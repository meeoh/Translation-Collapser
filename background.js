"use strict";

const PR_FILES_PATTERN = /https:\/\/github\.com\/.+\/.+\/pull\/.+\/files/;

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) {
    return;
  }

  if (PR_FILES_PATTERN.test(tab.url)) {
    try {
      await chrome.tabs.sendMessage(tabId, { action: "addCollapseButton" });
    } catch (error) {
      // Content script may not be ready yet, which is expected behavior
    }
  }
});
