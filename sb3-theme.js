function Sb3Theme() {
  var self = this;
  var vertexCounts = {
    "true": {
      "117": "stack",
      "81": "cap",
      "-1": "boolean",
      "-2": "reporter",
      "77": "hat",
      "233": "cblock",
      "197": "cend",
      "-3": "celse"
    },
    "false": {
      "120": "stack",
      "80": "cap",
      "22": "boolean",
      "26": "reporter",
      "81": "hat",
      "239": "cblock",
      "201": "cend",
      "360": "celse"
    }
  }
  var categoryColors = {
    "#4CBF56": "operators",
    "#9966FF": "looks",
    "#4C97FF": "motion",
    "#FFAB19": "control",
    "#FFD500": "events"
  }


  // hang out until the SVG exists, then run the init function
  var initObserver = new MutationObserver(function(mutations) {
    if(document.querySelector('svg.blocklySvg')) {
      initObserver.disconnect();
      self._initSVG();
    }
  });

  if(document.querySelector('svg.blocklySvg')) {
    this._initSVG();
  } else {
    initObserver.observe(document.getElementsByTagName('html')[0], {childList: true, subtree: true}); // <body> doesn't always exist at runtime
  }

  this._initSVG = function() {
    this.svg = document.querySelector('svg.blocklySvg');
    this.dragsvg = document.querySelector('svg.blocklyDragSurface');

    this.css = document.createElement("style");
    document.body.appendChild(this.css);

    this.NS = Blockly.SVG_NS;
    this.defs = this.svg.getElementsByTagName('defs')[0];
    for(i in onLoads) {
      onLoads[i]();
    }

    //set up an observer for future changes to the document
    var draggableCount = -1;
    var observer = new MutationObserver(function(mutations) {
      self.allBlocks = Array.prototype.slice.call(self.svg.querySelectorAll(".blocklyDraggable"));
      var dragdrag = self.dragsvg.querySelectorAll(".blocklyDraggable"); //cast that noelist to an array so I can merge it with this other nodelist
      for(let i = 0; i < dragdrag.length; i++) {
        self.allBlocks.push(dragdrag[i]);
      }
      var flyoutVisibility = self.svg.getElementsByClassName("blocklyFlyout")[0].style.display == "block";
      if(flyoutVisibility || draggableCount != self.allBlocks.length) {
        draggableCount = self.allBlocks.length;
        onChange();
      }
    });

    observer.observe(this.svg, {childList: true, subtree: true});
  }

  var onChange = function() {
    self.horizontal = Blockly.mainWorkspace.horizontalLayout;

    for(let i in self.allBlocks) {
      let path = self.allBlocks[i].querySelector(":scope > path");

      let vertexCount = path.getAttribute("d").match(/,| /g).length;
      let shapeName = vertexCounts[self.horizontal.toString()][vertexCount];
      if(shapeName) {
        self.allBlocks[i].classList.add(shapeName);
      }

      let colorName = categoryColors[path.getAttribute("fill")];
      if(colorName) {
        self.allBlocks[i].classList.add(colorName);
      }
    }

    for(let i in onChanges) {
      onChanges[i]();
    }
  }

  var onLoads = [];
  this.addInit = function(func) {
    onLoads.push(func);
  }
  var onChanges = [];
  this.addOnChange = function(func) {
    onChanges.push(func);
  }

  this.addFilter = function(filter) {
    var doc = new DOMParser().parseFromString(`<svg xmlns="` + this.NS + `">` + filter + `</svg>`, 'image/svg+xml');
    this.defs.appendChild( this.defs.ownerDocument.importNode(doc.documentElement.firstElementChild, true) );
  }

  this.getBlocksWithText = function(query) {
    var result = [];
    for(let i = 0; i < this.allBlocks.length; i++) {
      let text = "";
      let children = this.allBlocks[i].children;
      for(let j = 0; j < children.length; j++) {
        if(children[j].tagName.match(/text/i)) {
          text += " " + children[j].textContent;
        }
      }
      text = text.replace(/(&nbsp;|  +)/g, " ")
      if(text.match(query)) {
        result.push( this.allBlocks[i] );
      }
    }
    return result;
  }

  this.getBlocksWithIcon = function(query) {
    var result = [];
    for(let i = 0; i < this.allBlocks.length; i++) {
      let images = this.allBlocks[i].querySelectorAll(':scope > g > image');
      for(let j = 0; j < images.length; j++) {
        if(images[j].getAttribute('xlink:href').match(query)) {
          result.push( this.allBlocks[i] );
        }
      }
    }
    return result;
  }


  this.getInputs = function(query) {
    var result = [];
    for(let i = 0; i < query.length; i++) {
      let texts = query[i].querySelectorAll(':scope > g > g.blocklyEditableText');
      for(let j = 0; j < texts.length; j++) {
        result.push( texts[j].parentNode );
      }
    }
    return result;
  }

}
