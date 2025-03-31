import { useState, useEffect } from "react";

export default function Popup() {
    const [enabled, setEnabled] = useState(true);
    const [timeSpent, setTimeSpent] = useState(0);

    useEffect(() => {
        // Load initial settings
        chrome.storage.sync.get(["enabled", "youtubeTime"], (data) => {
            setEnabled(data.enabled ?? true);
            setTimeSpent(Math.floor((data.youtubeTime ?? 0) / 60000));
        });

        // Listen for storage changes to update time dynamically
        const handleStorageChange = (changes) => {
            if (changes.youtubeTime) {
                setTimeSpent(Math.floor((changes.youtubeTime.newValue ?? 0) / 60000));
            }
        };

        chrome.storage.onChanged.addListener(handleStorageChange);

        return () => chrome.storage.onChanged.removeListener(handleStorageChange);
    }, []);

    const toggleShortsBlocker = () => {
        chrome.storage.sync.set({ enabled: !enabled });
        setEnabled(!enabled);
    };

    return (
        <div style={{ padding: "10px", width: "220px", textAlign: "center" }}>
            <h3>YouTube Shorts Blocker</h3>
            <button onClick={toggleShortsBlocker} style={{ marginBottom: "10px" }}>
                {enabled ? "Disable" : "Enable"}
            </button>
            <p><b>Time spent today:</b> {timeSpent} mins</p>
        </div>
    );
}
