const sourceLngTA = document.getElementById('sourceLng');
const targetLngTA = document.getElementById('targetLng');
const deeplTokenTA = document.getElementById('deepLToken');
const saveBtn = document.getElementById('saveBtn');
const saveLbl = document.getElementById('saveLbl');

chrome.storage.local.get(['sourceLngValue'], (result) => {
    sourceLngTA.value = result.sourceLngValue || '';
});

chrome.storage.local.get(['targetLngValue'], (result) => {
    targetLngTA.value = result.targetLngValue || '';
});

chrome.storage.local.get(['deepLTokenValue'], (result) => {
    deeplTokenTA.value = result.deepLTokenValue || '';
});

saveBtn.addEventListener('click', () => {
    chrome.storage.local.set({ sourceLngValue: sourceLngTA.value });
    chrome.storage.local.set({ targetLngValue: targetLngTA.value });
    chrome.storage.local.set({ deepLTokenValue: deeplTokenTA.value });
    console.info("ParatranzDeepL config saved")
    saveLbl.textContent = "Saved!";
    setTimeout(() => {
        saveLbl.textContent = "";
    }, 1500);
});
