const waitingTimeBeforeStart = 500; // milliseconds
const waitingTimeBetweenTwoCalls = 2000; // milliseconds
const deepLApiEndpoint = "https://api-free.deepl.com/v2";
const deepLHearder = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: "DeepL-Auth-Key PUT YOUR KEY HERE",
};
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

function getTranslationDiv() {
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

function getTranslationText(translationDiv) {
    // translationDiv is a <textarea>
    return translationDiv.value;
}

async function computeTranslation(originalText, targetLanguage) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            {
                action: "deepl_translate",
                headers: deepLHearder,
                endpoint: deepLApiEndpoint,
                originalText,
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
    console.debug("Translation text written to the textarea:", translationText);
}

async function main() {
    const translationDiv = getTranslationDiv();
    const translationText = getTranslationText(translationDiv);
    if (translationText != "") {
        console.debug("Translation text is not empty.");
        return;
    }

    const originalText = getOriginalText();
    if (!originalText) {
        console.error("No original text found.");
        return;
    }
    console.debug("Original text:", originalText);

    const newTranslationText = await computeTranslation(originalText, "FR");
    writeTranslation(translationDiv, newTranslationText);

    // TODO Set its DeepL API Key in the extension options
    // TODO Set the language to translate to in the extension options
    // TODO Set the DeepL API endpoint in the extension options
}
