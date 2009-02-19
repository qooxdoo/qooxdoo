(function(){
/*
if (!window.qxsettings) qxsettings = {};
var settings = ${Settings};
for (var k in settings) qxsettings[k] = settings[k];

if (!window.qxvariants) qxvariants = {};
var variants = ${variants};
for (var k in variants) qxvariants[k] = variants[k];

qxresources = ${Resources};
qxtranslations = ${Translations}
*/

qxloader = {
  /*
  parts : ${Parts},
  uris : ${Uris},
  boot : ${Boot}
  */
  
  parts : %PARTS%,
  uris : %URIS%,
  boot : %BOOT%,  
};  

function loadScript(uri, callback) {
  var elem = document.createElement("script");
  elem.charset = "utf-8";
  elem.src = uri;
  elem.onreadystatechange = elem.onload = function()
  {
    if (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")
    {
      // Remove listeners (mem leak prevention)
      elem.onreadystatechange = elem.onload = null;
      callback();
    }
  };

  var head = document.getElementsByTagName("head")[0];
  head.appendChild(elem);
}

function loadScripts(list, callback) {
  if (list.length == 0) {
    callback();
    return;
  }
  loadScript(list.shift(), function() {
    window.setTimeout(function() {
      loadScripts(list, callback);
    }, 0);
  });
}  

var fireContentLoadedEvent = function() {
  document.readyState = "complete";
  document.removeEventListener('DOMContentLoaded', fireContentLoadedEvent, false);
};
if (document.addEventListener) {
  document.addEventListener('DOMContentLoaded', fireContentLoadedEvent, false);
}

var l=qxloader;
loadScripts(l.uris[l.parts[l.boot]], function() {
  if (document.readyState == "complete") try {qx.event.handler.Application.ready() } catch(e) {};
});
})();
