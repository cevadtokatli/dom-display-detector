# DOM Display Detector

DOM Display Detector detects an element if it is displayed on the screen or not and calls the given callback method according to the view status.

[Click here to see the demo.](https://cevadtokatli.github.io/dom-display-detector)

## Installation

It is available as a package on NPM for use with a module bundler.

```sh
# NPM
$ npm install --save @cevad-tokatli/dom-display-detector

# Yarn
$ yarn add @cevad-tokatli/dom-display-detector
```

## Usage

You can simply import the module and call `bind` method to bind an element to DOM Display Detector.

```typescript
import { bind } from '@cevad-tokatli/dom-display-detector'

const el = document.querySelector('#el')
bind(el, () => {
    el.classList.add('active')
})
```

## Methods

### bind

**`bind(el: Element | HTMLElement | string, onShow: (el: HTMLElement, isInitial: boolean) => void, onHide?: (el: HTMLElement, isInitial: boolean) => void): void`**

Binds the given element(s) to DOM Display Detector. Every time the element appears on the screen, calls `onShow` method and when the element disappears on the screen, calls `onHide` method.

As soon as the element is bound, DOM Display Detector directly calls either `onShow` or `onHide` according to the element view status. *(the second argument `isInitial` become `true` in these kinds of calls.)*

### bindOnce

**`bindOnce(el: Element | HTMLElement | string, onShow: (el: HTMLElement) => void, onHide?: (el: HTMLElement) => void): void`**

Unbinds the element automatically once the element is shown on the screen.

When the element is bound to DOM Display Detector, checks if the element is shown on the screen, and if it is, directly calls `onShow` method and unbinds the element, however, if the element is hidden, calls `onHide` method and keeps the element bound until it appears on the screen.

### unbind

**`unbind(el: Element | HTMLElement | string): void`**

Unbinds the given element(s).

## License
DOM Display Detector is provided under the [MIT License](https://opensource.org/licenses/MIT).
