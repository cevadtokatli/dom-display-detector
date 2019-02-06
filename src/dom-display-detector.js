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
 * @property {boolean} invokedAppearCallback
 * @property {boolean} invokedDisCallback
 */

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
     * @param {HTMLElement|string} elm
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
     * @param {HTMLElement|string} elm
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
     * @param {HTMLElement|string} elm
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
     * @param {HTMLElement|string} elm
     * @param {Function} appearCallback
     * @param {Function} disCallback
     * @param {boolean} bindOnce
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
     * @param {HTMLElement|string} elm
     * @returns {HTMLElement[]}
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
     * If an element is displayed and invokes the appropriate callback.
     *
     * @param {DDPElement} e
     * @param {ParentValues} w
     */
    static isSeen(e, w) {
        let seen = false,
            elm = e.elm,
            o = this.getOffset(elm),
            val = {
                left: o.left,
                top: o.top,
                width: elm.offsetWidth,
                height: elm.offsetHeight
            };

        while(elm = this.getScrollParent(elm)) {
            o = this.getOffset(elm);
            val.left -= o.left;
            val.top -= o.top;
            if(this.checkIfSeen(
                {
                    x: elm.scrollLeft,
                    y: elm.scrollTop,
                    width: elm.offsetWidth,
                    height: elm.offsetHeight
                },
                val
            )) {                
                val.left = o.left;
                val.top = o.top;
            } else {
                break;
            }
        }

        if(!elm && this.checkIfSeen(w, val)) {
            seen = true;
        }

        if(seen) {
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
     * Checks an element if it is seen on the screen.
     * 
     * @param {ParentValues} p
     * @param {ChildValues} c
     * @returns {boolean}
     */
    static checkIfSeen(p, c) {
        //console.log((p.height + p.y) >= c.top)
        //console.log(p.y <= (c.top + c.height)
        //console.log((p.width + p.x) >= c.left)
        //console.log(p.x <= (c.left + c.width))

        // top, bottom, left, right
        if(
            (p.height + p.y) >= c.top &&
            p.y <= (c.top + c.height) &&
            (p.width + p.x) >= c.left &&
            p.x <= (c.left + c.width)
        ) {
            return true;
        }

        return false;
    }

    /**
     * Returns window's position.
     *
     * @returns {ParentValues}
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
     * @returns {{left:number, top:number}}
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

    /**
     * Gets scroll parent of the given element.
     * 
     * @param {HTMLElement} elm 
     * @returns {HTMLElement}
     */
    static getScrollParent(elm) {
        let style = window.getComputedStyle(elm, null),
            excludeStaticParent = style.position == 'absolute';

        if(style.position == 'fixed') {
            return null;
        }

        for(let parent=elm; (parent = parent.parentElement);) {
            style = window.getComputedStyle(parent, null);
            if(excludeStaticParent && style.position == 'static') {
                continue;
            }

            if(/(auto|scroll|hidden)/.test(style.overflow + style.overflowY + style.overflowX)) {
                return parent;
            }
        }

        return null;
    }
}

DOMDisplayDetector.detect = DOMDisplayDetector.detect.bind(DOMDisplayDetector);

export const bind = DOMDisplayDetector.bind.bind(DOMDisplayDetector);
export const bindOnce = DOMDisplayDetector.bindOnce.bind(DOMDisplayDetector);
export const unbind = DOMDisplayDetector.unbind.bind(DOMDisplayDetector);