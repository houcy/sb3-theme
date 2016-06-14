'use strict';

function Sb3Theme() {
  var self = this;
  var vertexCounts = {
    "true": {
      "117": "stack",
      "81": "cap",
      "-1": "boolean",
      "-2": "number",
      "-4": "string",
      "77": "hat",
      "233": "c-block",
      "197": "c-end",
      "-3": "c-else"
    },
    "false": {
      "120": "stack",
      "80": "cap",
      "22": "boolean",
      "26": "number",
      "42": "string",
      "81": "hat",
      "241": "c-block",
      "201": "c-end",
      "360": "c-else"
    }
  };
  var inputVertexCounts = {
    "26": "input-number",
    "42": "input-string"
  };
  var categoryColors = {
    "#4CBF56": "operators",
    "#9966FF": "looks",
    "#4C97FF": "motion",
    "#FFAB19": "control",
    "#FFD500": "events"
  };

  // hang out until the SVG exists, then run the init function
  var initObserver = new MutationObserver(function(mutations) {
    if(document.querySelector('svg.blocklySvg')) {
      initObserver.disconnect();
      initSVG();
    }
  });

  if(document.querySelector('svg.blocklySvg')) {
    initSVG();
  } else {
    initObserver.observe(document.getElementsByTagName('html')[0], {childList: true, subtree: true}); // <body> doesn't always exist at runtime
  }

  var initSVG = function() {
    self.svg = document.querySelector('svg.blocklySvg');
    self.dragsvg = document.querySelector('svg.blocklyDragSurface');

    self.NS = Blockly.SVG_NS;
    var defs = self.svg.getElementsByTagName('defs')[0];
    for(let i = 0; i < addFilters.length; i++) {
      var doc = new DOMParser().parseFromString(`<svg xmlns="` + self.NS + `">` + addFilters[i] + `</svg>`, 'image/svg+xml');
      defs.appendChild( defs.ownerDocument.importNode(doc.documentElement.firstElementChild, true) );
    }

    //set up an observer for future changes to the document
    var observer = new MutationObserver(function(mutations) {
      self.newBlocks = [];
      self.horizontal = Blockly.mainWorkspace.horizontalLayout;

      for(let m = 0; m < mutations.length; m++) {
        for(let n = 0; n < mutations[m].addedNodes.length; n++) {
          let node = mutations[m].addedNodes[n];
          if(node.nodeType == 1) {
            if(node.classList.contains("blocklyDraggable")) {
              styleBlock(node);
            } else {
              styleInput(node.querySelector('g.blocklyEditableText'));
            }
          }
        }
      }
      if(self.newBlocks.length) {
        for(let i in onChanges) {
          onChanges[i]();
        }
      }
    });

    observer.observe(self.svg, {childList: true, subtree: true});
  }

  var styleBlock = function(block) {
    self.newBlocks.push(block);

    let path = block.querySelector(":scope > path");

    let vertexCount = path.getAttribute("d").match(/,| /g).length;
    let shapeName = vertexCounts[self.horizontal.toString()][vertexCount];
    if(shapeName) {
      block.classList.add(shapeName);
    }

    let colorName = categoryColors[path.getAttribute("fill")];
    if(colorName) {
      block.classList.add(colorName);
    }

    //empty bool inputs should all have the same d attribute
    let bools = block.querySelectorAll(':scope > path[d="M 16,0  h 16 l 16,16 l -16,16 h -16 l -16,-16 l 16,-16 z"]');
    for(let j = 0; j < bools.length; j++) {
      bools[j].classList.add("input", "input-boolean");
    }

    let inputs = block.querySelectorAll(':scope > g > g.blocklyEditableText');
    for(let j = 0; j < inputs.length; j++) {
      styleInput(inputs[j]);
    }
  }

  var styleInput = function(block) {
    if(block) {
      var input = block.parentNode;
      input.classList.add("input");

      var inputVertexCount = input.getElementsByTagName("path")[0].getAttribute("d").match(/,| /g).length;
      var inputShapeName = inputVertexCounts[inputVertexCount];
      if(inputShapeName) {
        if(inputShapeName == "input-string") {
          if(block.querySelector("text tspan")) {
            input.classList.add("input-dropdown");
          } else {
            input.classList.add("input-string");
          }
        } else {
          input.classList.add(inputShapeName);
        }
      }
    }
  }

  var onChanges = [];
  this.addOnChange = function(func) {
    onChanges.push(func);
  }
  var addFilters = [];
  this.addFilter = function(filter) {
    addFilters.push(filter)
  }

  this.getBlocksWithText = function(query) {
    var result = [];
    for(let i = 0; i < this.newBlocks.length; i++) {
      let text = "";
      let children = this.newBlocks[i].children;
      for(let j = 0; j < children.length; j++) {
        if(children[j].tagName.match(/text/i)) {
          text += " " + children[j].textContent;
        }
      }
      text = text.replace(/(&nbsp;|  +)/g, " ")
      if(text.match(query)) {
        result.push( this.newBlocks[i] );
      }
    }
    return result;
  }

  this.getBlocksWithIcon = function(query) {
    var result = [];
    for(let i = 0; i < this.newBlocks.length; i++) {
      let images = this.newBlocks[i].querySelectorAll(':scope > g > image');
      for(let j = 0; j < images.length; j++) {
        if(images[j].getAttribute('xlink:href').match(query)) {
          result.push( this.newBlocks[i] );
        }
      }
    }
    return result;
  }

}

window.sb3theme = new Sb3Theme();
