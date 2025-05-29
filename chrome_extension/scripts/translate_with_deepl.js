const waitingTimeBeforeStart = 500; // milliseconds
const waitingTimeBetweenTwoCalls = 2000; // milliseconds

setTimeout(() => {
    setInterval(main, waitingTimeBetweenTwoCalls);
}, waitingTimeBeforeStart);

function getOriginalText() {
    const originalDiv = document.getElementsByClassName("original well");
    console.debug("Original div element:", originalDiv);
    console.debug("Original div length:", originalDiv.length);
    console.debug("Original div first element:", originalDiv[0]);
    // originalDiv[0] is a <div> element
    if (originalDiv.length > 0 && originalDiv[0]) {
        return originalDiv[0].innerText;      console.log("Original text:", originalText);
    }
}

function getTranslationText(){
    const translationDiv = document.getElementsByClassName("translation form-control");
    console.debug("Translation div element:", translationDiv);
    console.debug("Translation div length:", translationDiv.length);
    console.debug("Translation div first element:", translationDiv[0]);
    // translationDiv[0] is a <textarea>
    if (translationDiv.length > 0 && translationDiv[0]) {
        return translationDiv[0].value;
    }
}

function main() {
    const translationText = getTranslationText();
    if (translationText != "") {
        console.debug("Translation text is not empty.");
        return
    }

    const originalText = getOriginalText();
    if (!originalText) {
        console.error("No original text found.");
        return
    }
    console.debug("Original text:", originalText);
}
