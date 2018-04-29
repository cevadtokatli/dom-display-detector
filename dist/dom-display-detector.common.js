/*!
 *   DOM Display Detector
 *   version: 1.0.0
 *    author: Cevad Tokatli <cevadtokatli@hotmail.com>
 *   website: http://cevadtokatli.com
 *    github: https://github.com/cevadtokatli/dom-display-detector
 *   license: MIT
 */

'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
    window.setTimeout(callback, 1000 / 60);
};
var elements = [],
    _init = false;

var DOMDisplayDetector = function () {
    function DOMDisplayDetector() {
        classCallCheck(this, DOMDisplayDetector);
    }

    createClass(DOMDisplayDetector, null, [{
        key: 'init',

        /**
         * Adds event listeners to window.
         */
        value: function init() {
            if (!window) {
                throw new Error('DOM Display Detector needs a window');
            }

            _init = true;
            window.addEventListener('resize', this.detect, true);
            window.addEventListener('scroll', this.detect, true);
        }

        /**
         *  Removes event listeners from window.
         *  DOM Display Detector destroys itself when it has no element. When a new element is added, it then initializes itself again.
         */

    }, {
        key: 'destroy',
        value: function destroy() {
            _init = false;
            window.removeEventListener('resize', this.detect);
            window.removeEventListener('scroll', this.detect);
        }

        /**
         * Binds an element or elements to DOM Display Detector.
         *
         * @param {HTMLElement|String} elm
         * @param {Function} appearCallback
         * @param {Function} disCallback
         */

    }, {
        key: 'bind',
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
         * @param {HTMLElement|String} elm
         * @param {Function} appearCallback
         * @param {Function} disCallback
         */

    }, {
        key: 'bindOnce',
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
         * @param {HTMLElement|String} elm
         */

    }, {
        key: 'unbind',
        value: function unbind(elm) {
            var elms = this.getElement(elm);
            elements = elements.filter(function (e) {
                if (elms.indexOf(e.elm) > -1 && !e.bindOnce) {
                    e.elm.scrollAnimationBound = false;
                    return false;
                }

                return true;
            });

            if (_init && elements.length == 0) {
                this.destroy();
            }
        }

        /**
         * Binds an element to DOM Display Detector if the element has been loaded.
         *
         * @param {HTMLElement|String} elm
         * @param {Function} appearCallback
         * @param {Function} disCallback
         * @param {Boolean} bindOnce
         */

    }, {
        key: 'bindElement',
        value: function bindElement(elm, appearCallback, disCallback, bindOnce) {
            var _this3 = this;

            if (!elm.scrollAnimationBound) {
                var display = window.getComputedStyle(elm, null).getPropertyValue('display');
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

                    if (!_init) {
                        this.init();
                    }
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
         * @param {HTMLElement|String} elm
         * @returns {Array}
         */

    }, {
        key: 'getElement',
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
        key: 'detect',
        value: function detect() {
            var _this4 = this;

            var w = this.getWindowPosition();
            elements.forEach(function (e) {
                _this4.isSeen(e, w);
            });
        }

        /**
         * Checks if an element is displayed and invokes the appropriate callback.
         *
         * @param {Object} e
         * @param {Object} w
         */

    }, {
        key: 'isSeen',
        value: function isSeen(e, w) {
            var elm = e.elm,
                offset = this.getOffset(elm),
                width = elm.offsetWidth,
                height = elm.offsetHeight,
                left = offset.left,
                top = offset.top;

            // top, bottom, left, right
            if (w.height + w.y >= top && w.y <= top + height && w.width + w.x >= left && w.x <= left + width) {
                if (!e.seen) {
                    e.seen = true;

                    if (e.bindOnce && e.invokedDisCallback) {
                        var i = elements.indexOf(e);
                        elements.splice(i, 1);

                        if (_init && elements.length == 0) {
                            this.destroy();
                        }
                    } else {
                        e.invokedAppearCallback = true;

                        if (typeof e.appearCallback == 'function') {
                            e.appearCallback({ target: e.elm });
                        }
                    }
                }
            } else {
                if (e.seen) {
                    e.seen = false;

                    if (e.bindOnce && e.invokedAppearCallback) {
                        var i = elements.indexOf(e);
                        elements.splice(i, 1);

                        if (_init && elements.length == 0) {
                            this.destroy();
                        }
                    } else {
                        e.invokedDisCallback = true;

                        if (typeof e.disCallback == 'function') {
                            e.disCallback({ target: e.elm });
                        }
                    }
                }
            }
        }

        /**
         * Returns window's position.
         *
         * @returns {{width: Number, height: Number, x: Number, y: Number}}
         */

    }, {
        key: 'getWindowPosition',
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
         * @returns {{left: Number, top: Number}}
         */

    }, {
        key: 'getOffset',
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
    }]);
    return DOMDisplayDetector;
}();

DOMDisplayDetector.detect = DOMDisplayDetector.detect.bind(DOMDisplayDetector);

var bind = DOMDisplayDetector.bind.bind(DOMDisplayDetector);
var bindOnce = DOMDisplayDetector.bindOnce.bind(DOMDisplayDetector);
var unbind = DOMDisplayDetector.unbind.bind(DOMDisplayDetector);

exports.bind = bind;
exports.bindOnce = bindOnce;
exports.unbind = unbind;
