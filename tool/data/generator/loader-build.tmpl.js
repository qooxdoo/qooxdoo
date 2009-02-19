if (!window.qxsettings) qxsettings = {};
var settings = ${Settings};
for (var k in settings) qxsettings[k] = settings[k];

if (!window.qxvariants) qxvariants = {};
var variants = ${variants};
for (var k in variants) qxvariants[k] = variants[k];

qxresources = ${Resources};
qxtranslations = ${Translations}

qxloader = {
  parts : ${Parts},
  uris : ${Uris},
  boot : ${Boot}
};

${BootPart}

try {qx.event.handler.Application.ready() } catch(e) {};

