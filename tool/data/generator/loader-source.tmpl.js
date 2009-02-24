if (!window.qx) window.qx = {};
if (!window.qxsettings) qxsettings = {};
if (!window.qxvariants) qxvariants = {};

qx.$$start = new Date();
  
/*
var settings = ${Settings};
for (var k in settings) qxsettings[k] = settings[k];

var variants = ${variants};
for (var k in variants) qxvariants[k] = variants[k];

qx.$$resources = ${Resources};
qx.$$translations = ${Translations}
*/

qx.$$loader = {
  /*
  parts : ${Parts},
  uris : ${Uris},
  boot : ${Boot}
  */
  
  parts : %PARTS%,
  uris : %URIS%,
  boot : %BOOT%  
};  

(function(){

function loadScript(uri, callback) {
  var elem = document.createElement("script");
  elem.charset = "utf-8";
  elem.src = uri;
  elem.onreadystatechange = elem.onload = function()
  {
    if (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")
    {
      elem.onreadystatechange = elem.onload = null;
      callback();
    }
  };
  var head = document.getElementsByTagName("head")[0];
  head.appendChild(elem);
}

var isWebkit = /AppleWebKit\/([^ ]+)/.test(navigator.userAgent);

function loadScriptList(list, callback) {
  if (list.length == 0) {
    callback();
    return;
  }
  loadScript(list.shift(), function() {
    if (isWebkit) {
      // force asynchronous load
      // Safari fails with an "maximum recursion depth exceeded" error if it is
      // called sync.      
      window.setTimeout(function() {
        loadScriptList(list, callback);
      }, 0);
    } else {
      loadScriptList(list, callback);
    }
  });
}

var fireContentLoadedEvent = function() {
  qx.$$domReady = true;
  document.removeEventListener('DOMContentLoaded', fireContentLoadedEvent, false);
};
if (document.addEventListener) {
  document.addEventListener('DOMContentLoaded', fireContentLoadedEvent, false);
}

qx.$$loader.init = function(){
  var l=qx.$$loader;
  loadScriptList(l.uris[l.parts[l.boot]], function(){
    // Opera needs this extra time to parse the scripts
    window.setTimeout(function(){
      if (window.qx && qx.event && qx.event.handler && qx.event.handler.Application) qx.event.handler.Application.onScriptLoaded();
    }, 0);
  });
}
qx.$$loader.init();

})();
