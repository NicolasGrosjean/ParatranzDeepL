const textarea = document.getElementById('deepLToken');
const saveBtn = document.getElementById('saveBtn');

chrome.storage.local.get(['deepLTokenValue'], (result) => {
    textarea.value = result.deepLTokenValue || '';
});

saveBtn.addEventListener('click', () => {
    chrome.storage.local.set({ deepLTokenValue: textarea.value });
    console.info("ParatranzDeepL config saved")
});
