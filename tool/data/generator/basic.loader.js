(function() {

    if (typeof console == "undefined") console = {};
    if (!console.log) console.log = function() {
        var out = java.lang.System.out;
        for (var i = 0; i < arguments.length; i++)
        out.print(arguments[i]);
        out.println();
    };

    if (!this.qxloadPrefixUrl) qxloadPrefixUrl = "";

    if (!this.window) window = this;

    if (!window.navigator) window.navigator = {
        userAgent: "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_4; de-de) AppleWebKit/533.17.8 (KHTML, like Gecko) Version/5.0.1 Safari/533.17.8",
        product: "",
        cpuClass: "",
        language: "en-US"
    };

    if (typeof environment !== "undefined") { // Rhino runtime
      if (!navigator.platform) navigator.platform = environment["os.name"];
    } else if (typeof process !== "undefined") { // Node runtime
      var os = require('os');
      var fs = require('fs');
      if (!navigator.platform) navigator.platform = os.type();
    }

    if (!window.setTimeout && environment && environment["java.version"]) {
      // Emulate setTimeout/setInterval features in Rhino
      // http://stackoverflow.com/questions/2261705/how-to-run-a-javascript-function-asynchronously-without-using-settimeout
      var timer = new java.util.Timer();
      var counter = 1; 
      var ids = {};

      window.setTimeout = function (fn,delay) 
      {
        if (delay === 0) {
          delay = 1;
        }
        var id = counter++;
        ids[id] = new JavaAdapter(java.util.TimerTask,{run: fn});
        timer.schedule(ids[id],delay);
        return id;
      };

      window.clearTimeout = function (id) 
      {
        if (ids[id])
        {
          ids[id].cancel();
          timer.purge();
          delete ids[id];
        }
      };

      window.setInterval = function (fn,delay) 
      {
        if (delay === 0) {
          delay = 1;
        }
        var id = counter++; 
        ids[id] = new JavaAdapter(java.util.TimerTask,{run: fn});
        timer.schedule(ids[id],delay,delay);
        return id;
      };

      window.clearInterval = window.clearTimeout;
    }

    if (!window.qx) window.qx = {};

    if (!qx.$$environment) qx.$$environment = {};
    var envinfo = %{EnvSettings};
    for (var k in envinfo) qx.$$environment[k] = envinfo[k];

    if (!qx.$$libraries) qx.$$libraries = {};
    var libinfo = %{Libinfo};
    for (var k in libinfo) qx.$$libraries[k] = libinfo[k];

    var isDebug = qx.$$environment["qx.debug"],
        log = isDebug ? console.log : function() {},
        load = qx.$$environment["qx.load"] ? this[qx.$$environment["load"]] : this.load;

    qx.$$resources = %{Resources};
    qx.$$translations = %{Translations};
    qx.$$locales = %{Locales};
    qx.$$packageData = {};
    qx.$$loader = {
        parts: %{Parts},
        packages: %{Packages},
        urisBefore: %{UrisBefore},
        boot: %{Boot},
        closureParts: %{ClosureParts},
        bootIsInline: %{BootIsInline},

        decodeUris: function(compressedUris) {
            var libs = qx.$$libraries;
            var uris = [];
            for (var i = 0; i < compressedUris.length; i++) {
                var uri = compressedUris[i].split(":");
                var euri;
                if (uri.length == 2 && uri[0] in libs) {
                    var prefix = libs[uri[0]].sourceUri;
                    euri = prefix + "/" + uri[1];
                } else {
                    euri = compressedUris[i];
                }
                uris.push(qxloadPrefixUrl + euri);
            }
            return uris;
        },

        init: function() {
            var l = qx.$$loader;
            if (l.urisBefore.length > 0) this.loadScriptList(l.urisBefore);

            var bootPackageHash = l.parts[l.boot][0];
            if (!l.bootIsInline) this.loadScriptList(l.decodeUris(l.packages[l.parts[l.boot][0]].uris));
            l.importPackageData(qx.$$packageData[bootPackageHash] || {});
            l.signalStartup();
        },

        loadScriptList: function(uris) {
            var i, p, s;
            for (i = 0; i < uris.length; i++) {
                if (typeof process !== "undefined") { // Node
                  p = uris[i];
                  try {
                    require(p);
                  } catch (e) {
                    console.error("Unable to load uri: "+p);
                    throw e;
                  }
                } else if (typeof environment !== "undefined") { // Rhino
                  p = uris[i];
                  try {
                    load(p);
                  } catch (e) {
                    java.lang.System.err.println("Unable to load uri: "+p);
                    throw e;
                  }
                }
                //log("loaded uri " + p);
            }
        },

        signalStartup: function() {
            qx.$$loader.scriptLoaded = true;
            qx.core.BaseInit.ready();
            qx.$$loader.applicationHandlerReady = true;
        },

        importPackageData: function(dataMap, callback) {
            if (dataMap["resources"]) {
                var resMap = dataMap["resources"];
                for (var k in resMap)
                qx.$$resources[k] = resMap[k];
            }
            if (dataMap["locales"]) {
                var locMap = dataMap["locales"];
                var qxlocs = qx.$$locales;
                for (var lang in locMap) {
                    if (!qxlocs[lang]) qxlocs[lang] = locMap[lang];
                    else for (var k in locMap[lang])
                    qxlocs[lang][k] = locMap[lang][k];
                }
            }
            if (dataMap["translations"]) {
                var trMap = dataMap["translations"];
                var qxtrans = qx.$$translations;
                for (var lang in trMap) {
                    if (!qxtrans[lang]) qxtrans[lang] = trMap[lang];
                    else for (var k in trMap[lang])
                    qxtrans[lang][k] = trMap[lang][k];
                }
            }
            if (callback) {
                callback(dataMap);
            }
        }
    };

})();


%{BootPart}

if (typeof exports != "undefined") {
    for (var key in qx) {
        exports[key] = qx[key];
    }
}

qx.$$loader.init();

