(function() {
  
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
})();

%{BootPart}

if (window.qx && qx.event && qx.event.handler && qx.event.handler.Application) qx.event.handler.Application.onScriptLoaded();
