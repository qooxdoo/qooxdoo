(function(){

if (!window.qx) window.qx = {};

qx.$$start = new Date();
  
if (!window.qxsettings) qxsettings = {};
var settings = %{Settings};
for (var k in settings) qxsettings[k] = settings[k];

if (!window.qxvariants) qxvariants = {};
var variants = %{Variants};
for (var k in variants) qxvariants[k] = variants[k];

if (!qx.$$libraries) qx.$$libraries = {};
var libinfo = %{Libinfo};
for (var k in libinfo) qx.$$libraries[k] = libinfo[k];

qx.$$resources = %{Resources};
qx.$$translations = %{Translations};
qx.$$locales = %{Locales};
qx.$$i18n    = %{I18N};
qx.$$packageData = {};

qx.$$loader = {
  parts : %{Parts},
  uris : %{Uris},
  boot : %{Boot},
  
  decodeUris : function(compressedUris)
  {
    var libs = qx.$$libraries;
    var uris = [];
    for (var i=0; i<compressedUris.length; i++)
    {
      var uri = compressedUris[i].split(":");
      var prefix = libs[uri[0]].sourceUri;
      var euri = prefix + "/" + uri[1];
      %{DecodeUrisPlug}
      uris.push(euri);
    }
    return uris;      
  }
};  

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
  loadScriptList(l.decodeUris(l.uris[l.parts[l.boot]]), function(){
    // Opera needs this extra time to parse the scripts
    window.setTimeout(function(){
      if (window.qx && qx.event && qx.event.handler && qx.event.handler.Application) qx.event.handler.Application.onScriptLoaded();
    }, 0);
  });
}
qx.$$loader.init();

})();