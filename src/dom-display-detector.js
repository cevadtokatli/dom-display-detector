/**
 * @typedef {Object} ParentValues
 * @property {number} width
 * @property {number} height
 * @property {number} x
 * @property {number} y
 * @property {number} right
 * @property {number} bottom
 */

/**
 * @typedef {Object} ChildValues
 * @property {number} width
 * @property {number} height
 * @property {number} left
 * @property {number} top
 */

/**
 * @typedef {Object} DDPElement
 * @property {HTMLElement} elm
 * @property {boolean} bindOnce
 * @property {Function} appearCallback
 * @property {Function} disCallback
 */

const elements = [];

class DOMDisplayDetector {
    /**
     * Adds event listeners to window.
     */
    static init() {
        // dont install if runs on the server.
        if(typeof window === 'undefined') {
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
    static bind(elm, appearCallback, disCallback) {
        let elms = this.getElement(elm);
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
        let elms = this.getElement(elm);
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
        let elms = this.getElement(elm);
        elements = elements.filter(e => {
            if(elms.indexOf(e.elm) > -1 && !e.bindOnce) {
                e.elm.scrollAnimationBound = false;
                return false;
            }

            return true;
        });
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
            let display = window.getComputedStyle(elm, null).display;
            if(display == 'none' || elm.offsetWidth != 0 || elm.offsetHeight != 0) {
                elm.scrollAnimationBound = true;
                let e = {
                    elm,
                    appearCallback,
                    disCallback,
                    seen: false,
                    bindOnce
                };

                elements.push(e);
                let w = this.getWindowPosition();
                this.isSeen(e, w);
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
        let w = this.getWindowPosition();
        elements.forEach(e => {
            this.isSeen(e, w);
        });
    }

    /**
     * If an element is displayed, invokes the appropriate callback.
     *
     * @param {DDPElement} e
     * @param {ParentValues} w
     */
    static isSeen(e, w) {
        let seen = true,
            elm = e.elm,
            val = this.getOffset(elm),
            scrollParents = this.getScrollParents(elm);
        for(let i in scrollParents) {
            let parent = scrollParents[i],
                p = this.getOffset(parent),
                pVal = this.getOffsetValues(parent, p);

            if(this.checkIfSeen(
                pVal,
                val
            )) {
                this.setSeenPart(parent, pVal, val);
            } else {
                seen = false;
                break;
            }
        }

        if(seen && !this.checkIfSeen(w, val)) {
            seen = false;
        }

        if(seen) {
            if(!e.seen) {
                e.seen = true;

                if(typeof e.appearCallback == 'function') {
                    e.appearCallback({target:e.elm});
                }

                if(e.bindOnce) {
                    let i = elements.indexOf(e);
                    elements.splice(i, 1);
                }
            }
        } else {
            if(e.seen) {
                e.seen = false;

                if(typeof e.disCallback == 'function') {
                    e.disCallback({target:e.elm});
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
        // top, bottom, left, right
        if(
            (p.bottom) >= c.top &&
            p.y <= (c.top + c.height) &&
            (p.right) >= c.left &&
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
        let width = window.innerWidth,
            height = window.innerHeight,
            x = window.pageXOffset,
            y = window.pageYOffset;

        return {
            width,
            height,
            x,
            y,
            right: width + x,
            bottom: height + y 
        };
    }

    /**
     * Returns offets of the given element.
     *
     * @param  {HTMLElement} elm
     * @returns {ChildValues}
     */
    static getOffset(elm) {
        let left = 0,
            top = 0,
            width = elm.offsetWidth,
            height = elm.offsetHeight;

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
            top,
            width,
            height
        };
    }

    /**
     * Gets scroll parents of the given element.
     * 
     * @param {HTMLElement} elm 
     * @returns {HTMLElement[]}
     */
    static getScrollParents(elm) {
        let parents = [],
            style = window.getComputedStyle(elm, null),
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
                parents.push(parent);
            }
        }

        return parents;
    }

    /**
     * Returns offset status from the given offset.
     * 
     * @param {HTMLElement} el
     * @param {ChildValues} val
     * @returns {ParentValues}
     */
    static getOffsetValues(el, val) {
        let width = val.width,
            height = val.height,
            x = val.left +  el.scrollLeft,
            y = val.top + el.scrollTop;

        return {
            width,
            height,
            x,
            y,
            right: width + x,
            bottom: height + y
        };
    }

    /**
     * Sets seen part of the child element.
     * 
     * @param {HTMLElement} parent
     * @param {ParentValues} p
     * @param {ChildValues} c
     */
    static setSeenPart(parent, p, c) {
        let val;

        if(
            (val = p.x - c.left) > 0
        ) {
            c.width -= val;
            c.left -= val;
        }
        if(
            (val = (c.width + c.left) - p.right) > 0
        ) {
            c.width -= val;
        }

        if(
            (val = p.y - c.top) > 0
        ) {
            c.height -= val;
            c.top += val;
        }
        if(
            (val = (c.height + c.top) - p.bottom) > 0
        ) {
            c.height -= val;
        }

        c.left -= parent.scrollLeft;
        c.top -= parent.scrollTop;
    }
}

DOMDisplayDetector.detect = DOMDisplayDetector.detect.bind(DOMDisplayDetector);
DOMDisplayDetector.init.call(DOMDisplayDetector);

export const bind = DOMDisplayDetector.bind.bind(DOMDisplayDetector);
export const bindOnce = DOMDisplayDetector.bindOnce.bind(DOMDisplayDetector);
export const unbind = DOMDisplayDetector.unbind.bind(DOMDisplayDetector);