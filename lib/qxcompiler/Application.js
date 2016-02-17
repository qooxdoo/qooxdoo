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

var fs = require("fs");
var async = require("async");
var path = require("path");
var qx = require("qooxdoo");
var util = require("../util");

var log = util.createLog("analyser");

qx.Class.define("qxcompiler.Application", {
  extend: qx.core.Object,

  /**
   * Constructor
   * @param className[, className...] {String|String[]}
   */
  construct: function (className) {
    this.base(arguments);
    var args = qx.lang.Array.fromArguments(arguments);
    var t = this;
    this.__classes = [];
    args.forEach(function(arg) {
      if (qx.lang.Type.isArray(arg))
        qx.lang.Array.append(t.__classes, arg);
      else
        t.__classes.push(arg);
    });
  },

  properties: {
    /**
     * Environment property map
     */
    environment: {
      init: null,
      nullable: true
    },

    /**
     * The Analyser instance
     */
    analyser: {
      init: null,
      nullable: true,
      apply: "_applyAnalyser"
    },

    /**
     * Application theme (class name)
     */
    theme: {
      init: "qx.theme.Simple",
      check: "String",
      apply: "_applyTheme"
    }
  },

  members: {
    __loadDeps: null,

    _applyAnalyser: function(value, oldValue) {
      if (value) {
        var t = this;
        this.__classes.forEach(function(className) {
          value.addClass(className);
        });
        value.addClass(this.getTheme());
      }
    },

    _applyTheme: function(value, oldValue) {
      var analyser = this.getAnalyser();
      if (analyser) {
        if (oldValue)
          analyser.removeClass(oldValue);
        if (value)
          analyser.addClass(value);
      }
    },

    /**
     * Calculates the dependencies of the classes to create a load order
     *
     * @param classes
     */
    calcDependencies: function (cb) {
      var t = this;
      var analyser = this.getAnalyser();
      var db = analyser.getDatabase();
      var allDeps = this.__loadDeps = [];

      var notYetDependedOn = [];
      var i = 0;

      // Copy all of the class definitions into notYetDependedOn;
      // notYetDependedOn is
      // depleted as the load order is determined
      for (var className in db.classInfo) {
        var info = notYetDependedOn[i++] = {
          className: className,
          neededFor: {}
        };
        var src = db.classInfo[className];
        if (src)
          for (var name in src)
            info[name] = src[name];
      }

      notYetDependedOn = notYetDependedOn.sort(function (left, right) {
        return left.className < right.className ? -1 : left.className > right.className ? 1 : 0;
      });

      /**
       * Finds the class definition in notYetDependedOn
       *
       * @param className
       * @returns
       */
      function getNYDO(className) {
        for (var i = 0; i < notYetDependedOn.length; i++) {
          var info = notYetDependedOn[i];
          if (info.className == className) {
            return info;
          }
        }
        return null;
      }

      var needed = [];
      var neededIndex = 0;
      var stack = [];

      function addDep(className) {
        if (allDeps.indexOf(className) > -1 || stack.indexOf(className) > -1)
          return;

        var info = getNYDO(className);
        if (!info)
          return;

        var deps = info.dependsOn;
        if (deps) {
          stack.push(className);
          for (var depName in deps) {
            if (deps[depName].load || deps[depName].require) {
              addDep(depName);
            } else if (allDeps.indexOf(depName) == -1 && needed.indexOf(depName) == -1)
              needed.push(depName);
          }
          qx.lang.Array.remove(stack, className);
        }

        allDeps.push(className);
      }

      // Start the ball rolling
      addDep("qx.lang.Object");
      for (var i = 0; i < t.__classes.length; i++)
        addDep(t.__classes[i]);
      addDep(t.getTheme());

      while (neededIndex < needed.length) {
        var className = needed[neededIndex++];
        addDep(className);
      }

      if (cb)
        cb();
    },

    getUris: function () {
      var uris = [];
      var loadDeps = this.__loadDeps;
      var db = this.getAnalyser().getDatabase();

      function add(className) {
        var def = db.classInfo[className];
        uris.push(def.libraryName + ":" + className.replace(/\./g, "/") + ".js");
      }
      this.__loadDeps.forEach(add);

      return uris;
    },

    /**
     * Returns a list of all of the assets required by all classes
     * @param environment {Map} environment
     */
    getAssets: function (environment) {
      var assets = [];
      var db = this.getAnalyser().getDatabase();

      // Check all the classes
      var classNames = this.__loadDeps.slice();
      for (var i = 0; i < classNames.length; i++) {
        var classInfo = db.classInfo[classNames[i]];
        var tmp = classInfo.assets;
        if (tmp)
          assets.push.apply(assets, tmp);
      }

      // Expand variables
      for (var i = 0; i < assets.length; i++) {
        var asset = assets[i];
        var matched = false;

        var m = asset.match(/\$\{([^}]+)\}/);
        if (m) {
          var match = m[0];
          var capture = m[1];
          var pos = asset.indexOf(match);
          var left = asset.substring(0, pos);
          var right = asset.substring(pos + match.length);
          var value = environment[capture];
          if (value !== undefined) {
            if (qx.lang.Type.isArray(value)) {
              value.forEach(function(value) {
                assets.push(left + value + right);
              });
            } else {
              assets.push(left + value + right);
            }
          }
          qx.lang.Array.removeAt(assets, i--);
        }
      }

      // Remove duplicates and overlapping path wildcards
      assets.sort();
      for (var i = 1; i < assets.length; i++) {
        var asset = assets[i];
        var lastAsset = assets[i - 1];

        if (asset == lastAsset) {
          assets.splice(i--, 1);
          continue;
        }

        if (lastAsset[lastAsset.length - 1] == '*') {
          var path = lastAsset.substring(0, lastAsset.length - 1);
          if (asset.substring(0, path.length) == path) {
            assets.splice(i--, 1);
            continue;
          }
        }
      }

      return assets;
    },

    /**
     * Returns the class name for the application
     * @returns {String}
     */
    getClassName: function() {
      return this.__classes[0];
    }

  }
});

module.exports = qxcompiler.Application;
