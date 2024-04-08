(function(){

  var path = require("path");

  if (typeof window === "undefined")
    window = this;
  window.addEventListener = function() {};
  window.removeEventListener = function() {};
  window.dispatchEvent = function() {};

  if (!window.navigator) window.navigator = {};
  if (!window.navigator.userAgent) {
    window.navigator.userAgent = "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_4; de-de) AppleWebKit/533.17.8 (KHTML, like Gecko) Version/5.0.1 Safari/533.17.8";
  }
  if (!window.navigator.product) window.navigator.product = "";
  if (!window.navigator.cpuClass) window.navigator.cpuClass = "";

  // Node suppresses output to the "real" console when calling console.debug, it's only shown
  //  in the debugger
  console.debug = function() {
    var args = [].slice.apply(arguments);
    console.log.apply(this, args);
  };

  var JSDOM = null;
  try {
    JSDOM = require("jsdom").JSDOM;
  } catch(ex) {
    // Nothing
  }
  if (JSDOM) {
    var dom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`);
    if (!window)
      window = dom.window;
    else {
      window.document = dom.window.document;
    }
  } else {
    window.document = document = {
        readyState: "ready",
        currentScript: {
          src: new (require('url').URL)('file:' + __filename).href
        },
        createEvent: function() {
          return {
            initCustomEvent: function() {}
          };
        },
        createElement: function () {
          return {}
        },
        addListener: function() {},
        removeListener: function() {},
        documentElement: {
          style: {}
        }
    };
  }

  if (!this.qxloadPrefixUrl)
    qxloadPrefixUrl = "";

  if (!window.qx)
    window.qx = {};

  if (!qx.$$appRoot) {
    qx.$$appRoot = __dirname + path.sep;
  }

  if (!window.qxvariants)
    qxvariants = {};

  qx.$$start = new Date();

  if (!qx.$$environment) {
    qx.$$environment = {};
  }
  var envinfo = %{EnvSettings};
  for (var k in envinfo) {
    if (qx.$$environment[k] === undefined) {
       qx.$$environment[k] = envinfo[k];
    }
  }

  if (!qx.$$libraries) {
    qx.$$libraries = {};
  }
  %{Libraries}.forEach(ns => qx.$$libraries[ns] = {
      sourceUri: qx.$$appRoot + %{SourceUri},
      resourceUri: qx.$$appRoot + %{ResourceUri}
   });

  var isDebug = qx.$$environment["qx.debugLoader"];
  var log = isDebug ? console.log : function() { };
  var loaderMethod = qx.$$environment["qx.ooLoader"] ? this[qx.$$environment["qx.ooLoader"]] : require;
  if (typeof loaderMethod !== "function")
    throw new Error("Cannot initialise Qooxdoo application - no URI loader method detected");

  qx.$$resources = %{Resources};
  qx.$$translations = %{Translations};
  qx.$$locales = %{Locales};
  qx.$$packageData = {};
  qx.$$g = {}
  qx.$$createdAt = function (obj, filename, lineNumber, column, verbose) {
    if (obj && obj.hasOwnProperty && !obj.hasOwnProperty("$$createdAt")) {
      var value = {
        filename: filename,
        lineNumber: lineNumber,
        column: column
      };
      var stack = new Error().stack;
      if (verbose && !!stack) {
        Object.assign(value, { stack: stack.split("\n").slice(2).map(line => line.trim()) });
      }
      Object.defineProperty(obj, "$$createdAt", {
        value: value,
        enumerable: false,
        configurable: false,
        writable: false
      });
    }
    return obj;
  };

  qx.$$loader = {
      parts : %{Parts},
      packages : %{Packages},
      urisBefore : %{UrisBefore},
      boot : %{Boot},
      closureParts : %{ClosureParts},
      delayDefer: false,
      transpiledPath: qx.$$appRoot + %{TranspiledPath},

      decodeUris : function(compressedUris, pathName) {
        if (!pathName)
          pathName = this.transpiledPath;
        var libs = qx.$$libraries;
        var uris = [];
        for (var i = 0; i < compressedUris.length; i++) {
          var uri = compressedUris[i].split(":");
          var euri;
          if (uri[0] == "__external__") {
            continue;
          } else {
            euri = qx.$$appRoot + compressedUris[i];
          }
          %{DecodeUrisPlug}
          uris.push(qxloadPrefixUrl + euri);
        }
        return uris;
      },

      init : function() {
        var l = qx.$$loader;
        var t = this;

        var allScripts = l.decodeUris(l.urisBefore, "resourceUri");
        t.loadScriptList(allScripts);

        l.parts[l.boot].forEach(function(pkg) {
          t.loadScriptList(l.decodeUris(l.packages[pkg].uris));
        });

        l.parts[l.boot].forEach(function(pkg) {
          l.importPackageData(qx.$$packageData[pkg] || {});
        });
        qx.$$domReady = true;
        l.signalStartup();
      },

      loadScriptList: function(list) {
        list.forEach(function(uri) {
          uri = uri.replace(/\?.*$/, '');
          var f = loaderMethod(uri);
          if (typeof f === "function") {
            var s = f.name === ""?path.basename(uri, ".js"):f.name;
            window[s] = f;
          }
        });
      },

      signalStartup : function() {
        qx.Bootstrap.executePendingDefers();
        qx.$$loader.delayDefer = false;
        qx.$$loader.scriptLoaded = true;
        if (qx.Class.$$brokenClassDefinitions) {
          console.error("**************");
          console.error("One or more class definitions did not load properly - please see error messages above for details.");
          console.error("It is probable that your application will have unexpected errors.  Please fix the class problems above before continuing.");
          console.error("**************");
        } else {
          qx.core.BaseInit.ready();
          qx.$$loader.applicationHandlerReady = true;
        }
      },

      importPackageData : function(dataMap, callback) {
        if (dataMap["resources"]) {
          var resMap = dataMap["resources"];
          for ( var k in resMap)
            qx.$$resources[k] = resMap[k];
        }
        if (dataMap["locales"]) {
          var locMap = dataMap["locales"];
          var qxlocs = qx.$$locales;
          for ( var lang in locMap) {
            if (!qxlocs[lang])
              qxlocs[lang] = locMap[lang];
            else
              for (var k in locMap[lang])
                qxlocs[lang][k] = locMap[lang][k];
          }
        }
        if (dataMap["translations"]) {
          var trMap = dataMap["translations"];
          var qxtrans = qx.$$translations;
          for ( var lang in trMap) {
            if (!qxtrans[lang])
              qxtrans[lang] = trMap[lang];
            else
              for ( var k in trMap[lang])
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

qx.$$loader.init();
if (typeof exports != "undefined") {
  for (var key in qx) {
    exports[key] = qx[key];
  }
}


