export type BindElement = Element | HTMLElement | string

export interface Item {
  el: HTMLElement
  isOnce: boolean
  isShown: boolean
  onHide: ((el: HTMLElement, isInitial?: boolean) => void) | null
  onShow: ((el: HTMLElement, isInitial?: boolean) => void) | null
}
