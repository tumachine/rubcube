// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"lib/split/split.js":[function(require,module,exports) {

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// The programming goals of Split.js are to deliver readable, understandable and
// maintainable code, while at the same time manually optimizing for tiny minified file size,
// browser compatibility without additional requirements, graceful fallback (IE8 is supported)
// and very few assumptions about the user's page layout.
var global = window;
var document = global.document; // Save a couple long function names that are used frequently.
// This optimization saves around 400 bytes.

var addEventListener = 'addEventListener';
var removeEventListener = 'removeEventListener';
var getBoundingClientRect = 'getBoundingClientRect';
var gutterStartDragging = '_a';
var aGutterSize = '_b';
var bGutterSize = '_c';
var HORIZONTAL = 'horizontal';

var NOOP = function NOOP() {
  return false;
}; // Figure out if we're in IE8 or not. IE8 will still render correctly,
// but will be static instead of draggable.


var isIE8 = global.attachEvent && !global[addEventListener]; // Helper function determines which prefixes of CSS calc we need.
// We only need to do this once on startup, when this anonymous function is called.
//
// Tests -webkit, -moz and -o prefixes. Modified from StackOverflow:
// http://stackoverflow.com/questions/16625140/js-feature-detection-to-detect-the-usage-of-webkit-calc-over-calc/16625167#16625167

var calc = "".concat(['', '-webkit-', '-moz-', '-o-'].filter(function (prefix) {
  var el = document.createElement('div');
  el.style.cssText = "width:".concat(prefix, "calc(9px)");
  return !!el.style.length;
}).shift(), "calc"); // Helper function checks if its argument is a string-like type

var isString = function isString(v) {
  return typeof v === 'string' || v instanceof String;
}; // Helper function allows elements and string selectors to be used
// interchangeably. In either case an element is returned. This allows us to
// do `Split([elem1, elem2])` as well as `Split(['#id1', '#id2'])`.


var elementOrSelector = function elementOrSelector(el) {
  if (isString(el)) {
    var ele = document.querySelector(el);

    if (!ele) {
      throw new Error("Selector ".concat(el, " did not match a DOM element"));
    }

    return ele;
  }

  return el;
}; // Helper function gets a property from the properties object, with a default fallback


var getOption = function getOption(options, propName, def) {
  var value = options[propName];

  if (value !== undefined) {
    return value;
  }

  return def;
};

var getGutterSize = function getGutterSize(gutterSize, isFirst, isLast, gutterAlign) {
  if (isFirst) {
    if (gutterAlign === 'end') {
      return 0;
    }

    if (gutterAlign === 'center') {
      return gutterSize / 2;
    }
  } else if (isLast) {
    if (gutterAlign === 'start') {
      return 0;
    }

    if (gutterAlign === 'center') {
      return gutterSize / 2;
    }
  }

  return gutterSize;
}; // Default options


var defaultGutterFn = function defaultGutterFn(i, gutterDirection) {
  var gut = document.createElement('div');
  gut.className = "gutter gutter-".concat(gutterDirection);
  return gut;
};

var defaultElementStyleFn = function defaultElementStyleFn(dim, size, gutSize) {
  var style = {};

  if (!isString(size)) {
    if (!isIE8) {
      style[dim] = "".concat(calc, "(").concat(size, "% - ").concat(gutSize, "px)");
    } else {
      style[dim] = "".concat(size, "%");
    }
  } else {
    style[dim] = size;
  }

  return style;
};

var defaultGutterStyleFn = function defaultGutterStyleFn(dim, gutSize) {
  return _defineProperty({}, dim, "".concat(gutSize, "px"));
}; // The main function to initialize a split. Split.js thinks about each pair
// of elements as an independant pair. Dragging the gutter between two elements
// only changes the dimensions of elements in that pair. This is key to understanding
// how the following functions operate, since each function is bound to a pair.
//
// A pair object is shaped like this:
//
// {
//     a: DOM element,
//     b: DOM element,
//     aMin: Number,
//     bMin: Number,
//     dragging: Boolean,
//     parent: DOM element,
//     direction: 'horizontal' | 'vertical'
// }
//
// The basic sequence:
//
// 1. Set defaults to something sane. `options` doesn't have to be passed at all.
// 2. Initialize a bunch of strings based on the direction we're splitting.
//    A lot of the behavior in the rest of the library is paramatized down to
//    rely on CSS strings and classes.
// 3. Define the dragging helper functions, and a few helpers to go with them.
// 4. Loop through the elements while pairing them off. Every pair gets an
//    `pair` object and a gutter.
// 5. Actually size the pair elements, insert gutters and attach event listeners.


