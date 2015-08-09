var canvas = document.getElementById('NOTED_CANVAS____');

var strokeColorInput = null;
var strokeWidthInput = null;

var NotedTools = {
  "select": new Tool(),
  "free": new Tool({
    currentPath: null,
    minDistance: 7,
  }),
  "circle": new Tool(),
  "rectangle": new Tool(),
  "text": new Tool(),
  "erase": new Tool(),
}

var save = function() {
  project.deselectAll();
  window.postMessage({
    type: '_NOTED_SAVE_CANVAS',
    payload: project.exportJSON(),
  }, "*");
}

// Because I'm lazy and this is incredibly poorly coded anyways..
setTimeout(function() {
  strokeColorInput = document.getElementById("NOTED_STROKE_COLOR_____");
  strokeWidthInput = document.getElementById("NOTED_STROKE_WIDTH_____");
  
  document.getElementById("NOTED_ICON_____").addEventListener('click', function() {
    toggleDrawMode();
  });
  
  document.getElementById("NOTED_TOOL_SELECT_____").addEventListener('click', function() {
    NotedTools.select.activate();
  });
  
  document.getElementById("NOTED_TOOL_FREE_____").addEventListener('click', function() {
    NotedTools.free.activate();
  });
  
  document.getElementById("NOTED_TOOL_CIRCLE_____").addEventListener('click', function() {
    NotedTools.circle.activate();
  });
  
  document.getElementById("NOTED_TOOL_RECT_____").addEventListener('click', function() {
    NotedTools.rect.activate();
  });

  document.getElementById("NOTED_TOOL_TEXT_____").addEventListener('click', function() {
    NotedTools.text.activate();
  });
  
  document.getElementById("NOTED_TOOL_ERASE_____").addEventListener('click', function() {
    NotedTools.erase.activate();
  });
  
  document.getElementById("NOTED_TOOL_CLEAR_____").addEventListener('click', function() {
    project.clear();
    save();
  });

}, 100);

/* ---------- */

function onMouseDown(event) {
  
}

function onResize(event) {
  view.viewSize = new Size(window.innerWidth, window.innerHeight);
  view.center = new Point(document.body.scrollLeft, document.body.scrollTop);
}

function onScroll(event) {
  if(Key.isDown('control')) {
    console.log("???");
    event.preventDefault();
  } else {
    view.center = new Point(document.body.scrollLeft, document.body.scrollTop);
  }
}

window.addEventListener('resize', onResize, false);
document.addEventListener('scroll', onScroll, false);

onResize();
onScroll();

var canvasEnabled = false;
var toggleDrawMode = function() {
  if(canvasEnabled) {
    canvas.className = 'NOTED_HIDE';
    document.body.className = null;
    tool.activate();
    save();
  } else {
    canvas.className = null;
    document.body.className = 'NOTED_HIDE';
  }
  canvasEnabled = !canvasEnabled;
}
canvas.className = 'NOTED_HIDE';

document.addEventListener('keyup', function(evt) {
  if(evt.altKey && evt.which == 87) {
    toggleDrawMode();
  }
});

window.addEventListener("message", function(event) {
    // We only accept messages from ourselves
    if (event.source != window)
      return;

    if (event.data.type && (event.data.type == "_NOTED_LOAD_CANVAS")) {
      project.clear();
      project.importJSON(event.data.payload);
    }
}, false);

window.postMessage({ type: "_NOTED_GET_CANVAS" }, "*");

// TOOL DEFINITIONS

// * Select tool * //
NotedTools.select.onMouseUp = function(event) {
  if(!this.hasDragged) {
    var result = project.hitTest(event.point);
    if(result) {
      result.item.selected = !result.item.selected;
    } else {
      project.deselectAll();
    }
  }
}

NotedTools.select.onMouseDown = function(event) {
  this.hasDragged = false;
}

NotedTools.select.onMouseDrag = function(event) {
  this.hasDragged = true;
  
  project.selectedItems.forEach(function(item) {
    item.translate(event.delta);
  });
}

// * Free Draw Tool * //
NotedTools.free.onMouseDown = function(event) {
  this.currentPath = new Path({
    strokeColor: strokeColorInput.value,
    strokeWidth: strokeWidthInput.value,
    strokeCap: 'round',
    strokeJoin: 'round',
    onClick: function() {
      this.isClicked = !this.isClicked;
    },
  });
  this.currentPath.add(event.point);
}

NotedTools.free.onMouseDrag = function(event) {
  this.currentPath.add(event.point);
  this.currentPath.smooth();
}

NotedTools.free.onMouseUp = function(event) {
  this.currentPath.reduce();
  this.currentPath.simplify();
  save();
}

// * Circle tool * //
NotedTools.circle.onMouseDown = function(event) {
  this.currentPath = new Path.Circle({
    strokeColor: strokeColorInput.value,
    strokeWidth: strokeWidthInput.value,
    center: event.point,
    radius: 0,
  });
}

NotedTools.circle.onMouseDrag = function(event) {
  this.currentPath.radius = event.delta / 2;
}

// * Text tool * //
NotedTools.text.onMouseUp = function(event) {
  var result = project.hitTest(event.point);
  
  if(result && result.item.className == "PointText") {
    if(this.currentText) this.currentText.selected = false;
    if(this.currentText != result.item) {
      this.currentText = result.item;
      this.currentText.selected = true;
      save();
    } else {
      this.currentText = null;
      save();
    }
  } else {
    if(this.currentText) {
      this.currentText.selected = false;
      this.currentText = null;
      save();
    }
    this.currentText = new PointText({
      fillColor: strokeColorInput.value,
      fontSize: strokeWidthInput.value * 3,
      position: event.point,
      selected: true,
    });
  }
}

NotedTools.text.onKeyDown = function(event) {
  if(!this.currentText) return;
  event.preventDefault();
  if(event.key == 'backspace') {
    if(this.currentText.content.length == 0) {
      this.currentText.remove();
    }
    this.currentText.content = this.currentText.content.substring(0, this.currentText.content.length-1);
  } else {
    this.currentText.content += event.character;
  }
}

// * Erase Tool * //
NotedTools.erase.onMouseDrag = function(event) {
  var result = project.hitTest(event.point);
  if(result) {
    result.item.remove();
  }
}

NotedTools.erase.onMouseUp = function(event) {
  var result = project.hitTest(event.point);
  if(result) {
    result.item.remove();
  }
  save();
}
