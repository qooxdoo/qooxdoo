/* ************************************************************************
 * 
 *    qxcompiler - node.js based replacement for the Qooxdoo python 
 *    toolchain
 * 
 *    https://github.com/johnspackman/qxcompiler
 * 
 *    Copyright:
 *      2011-2013 Zenesis Limited, http://www.zenesis.com
 * 
 *      MIT: http://opensource.org/licenses/MIT.
 * 
 *    Authors:
 *      * John Spackman (john.spackman@zenesis.com)
 * 
 * ************************************************************************/

/**
 * generator.js
 * 
 * Provides a loose implementation comparable to Qooxdoo's generator.py
 */ 

var fs = require("fs");
var async = require("async");
var util = require("./util");
var qxAnalyser = require("./analyser.js");
var qxConfig = require("./config.js");

var log = util.createLog("main");

/**
 * Generator
 */
qx.Class.define("qxanalyser.Generator", {
  extend: qx.core.Object,
  
  members: {
    __options: {},
    __analyser: null,
    __buildCfg: null,
    __app: null,
   
    /**
     * Processes the command line
     * @param argv
     * @returns {map} options detected
     */
    processCommandLine: function(argv) {
      if (argv === undefined)
        argv = process.argv;
      
      var options = this.__options = { };
      for (var i = 0; i < argv.length; i++) {
        var arg = argv[i];
        if (arg == "--no-resources")
          options.processResources = false;
        else if (arg == "--log")
          options.logSettings = process.argv[++i];
        else if (arg == "--no-line-numbers")
          options.lineNumbers = false;
        else if (/^[a-z0-9_-]+$/.test(arg))
          options.buildType = arg;
      };
      return options;
    },
    
    /**
     * Loads the config.json from current directory
     */
    loadConfig: function(callback) {
      var t = this;
      log.debug("Loading config.json");
      var config = new qxConfig.Config("config.json");
      config.load(function() {
        var analyser = t.getAnalyser();
        var buildCfg = t.__buildCfg = config.getAnalyserConfig(t.__options.buildType);
        log.trace(JSON.stringify(buildCfg, null, 2));

        buildCfg.includeClasses.forEach(function(className) { analyser.addClass(className); });
        buildCfg.libraries.forEach(function(library) { analyser.addLibrary(library); });
        if (callback)
          callback();
      });
    },
    
    /**
     * Does the generation
     * @param callback
     */
    generate: function(callback) {
      var t = this;
      var buildCfg = t.__buildCfg;
      if (!buildCfg)
        t.loadConfig();
      var analyser = t.getAnalyser();
      
      log.debug("Analysing");
      analyser.run(function(err) {
        if (err) throw err;
        
        // Write it
        var db = analyser.getDatabase();
        fs.writeFile("db.js", "var db = " + JSON.stringify(db, null, 2));

        // Get dependencies
        var app = this.__app = new qxAnalyser.Application(analyser, buildCfg.includeClasses);
        app.calcDependencies();
        
        var uris = app.getUris();
        uris.unshift("__out__:resources.js");
        var configdata = {
          "environment": buildCfg.environment,
          "loader": {
            "parts": {
              "boot": [
                "0"
              ]
            },
            "packages": {
              "0": {
                "uris": uris
              }
            }
          },
          "libraries": {
            "__out__": {
              "sourceUri": "script"
            }
          },
          "urisBefore": [],
          "cssBefore": [],
          "boot": "boot",
          "closureParts": {},
          "bootIsInline": false,
          "addNoCacheParam": false
        };
        
        function fixUri(path) {
          if (path[0] == '/' || path.match(/^https?\:/))
            return path;
          return "../" + path;
        }
        buildCfg.libraries.forEach(function(library) {
          configdata.libraries[library.libraryName] = {
            sourceUri: fixUri(library.rootDir + "/" + library.sourcePath),
            resourceUri: fixUri(library.rootDir + "/" + library.resourcePath)
          };
        });
        
        var pkgdata = {
          "locales": {},
          "resources": {},
          "translations": {
            "C": {}
          }
        };
        
        for (var i = 0, locales = analyser.getLocales(); i < locales.length; i++) {
          var localeId = locales[i];
          pkgdata.locales[localeId] = db.cldr[localeId];
          pkgdata.translations[localeId] = {};
        }
        pkgdata.locales["C"] = db.cldr["en"];
        
        var rm = analyser.getResourceManager();
        if (rm) {
          rm.getAssets(app.getAssets(), function(err, assets) {
            
            // Save any changes that getAssets collected
            rm.saveDatabase();
            
            for (var i = 0; i < assets.length; i++) {
              var asset = assets[i];
              var arr = pkgdata.resources[asset.filename] = [
                asset.fileInfo.width, asset.fileInfo.height, (asset.filename.match(/\.(\w+)$/)[1])||"", asset.libraryName
              ];
              if (asset.fileInfo.composite !== undefined) {
                arr.push(asset.fileInfo.composite);
                arr.push(asset.fileInfo.x);
                arr.push(asset.fileInfo.y);
              }
            }
            
            async.parallel([
                function(callback) {
                  var MAP = {
                    EnvSettings: configdata.environment,
                    Libinfo: configdata.libraries,
                    Resources: {},
                    Translations: { "C": null },
                    Locales: { "C": null },
                    Parts: configdata.loader.parts,
                    Packages: configdata.loader.packages,
                    UrisBefore: [],
                    CssBefore: [],
                    Boot: "boot",
                    ClosureParts: {},
                    BootIsInline: false,
                    NoCacheParam: false,
                    DecodeUrisPlug: undefined,
                    BootPart: undefined
                  };
                  
                  for (var i = 0, locales = analyser.getLocales(); i < locales.length; i++) {
                    var localeId = locales[i];
                    MAP.Translations[localeId] = null;
                    MAP.Locales[localeId] = null;
                  }
                  
                  fs.readFile(analyser.getQooxdooPath() + "/../tool/data/generator/loader.tmpl.js", { encoding: "utf-8" }, function(err, data) {
                    if (err)
                      return callback(err);
                    var lines = data.split('\n');
                    for (var i = 0; i < lines.length; i++) {
                      var line = lines[i];
                      var match;
                      while (match = line.match(/\%\{([^}]+)\}/)) {
                        var keyword = match[1];
                        var replace = "";
                        if (MAP[keyword] !== undefined)
                          replace = JSON.stringify(MAP[keyword], null, 2);
                        var newLine = line.substring(0, match.index) + replace + line.substring(match.index + keyword.length + 3);
                        line = newLine;
                      }
                      lines[i] = line;
                    }
                    data = lines.join('\n');
                    fs.writeFile(analyser.getBuildType() + "/script/boot.js", data, callback);
                  });
                },
                
                function(callback) {
                  fs.writeFile(analyser.getBuildType() + "/index.html", 
                    "<!DOCTYPE html>\n" + 
                    "<html>\n" +
                    "<head>\n" +
                    "  <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />\n" +
                    "  <title>skeleton</title>\n" +
                    "  <script type=\"text/javascript\" src=\"script/boot.js\"></script>\n" +
                    "</head>\n" +
                    "<body></body>\n" +
                    "</html>\n",
                    callback);
                },
                
                function(callback) {
                  fs.writeFile(analyser.getBuildType() + "/script/test.json", JSON.stringify(configdata, null, 2), callback);
                },
                
                function(callback) {
                  fs.writeFile(analyser.getBuildType() + "/script/resources.js", "qx.$$packageData['0'] = " + JSON.stringify(pkgdata, null, 2) + ";\n", callback);
                },
                
                function(callback) {
                  fs.writeFile(analyser.getBuildType() + "/script/resources.json", JSON.stringify(pkgdata, null, 2) + "\n", callback);
                }
              ],
              callback);
          });
        }
      });
    },
    
    getAnalyser: function() {
      if (!this.__analyser)
        this.__analyser = new qxanalyser.Analyser();
      return this.__analyser;
    },
    
    getApplication: function() {
      return this._app;
    }
  }
});

exports.Generator = qxanalyser.Generator;