var Split = function Split(idsOption) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var ids = idsOption;
  var dimension;
  var clientAxis;
  var position;
  var positionEnd;
  var clientSize;
  var elements; // Allow HTMLCollection to be used as an argument when supported

  if (Array.from) {
    ids = Array.from(ids);
  } // All DOM elements in the split should have a common parent. We can grab
  // the first elements parent and hope users read the docs because the
  // behavior will be whacky otherwise.


  var firstElement = elementOrSelector(ids[0]);
  var parent = firstElement.parentNode;
  var parentStyle = getComputedStyle ? getComputedStyle(parent) : null;
  var parentFlexDirection = parentStyle ? parentStyle.flexDirection : null; // Set default options.sizes to equal percentages of the parent element.

  var sizes = getOption(options, 'sizes') || ids.map(function () {
    return 100 / ids.length;
  }); // Standardize minSize to an array if it isn't already. This allows minSize
  // to be passed as a number.

  var minSize = getOption(options, 'minSize', 100);
  var minSizes = Array.isArray(minSize) ? minSize : ids.map(function () {
    return minSize;
  }); // Get other options

  var expandToMin = getOption(options, 'expandToMin', false);
  var gutterSize = getOption(options, 'gutterSize', 10);
  var gutterAlign = getOption(options, 'gutterAlign', 'center');
  var snapOffset = getOption(options, 'snapOffset', 30);
  var dragInterval = getOption(options, 'dragInterval', 1);
  var direction = getOption(options, 'direction', HORIZONTAL);
  var cursor = getOption(options, 'cursor', direction === HORIZONTAL ? 'col-resize' : 'row-resize');
  var gutter = getOption(options, 'gutter', defaultGutterFn);
  var elementStyle = getOption(options, 'elementStyle', defaultElementStyleFn);
  var gutterStyle = getOption(options, 'gutterStyle', defaultGutterStyleFn); // 2. Initialize a bunch of strings based on the direction we're splitting.
  // A lot of the behavior in the rest of the library is paramatized down to
  // rely on CSS strings and classes.

  if (direction === HORIZONTAL) {
    dimension = 'width';
    clientAxis = 'clientX';
    position = 'left';
    positionEnd = 'right';
    clientSize = 'clientWidth';
  } else if (direction === 'vertical') {
    dimension = 'height';
    clientAxis = 'clientY';
    position = 'top';
    positionEnd = 'bottom';
    clientSize = 'clientHeight';
  } // 3. Define the dragging helper functions, and a few helpers to go with them.
  // Each helper is bound to a pair object that contains its metadata. This
  // also makes it easy to store references to listeners that that will be
  // added and removed.
  //
  // Even though there are no other functions contained in them, aliasing
  // this to self saves 50 bytes or so since it's used so frequently.
  //
  // The pair object saves metadata like dragging state, position and
  // event listener references.


  function setElementSize(el, size, gutSize, i) {
    // Split.js allows setting sizes via numbers (ideally), or if you must,
    // by string, like '300px'. This is less than ideal, because it breaks
    // the fluid layout that `calc(% - px)` provides. You're on your own if you do that,
    // make sure you calculate the gutter size by hand.
    var style = elementStyle(dimension, size, gutSize, i);
    Object.keys(style).forEach(function (prop) {
      // eslint-disable-next-line no-param-reassign
      el.style[prop] = style[prop];
    });
  }

  function setGutterSize(gutterElement, gutSize, i) {
    var style = gutterStyle(dimension, gutSize, i);
    Object.keys(style).forEach(function (prop) {
      // eslint-disable-next-line no-param-reassign
      gutterElement.style[prop] = style[prop];
    });
  }

  function getSizes() {
    return elements.map(function (element) {
      return element.size;
    });
  } // Supports touch events, but not multitouch, so only the first
  // finger `touches[0]` is counted.


  function getMousePosition(e) {
    if ('touches' in e) return e.touches[0][clientAxis];
    return e[clientAxis];
  } // Actually adjust the size of elements `a` and `b` to `offset` while dragging.
  // calc is used to allow calc(percentage + gutterpx) on the whole split instance,
  // which allows the viewport to be resized without additional logic.
  // Element a's size is the same as offset. b's size is total size - a size.
  // Both sizes are calculated from the initial parent percentage,
  // then the gutter size is subtracted.


  function adjust(offset) {
    var a = elements[this.a];
    var b = elements[this.b];
    var percentage = a.size + b.size;
    a.size = offset / this.size * percentage;
    b.size = percentage - offset / this.size * percentage;
    setElementSize(a.element, a.size, this[aGutterSize], a.i);
    setElementSize(b.element, b.size, this[bGutterSize], b.i);
  } // drag, where all the magic happens. The logic is really quite simple:
  //
  // 1. Ignore if the pair is not dragging.
  // 2. Get the offset of the event.
  // 3. Snap offset to min if within snappable range (within min + snapOffset).
  // 4. Actually adjust each element in the pair to offset.
  //
  // ---------------------------------------------------------------------
  // |    | <- a.minSize               ||              b.minSize -> |    |
  // |    |  | <- this.snapOffset      ||     this.snapOffset -> |  |    |
  // |    |  |                         ||                        |  |    |
  // |    |  |                         ||                        |  |    |
  // ---------------------------------------------------------------------
  // | <- this.start                                        this.size -> |


  function drag(e) {
    var offset;
    var a = elements[this.a];
    var b = elements[this.b];
    if (!this.dragging) return; // Get the offset of the event from the first side of the
    // pair `this.start`. Then offset by the initial position of the
    // mouse compared to the gutter size.

    offset = getMousePosition(e) - this.start + (this[aGutterSize] - this.dragOffset);

    if (dragInterval > 1) {
      offset = Math.round(offset / dragInterval) * dragInterval;
    } // If within snapOffset of min or max, set offset to min or max.
    // snapOffset buffers a.minSize and b.minSize, so logic is opposite for both.
    // Include the appropriate gutter sizes to prevent overflows.


    if (offset <= a.minSize + snapOffset + this[aGutterSize]) {
      offset = a.minSize + this[aGutterSize];
    } else if (offset >= this.size - (b.minSize + snapOffset + this[bGutterSize])) {
      offset = this.size - (b.minSize + this[bGutterSize]);
    } // Actually adjust the size.


    adjust.call(this, offset); // Call the drag callback continously. Don't do anything too intensive
    // in this callback.

    getOption(options, 'onDrag', NOOP)();
  } // Cache some important sizes when drag starts, so we don't have to do that
  // continously:
  //
  // `size`: The total size of the pair. First + second + first gutter + second gutter.
  // `start`: The leading side of the first element.
  //
  // ------------------------------------------------
  // |      aGutterSize -> |||                      |
  // |                     |||                      |
  // |                     |||                      |
  // |                     ||| <- bGutterSize       |
  // ------------------------------------------------
  // | <- start                             size -> |


  function calculateSizes() {
    // Figure out the parent size minus padding.
    var a = elements[this.a].element;
    var b = elements[this.b].element;
    var aBounds = a[getBoundingClientRect]();
    var bBounds = b[getBoundingClientRect]();
    this.size = aBounds[dimension] + bBounds[dimension] + this[aGutterSize] + this[bGutterSize];
    this.start = aBounds[position];
    this.end = aBounds[positionEnd];
  }

  function innerSize(element) {
    // Return nothing if getComputedStyle is not supported (< IE9)
    // Or if parent element has no layout yet
    if (!getComputedStyle) return null;
    var computedStyle = getComputedStyle(element);
    if (!computedStyle) return null;
    var size = element[clientSize];
    if (size === 0) return null;

    if (direction === HORIZONTAL) {
      size -= parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
    } else {
      size -= parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);
    }

    return size;
  } // When specifying percentage sizes that are less than the computed
  // size of the element minus the gutter, the lesser percentages must be increased
  // (and decreased from the other elements) to make space for the pixels
  // subtracted by the gutters.


  function trimToMin(sizesToTrim) {
    // Try to get inner size of parent element.
    // If it's no supported, return original sizes.
    var parentSize = innerSize(parent);

    if (parentSize === null) {
      return sizesToTrim;
    }

    if (minSizes.reduce(function (a, b) {
      return a + b;
    }, 0) > parentSize) {
      return sizesToTrim;
    } // Keep track of the excess pixels, the amount of pixels over the desired percentage
    // Also keep track of the elements with pixels to spare, to decrease after if needed


    var excessPixels = 0;
    var toSpare = [];
    var pixelSizes = sizesToTrim.map(function (size, i) {
      // Convert requested percentages to pixel sizes
      var pixelSize = parentSize * size / 100;
      var elementGutterSize = getGutterSize(gutterSize, i === 0, i === sizesToTrim.length - 1, gutterAlign);
      var elementMinSize = minSizes[i] + elementGutterSize; // If element is too smal, increase excess pixels by the difference
      // and mark that it has no pixels to spare

      if (pixelSize < elementMinSize) {
        excessPixels += elementMinSize - pixelSize;
        toSpare.push(0);
        return elementMinSize;
      } // Otherwise, mark the pixels it has to spare and return it's original size


      toSpare.push(pixelSize - elementMinSize);
      return pixelSize;
    }); // If nothing was adjusted, return the original sizes

    if (excessPixels === 0) {
      return sizesToTrim;
    }

    return pixelSizes.map(function (pixelSize, i) {
      var newPixelSize = pixelSize; // While there's still pixels to take, and there's enough pixels to spare,
      // take as many as possible up to the total excess pixels

      if (excessPixels > 0 && toSpare[i] - excessPixels > 0) {
        var takenPixels = Math.min(excessPixels, toSpare[i] - excessPixels); // Subtract the amount taken for the next iteration

        excessPixels -= takenPixels;
        newPixelSize = pixelSize - takenPixels;
      } // Return the pixel size adjusted as a percentage


      return newPixelSize / parentSize * 100;
    });
  } // stopDragging is very similar to startDragging in reverse.


  function stopDragging() {
    var self = this;
    var a = elements[self.a].element;
    var b = elements[self.b].element;

    if (self.dragging) {
      getOption(options, 'onDragEnd', NOOP)(getSizes());
    }

    self.dragging = false; // Remove the stored event listeners. This is why we store them.

    global[removeEventListener]('mouseup', self.stop);
    global[removeEventListener]('touchend', self.stop);
    global[removeEventListener]('touchcancel', self.stop);
    global[removeEventListener]('mousemove', self.move);
    global[removeEventListener]('touchmove', self.move); // Clear bound function references

    self.stop = null;
    self.move = null;
    a[removeEventListener]('selectstart', NOOP);
    a[removeEventListener]('dragstart', NOOP);
    b[removeEventListener]('selectstart', NOOP);
    b[removeEventListener]('dragstart', NOOP);
    a.style.userSelect = '';
    a.style.webkitUserSelect = '';
    a.style.MozUserSelect = '';
    a.style.pointerEvents = '';
    b.style.userSelect = '';
    b.style.webkitUserSelect = '';
    b.style.MozUserSelect = '';
    b.style.pointerEvents = '';
    self.gutter.style.cursor = '';
    self.parent.style.cursor = '';
    document.body.style.cursor = '';
  } // startDragging calls `calculateSizes` to store the inital size in the pair object.
  // It also adds event listeners for mouse/touch events,
  // and prevents selection while dragging so avoid the selecting text.


  function startDragging(e) {
    // Right-clicking can't start dragging.
    if ('button' in e && e.button !== 0) {
      return;
    } // Alias frequently used variables to save space. 200 bytes.


    var self = this;
    var a = elements[self.a].element;
    var b = elements[self.b].element; // Call the onDragStart callback.

    if (!self.dragging) {
      getOption(options, 'onDragStart', NOOP)(getSizes());
    } // Don't actually drag the element. We emulate that in the drag function.


    e.preventDefault(); // Set the dragging property of the pair object.

    self.dragging = true; // Create two event listeners bound to the same pair object and store
    // them in the pair object.

    self.move = drag.bind(self);
    self.stop = stopDragging.bind(self); // All the binding. `window` gets the stop events in case we drag out of the elements.

    global[addEventListener]('mouseup', self.stop);
    global[addEventListener]('touchend', self.stop);
    global[addEventListener]('touchcancel', self.stop);
    global[addEventListener]('mousemove', self.move);
    global[addEventListener]('touchmove', self.move); // Disable selection. Disable!

    a[addEventListener]('selectstart', NOOP);
    a[addEventListener]('dragstart', NOOP);
    b[addEventListener]('selectstart', NOOP);
    b[addEventListener]('dragstart', NOOP);
    a.style.userSelect = 'none';
    a.style.webkitUserSelect = 'none';
    a.style.MozUserSelect = 'none';
    a.style.pointerEvents = 'none';
    b.style.userSelect = 'none';
    b.style.webkitUserSelect = 'none';
    b.style.MozUserSelect = 'none';
    b.style.pointerEvents = 'none'; // Set the cursor at multiple levels

    self.gutter.style.cursor = cursor;
    self.parent.style.cursor = cursor;
    document.body.style.cursor = cursor; // Cache the initial sizes of the pair.

    calculateSizes.call(self); // Determine the position of the mouse compared to the gutter

    self.dragOffset = getMousePosition(e) - self.end;
  } // adjust sizes to ensure percentage is within min size and gutter.


  sizes = trimToMin(sizes); // 5. Create pair and element objects. Each pair has an index reference to
  // elements `a` and `b` of the pair (first and second elements).
  // Loop through the elements while pairing them off. Every pair gets a
  // `pair` object and a gutter.
  //
  // Basic logic:
  //
  // - Starting with the second element `i > 0`, create `pair` objects with
  //   `a = i - 1` and `b = i`
  // - Set gutter sizes based on the _pair_ being first/last. The first and last
  //   pair have gutterSize / 2, since they only have one half gutter, and not two.
  // - Create gutter elements and add event listeners.
  // - Set the size of the elements, minus the gutter sizes.
  //
  // -----------------------------------------------------------------------
  // |     i=0     |         i=1         |        i=2       |      i=3     |
  // |             |                     |                  |              |
  // |           pair 0                pair 1             pair 2           |
  // |             |                     |                  |              |
  // -----------------------------------------------------------------------

  var pairs = [];
  elements = ids.map(function (id, i) {
    // Create the element object.
    var element = {
      element: elementOrSelector(id),
      size: sizes[i],
      minSize: minSizes[i],
      i: i
    };
    var pair;

    if (i > 0) {
      // Create the pair object with its metadata.
      pair = {
        a: i - 1,
        b: i,
        dragging: false,
        direction: direction,
        parent: parent
      };
      pair[aGutterSize] = getGutterSize(gutterSize, i - 1 === 0, false, gutterAlign);
      pair[bGutterSize] = getGutterSize(gutterSize, false, i === ids.length - 1, gutterAlign); // if the parent has a reverse flex-direction, switch the pair elements.

      if (parentFlexDirection === 'row-reverse' || parentFlexDirection === 'column-reverse') {
        var temp = pair.a;
        pair.a = pair.b;
        pair.b = temp;
      }
    } // Determine the size of the current element. IE8 is supported by
    // staticly assigning sizes without draggable gutters. Assigns a string
    // to `size`.
    //
    // IE9 and above


    if (!isIE8) {
      // Create gutter elements for each pair.
      if (i > 0) {
        var gutterElement = gutter(i, direction, element.element);
        setGutterSize(gutterElement, gutterSize, i); // Save bound event listener for removal later

        pair[gutterStartDragging] = startDragging.bind(pair); // Attach bound event listener

        gutterElement[addEventListener]('mousedown', pair[gutterStartDragging]);
        gutterElement[addEventListener]('touchstart', pair[gutterStartDragging]);
        parent.insertBefore(gutterElement, element.element);
        pair.gutter = gutterElement;
      }
    }

    setElementSize(element.element, element.size, getGutterSize(gutterSize, i === 0, i === ids.length - 1, gutterAlign), i); // After the first iteration, and we have a pair object, append it to the
    // list of pairs.

    if (i > 0) {
      pairs.push(pair);
    }

    return element;
  });

  function adjustToMin(element) {
    var isLast = element.i === pairs.length;
    var pair = isLast ? pairs[element.i - 1] : pairs[element.i];
    calculateSizes.call(pair);
    var size = isLast ? pair.size - element.minSize - pair[bGutterSize] : element.minSize + pair[aGutterSize];
    adjust.call(pair, size);
  }

  elements.forEach(function (element) {
    var computedSize = element.element[getBoundingClientRect]()[dimension];

    if (computedSize < element.minSize) {
      if (expandToMin) {
        adjustToMin(element);
      } else {
        // eslint-disable-next-line no-param-reassign
        element.minSize = computedSize;
      }
    }
  });

  function setSizes(newSizes) {
    var trimmed = trimToMin(newSizes);
    trimmed.forEach(function (newSize, i) {
      if (i > 0) {
        var pair = pairs[i - 1];
        var a = elements[pair.a];
        var b = elements[pair.b];
        a.size = trimmed[i - 1];
        b.size = newSize;
        setElementSize(a.element, a.size, pair[aGutterSize], a.i);
        setElementSize(b.element, b.size, pair[bGutterSize], b.i);
      }
    });
  }

  function destroy(preserveStyles, preserveGutter) {
    pairs.forEach(function (pair) {
      if (preserveGutter !== true) {
        pair.parent.removeChild(pair.gutter);
      } else {
        pair.gutter[removeEventListener]('mousedown', pair[gutterStartDragging]);
        pair.gutter[removeEventListener]('touchstart', pair[gutterStartDragging]);
      }

      if (preserveStyles !== true) {
        var style = elementStyle(dimension, pair.a.size, pair[aGutterSize]);
        Object.keys(style).forEach(function (prop) {
          elements[pair.a].element.style[prop] = '';
          elements[pair.b].element.style[prop] = '';
        });
      }
    });
  }

  if (isIE8) {
    return {
      setSizes: setSizes,
      destroy: destroy
    };
  }

  return {
    setSizes: setSizes,
    getSizes: getSizes,
    collapse: function collapse(i) {
      adjustToMin(elements[i]);
    },
    destroy: destroy,
    parent: parent,
    pairs: pairs
  };
};

var _default = Split;
exports.default = _default;
},{}],"split.js":[function(require,module,exports) {
"use strict";

var _split = _interopRequireDefault(require("./lib/split/split"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Three.js - Responsive Editor
// from https://threejsfundamentals.org/threejs/threejs-responsive-editor.html

/* global Split */
// This code is only related to handling the split.
// Our three.js code has not changed
(0, _split.default)(['#view', '#controls'], {
  // eslint-disable-line new-cap
  sizes: [75, 25],
  minSize: 100,
  elementStyle: function elementStyle(dimension, size, gutterSize) {
    return {
      'flex-basis': "calc(".concat(size, "% - ").concat(gutterSize, "px)")
    };
  },
  gutterStyle: function gutterStyle(dimension, gutterSize) {
    return {
      'flex-basis': "".concat(gutterSize, "px")
    };
  }
});
},{"./lib/split/split":"lib/split/split.js"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "57564" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","split.js"], null)
//# sourceMappingURL=/split.478f6da2.js.map