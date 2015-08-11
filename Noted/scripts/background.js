chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.type == "_NOTED_CAPTURE_PAGE") {
    chrome.tabs.captureVisibleTab(null, {}, function(dataURL) {
      console.log("Captured image for saving.");
      request.payload = dataURL;
      sendResponse(request);
    });
    return true;
  } else if (request.type == "_NOTED_CAPTURE_PAGE_COLOR") {
    chrome.tabs.captureVisibleTab(null, {}, function(dataURL) {
      console.log("Captured image for color picking.");
      request.payload = dataURL;
      sendResponse(request);
    });
    return true;
  }
});
