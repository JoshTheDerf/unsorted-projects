/* global chrome, btoa */

(function () {
  // Handle basic IO
  var URLidentifier = 'NOTED::' + btoa(window.location.href)
  window.addEventListener('message', function (event) {
    // We only accept messages from ourselves
    if (event.source !== window) return

    if (event.data.type) {
      var request = event.data
      if (request.type === '_NOTED_GET_CANVAS') {
        chrome.storage.local.get([URLidentifier], function (data) {
          if (data[URLidentifier]) {
            window.postMessage({ type: '_NOTED_LOAD_CANVAS', payload: data[URLidentifier] }, '*')
          }
        })

      } else if (request.type === '_NOTED_SAVE_CANVAS') {
        var storObj = {}
        storObj[URLidentifier] = request.payload
        chrome.storage.local.set(storObj)

      } else if (request.type === '_NOTED_CAPTURE_PAGE') {
        chrome.runtime.sendMessage(request, function (response) {
          response.type = '_NOTED_SEND_PAGE_IMG'
          window.postMessage(response, '*')
        })
      } else if (request.type === '_NOTED_CAPTURE_PAGE_COLOR') {
        chrome.runtime.sendMessage(request, function (response) {
          response.type = '_NOTED_SEND_PAGE_COLOR_IMG'
          window.postMessage(response, '*')
        })
      }
    }
  }, false)

  var loadScripts = function () {
    var s = document.createElement('script')

    // Load paper.js
    s.src = chrome.extension.getURL('lib/paper-full.modified.js')
    s.onload = function () {
      this.parentNode.removeChild(this)
    }

    document.head.appendChild(s)

    s = document.createElement('script')

    // Load controller script
    s.src = chrome.extension.getURL('scripts/page/controller.js')
    s.onload = function () {
      this.parentNode.removeChild(this)
    }

    document.head.appendChild(s)

    s = document.createElement('script')
    // Load main paperscript project
    s.src = chrome.extension.getURL('scripts/page/paperscript/mainProject.js')
    s.setAttribute('canvas', 'NOTED_CANVAS_____')
    s.setAttribute('type', 'text/noted_paperscript')

    s.onload = function () {
      this.parentNode.removeChild(this)
    }
    document.head.appendChild(s)
  }

  loadScripts()
})()
