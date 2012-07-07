(function(){
if (!window.qx) window.qx = {};
var qx = window.qx;

if (!qx.$$environment) qx.$$environment = {};
var envinfo = %{EnvSettings};
for (var k in envinfo) qx.$$environment[k] = envinfo[k];

qx.$$resources = %{Resources};
qx.$$translations = %{Translations};
qx.$$locales = %{Locales};
qx.$$packageData = {};

if (!qx.$$libraries) qx.$$libraries = {};
var libinfo = %{Libinfo};

var packages = %{Packages};
for (var id in packages) {
  for (var i = 0; i < packages[id].uris.length; i++) {
    var uri = packages[id].uris[i];
    if (uri.indexOf("__out__") != -1) {
      continue;
    }
    uri = uri.split(":");
    packages[id].uris[i] = libinfo[uri[0]].sourceUri + "/" + uri[1];
  }
}

for (var id in packages) {
  var list = packages[id].uris;
  for (var i = 0; i < list.length; i++) {
    var uri = list[i];
    if (uri.indexOf("__out__") != -1) {
      continue;
    }
    if (window.ActiveXObject) {
      var request = new window.ActiveXObject("Microsoft.XMLHTTP");
    } else {
     var request = new XMLHttpRequest();
    }
    request.open("GET", uri, false); 
    request.send(null);
    
    var elem = document.createElement("script");
    elem.charset = "utf-8";
    elem.type = "text/javascript";
    elem.text = request.responseText;
    var head = document.getElementsByTagName("head")[0];
    head.appendChild(elem);
  }
}

var exp = envinfo["qx.export"];
if (exp) {
  for (var name in exp) {
    var c = exp[name].split(".");
    var root = window;
    for (var i=0; i < c.length; i++) {
      root = root[c[i]];
    };
    window[name] = root;
  }
}
})();