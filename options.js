"use strict";

const DEFAULT_SETTINGS = {
  keywords: "",
  deletedFiles: false,
  emptyFiles: false,
  markAsViewed: false,
};

const STATUS_DISPLAY_MS = 1500;

function getElement(id) {
  return document.getElementById(id);
}

function showStatus(message, isError = false) {
  const status = getElement("status");
  status.textContent = message;
  status.className = isError ? "status-error" : "status-success";

  setTimeout(() => {
    status.textContent = "";
    status.className = "";
  }, STATUS_DISPLAY_MS);
}

async function saveOptions() {
  const keywords = getElement("keywords").value.trim();
  const deletedFiles = getElement("deletedFiles").checked;
  const emptyFiles = getElement("emptyFiles").checked;
  const markAsViewed = getElement("markAsViewed").checked;

  if (!keywords && !deletedFiles && !emptyFiles) {
    showStatus("Please enter a keyword or enable a file type option.", true);
    return;
  }

  try {
    await chrome.storage.sync.set({
      keywords,
      deletedFiles,
      emptyFiles,
      markAsViewed,
    });
    showStatus("Options saved successfully!");
  } catch (error) {
    showStatus("Error saving options. Please try again.", true);
  }
}

async function restoreOptions() {
  try {
    const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    getElement("keywords").value = settings.keywords;
    getElement("deletedFiles").checked = settings.deletedFiles;
    getElement("emptyFiles").checked = settings.emptyFiles;
    getElement("markAsViewed").checked = settings.markAsViewed;
  } catch (error) {
    showStatus("Error loading options.", true);
  }
}

document.addEventListener("DOMContentLoaded", restoreOptions);
getElement("save").addEventListener("click", saveOptions);

getElement("keywords").addEventListener("keydown", (event) => {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    saveOptions();
  }
});
