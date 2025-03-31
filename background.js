let startTime = null;
let totalTime = 0;

// Load stored time when extension starts
chrome.storage.sync.get("youtubeTime", (data) => {
    totalTime = data.youtubeTime ?? 0;
});

// Function to update time spent
function updateTimeSpent() {
    if (startTime) {
        const now = Date.now();
        totalTime += (now - startTime);
        startTime = now;

        // Save to storage
        chrome.storage.sync.set({ youtubeTime: totalTime }, () => {
            console.log("Updated YouTube time:", totalTime);
        });
    }
}

// Detect when user is on YouTube
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url && tab.url.includes("youtube.com")) {
        startTime = Date.now();
    } else {
        updateTimeSpent();
        startTime = null;
    }
});

// Handle tab switching
chrome.tabs.onActivated.addListener(() => updateTimeSpent());

// Save time when the extension unloads
chrome.runtime.onSuspend.addListener(() => updateTimeSpent());

// 📩 Handle messages from `Popup.js`
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getStorage") {
        chrome.storage.sync.get(["enabled", "youtubeTime"], (data) => {
            sendResponse({
                enabled: data.enabled ?? true,
                youtubeTime: data.youtubeTime ?? 0
            });
        });
        return true; // Required for async response
    }
});
