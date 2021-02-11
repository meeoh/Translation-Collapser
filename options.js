// Saves options to chrome.storage
function save_options() {
  var keywords = document.getElementById("keywords").value;
  const deletedFiles = document.getElementById("deletedFiles").checked;
  const emptyFiles = document.getElementById("emptyFiles").checked;

  chrome.storage.sync.set(
    {
      keywords,
      deletedFiles,
      emptyFiles,
    },
    function () {
      // Update status to let user know options were saved.
      var status = document.getElementById("status");
      status.textContent = "Options saved.";
      setTimeout(function () {
        status.textContent = "";
      }, 750);
    }
  );
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get(
    {
      keywords: "translations",
      emptyFiles: false,
      deletedFiles: false,
    },
    function ({ keywords, emptyFiles, deletedFiles }) {
      document.getElementById("keywords").value = keywords;
      document.getElementById("deletedFiles").checked = deletedFiles;
      document.getElementById("emptyFiles").checked = emptyFiles;
    }
  );
}
document.addEventListener("DOMContentLoaded", restore_options);
document.getElementById("save").addEventListener("click", save_options);
