/*!
 *   DOM Display Detector
 *   version: 2.0.0
 *    author: Cevad Tokatli <cevadtokatli@hotmail.com>
 *   website: http://cevadtokatli.com
 *    github: https://github.com/cevadtokatli/dom-display-detector
 *   license: MIT
 */

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _readOnlyError(name) {
  throw new Error("\"" + name + "\" is read-only");
}

/**
 * @typedef {Object} ParentValues
 * @property {number} width
 * @property {number} height
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} ChildValues
 * @property {number} width
 * @property {number} height
 * @property {number} left
 * @property {number} right
 */

/**
 * @typedef {Object} DDPElement
 * @property {HTMLElement} elm
 * @property {boolean} bindOnce
 * @property {Function} appearCallback
 * @property {Function} disCallback
 */
var elements = [];

var DOMDisplayDetector =
/*#__PURE__*/
function () {
  function DOMDisplayDetector() {
    _classCallCheck(this, DOMDisplayDetector);
  }

  _createClass(DOMDisplayDetector, null, [{
    key: "init",

    /**
     * Adds event listeners to window.
     */
    value: function init() {
      // dont install if runs on the server.
      if (typeof window === 'undefined') {
        return;
      }

      window.addEventListener('resize', this.detect, true);
      window.addEventListener('scroll', this.detect, true);
    }
    /**
     * Binds an element or elements to DOM Display Detector.
     *
     * @param {HTMLElement|string} elm
     * @param {Function} appearCallback
     * @param {Function} disCallback
     */

  }, {
    key: "bind",
    value: function bind(elm, appearCallback, disCallback) {
      var _this = this;

      var elms = this.getElement(elm);
      elms.forEach(function (e) {
        _this.bindElement(e, appearCallback, disCallback, false);
      });
    }
    /**
     * Binds an element or elements to DOM Display Detector for once.
     *
     * @param {HTMLElement|string} elm
     * @param {Function} appearCallback
     * @param {Function} disCallback
     */

  }, {
    key: "bindOnce",
    value: function bindOnce(elm, appearCallback, disCallback) {
      var _this2 = this;

      var elms = this.getElement(elm);
      elms.forEach(function (e) {
        _this2.bindElement(e, appearCallback, disCallback, true);
      });
    }
    /**
     * Unbinds elements. It doesn’t work with elements that have been bound with the bindOnce method since they unbind themselves.
     *
     * @param {HTMLElement|string} elm
     */

  }, {
    key: "unbind",
    value: function unbind(elm) {
      var elms = this.getElement(elm);
      elements = (_readOnlyError("elements"), elements.filter(function (e) {
        if (elms.indexOf(e.elm) > -1 && !e.bindOnce) {
          e.elm.scrollAnimationBound = false;
          return false;
        }

        return true;
      }));
    }
    /**
     * Binds an element to DOM Display Detector if the element has been loaded.
     *
     * @param {HTMLElement|string} elm
     * @param {Function} appearCallback
     * @param {Function} disCallback
     * @param {boolean} bindOnce
     */

  }, {
    key: "bindElement",
    value: function bindElement(elm, appearCallback, disCallback, bindOnce) {
      var _this3 = this;

      if (!elm.scrollAnimationBound) {
        var display = window.getComputedStyle(elm, null).display;

        if (display == 'none' || elm.offsetWidth != 0 || elm.offsetHeight != 0) {
          elm.scrollAnimationBound = true;
          var e = {
            elm: elm,
            appearCallback: appearCallback,
            disCallback: disCallback,
            seen: false,
            bindOnce: bindOnce
          };
          elements.push(e);
          var w = this.getWindowPosition();
          this.isSeen(e, w);
        } else {
          // waits for the element to be loaded
          setTimeout(function () {
            _this3.bindElement(elm, appearCallback, disCallback, bindOnce);
          }, 100);
        }
      }
    }
    /**
     * Gets elements from a string or from the elements themselves.
     *
     * @param {HTMLElement|string} elm
     * @returns {HTMLElement[]}
     */

  }, {
    key: "getElement",
    value: function getElement(elm) {
      if (typeof elm == 'string') {
        return Array.prototype.map.call(document.querySelectorAll(elm), function (t) {
          return t;
        });
      } else {
        return [elm];
      }
    }
    /**
     * Checks if elements are displayed or not.
     */

  }, {
    key: "detect",
    value: function detect() {
      var _this4 = this;

      var w = this.getWindowPosition();
      elements.forEach(function (e) {
        _this4.isSeen(e, w);
      });
    }
    /**
     * If an element is displayed and invokes the appropriate callback.
     *
     * @param {DDPElement} e
     * @param {ParentValues} w
     */

  }, {
    key: "isSeen",
    value: function isSeen(e, w) {
      var seen = false,
          elm = e.elm,
          o = this.getOffset(elm),
          val = {
        left: o.left,
        top: o.top,
        width: elm.offsetWidth,
        height: elm.offsetHeight
      };

      while (elm = this.getScrollParent(elm)) {
        o = this.getOffset(elm);
        val.left -= o.left;
        val.top -= o.top;

        if (this.checkIfSeen({
          x: elm.scrollLeft,
          y: elm.scrollTop,
          width: elm.offsetWidth,
          height: elm.offsetHeight
        }, val)) {
          val.left = o.left;
          val.top = o.top;
        } else {
          break;
        }
      }

      if (!elm && this.checkIfSeen(w, val)) {
        seen = true;
      }

      if (seen) {
        if (!e.seen) {
          e.seen = true;

          if (e.bindOnce) {
            var i = elements.indexOf(e);
            elements.splice(i, 1);
          } else {
            if (typeof e.appearCallback == 'function') {
              e.appearCallback({
                target: e.elm
              });
            }
          }
        }
      } else {
        if (e.seen) {
          e.seen = false;

          if (typeof e.disCallback == 'function') {
            e.disCallback({
              target: e.elm
            });
          }
        }
      }
    }
    /**
     * Checks an element if it is seen on the screen.
     * 
     * @param {ParentValues} p
     * @param {ChildValues} c
     * @returns {boolean}
     */

  }, {
    key: "checkIfSeen",
    value: function checkIfSeen(p, c) {
      //console.log((p.height + p.y) >= c.top)
      //console.log(p.y <= (c.top + c.height)
      //console.log((p.width + p.x) >= c.left)
      //console.log(p.x <= (c.left + c.width))
      // top, bottom, left, right
      if (p.height + p.y >= c.top && p.y <= c.top + c.height && p.width + p.x >= c.left && p.x <= c.left + c.width) {
        return true;
      }

      return false;
    }
    /**
     * Returns window's position.
     *
     * @returns {ParentValues}
     */

  }, {
    key: "getWindowPosition",
    value: function getWindowPosition() {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
        x: window.pageXOffset,
        y: window.pageYOffset
      };
    }
    /**
     * Returns left and top offets of an element.
     *
     * @param  {HTMLElement} elm
     * @returns {{left:number, top:number}}
     */

  }, {
    key: "getOffset",
    value: function getOffset(elm) {
      var left = 0,
          top = 0;

      do {
        if (!isNaN(elm.offsetLeft)) {
          left += elm.offsetLeft;
        }

        if (!isNaN(elm.offsetTop)) {
          top += elm.offsetTop;
        }

        elm = elm.offsetParent;
      } while (elm);

      return {
        left: left,
        top: top
      };
    }
    /**
     * Gets scroll parent of the given element.
     * 
     * @param {HTMLElement} elm 
     * @returns {HTMLElement}
     */

  }, {
    key: "getScrollParent",
    value: function getScrollParent(elm) {
      var style = window.getComputedStyle(elm, null),
          excludeStaticParent = style.position == 'absolute';

      if (style.position == 'fixed') {
        return null;
      }

      for (var parent = elm; parent = parent.parentElement;) {
        style = window.getComputedStyle(parent, null);

        if (excludeStaticParent && style.position == 'static') {
          continue;
        }

        if (/(auto|scroll|hidden)/.test(style.overflow + style.overflowY + style.overflowX)) {
          return parent;
        }
      }

      return null;
    }
  }]);

  return DOMDisplayDetector;
}();

DOMDisplayDetector.detect = DOMDisplayDetector.detect.bind(DOMDisplayDetector);
DOMDisplayDetector.init.call(DOMDisplayDetector);
var bind = DOMDisplayDetector.bind.bind(DOMDisplayDetector);
var bindOnce = DOMDisplayDetector.bindOnce.bind(DOMDisplayDetector);
var unbind = DOMDisplayDetector.unbind.bind(DOMDisplayDetector);

export { bind, bindOnce, unbind };
