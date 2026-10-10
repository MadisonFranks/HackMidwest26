chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "scamshield-analyze",
    title: "Analyze with ScamShield AI",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "scamshield-analyze" && info.selectionText) {
    chrome.storage.local.set({
      selectedMessage: info.selectionText,
      selectedAt: Date.now()
    });
  }
});