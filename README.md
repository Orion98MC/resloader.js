resloader.js
============

Resloader loads images and provides progress feedback so that when your page is loaded the user gets a clean finished result.

Features:
* standalone. (no framework required)
* event emitter. (nice decoupling)
* prevents reapeated load sequence with a cookie. (can be tweaked)

```
Original: 10541 bytes.
Minified: 4947 bytes.
Gzipped:  1156 bytes.
```

# Usage

Put the script at the bottom of the page or call it when the DOM is ready.

Example:
```html

<script type="text/javascript" src="js/resloader.js"></script>
<script type="text/javascript">
  Resloader.UI();
</script>

```

# API

## Resloader

When instanciated, the Resloader object collects all the images and background-images urls in the current HTML page and tries to load them. While loading, it emits 'progress' messages which allow one to show a progress bar if needed. When done it calls a callback.


Example:
```js
  
  var loader = Resloader({ options }, finishedCallback)
      .on('progress', updateCallback);

```

(where options can be... found in resloader.js config hash)
Since the autostart option is true by default, it starts right away the loading process.


## Resloader.UI

Resloader.UI returns a Resloader object with predefined UI. It provides an overlayed "progress bar" and can easily be extended.

Example:
```js
  
  var loader = Resloader.UI({ options }, finishedCallback);

```

The UI can be styled using css.


# Browser support

Tested on Latest versions of Safari, Chrome, and Firefox.
