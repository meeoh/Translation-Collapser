const collapseText = "Collapse All Translations";
const expandText = "Expand All Translations";
const COLLAPSE_MODE = 0;
const EXPAND_MODE = 1;
let currentMode = COLLAPSE_MODE;

const completed = {};

const clickInputs = (collapse) => {
  const elements = document.querySelectorAll(".file-header");
  elements.forEach((parent) => {
    const fileNameElement = parent.querySelector(".file-info a");
    const fileName = fileNameElement.text;

    chrome.storage.sync.get(
      {
        keywords: "translations",
      },
      function (items) {
        const keywords = items.keywords.split(",");

        const match = keywords.some((keyword) => {
          return fileName.includes(keyword);
        });

        if (match) {
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
    const button = document.getElementsByClassName(
      "translationsCollapseButton"
    )[0];
    button.textContent = collapse ? expandText : collapseText;
    currentMode = collapse ? EXPAND_MODE : COLLAPSE_MODE;
  });
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
