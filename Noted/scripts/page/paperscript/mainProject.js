var canvas = document.getElementById('NOTED_CANVAS_____');

var panel;

var getStrokeColor = function() {
  return document.getElementById("NOTED_STROKE_COLOR_____").value;
};
var setStrokeColor = function(value) {
  document.getElementById("NOTED_STROKE_COLOR_____").value = value;
}

var getStrokeWidth = function() {
  return document.getElementById("NOTED_STROKE_WIDTH_____").value;
};
var setStrokeWidth = function(value) {
  document.getElementById("NOTED_STROKE_WIDTH_____").value = value;
}

var getFillColor = function() {
  var col = new Color(document.getElementById("NOTED_FILL_COLOR_____").value);
  col.alpha = document.getElementById("NOTED_FILL_OPACITY_____").value/255.0;
  return col;
};
var setFillColor = function(value) {
  document.getElementById("NOTED_FILL_COLOR_____").value = value;
};

var getFillAlpha = function(value) {
  return document.getElementById("NOTED_FILL_OPACITY_____").value;
}

var setFillAlpha = function(value) {
  document.getElementById("NOTED_FILL_OPACITY_____").value = value;
};


var setCursor = function(cursor) {
  canvas.style.cursor = cursor ? cursor : "default";
}


var fillAlphaInput = null;

var NotedTools = {
  "select": new Tool(),
  "eyedropper": new Tool(),
  "free": new Tool({
    currentPath: null,
    minDistance: 7,
  }),
  "circle": new Tool(),
  "rect": new Tool(),
  "text": new Tool(),
  "erase": new Tool(),
  "screenshot": new Tool(),
};

var save = function() {
  project.deselectAll();
  window.postMessage({
    type: '_NOTED_SAVE_CANVAS',
    payload: project.exportJSON(),
  }, "*");
};

// Because I'm lazy and this is incredibly poorly coded anyways..
setTimeout(function() {
  panel = document.getElementById("NOTED_PANEL_____");
  
  document.getElementById("NOTED_ICON_____").addEventListener('click', function() {
    canvas.style.backgroundColor = null;
    toggleDrawMode();
  });
  
  document.getElementById("NOTED_TOOL_SELECT_____").addEventListener('click', function() {
    setCursor('crosshair');
    canvas.style.backgroundColor = null;
    NotedTools.select.activate();
  });
  
  document.getElementById("NOTED_TOOL_EYEDROPPER_____").addEventListener('click', function() {
    setCursor('crosshair');
    canvas.style.backgroundColor = 'transparent';
    NotedTools.eyedropper.activate();
  });
  
  document.getElementById("NOTED_TOOL_FREE_____").addEventListener('click', function() {
    setCursor('crosshair');
    canvas.style.backgroundColor = null;
    NotedTools.free.activate();
  });
  
  document.getElementById("NOTED_TOOL_CIRCLE_____").addEventListener('click', function() {
    setCursor('crosshair');
    canvas.style.backgroundColor = null;
    NotedTools.circle.activate();
  });
  
  document.getElementById("NOTED_TOOL_RECT_____").addEventListener('click', function() {
    setCursor('crosshair');
    canvas.style.backgroundColor = null;
    NotedTools.rect.activate();
  });

  document.getElementById("NOTED_TOOL_TEXT_____").addEventListener('click', function() {
    setCursor('text');
    canvas.style.backgroundColor = null;
    NotedTools.text.activate();
  });
  
  document.getElementById("NOTED_TOOL_ERASE_____").addEventListener('click', function() {
    setCursor('crosshair');
    canvas.style.backgroundColor = null;
    NotedTools.erase.activate();
  });
  
  document.getElementById("NOTED_TOOL_CLEAR_____").addEventListener('click', function() {
    setCursor();
    canvas.style.backgroundColor = null;
    project.clear();
    view.update();
    save();
  });
  
  document.getElementById("NOTED_TOOL_SCREENSHOT_____").addEventListener('click', function() {
    setCursor('crosshair');
    canvas.style.backgroundColor = null;
    NotedTools.screenshot.activate();
  });

  // If all event listeners have been properly set, display our stuff.
  panel.style.display = null;
  canvas.style.display = null;
}, 50);

/* ---------- */

function onMouseDown(event) {};

function onResize(event) {
  view.viewSize = new Size(window.innerWidth, window.innerHeight);
  view.center = new Point(document.body.scrollLeft, document.body.scrollTop);
}

function onScroll(event) {
  if(Key.isDown('control')) {
    /// ???
  } else {
    view.center = new Point(document.body.scrollLeft, document.body.scrollTop);
  }
}

window.addEventListener('resize', onResize, false);
document.addEventListener('scroll', onScroll, false);

onResize();
onScroll();
setCursor();

