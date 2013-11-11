/*
  Resloader, the resources loader

  Copyright (c), 2013-2014, Thierry Passeron
  The MIT License
**/

(function (global) {
  
  'use strict'
  
  var Eventify = function (object) {
    var _on = function (event, callback) {
      if (!this._events) { this._events = {}; }
      this._events[event] = this._events[event] || [];
      this._events[event].push(callback);
      return this;
    };
    
    var _emit = function (event) {
      if (!this._events) { this._events = {}; }
      if (this._events[event]) {
        var args = Array.prototype.slice.apply(arguments);
        args.shift();
        for (var i = 0; i < this._events[event].length; i++) {
          var cb = this._events[event][i];
          cb.apply(this, args);
        }
      }
      return this;
    };
    
    var _off = function (event, callback) {
      if (!this._events) { this._events = {}; }
      var idx = this._events[event].indexOf(callback);
      this._events[event].splice(idx, 1);
      return this;
    }
    
    if (typeof object === 'function') {
      object.prototype.on = _on;
      object.prototype.emit = _emit;
      object.prototype.off = _off;
      return true;
    }
    
    if (typeof object === 'object') {
      object.on = _on;
      object.emit = _emit;
      object.off = _off;
      return true;
    }
    
    return false;
  }
  
  var getStyle = function(x, styleProp) {
    if (x.currentStyle) return x.currentStyle[styleProp];
    else if (window.getComputedStyle) return document.defaultView.getComputedStyle(x, null).getPropertyValue(styleProp);
    return x.style[styleProp];
  };
  
  var isVisibleElement = function(element) {
    if (getStyle(element, "display") === "none") { return false; }
    if (element.parentNode === document) return true;
    return isVisibleElement(element.parentNode);
  };
    
  var loadableImageURLs = function(element, filterInvisible) {
    element = element || document;
    var elements = element.getElementsByTagName('*');    
    var bgis = {};
    var url;
    for (var i=0; i < elements.length; i++) {
      var e = elements[i], bgi;
      if (e.tagName.toUpperCase() === 'IMG') { bgi = 'url(' + e.src + ')'; }
      else { bgi = getStyle(e, 'background-image'); }
      
      if (!bgi) { continue; }
      if (filterInvisible && !isVisibleElement(e)) { continue; }
      
      if (bgi !== 'none' && bgi.match(/^url/)) { 
        url = bgi.match(/^url\("?([^"]*)"?\)/)[1]; 
        if (!bgis[url]) {
          bgis[url] = [];
        }
        bgis[url].push(e);
      }
    }
    return bgis;
  };
  
  if (!Date.now) {
    Date.now = function now() {
      return new Date().getTime();
    };
  }
  
  if (!Object.keys) {
    Object.keys = (function () {
      'use strict';
      var hasOwnProperty = Object.prototype.hasOwnProperty,
          hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
          dontEnums = [
            'toString',
            'toLocaleString',
            'valueOf',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'constructor'
          ],
          dontEnumsLength = dontEnums.length;

      return function (obj) {
        if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
          throw new TypeError('Object.keys called on non-object');
        }

        var result = [], prop, i;

        for (prop in obj) {
          if (hasOwnProperty.call(obj, prop)) {
            result.push(prop);
          }
        }

        if (hasDontEnumBug) {
          for (i = 0; i < dontEnumsLength; i++) {
            if (hasOwnProperty.call(obj, dontEnums[i])) {
              result.push(dontEnums[i]);
            }
          }
        }
        return result;
      };
    }());
  }

  var cookieOnce = function (cookieName, seconds, callback) {
		var cookies = document.cookie.split(/;\s+/);    
		for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].split('=');
			if (cookie && (cookie[0] === cookieName)) { return callback(false); }
		}
    
    var expireDate = new Date(Date.now() + (seconds || 3600) * 1000 /* 1 hour default */);
    var cookie = cookieName + '=true; expires=' + expireDate.toUTCString();
    document.cookie = cookie;
    callback(true);
  };
    
  var nodata = { finished: 0, left: 0, length: 0, results: {}, progress: 0 };
  var preloadImages = function(srcs, callback /* Function(data) */) {
    srcs = srcs instanceof Array ? srcs : [srcs];
    
    if (!srcs || !srcs.length) { 
      callback(nodata); 
      return;
    }
  
    var left = srcs.length,
        t0 = Date.now(),
        results = {};

    for (var i = 0; i < srcs.length; i++) {
      var image = new Image();
    
      var _done = function () {
        left--; 
        results[this.src] = this.naturalWidth > 0;
      
        callback({ left: left, length: srcs.length, progress: (srcs.length - left) / srcs.length });
        if (left === 0) { callback({ finished: Date.now() - t0, left: left, length: srcs.length, results: results, progress: 1 }); } 
      };
    
      image.onload = _done;
      image.onerror = _done;
      image.src = srcs[i];
    }
  };
  
  var setStyles = function (el, css) {
    for (var prop in css) {
      el.style[prop] = css[prop];
    }
  };
  
  var appendElement = function (parent, tag, id, css) {
    var el = document.createElement(tag || 'div');
    el.id = id;
    if (css) { setStyles(el, css); }
    parent.appendChild(el);
    return el;
  };
  
  /*
  
    resload
  
    this function loads image resources either from <img> tags or background-image styles
  
  **/
 
  var Resloader = function (options, callback /* Funtion (data) */) {
    if (typeof this !== 'object') { return new this(options, callback); }
    
    var config = {
      verbose: false,
      
      beforeDelay: 0, /* ms before starting load of resources */
      afterDelay: 1000, /* ms after loading of resources, negative value will allow manual remove of overlayDiv */
      
      resources: [], /* urls to load as images */
      
      expires: null, /* date till expiration of cookie for once cookie check, null === load each time */
      loadInvisible: false,
      
      onbefore: function (done) { done() },
      autostart: true
    };
    
    for (var key in options) { config[key] = options[key]; }
    
    this.config = config;
    this.callback = callback;
    this.resources = Array.prototype.concat.apply(config.resources, 
        Object.keys(loadableImageURLs(document, !config.loadInvisible)));
    this.started = false;

    if (config.autostart) {
      var self = this;
      setTimeout(function () { self.start(); }, 0);
    }
    return this;
  };
  
  if (!Eventify(Resloader)) { throw new Error("Cannot Eventify object"); }
  
  Resloader.prototype.start = function () {
    var config = this.config,
        resources = this.resources,
        callback = this.callback,
        self = this;
    
    if (this.started) { 
      console.log('already started');
      return; 
    }
    this.started = true;
    
    this.emit('start');
        
    if (!this.resources.length) { 
      console.log('no resources to load');
      if (callback) { callback(nodata); }
      return this;
    }
        
    var finish = function (data) {
      self.emit('finish');
      if (!(config.afterDelay < 0) && config.overlayDiv) {
        config.overlayDiv.parentNode.removeChild(config.overlayDiv);
      }
      if (callback) { callback(data); }
    };
    
    var preload = function () {
      config.onbefore(function () {
        preloadImages(resources, function (data) {
          self.emit('progress', data);

          if (data.finished) {
            setTimeout(function () { finish(data); }, config.afterDelay);
          }
        });
      });
    };
    
    if (config.expires) {
      cookieOnce("resloader", config.expires, function (firstTime) {
        self.emit('cookie', firstTime);
        if (firstTime) {
          setTimeout(preload, config.beforeDelay);
          return;
        }
        finish();
      });
      return;
    } 
    
    setTimeout(preload, config.beforeDelay);
  };
  
  Resloader.UI = function (options, callback) {
    
    var config = {
      root: document.body,
      type: "bar"
    };
    
    for (var key in options) { config[key] = options[key]; }
    
    var self = new Resloader(config, callback);
    
    var _onbefore = self.config.onbefore;
    self.config.onbefore = function (done) {
      self.setupUI.call(self);
      if (_onbefore) { _onbefore.call(self, done); }
      else { done(); }
    };

    return self;
  };
    
  Resloader.prototype.setupUI = function () {
    var self = this,
        config = this.config;
    
    config.overlayDiv   = appendElement(config.root, 'div', 'resloader_overlay', {
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      width: '100%',
      heigth: '100%',
      zIndex: 9999999
    }); 
    config.overlayDiv.className = config.type;
    
    config.headerDiv    = appendElement(config.overlayDiv, 'div', 'resloader_header');
    config.progressDiv  = appendElement(config.overlayDiv, 'div', 'resloader_progress', { 
      position: "relative"
    });
    config.indicatorDiv = appendElement(config.progressDiv, 'div', 'resloader_indicator', {
      overflow: "hidden"
    });
    config.labelDiv     = appendElement(config.progressDiv, 'div', 'resloader_label');
    config.footerDiv    = appendElement(config.overlayDiv, 'div', 'resloader_footer');
    
    switch (config.type) {
    case 'bar': 
      setStyles(config.indicatorDiv, {
        position: "relative"
      });
      
      var progressBar = appendElement(config.indicatorDiv, 'div', 'resloader_bar', {
        position: "absolute",
        top: 0,
        left: 0,
        width: "0%",
        height: "100%"
      });
      
      self.on('progress', function (data) {
        var percent = Math.ceil(data.progress * 100) + "%";
        progressBar.style.width = percent;
        config.labelDiv.textContent = percent;
      });
      
      self.emit('progress', {progress: 0});
      
      break;
    default:
    }
    
    self.emit('setupUI');
  };
  
  global.Resloader = Resloader;

  // You can reuse some of these if you like...
  global.Resloader.exports = {
    getStyle: getStyle,
    isVisibleElement: isVisibleElement,
    loadableImageURLs: loadableImageURLs,
    appendElement: appendElement,
    Eventify: Eventify
  };
  
})(window);