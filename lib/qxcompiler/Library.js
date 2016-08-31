/* ************************************************************************
 *
 *    qxcompiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/johnspackman/qxcompiler
 *
 *    Copyright:
 *      2011-2016 Zenesis Limited, http://www.zenesis.com
 *
 *    License:
 *      LGPL: http://www.gnu.org/licenses/lgpl.html
 *      EPL: http://www.eclipse.org/org/documents/epl-v10.php
 *
 *      This software is provided under the same licensing terms as Qooxdoo,
 *      please see the LICENSE file in the Qooxdoo project's top-level directory
 *      for details.
 *
 *    Authors:
 *      * John Spackman (john.spackman@zenesis.com)
 *
 * ************************************************************************/

var path = require("path");
var qx = require("qooxdoo");
var fs = require("fs");
var async = require("async");
var util = require("../util");

var log = util.createLog("library");

var SERIAL=0;

/**
 * A Qooxdoo Library or application; typical usage is to call .loadManifest to configure from
 * the library itself
 */
qx.Class.define("qxcompiler.Library", {
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

    /** The path to resource files, relative to rootDir */
    resourcePath: {
      init: "source/resource",
      check: "String"
    },

    /** The path to translation files, relative to rootDir */
    translationPath: {
      init: "source/translation",
      check: "String"
    },

    /** Array of external scripts required by the library */
    addScript: {
      init: null
    },

    /** Array of external stylesheets required by the library */
    addCss: {
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
      if (value)
        value = path.resolve(value);
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
      fs.readFile(rootDir + "/Manifest.json", { encoding: "utf8" }, function(err, data) {
        if (!err) {
          data = JSON.parse(data);
          t.setNamespace(data.provides.namespace);
          var sourcePath = data.provides["class"];
          t.setSourcePath(sourcePath);
          t.setResourcePath(data.provides.resource);
          if (data.provides.transpiled)
            t.setTranspiledPath(data.provides.transpiled);
          else {
            var m = sourcePath.match(/^(.*)\/([^/]+)$/);
            if (m && m.length == 3) {
              t.setTranspiledPath(m[1] + "/transpiled");
            } else {
              t.setTranspiledPath("transpiled");
            }
          }
          if (data.provides.translation)
            t.setTranslationPath(data.provides.translation);
          if (data.externalResources) {
            if (data.externalResources.script)
              t.setAddScript(data.externalResources.script);
            if (data.externalResources.css)
              t.setAddCss(data.externalResources.css);
          }
        }
        return cb && cb(err);
      });
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
          if (err)
            return cb(err);

          async.each(
              filenames,
              function(filename, cb) {
                if (filename[0] == '.')
                  return cb();
                fs.stat(folder + "/" + filename, function(err, stat) {
                  if (!stat)
                    return cb();

                  if (stat.isDirectory()) {
                    var tmp = packageName;
                    if (tmp.length)
                      tmp += ".";
                    tmp += filename;
                    return scanDir(folder + "/" + filename, tmp, cb);
                  }

                  // Make sure it looks like a file
                  var match = filename.match(/(.*)(\.\w+)$/);
                  if (!match) {
                    log.trace("Skipping file " + folder + "/" + filename);
                    return cb();
                  }

                  // Class name
                  var className = match[1];
                  var extension = match[2];
                  if (packageName.length)
                    className = packageName + "." + className;

                  if (extension == ".js") {
                    t.__knownSymbols[className] = "class";
                    classes.push(className);
                  } else
                    t.__knownSymbols[filename] = "resource";
                  t.__knownSymbols[packageName] = "package";

                  cb();
                });
              },
              cb);
        });
      }

      scanDir(t.getRootDir() + "/" + t.getSourcePath(), "", function(err) {
        cb(err, classes);
      });
    },

    /**
     * Detects whether a given classname is known to exist in the library; this is only accurate
     * if scanForClasses() has been called
     * @param className
     * @returns {boolean}
     */
    hasFoundSymbol: function(className) {
      return this.__knownSymbols[className] === "class";
    },

    /**
     * Gets the class for the symbol, or null if not a class/class member
     * @param name
     * @param cb
     */
    getSymbolClass: function(name, cb) {
      if (!name.length)
        return cb(null, null);
      var t = this;
      var segs = name.split('.');
      var symbol = name;
      var found = null;
      async.until(
          function() {
            return !symbol.length || !!found;
          },
          function(cb) {
            t.__getSymbolTypeImpl(symbol, function(err, symbolType) {
              if (symbolType == "class")
                found = symbol;
              else {
                segs.pop();
                symbol = segs.join('.');
              }
              cb(err);
            });
          },
          function(err) {
            cb(err, found);
          }
      );
    },

    /**
     * Detects the type of a symbol, "class", "resource", "package", or null if not found
     * @param {String} name
     * @param {Function} cb(err, symbolType, className)
     */
    getSymbolType: function(name, cb) {
      var t = this;
      this.__getSymbolTypeImpl(name, function(err, symbolType) {
        if (symbolType == "member") {
          t.getSymbolClass(name, function (err, className) {
            cb(err, symbolType, className);
          });
        } else if (symbolType == "class") {
          cb(err, symbolType, name);
        } else
          cb(err, symbolType, null);
      });
    },

    /**
     * Detects the type of a symbol, "class", "resource", "package", or null if not found
     * @param {String} name
     * @param {Function} cb(err, symbolType)
     */
    __getSymbolTypeImpl: function(name, cb) {
      if (!name.length)
        return cb(null, null);
      var t = this;

      if (this.__knownSymbols[name])
        return cb(null, t.__knownSymbols[name]);

      function getSymbol(depth, separator) {
        if (!separator)
          separator = "/";
        var str = "";
        for (var j = 0; j <= depth; j++) {
          if (j == 0)
            str = segs[j];
          else
            str += separator + segs[j];
        }
        return str;
      }

      function test(path, cb) {
        path = t.getRootDir() + "/" + t.getSourcePath() + "/" + path;
        fs.exists(path, function(exists) {
          if (!exists)
            return cb(null, false);
          fs.stat(path, function(err, stats) {
            if (err)
              return cb(err);
            return cb(null, stats.isFile() ? "file" : stats.isDirectory() ? "dir" : false);
          });
        });
      }

      function found(symbol, symbolType, cb) {
        if (symbolType) {
          if (index < segs.length - 1)
            t.__knownSymbols[name] = "member";
          symbol = symbol.replace(/\//g, '.');
          t.__knownSymbols[symbol] = symbolType;
        }
        for (--index; index > -1; index--) {
          symbol = getSymbol(index, '.');
          t.__knownSymbols[symbol] = "package";
        }
        cb();
      }

      if (name.indexOf('*') > -1)
        return found(null, null, cb);

      var segs = name.split('.');
      var symbolType = null;
      var index = segs.length;

      async.until(
          function() {
            return --index < 0;
          },
          function(cb) {
            var path = getSymbol(index, '/');
            test(path, function(err, result) {
              if (result === "file")
                found(path, "resource", cb);
              else if (result === "path")
                found(path, "package", cb);
              else
                test(path + ".js", function(err, result) {
                  if (result == "file")
                    found(path, "class", cb);
                  else
                    cb();
                });
            });
          },
          function(err) {
            cb(err, t.__knownSymbols[name]||null);
          });
    }
  }
});

module.exports = qxcompiler.Library;