var canvasEnabled = false;
var toggleDrawMode = function() {
  if(canvasEnabled) {
    // Disable
    panel.className = 'NOTED_DEACTIVATED';
    canvas.className = 'NOTED_HIDE';
    document.body.className = null;
    // Activating the default tool clears the rest.
    tool.activate();
    save();
  } else {
    // Enable
    panel.className = 'NOTED_ACTIVATED';
    canvas.className = null;
    document.body.className = 'NOTED_HIDE';
  }
  canvasEnabled = !canvasEnabled;
};

canvas.className = 'NOTED_HIDE';

window.addEventListener("message", function(event) {
    // Only use messages from window
    if (event.source != window)
      return;

    if(event.data.type) {
      var request = event.data;
      if (request.type == "_NOTED_LOAD_CANVAS") {
        project.clear();
        project.importJSON(request.payload);
        
      } else if (request.type == "_NOTED_SEND_PAGE_IMG") {
        // Reactivate Panel.
        panel.className = 'NOTED_ACTIVATED';
        canvas.className = null;
        // Deal with image cropping and such.
        var imageObj = new Image();
        
        imageObj.onload = function() {
          var tempCanvas = document.getElementById("NOTED_TEMP_CANVAS_____");
          var tempContext = tempCanvas.getContext('2d');
          tempCanvas.width = request.width;
          tempCanvas.height = request.height;
          tempContext.drawImage(
            imageObj,
            // Source coords
            request.x,
            request.y,
            request.width,
            request.height,
            // Dest coords
            0,
            0,
            request.width,
            request.height
          );
          document.getElementById("NOTED_PREVIEW_____").href = tempCanvas.toDataURL();
          document.getElementById("NOTED_PREVIEW_____").children[0].src = tempCanvas.toDataURL();
        };
        
        imageObj.src = request.payload;
      } else if (request.type == "_NOTED_SEND_PAGE_COLOR_IMG") {
        imageObj = new Image();
        
        imageObj.onload = function() {
          var tempCanvas = document.getElementById("NOTED_TEMP_CANVAS_____");
          var tempContext = tempCanvas.getContext('2d');
          tempCanvas.width = window.innerWidth;
          tempCanvas.height = window.innerHeight;
          
          tempContext.drawImage(imageObj, 0, 0);
          
          var pointData = tempContext.getImageData(request.x, request.y, 1, 1).data;
          var colorVal = new Color(pointData[0]/255, pointData[1]/255, pointData[2]/255, pointData[3]/255).toCSS(true);
          if(request.isFill) {
            setFillColor(colorVal);
            if(getFillAlpha() == 0) setFillAlpha(255);
          } else {
            setStrokeColor(colorVal);
          }
        }
        imageObj.src = request.payload;
      }
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
};

NotedTools.select.onMouseDown = function(event) {
  this.hasDragged = false;
};

NotedTools.select.onMouseDrag = function(event) {
  this.hasDragged = true;
  
  project.selectedItems.forEach(function(item) {
    item.translate(event.delta);
  });
};

// * Free Draw Tool * //
// Avoid using the shift modifier if you value your sanity.
NotedTools.free.onMouseDown = function(event) {
  if(!Key.isDown('shift') || !this.currentPath) {
    this.currentPath = new Path({
      strokeColor: getStrokeColor(),
      strokeWidth: getStrokeWidth(),
      fillColor: getFillColor(),
      strokeCap: 'round',
      strokeJoin: 'round',
    });
    this.currentPath.add(event.point);
  } else {
    this.currentPath.add(event.point);
  }
};

NotedTools.free.onMouseDrag = function(event) {
  if(!Key.isDown('shift')) {
    this.currentPath.add(event.point);
    this.currentPath.smooth();
  } else {
    this.currentPath.segments[this.currentPath.segments.length-1].point = event.point;
  }
};

NotedTools.free.onMouseUp = function(event) {
  if(!Key.isDown('shift')) {
    this.currentPath.add(event.point);
    this.currentPath.reduce();
    this.currentPath.simplify();
    this.currentPath = null;
    save();
  }
};

// * Circle tool * //
NotedTools.circle.onMouseDown = function(event) {
  this.currentPath = new Path.Circle({
    strokeColor: getStrokeColor(),
    strokeWidth: getStrokeWidth(),
    fillColor: getFillColor(),
    center: event.point,
    radius: 5,
  });
};

NotedTools.circle.onMouseDrag = function(event) {
  this.currentPath.scaling = event.downPoint.getDistance(event.point)/5;
};

NotedTools.circle.onMouseUp = function(event) {
  save();
};

// * Rectangle tool * //
NotedTools.rect.onMouseDown = function(event) {
  this.currentPath = new Path.Rectangle({
    strokeColor: getStrokeColor(),
    strokeWidth: getStrokeWidth(),
    fillColor: getFillColor(),
    from: event.point,
    to: event.point+1,
  });
};

NotedTools.rect.onMouseDrag = function(event) {
  this.currentPath.segments[0].point.x = event.point.x;
  this.currentPath.segments[1].point = event.point;
  this.currentPath.segments[2].point.y = event.point.y;
};

NotedTools.rect.onMouseUp = function(event) {
  save();
};


// * Text tool * //
NotedTools.text.onMouseUp = function(event) {
  var result = project.hitTest(event.point);
  
  if(result && result.item.className == "PointText") {
    if(this.currentText) this.currentText.selected = false;
    if(this.currentText != result.item) {
      this.currentText = result.item;
      this.currentText.selected = true;
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
      strokeColor: getStrokeColor(),
      strokeWidth: getStrokeWidth() / 10,
      fillColor: getFillColor().toCSS(true),
      fontSize: getStrokeWidth() * 3,
      fontFamily: 'Impact, Arial, Helveceta, DejaVu Sans, sans-serif',
      position: event.point,
      selected: true,
    });
  }
};

NotedTools.text.onKeyDown = function(event) {
  if(!this.currentText) return;
  event.preventDefault();
  if(event.key == 'backspace') {
    if(this.currentText.content.length === 0) {
      this.currentText.remove();
    }
    this.currentText.content = this.currentText.content.substring(0, this.currentText.content.length-1);
  } else {
    this.currentText.content += event.character;
  }
};

// * Erase Tool * //
NotedTools.erase.onMouseDrag = function(event) {
  var result = project.hitTest(event.point);
  if(result) {
    result.item.remove();
  }
};

NotedTools.erase.onMouseUp = function(event) {
  var result = project.hitTest(event.point);
  if(result) {
    result.item.remove();
  }
  save();
};

// * Screenshot Tool *//
NotedTools.screenshot.onMouseDown = function(event) {
  if(!this.isBusy) {
    this.currentPath = new Path.Rectangle({
      strokeColor: "rgba(0,0,0,0.4)",
      fillColor: "rgba(0,0,0,0.2)",
      strokeWidth: 4,
      from: event.point,
      to: event.point+1,
    });
    this.startX = event.event.clientX;
    this.startY = event.event.clientY;
  }
};

NotedTools.screenshot.onMouseDrag = function(event) {
  if(!this.isBusy) {
    this.currentPath.segments[0].point.x = event.point.x;
    this.currentPath.segments[1].point = event.point;
    this.currentPath.segments[2].point.y = event.point.y;
  }
};

NotedTools.screenshot.onMouseUp = function(event) {
  if(!this.isBusy) {
    this.isBusy = true;
    // Hide Panel
    panel.className = "NOTED_INACTIVE";
    var x = this.startX;
    var y = this.startY;
    var width = event.event.clientX - this.startX;
    var height = event.event.clientY - this.startY;
    
    // Normalize if the user dragged in an unusual direction.
    if(width < 1) {
      x = event.event.clientX;
      width *= -1;
    }
    
    if(height < 1) {
      y = event.event.clientY;
      height *= -1;
    }
    
    var pos = event.middlePoint;
    pos.y = pos.y + (this.currentPath.bounds.height / 3);
    pos.x = pos.x - (this.currentPath.bounds.height / 3);
    var timerText = new PointText({
      position: pos,
      content: "5",
      fillColor: "#FFF",
      strokeColor: "#000",
      strokeWidth: 1,
      fontWeight: "bold",
      fontSize: this.currentPath.bounds.height,
    });
    
    var i = 5;
    var intval = setInterval(function () {
      i--;
      
      if(i === 1) {
        // So that the body color is white.
        canvas.className = 'NOTED_HIDE';
      }
      
      if(i === 0) {
        timerText.remove();
        NotedTools.screenshot.currentPath.remove();
        view.update();
        clearInterval(intval);
        window.postMessage({
          type:"_NOTED_CAPTURE_PAGE",
          x: x,
          y: y,
          width: width,
          height: height
        }, "*");
        NotedTools.screenshot.isBusy = false;
      } else {
        timerText.content = i;
        view.update();
      }
    }, 1000);
  }
};

/* Eyedropper */
canvas.addEventListener("contextmenu", function(e){
  if(paper.tool == NotedTools.eyedropper) {
    e.preventDefault();
  }
}, false);

NotedTools.eyedropper.onMouseUp = function(event) {
  event.preventDefault();
  window.postMessage({
    type:"_NOTED_CAPTURE_PAGE_COLOR",
    x: event.event.clientX,
    y: event.event.clientY,
    isFill: event.event.button != 0 ? true : false,
  }, "*");
  return false;
}
