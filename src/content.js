let startTime = Date.now();

// Function to check if Shorts blocking is enabled
function checkAndApplyShortsBlock() {
    chrome.runtime.sendMessage({ action: "getStorage" }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("Error:", chrome.runtime.lastError);
            return;
        }
        if (response?.enabled) {
            hideShorts();
            redirectShorts();
        }
    });
}

// Hide Shorts elements
function hideShorts() {
    document.querySelectorAll('ytd-rich-section-renderer, ytd-reel-shelf-renderer').forEach(el => el.remove());
    document.querySelectorAll('ytd-compact-video-renderer').forEach(el => {
        const badge = el.querySelector('ytd-badge-supported-renderer');
        if (badge && badge.innerText.includes("Shorts")) {
            el.remove();
        }
    });
    document.querySelector('a#endpoint[title="Shorts"]')?.remove();
}

// Redirect from Shorts pages
function redirectShorts() {
    if (window.location.pathname.startsWith("/shorts")) {
        window.location.replace("https://www.youtube.com/");
    }
}

// Mutation observer for dynamically loading elements
let timeout;
const observer = new MutationObserver(() => {
    clearTimeout(timeout);
    timeout = setTimeout(checkAndApplyShortsBlock, 200);
});
observer.observe(document.body, { childList: true, subtree: true });

// Track time when navigating between videos
window.addEventListener("yt-navigate-start", () => {
    const now = Date.now();
    const timeSpent = now - startTime;
    startTime = now;
    chrome.runtime.sendMessage({ action: "updateTime", timeSpent });
});

// Run checks initially
checkAndApplyShortsBlock();
window.addEventListener("beforeunload", () => {
    const timeSpent = Date.now() - startTime;
    chrome.runtime.sendMessage({ action: "updateTime", timeSpent });
});
