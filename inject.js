"use strict";

const COLLAPSE_TEXT = "Collapse Files";
const EXPAND_TEXT = "Expand Files";
const BUTTON_CLASS = "github-file-collapser-btn";
const PR_FILES_PATTERN = /https:\/\/github\.com\/.+\/.+\/pull\/.+\/files/;

const DEFAULT_SETTINGS = {
  keywords: "translations",
  deletedFiles: false,
  emptyFiles: false,
};

let isCollapsed = false;
const processedPages = new Set();

async function getSettings() {
  return chrome.storage.sync.get(DEFAULT_SETTINGS);
}

function parseKeywords(keywordString) {
  return keywordString
    .split(",")
    .map((keyword) => keyword.trim())
    .filter((keyword) => keyword.length > 0);
}

function shouldCollapseFile(fileElement, fileName, settings) {
  const keywords = parseKeywords(settings.keywords);

  const matchesKeyword = keywords.some((keyword) =>
    fileName.toLowerCase().includes(keyword.toLowerCase())
  );

  const isEmptyFile = settings.emptyFiles &&
    fileElement.querySelector(".data.highlight.empty") !== null;

  const isDeletedFile = settings.deletedFiles &&
    fileElement.querySelector("[id^='hidden-diff-reason']") !== null;

  return matchesKeyword || isEmptyFile || isDeletedFile;
}

function getFileToggle(fileElement) {
  const reviewedToggle = fileElement.querySelector(".js-reviewed-toggle input");
  if (reviewedToggle) {
    return {
      element: reviewedToggle,
      isExpanded: !reviewedToggle.checked,
    };
  }

  const detailsTarget = fileElement.querySelector(".js-details-target");
  if (detailsTarget) {
    return {
      element: detailsTarget,
      isExpanded: detailsTarget.getAttribute("aria-expanded") === "true",
    };
  }

  return null;
}

async function toggleFiles(shouldCollapse) {
  const settings = await getSettings();
  const files = document.querySelectorAll(".file");

  files.forEach((fileElement) => {
    const fileNameElement = fileElement.querySelector(".file-info a");
    if (!fileNameElement) return;

    const fileName = fileNameElement.textContent || fileNameElement.innerText || "";

    if (!shouldCollapseFile(fileElement, fileName, settings)) {
      return;
    }

    const toggle = getFileToggle(fileElement);
    if (!toggle) return;

    const shouldClick = shouldCollapse ? toggle.isExpanded : !toggle.isExpanded;
    if (shouldClick) {
      toggle.element.click();
    }
  });

  updateButtonState(shouldCollapse);
}

function updateButtonState(collapsed) {
  isCollapsed = collapsed;
  const button = document.querySelector(`.${BUTTON_CLASS}`);
  if (button) {
    button.textContent = collapsed ? EXPAND_TEXT : COLLAPSE_TEXT;
  }
}

function handleButtonClick() {
  toggleFiles(!isCollapsed);
}

function createCollapseButton() {
  const container = document.createElement("div");
  container.className = "diffbar-item mr-3";

  const button = document.createElement("button");
  button.className = `btn ${BUTTON_CLASS}`;
  button.textContent = COLLAPSE_TEXT;
  button.type = "button";
  button.addEventListener("click", handleButtonClick);

  container.appendChild(button);
  return container;
}

function addButton() {
  const currentPath = document.location.pathname;

  if (processedPages.has(currentPath)) {
    return;
  }

  if (document.querySelector(`.${BUTTON_CLASS}`)) {
    return;
  }

  const prReviewTools = document.querySelector(".pr-review-tools");
  if (!prReviewTools) {
    return;
  }

  const buttonContainer = createCollapseButton();
  prReviewTools.insertBefore(buttonContainer, prReviewTools.firstChild);
  processedPages.add(currentPath);
  isCollapsed = false;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action !== "addCollapseButton") {
    return;
  }

  if (!PR_FILES_PATTERN.test(document.location.href)) {
    return;
  }

  addButton();
  sendResponse({ success: true });
});

if (PR_FILES_PATTERN.test(document.location.href)) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addButton);
  } else {
    addButton();
  }
}
