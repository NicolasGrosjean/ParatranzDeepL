const waitingTimeBeforeStart = 500; // milliseconds
const waitingTimeBetweenTwoCalls = 2000; // milliseconds
const deepLFreeApiEndpoint = "https://api-free.deepl.com/v2";
const deepLProApiEndpoint = "https://api.deepl.com/v2";
let deepL_enabled = true;
let isRunning = false;

setTimeout(() => {
    const intervalId = setInterval(async () => {
        if (!deepL_enabled) {
            clearInterval(intervalId);
            return;
        }
        if (isRunning) {
            return;
        }
        isRunning = true;
        try {
            await main();
        } finally {
            isRunning = false;
        }
    }, waitingTimeBetweenTwoCalls);
}, waitingTimeBeforeStart);

function getOriginalText() {
    const originalDiv = document.getElementsByClassName("original well");
    console.debug("Original div element:", originalDiv);
    console.debug("Original div length:", originalDiv.length);
    console.debug("Original div first element:", originalDiv[0]);
    // originalDiv[0] is a <div> element
    if (originalDiv.length > 0 && originalDiv[0]) {
        return originalDiv[0].innerText;
    }
}

function getTranslationTA() {
    const translationDivs = document.getElementsByClassName(
        "translation form-control"
    );
    console.debug("Translation div element:", translationDivs);
    console.debug("Translation div length:", translationDivs.length);
    console.debug("Translation div first element:", translationDivs[0]);
    // translationDivs[0] is a <textarea>
    if (translationDivs.length > 0 && translationDivs[0]) {
        return translationDivs[0];
    }
}

function getTranslationText(translationTA) {
    // translationTA is a <textarea>
    return translationTA.value;
}

async function getDeepLHeader() {
    return new Promise((resolve) => {
        chrome.storage.local.get(["deepLTokenValue"], (result) => {
            const deepLToken = result.deepLTokenValue;
            if (!deepLToken) {
                console.error(
                    "DeepL API token not found in extension storage."
                );
                alert(
                    "DeepL API token not found. Please set it in the extension options, then refresh the page."
                );
                deepL_enabled = false;
                resolve({});
            } else {
                resolve({
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: "DeepL-Auth-Key " + deepLToken,
                });
            }
        });
    });
}

async function getDeepLEndpoint() {
    return new Promise((resolve) => {
        chrome.storage.local.get(["apiTypeValue"], (result) => {
            const apiType = result.apiTypeValue;
            if (!apiType) {
                console.error("API type not found in extension storage.");
                alert(
                    "API type not found. Please set it in the extension options, then refresh the page."
                );
                deepL_enabled = false;
                resolve("");
            } else {
                if (apiType === "free") {
                    resolve(deepLFreeApiEndpoint);
                } else if (apiType === "pro") {
                    resolve(deepLProApiEndpoint);
                } else {
                    console.error("Unknown API type:", apiType);
                    alert("Unknown API type: " + apiType);
                    deepL_enabled = false;
                    resolve("");
                }
            }
        });
    });
}

async function getSourceLanguage() {
    return new Promise((resolve) => {
        chrome.storage.local.get(["sourceLngValue"], (result) => {
            const sourceLng = result.sourceLngValue;
            if (!sourceLng) {
                console.error(
                    "Source language not found in extension storage."
                );
                alert(
                    "Source language not found. Please set it in the extension options, then refresh the page."
                );
                deepL_enabled = false;
                resolve({});
            } else {
                resolve(sourceLng);
            }
        });
    });
}

async function getTargetLanguage() {
    return new Promise((resolve) => {
        chrome.storage.local.get(["targetLngValue"], (result) => {
            const targetLng = result.targetLngValue;
            if (!targetLng) {
                console.error(
                    "Target language not found in extension storage."
                );
                alert(
                    "Target language not found. Please set it in the extension options, then refresh the page."
                );
                deepL_enabled = false;
                resolve({});
            } else {
                resolve(targetLng);
            }
        });
    });
}

async function computeTranslation(
    originalText,
    sourceLanguage,
    targetLanguage
) {
    const headers = await getDeepLHeader();
    const deepLApiEndpoint = await getDeepLEndpoint();
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            {
                action: "deepl_translate",
                headers: headers,
                endpoint: deepLApiEndpoint,
                originalText,
                sourceLanguage,
                targetLanguage,
            },
            (response) => {
                if (chrome.runtime.lastError) {
                    console.error(
                        "Error communicating with background script:",
                        chrome.runtime.lastError
                    );
                    alert(
                        "Error communicating with background script: " +
                            chrome.runtime.lastError.message
                    );
                    deepL_enabled = false;
                    resolve("");
                } else if (response && response.error) {
                    console.error("DeepL API error:", response.error);
                    alert("DeepL API error: " + response.error);
                    deepL_enabled = false;
                    resolve("");
                } else {
                    resolve(response.translation);
                }
            }
        );
    });
}

function writeTranslation(translationDiv, translationText) {
    // translationDiv is a <textarea>
    translationDiv.value = translationText;
    // Simulate user input event
    const event = new Event('input', { bubbles: true });
    translationDiv.dispatchEvent(event);
    console.info("Translation text written to the textarea:", translationText);
}

async function main() {
    const translationTA = getTranslationTA();
    const translationText = getTranslationText(translationTA);
    if (translationText != "") {
        console.info("Translation text is not empty, DeepL is not called.");
        return;
    }

    const originalText = getOriginalText();
    if (!originalText) {
        console.error("No original text found.");
        return;
    }
    console.debug("Original text:", originalText);

    const newTranslationText = await computeTranslation(
        originalText,
        await getSourceLanguage(),
        await getTargetLanguage()
    );
    writeTranslation(translationTA, newTranslationText);
}
