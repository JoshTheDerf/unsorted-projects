$(document).ready(function() {
  chrome.storage.local.get(["enabled", "redirected", "blocked"], function(){});
});
