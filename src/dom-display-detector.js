const requestAnimationFrame = window.requestAnimationFrame ||
                              window.webkitRequestAnimationFrame ||
                              window.mozRequestAnimationFrame ||
                              ((callback) => { window.setTimeout(callback, 1000 / 60); });
var elements = [],
    init = false;

class DOMDisplayDetector {
    /**
     * Adds event listeners to window.
     */
    static init() {
        if(!window) {
            throw new Error('DOM Display Detector needs a window');
        }

        init = true;
        window.addEventListener('resize', this.detect, true);
        window.addEventListener('scroll', this.detect, true);
    }

    /**
     *  Removes event listeners from window.
     *  DOM Display Detector destroys itself when it has no element. When a new element is added, it then initializes itself again.
     */
    static destroy() {
        init = false;
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
    static bind(elm, appearCallback, disCallback) {
        var elms = this.getElement(elm);
        elms.forEach(e => {
            this.bindElement(e, appearCallback, disCallback, false);
        });
    }

    /**
     * Binds an element or elements to DOM Display Detector for once.
     *
     * @param {HTMLElement|String} elm
     * @param {Function} appearCallback
     * @param {Function} disCallback
     */
    static bindOnce(elm, appearCallback, disCallback) {
        var elms = this.getElement(elm);
        elms.forEach(e => {
            this.bindElement(e, appearCallback, disCallback, true);
        });
    }

    /**
     * Unbinds elements. It doesn’t work with elements that have been bound with the bindOnce method since they unbind themselves.
     *
     * @param {HTMLElement|String} elm
     */
    static unbind(elm) {
        var elms = this.getElement(elm);
        elements = elements.filter(e => {
            if(elms.indexOf(e.elm) > -1 && !e.bindOnce) {
                e.elm.scrollAnimationBound = false;
                return false;
            }

            return true;
        });

        if(init && elements.length == 0) {
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
    static bindElement(elm, appearCallback, disCallback, bindOnce) {
        if(!elm.scrollAnimationBound) {
            var display = window.getComputedStyle(elm, null).getPropertyValue('display');
            if(display == 'none' || elm.offsetWidth != 0 || elm.offsetHeight != 0) {
                elm.scrollAnimationBound = true;
                var e = {
                    elm,
                    appearCallback,
                    disCallback,
                    seen: false,
                    bindOnce
                };

                elements.push(e);
                var w = this.getWindowPosition();
                this.isSeen(e, w);

                if(!init) {
                    this.init();
                }
            } else {
                // waits for the element to be loaded
                setTimeout(() => {
                    this.bindElement(elm, appearCallback, disCallback, bindOnce);
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
    static getElement(elm) {
        if(typeof elm == 'string') {
            return Array.prototype.map.call(document.querySelectorAll(elm), t => t);
        } else {
            return [elm];
        }
    }

    /**
     * Checks if elements are displayed or not.
     */
    static detect() {
        var w = this.getWindowPosition();
        elements.forEach(e => {
            this.isSeen(e, w);
        });
    }

    /**
     * Checks if an element is displayed and invokes the appropriate callback.
     *
     * @param {Object} e
     * @param {Object} w
     */
    static isSeen(e, w) {
        var elm = e.elm,
            offset = this.getOffset(elm),
            width = elm.offsetWidth,
            height = elm.offsetHeight,
            left = offset.left,
            top = offset.top;

        // top, bottom, left, right
        if((w.height + w.y) >= top && w.y <= (top + height) && (w.width + w.x) >= left && w.x <= (left + width)) {
            if(!e.seen) {
                e.seen = true;

                if(e.bindOnce && e.invokedDisCallback) {
                    var i = elements.indexOf(e);
                    elements.splice(i, 1);

                    if(init && elements.length == 0) {
                        this.destroy();
                    }
                } else {
                    e.invokedAppearCallback = true;

                    if(typeof e.appearCallback == 'function') {
                        e.appearCallback({target:e.elm});
                    }
                }
            }
        } else {
            if(e.seen) {
                e.seen = false;

                if(e.bindOnce && e.invokedAppearCallback) {
                    var i = elements.indexOf(e);
                    elements.splice(i, 1);

                    if(init && elements.length == 0) {
                        this.destroy();
                    }
                } else {
                    e.invokedDisCallback = true;

                    if(typeof e.disCallback == 'function') {
                        e.disCallback({target:e.elm});
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
    static getWindowPosition() {
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
    static getOffset(elm) {
        var left = 0,
            top = 0;

        do {
            if(!isNaN(elm.offsetLeft)) {
                left += elm.offsetLeft;
            }

            if(!isNaN(elm.offsetTop)) {
                top += elm.offsetTop;
            }

            elm = elm.offsetParent;
        } while(elm)

        return {
            left,
            top
        };
    }
}

DOMDisplayDetector.detect = DOMDisplayDetector.detect.bind(DOMDisplayDetector);

export const bind = DOMDisplayDetector.bind.bind(DOMDisplayDetector);
export const bindOnce = DOMDisplayDetector.bindOnce.bind(DOMDisplayDetector);
export const unbind = DOMDisplayDetector.unbind.bind(DOMDisplayDetector);