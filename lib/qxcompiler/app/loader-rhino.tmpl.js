window = (function() { return this;	}).call(null);

(function(){ 
	
  if (typeof console === "undefined") {
    console = {
      log: function() {
        var out = java.lang.System.out;
        for (var i = 0; i < arguments.length; i++)
          out.print(arguments[i]);
        out.println();
        out.flush();
      }
    };
    console.debug = console.log;
    console.warn = console.log;
  }
  
  window.document = document = {
      readyState: "ready",
      createEvent: function() {
        return {
          initCustomEvent: function() {}
        };
      },
      addListener: function() {},
      removeListener: function() {},
      documentElement: {
        style: {}
      }
  };
  
  if (!this.window) 
    window = this;
  window.dispatchEvent = function() {};
  
	if (!window.navigator) {
	  window.navigator = {
    	  userAgent: "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_4; de-de) AppleWebKit/533.17.8 (KHTML, like Gecko) Version/5.0.1 Safari/533.17.8", 
    	  product: "", 
    	  cpuClass: ""
    	}; 
	}
	
  if (!this.qxloadPrefixUrl)
    qxloadPrefixUrl = "";

	if (!window.qx) 
	  window.qx = {};
	
  if (!window.qxvariants) 
    qxvariants = {};
  
  qx.$$start = new Date();

	if (!qx.$$environment) qx.$$environment = {};
	var envinfo = %{EnvSettings};
	for (var k in envinfo) qx.$$environment[k] = envinfo[k];
	
	if (!qx.$$libraries) qx.$$libraries = {};
	var libinfo = %{Libinfo};
	for (var k in libinfo) qx.$$libraries[k] = libinfo[k];

	var isDebug = qx.$$environment["qx.debugLoader"];
	var log = isDebug ? console.log : function() { };
	var load = qx.$$environment["qx.ooLoader"] ? this[qx.$$environment["qx.ooLoader"]] : this.load;

	qx.$$resources = %{Resources};
	qx.$$translations = %{Translations};
	qx.$$locales = %{Locales};
	qx.$$packageData = {};
  qx.$$g = {}
  qx.$$createdAt = function(obj, filename, lineNumber, column) {
    if (obj !== undefined && obj !== null) {
      Object.defineProperty(obj, "$$createdAt", {
        value: {
          filename: filename,
          lineNumber: lineNumber,
          column: column
        },
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
	  transpiledPath: %{TranspiledPath},
		  
		decodeUris : function(compressedUris) {
			var libs = qx.$$libraries;
			var uris = [];
			for ( var i = 0; i < compressedUris.length; i++) {
				var uri = compressedUris[i].split(":");
				var euri;
				if (uri.length == 2 && uri[0] in libs) {
				  if (uri[0] == "__out__")
            euri = uri[1];
          else
            euri = this.transpiledPath + "/" + uri[1];
				} else {
					euri = compressedUris[i];
				}
				uris.push(qxloadPrefixUrl + euri);
			}
			return uris;
		},

		init : function() {
			var l = qx.$$loader;
			this.loadScriptList(l.urisBefore);

			var bootPackageHash=l.parts[l.boot][0];
			this.loadScriptList(l.decodeUris(l.packages[l.parts[l.boot][0]].uris));
			l.importPackageData(qx.$$packageData[bootPackageHash] || {});
      qx.$$domReady = true;
			l.signalStartup();
		},
		
		loadScriptList: function(list) {
      list.forEach(function(uri) {
				load(uri);
      });
		},

		signalStartup : function() {
      qx.Bootstrap.executePendingDefers();
      qx.$$loader.delayDefer = false;
      qx.$$loader.scriptLoaded = true;
      if (window.qx && qx.event && qx.event.handler && qx.event.handler.Application) {
        qx.event.handler.Application.onScriptLoaded();
        qx.$$loader.applicationHandlerReady = true;
      } else {
        qx.$$loader.applicationHandlerReady = false;
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


