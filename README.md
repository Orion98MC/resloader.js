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

## Events

Emits few events which you can grep in the source like:

* progress, arg: data [Object], data.progress contains a Float between 0 and 1
* start, no args, emitted on start()
* finish, arg: data [Object], emitted when all assets have been loaded (whether an error occured or not). data.result contains a hash of urls as keys and whether the image width is greater than zero as values.
* cookie, arg: firstTime [Boolean], if true no valid cookie was found, else a valid cookie was found thus, no preloading occured.


# Browser support

Tested on Latest versions of Safari, Chrome, and Firefox.

# License

The MIT License (MIT)

Copyright (c) 2013 Thierry Passeron

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
