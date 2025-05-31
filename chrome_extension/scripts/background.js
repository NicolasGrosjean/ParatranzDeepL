// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "deepl_translate" && request.headers) {
        const deepL_fetch_options = {
            method: "POST",
            headers: request.headers,
            body: JSON.stringify({
                text: [request.originalText],
                source_lang: request.sourceLanguage,
                target_lang: request.targetLanguage,
            }),
        };

        fetch(request.endpoint + "/translate", deepL_fetch_options)
            .then((res) => {
                if (res.status === 429 || res.status === 456) {
                    console.error(
                        "DeepL API limit reached or server error:",
                        res.status
                    );
                    alert(
                        "Error, DeepL server limit reached! Try again later or upgrade to a paid plan."
                    );
                    sendResponse({ error: "DeepL API limit reached or server error: " + res.status });
                    return;
                }
                return res.json();
            })
            .then((translationText) => {
                if (translationText) {
                    console.debug("DeepL API raw result is:", translationText);
                    translationText = translationText.translations[0].text;
                    // TODO Remove the "translated by deepl" message
                    sendResponse({ translation: translationText });
                }
            })
            .catch((err) => {
                console.error(
                    "Error while fetching translation from DeepL API:",
                    err
                );
                alert(
                    "Error while fetching translation from DeepL API: " +
                        err.message
                );
                sendResponse({ error: err.toString() });
            });
        // Indicate async response
        return true;
    } else {
        return false; // Ignore other messages
    }
});
