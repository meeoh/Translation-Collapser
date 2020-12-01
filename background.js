chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == "complete") {
    if (tab.url.match(/https:\/\/github\.com\/.+\/.+\/pull\/.+\/files/)) {
      chrome.tabs.sendMessage(
        tab.id,
        { action: "addTranslationsButton" },
        function (response) {}
      );
    }
  }
});
