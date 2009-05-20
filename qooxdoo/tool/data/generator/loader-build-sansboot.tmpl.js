if (!window.qx) window.qx = {};

qx.$$start = new Date();
  
if (!window.qxsettings) qxsettings = {};
var settings = %{Settings};
for (var k in settings) qxsettings[k] = settings[k];

if (!window.qxvariants) qxvariants = {};
var variants = %{Variants};
for (var k in variants) qxvariants[k] = variants[k];

if (!window.qxlibraries) qxlibraries = {};
var libinfo = %{Libinfo};
for (var k in libinfo) qxlibraries[k] = libinfo[k];

qx.$$resources = %{Resources};
qx.$$translations = %{Translations};
qx.$$locales = %{Locales}

qx.$$loader = {
  parts : %{Parts},
  uris : %{Uris},
  boot : %{Boot}
};  

if (window.qx && qx.event && qx.event.handler && qx.event.handler.Application) qx.event.handler.Application.onScriptLoaded();

