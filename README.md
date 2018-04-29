# DOM Display Detector
DOM Display Detector detects an element if it is displayed on the screen or not and calls the given callback method according to the element’s view status.

## NPM
You can install DOM Display Detector by using npm.

```
npm install --save-dev dom-display-detector
```

## Installation
You can simply import ```dom-display-detector``` and call the static ```bind``` method to bind an element to DOM Display Detector.

```
import {bind} from 'dom-display-detector';

const elm = document.querySelector('#elm');
bind(elm, () => {
    elm.classList.add('active');
});
```

You can also add the script file into your HTML.
```
<!DOCTYPE html>
<html lang="en">
<head></head>
<body>
<div id="elm"></div>
<script src="/node_modules/dom-display-detector/dist/dom-display-detector.min.js"></script>
<script>
var elm = document.querySelector('#elm');
DOMDisplayDetector.bind(elm, function() {
    elm.classList.add('active');
});
</script>
</body>
</html>
```

## Methods

### Bind
##### ```static void bind(HTMLElement|String elm, Function appearCallback, Function disCallback)```
Binds an element or elements to DOM Display Detector. Every time an element appears on the screen, ```appearCallback``` is invoked, when the element disappears on the screen, ```disCallback``` is invoked.

*	**elm:** HTMLElement to be bound. It can be element itself or a CSS selector as a string.
*	**appearCallback:** Callback method that is invoked when the specified element appears on the screen.
*	**disCallback:** Callback method that is invoked when the specified element disappears on the screen.



### BindOnce
##### ```static void bindOnce(HTMLElement|String elm, Function appearCallback, Function disCallback)```
The only difference from the ```bind``` method is that callback methods are invoked once and then element unbinds itself.

### Unbind
##### ```static void unBind(HTMLElement|String elm)```
*	**elm:** HTMLElement to be unbound. It can be element itself or a CSS selector as string.

Unbinds elements. It doesn’t work with elements that are bound with ```bindOnce``` method since they unbind themselves.

## IE Support
IE 10 is not supported and patches to fix problems will not be accepted.

## License
DOM Display Detector is provided under the MIT License.