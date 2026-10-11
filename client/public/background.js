// ScamShield AI Background Service Worker (Manifest V3)

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

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SCAN_EMAIL_PAYLOAD') {
    handleEmailScan(request.payload)
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }

  if (request.type === 'GET_OPEN_EMAIL_CONTENT') {
    // Relay to active tab if needed
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'EXTRACT_EMAIL_NOW' }, (response) => {
          sendResponse(response || { success: false, error: 'No response from tab' });
        });
      } else {
        sendResponse({ success: false, error: 'No active tab found' });
      }
    });
    return true;
  }
});

async function handleEmailScan(payload) {
  const backendUrl = 'http://localhost:5001/api/analyze';
  
  const response = await fetch(backendUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: payload.message || payload.text || '',
      file: payload.file || undefined
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Server responded with status ${response.status}`);
  }

  const result = await response.json();

  // Save last scan in storage
  await chrome.storage.local.set({
    lastEmailScan: {
      timestamp: Date.now(),
      result,
      subject: payload.subject || 'Scanned Email'
    }
  });

  // Update extension badge
  if (result.score >= 70) {
    chrome.action.setBadgeText({ text: `${result.score}` });
    chrome.action.setBadgeBackgroundColor({ color: '#ef4444' }); // Red
  } else if (result.score >= 35) {
    chrome.action.setBadgeText({ text: `${result.score}` });
    chrome.action.setBadgeBackgroundColor({ color: '#f59e0b' }); // Orange
  } else {
    chrome.action.setBadgeText({ text: 'OK' });
    chrome.action.setBadgeBackgroundColor({ color: '#10b981' }); // Green
  }

  return result;
}