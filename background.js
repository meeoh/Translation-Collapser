"use strict";

const PR_FILES_PATTERN = /https:\/\/github\.com\/.+\/.+\/pull\/.+\/(files|changes)/;

console.log("[GH File Collapser] Background service worker loaded");

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  console.log("[GH File Collapser] Tab updated:", { tabId, status: changeInfo.status, url: tab.url });

  if (changeInfo.status !== "complete" || !tab.url) {
    return;
  }

  if (PR_FILES_PATTERN.test(tab.url)) {
    console.log("[GH File Collapser] PR files page detected, sending message to content script");
    try {
      const response = await chrome.tabs.sendMessage(tabId, { action: "addCollapseButton" });
      console.log("[GH File Collapser] Content script response:", response);
    } catch (error) {
      console.log("[GH File Collapser] Could not reach content script:", error.message);
    }
  }
});
