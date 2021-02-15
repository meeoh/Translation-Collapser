const collapseText = "Collapse All Translations";
const expandText = "Expand All Translations";
const COLLAPSE_MODE = 0;
const EXPAND_MODE = 1;
let currentMode = COLLAPSE_MODE;

const completed = {};

const clickInputs = (collapse) => {
  const files = document.querySelectorAll(".file");
  files.forEach((parent) => {
    const fileNameElement = parent.querySelector(".file-info a");
    const fileName = fileNameElement.text;

    chrome.storage.sync.get(
      {
        keywords: "translations",
        deletedFiles: false,
        emptyFiles: false,
      },
      function ({ keywords: savedKeywords, deletedFiles, emptyFiles }) {
        const keywords = savedKeywords
          .split(",")
          .map((keyword) => keyword.trim());

        const filenameMatch = keywords.some((keyword) => {
          return fileName.includes(keyword);
        });

        const emptyFile = emptyFiles && parent.querySelector(".empty");
        console.log(parent.querySelectorAll(".data.highlight.empty"));

        const deletedFile =
          deletedFiles && parent.querySelector(".hidden-diff-reason");

        if (filenameMatch || emptyFile || deletedFile) {
          let toggle = parent.querySelector(".js-reviewed-toggle input");
          let expanded = toggle && !toggle.checked;

          if (!toggle) {
            toggle = parent.querySelector(".js-details-target");
            expanded = toggle.getAttribute("aria-expanded") == "true";
          }

          if (collapse && expanded) {
            toggle.click();
          } else if (!collapse && !expanded) {
            toggle.click();
          }
        }
      }
    );
  });
  const button = document.getElementsByClassName(
    "translationsCollapseButton"
  )[0];
  button.textContent = collapse ? expandText : collapseText;
  currentMode = collapse ? EXPAND_MODE : COLLAPSE_MODE;
};

const collapseAllTranslations = () => {
  clickInputs(true);
};

const expandAllTranslations = () => {
  clickInputs(false);
};

const toggleTranslations = () => {
  if (currentMode === COLLAPSE_MODE) collapseAllTranslations();
  else if (currentMode === EXPAND_MODE) expandAllTranslations();
};

const addButton = () => {
  var div = document.createElement("div");
  div.className = "diffbar-item";
  const button = document.createElement("button");
  button.className = "btn translationsCollapseButton";
  button.textContent = collapseText;
  button.onclick = toggleTranslations;
  div.append(button);

  const prReviewTools = document.querySelector(".pr-review-tools");
  if (prReviewTools) {
    prReviewTools.insertBefore(div, prReviewTools.firstChild);
    completed[document.location.pathname] = true;
  }
};

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (
    msg.action == "addTranslationsButton" &&
    document.location.href.match(
      /https:\/\/github\.com\/.+\/.+\/pull\/.+\/files/
    ) &&
    !completed[document.location.pathname]
  ) {
    addButton();
  }
});
