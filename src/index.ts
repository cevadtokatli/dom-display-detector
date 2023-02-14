import { BindElement, Item } from './types'

/**
 * Stores the bound items.
 */
let itemList: Item[] = []

/**
 * DOM Display Detector attaches each scrollable element to a scroll event to detect the inner scroll changes.
 * Stores the elements with attached events.
 */
const scrollParentElements = new Set<HTMLElement>()

/**
 * Binds the given element(s) to DOM Display Detector.
 */
export const bind = (el: BindElement, onShow: ((el: HTMLElement, isInitial: boolean) => void) | null, onHide?: (el: HTMLElement, isInitial: boolean) => void) => {
  parseElements(el).filter(el => !itemList.find(item => item.el === el)).forEach(el => {
    const isShown = isElementShown(el)

    if (isShown) {
      onShow?.(el, true)
    } else {
      onHide?.(el, true)
    }

    itemList.push({
      el,
      isOnce: false,
      isShown,
      onHide,
      onShow,
    })
  })
}

/**
 * Unbinds the element(s) automatically once the element is shown on the screen.
 */
export const bindOnce = (el: BindElement, onShow: ((el: HTMLElement) => void) | null, onHide?: (el: HTMLElement) => void) => {
  parseElements(el).filter(el => !itemList.find(item => item.el === el)).forEach(el => {
    if (isElementShown(el)) {
      onShow?.(el)
    } else {
      onHide?.(el)

      itemList.push({
        el,
        isOnce: true,
        isShown: false,
        onHide,
        onShow,
      })
    }
  })
}

/**
 * Calculates the left, top, width and height of the element shown on the screen.
 */
const calculateShownPart = (el: HTMLElement | null): { left: number, top: number, width: number, height: number } => {
  if (!el) {
    return {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    }
  }

  const parentEl = getScrollParent(el)

  if (parentEl && !scrollParentElements.has(parentEl)) {
    scrollParentElements.add(parentEl)
    parentEl.addEventListener('scroll', detect)
  }

  const parent = calculateShownPart(parentEl)
  let { left, top, width, height } = el.getBoundingClientRect()

  // left & width
  if (left < 0) {
    width += left
    left = 0
  }

  if (width > 0 && left < parent.left) {
    width -= parent.left - left
    left = parent.left
  }

  if (width > 0 && width + left > parent.width + parent.left) {
    width -= (width + left) - (parent.width + parent.left)
  }

  // top & height
  if (top < 0) {
    height += top
    top = 0
  }

  if (height > 0 && top < parent.top) {
    height -= parent.top - top
    top = parent.top
  }

  if (height > 0 && height + top > parent.height + parent.top) {
    height -= (height + top) - (parent.height + parent.top)
  }

  return {
    left,
    top,
    width,
    height,
  }
}

/**
 * Checks if the bound elements got shown or hidden and calls onShow or onHide methods accordingly.
 */
const detect = () => {
  itemList.forEach(item => {
    const isShown = isElementShown(item.el)

    if (isShown && !item.isShown) {
      if (!item.isOnce) {
        item?.onShow(item.el, false)
      } else {
        item?.onShow(item.el)
        unbind(item.el)
      }
    } else if (!isShown && item.isShown) {
      item.onHide?.(item.el, false)
    }
 
    item.isShown = isShown
  })
}

/**
 * Gets scroll parent of the given element.
 */
const getScrollParent = (el: HTMLElement): HTMLElement => {
  for (let parent = el; parent = parent.parentElement;) {
    const style = window.getComputedStyle(parent, null)

    if (/(auto|scroll|hidden)/.test(style.overflow + style.overflowX + style.overflowY)) {
      return parent
    }
  }

  return null
}

/**
 * Checks if the given element is shown on the screen.
 */
const isElementShown = (el: HTMLElement): boolean => {
  const { width, height } = calculateShownPart(el) 

  return width >= 0 && height >= 0
}

/**
 * Converts input to an array of HTML elements.
 */
const parseElements = (input: BindElement): HTMLElement[] => { 
  if (typeof input === 'string') {
    return Array.prototype.map.call(document.querySelectorAll(input), i => i)
  }

  return [input as HTMLElement]
}

/**
 * Unbinds the given element(s).
 */
export const unbind = (el: BindElement) => {
  const els = parseElements(el)
  itemList = itemList.filter(({ el }) => els.indexOf(el) === -1)
}

window.addEventListener('resize', detect)
window.addEventListener('scroll', detect)
