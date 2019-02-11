/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo-compiler
 *
 *    Copyright:
 *      2011-2017 Zenesis Limited, http://www.zenesis.com
 *
 *    License:
 *      MIT: https://opensource.org/licenses/MIT
 *
 *      This software is provided under the same licensing terms as Qooxdoo,
 *      please see the LICENSE file in the Qooxdoo project's top-level directory
 *      for details.
 *
 *    Authors:
 *      * John Spackman (john.spackman@zenesis.com, @johnspackman)
 *
 * *********************************************************************** */

var path = require("upath");
require("qooxdoo");
var fs = require("fs");
var async = require("async");
var util = require("../util");

var log = util.createLog("library");

/**
 * A Qooxdoo Library or application; typical usage is to call .loadManifest to configure from
 * the library itself
 */
qx.Class.define("qx.tool.compiler.app.Library", {
  extend: qx.core.Object,

  construct: function() {
    this.base(arguments);
    this.__knownSymbols = {};
  },

  properties: {
    /** The namespace of the library */
    namespace: {
      check: "String"
    },

    /** The version of the library */
    version: {
      check: "String"
    },

    /** The directory; transformed into an absolute path */
    rootDir: {
      check: "String",
      transform: "_transformRootDir"
    },

    /** The path to source files, relative to rootDir */
    sourcePath: {
      init: "source/class",
      check: "String"
    },

    /** The path to generated transpiled files, relative to rootDir */
    transpiledPath: {
      init: "source/transpiled",
      check: "String"
    },

    /** The info section form the Manifest */
    libraryInfo: {
      check: "Map"
    },

    /** The path to resource files, relative to rootDir */
    resourcePath: {
      init: "source/resource",
      check: "String"
    },

    /** The path to resource files, relative to rootDir */
    themePath: {
      init: "source/theme",
      check: "String"
    },

    /** The path to translation files, relative to rootDir */
    translationPath: {
      init: "source/translation",
      check: "String"
    },

    /** {WebFont[]} List of webfonts provided */
    webFonts: {
      init: null,
      nullable: true,
      check: "Array"
    },

    /** Array of external scripts required by the library */
    addScript: {
      init: null
    },

    /** Array of external stylesheets required by the library */
    addCss: {
      init: null
    },

    /**  Array of requires resources of the library */
    requires: {
      init: null
    }

  },

  members: {
    __knownSymbols: null,

    /**
     * Transform for rootDir; converts it to an absolute path
     * @param value
     * @returns {*}
     * @private
     */
    _transformRootDir: function(value) {
//      if (value)
//        value = path.resolve(value);
      return value;
    },

    /**
     * Loads the Manifest.json from the directory and uses it to configure
     * properties
     * @param rootDir
     * @param cb
     */
    loadManifest: function(rootDir, cb) {
      var t = this;
      t.setRootDir(rootDir);
      qx.tool.compiler.utils.Json.loadJsonAsync(rootDir + "/Manifest.json")
        .then(data => {
          if (!data) {
            var Console = qx.tool.compiler.Console.getInstance();
            throw new Error(Console.decode("qx.tool.compiler.library.emptyManifest", rootDir));
          }
          t.setNamespace(data.provides.namespace);
          t.setVersion(data.info.version);
          var sourcePath = data.provides["class"];
          t.setSourcePath(sourcePath);
          t.setResourcePath(data.provides.resource);
          t.setLibraryInfo(data.info);
          if (data.provides.transpiled) {
            t.setTranspiledPath(data.provides.transpiled); 
          } else {
            var m = sourcePath.match(/^(.*)\/([^/]+)$/);
            if (m && m.length == 3) {
              t.setTranspiledPath(m[1] + "/transpiled");
            } else {
              t.setTranspiledPath("transpiled");
            }
          }
          if (data.provides.translation) {
            t.setTranslationPath(data.provides.translation);
          }
          if (data.provides.webfonts) {
            var fonts = [];
            data.provides.webfonts.forEach(wf => {
              var font = new qx.tool.compiler.app.WebFont(t).set(wf);
              fonts.push(font);
            });
            t.setWebFonts(fonts);
          }
          if (data.externalResources) {
            if (data.externalResources.script) {
              t.setAddScript(data.externalResources.script); 
            }
            if (data.externalResources.css) {
              t.setAddCss(data.externalResources.css);
            }
          }
          if (data.requires) {
            t.setRequires(data.requires);
          }  
          if (data.provides && data.provides.boot) {
            qx.tool.compiler.Console.print("qx.tool.cli.compile.deprecatedProvidesBoot", rootDir);
          }
          return cb && cb();
        })
        .catch(err => cb(err));
    },

    /**
     * Scans the filing system looking for classes; there are occasions (ie Qooxdoo's qxWeb module)
     * where the class name does not comply with the namespace, this method is used to find those
     * files and also to prepopulate the known symbols list
     * @param cb(err, classes) returns an array of class names
     */
    scanForClasses: function(cb) {
      var t = this;
      var classes = [];
      function scanDir(folder, packageName, cb) {
        fs.readdir(folder, function(err, filenames) {
          if (err) {
            cb(err);
            return;
          }

          async.each(
              filenames,
              function(filename, cb) {
                if (filename[0] == ".") {
                  cb();
                  return; 
                }
                fs.stat(path.join(folder, filename), function(err, stat) {
                  if (err || !stat) {
                    cb(err);
                    return;
                  }

                  if (stat.isDirectory()) {
                    var tmp = packageName;
                    if (tmp.length) {
                      tmp += "."; 
                    }
                    tmp += filename;
                    scanDir(path.join(folder, filename), tmp, cb);
                    return;
                  }

                  // Make sure it looks like a file
                  var match = filename.match(/(.*)(\.\w+)$/);
                  if (!match) {
                    log.trace("Skipping file " + folder + "/" + filename);
                    cb();
                    return;
                  }

                  // Class name
                  var className = match[1];
                  var extension = match[2];
                  if (packageName.length) {
                    className = packageName + "." + className; 
                  }

                  if (className.match(/__init__/)) {
                    cb();
                    return;
                  }
                  if (extension == ".js") {
                    t.__knownSymbols[className] = "class";
                    classes.push(className);
                  } else {
                    t.__knownSymbols[filename] = "resource";
                  }
                  if (Boolean(packageName) && !t.__knownSymbols[packageName]) {
                    t.__knownSymbols[packageName] = "package";
                    var pos;
                    tmp = packageName;
                    while ((pos = tmp.lastIndexOf(".")) > -1) {
                      tmp = tmp.substring(0, pos);
                      t.__knownSymbols[tmp] = "package";
                    }
                  }

                  cb();
                });
              },
              cb);
        });
      }

      scanDir(path.join(t.getRootDir(), t.getSourcePath()), "", function(err) {
        cb(err, classes);
      });
    },

    /**
     * Detects the type of a symbol, "class", "resource", "package", or null if not found
     * @param {String} name
     * @return {{symbolType,name,className?}}
     */
    getSymbolType: function(name) {
      if (!name.length) {
        return null;
      }
      var t = this;

      var type = this.__knownSymbols[name];

      if (type) {
        return { symbolType: t.__knownSymbols[name], className: type == "class" ? name : null, name: name }; 
      }
      
      var tmp = name;
      var pos;
      while ((pos = tmp.lastIndexOf(".")) > -1) {
        tmp = tmp.substring(0, pos);
        type = this.__knownSymbols[tmp];
        if (type) {
          if (type == "class") {
            return { symbolType: "member", className: tmp, name: name };
          }
          return null;
        }
      }

      return null;
    },

    /**
     * Returns all known symbols as a map indexed by symbol name
     */
    getKnownSymbols: function() {
      return this.__knownSymbols;
    },

    /**
     * Returns the full filename for the file within this library
     *
     * @param filename {String} the filename relative to this library
     * @return {String} the full filename
     */
    getFilename: function(filename) {
      return path.join(this.getRootDir(), this.getSourcePath(), filename);
    }
  }
});

module.exports = qx.tool.compiler.app.Library;
