"use strict";

const COLLAPSE_TEXT = "Collapse Files";
const EXPAND_TEXT = "Expand Files";
const BUTTON_CLASS = "github-file-collapser-btn";
const PR_FILES_PATTERN = /https:\/\/github\.com\/.+\/.+\/pull\/.+\/(files|changes)/;

const DEFAULT_SETTINGS = {
  keywords: "",
  deletedFiles: false,
  emptyFiles: false,
  markAsViewed: false,
};

let isCollapsed = false;
const collapsedFileIds = new Set();

async function getSettings() {
  try {
    return await chrome.storage.sync.get(DEFAULT_SETTINGS);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function parseKeywords(keywordString) {
  return keywordString
    .split("\n")
    .map((keyword) => keyword.trim())
    .filter((keyword) => keyword.length > 0);
}

function getFileDiffs() {
  return document.querySelectorAll('[id^="diff-"][class*="Diff-module__diff"]');
}

function getFileName(fileElement) {
  const codeEl = fileElement.querySelector('h3[class*="DiffFileHeader-module__file-name"] a code');
  if (!codeEl) return "";
  // Strip LRM/RLM unicode markers that GitHub inserts
  return codeEl.textContent.replace(/[\u200E\u200F]/g, "").trim();
}

function isFileExpanded(fileElement) {
  return fileElement.querySelector(".octicon-chevron-down") !== null;
}

function getCollapseToggle(fileElement) {
  const chevron = fileElement.querySelector(".octicon-chevron-down, .octicon-chevron-right");
  return chevron ? chevron.closest("button") : null;
}

function markFileViewed(fileElement, viewed) {
  const btn = fileElement.querySelector('button[class*="MarkAsViewedButton-module"]');
  if (!btn) return;
  const isViewed = btn.getAttribute("aria-pressed") === "true";
  if (viewed && !isViewed) {
    btn.click();
  } else if (!viewed && isViewed) {
    btn.click();
  }
}

function shouldCollapseFile(fileElement, fileName, settings) {
  const keywords = parseKeywords(settings.keywords);

  const matchesKeyword = keywords.length > 0 && keywords.some((keyword) => {
    try {
      return new RegExp(keyword, "i").test(fileName);
    } catch {
      return fileName.toLowerCase().includes(keyword.toLowerCase());
    }
  });

  const isDeletedFile = settings.deletedFiles &&
    fileElement.textContent.includes("This file was deleted.");

  const isEmptyFile = settings.emptyFiles &&
    fileElement.textContent.includes("Whitespace-only changes.");

  return matchesKeyword || isEmptyFile || isDeletedFile;
}

async function toggleFiles(shouldCollapse) {
  const settings = await getSettings();
  const files = getFileDiffs();

  files.forEach((fileElement) => {
    const fileId = fileElement.id;
    const fileName = getFileName(fileElement);
    if (!fileName) return;

    const toggle = getCollapseToggle(fileElement);
    if (!toggle) return;

    if (shouldCollapse) {
      if (!shouldCollapseFile(fileElement, fileName, settings)) return;
      if (!isFileExpanded(fileElement)) return;
      toggle.click();
      collapsedFileIds.add(fileId);
      if (settings.markAsViewed) {
        markFileViewed(fileElement, true);
      }
    } else {
      if (!collapsedFileIds.has(fileId)) return;
      if (isFileExpanded(fileElement)) return;
      toggle.click();
      collapsedFileIds.delete(fileId);
      if (settings.markAsViewed) {
        markFileViewed(fileElement, false);
      }
    }
  });

  updateButtonState(shouldCollapse);
}

function updateButtonState(collapsed) {
  isCollapsed = collapsed;
  const button = document.querySelector(`.${BUTTON_CLASS}`);
  if (button) {
    const label = button.querySelector('[data-component="text"]');
    if (label) {
      label.textContent = collapsed ? EXPAND_TEXT : COLLAPSE_TEXT;
    }
  }
}

function handleButtonClick() {
  toggleFiles(!isCollapsed);
}

function createCollapseButton() {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `prc-Button-ButtonBase-9n-Xk ${BUTTON_CLASS}`;
  button.setAttribute("data-loading", "false");
  button.setAttribute("data-no-visuals", "true");
  button.setAttribute("data-size", "small");
  button.setAttribute("data-variant", "default");

  const content = document.createElement("span");
  content.setAttribute("data-component", "buttonContent");
  content.setAttribute("data-align", "center");
  content.className = "prc-Button-ButtonContent-Iohp5";

  const text = document.createElement("span");
  text.setAttribute("data-component", "text");
  text.className = "prc-Button-Label-FWkx3";
  text.textContent = COLLAPSE_TEXT;

  content.appendChild(text);
  button.appendChild(content);
  button.addEventListener("click", handleButtonClick);

  return button;
}

function addButton() {
  if (document.querySelector(`.${BUTTON_CLASS}`)) return;

  // Insert before the "Submit review" button in the PR toolbar
  const reviewButton = document.querySelector('button[class*="ReviewMenuButton-module__ReviewMenuButton"]');
  if (reviewButton && reviewButton.parentElement) {
    const button = createCollapseButton();
    reviewButton.parentElement.insertBefore(button, reviewButton);
    isCollapsed = false;
  }
}

function waitForToolbar() {
  if (!PR_FILES_PATTERN.test(document.location.href)) return;

  addButton();
  if (document.querySelector(`.${BUTTON_CLASS}`)) return;

  const observer = new MutationObserver(() => {
    if (!PR_FILES_PATTERN.test(document.location.href)) return;
    addButton();
    if (document.querySelector(`.${BUTTON_CLASS}`)) {
      observer.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 30000);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action !== "addCollapseButton") return;
  if (!PR_FILES_PATTERN.test(document.location.href)) return;

  isCollapsed = false;
  collapsedFileIds.clear();
  waitForToolbar();
  sendResponse({ success: true });
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", waitForToolbar);
} else {
  waitForToolbar();
}
