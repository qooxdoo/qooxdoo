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
var path = require("path");
var async = require('async');
var qx = require("qooxdoo");
var util = require("../../util");

var log = util.createLog("makers");

/**
 * Simple application maker, given some class names, a theme class name, and one or more
 * targets it will generate the application(s)
 */
module.exports = qx.Class.define("qxcompiler.makers.SimpleApp", {
  extend: require("./Maker"),

  /**
   * Constructor
   * @param className {String|String[]} classname(s) to generate
   * @param theme {String} the theme classname
   */
  construct: function(className, theme) {
    this.base(arguments);
    if (className)
      this.setClassName(className);
    if (theme)
      this.setTheme(theme);
  },

  properties: {
    /** Class(es) to include in the target application */
    className: {
      nullable: false
    },

    /** Theme name */
    theme: {
      nullable: false,
      check: "String"
    }
  },

  members: {
    /*
     * @Override
     */
    make: function(cb) {
      var t = this;
      var analyser = this.getAnalyser();
      async.series([
          function(cb) {
            t.getTarget().open(cb);
          },

          function(cb) {
            analyser.open(cb);
          },

          function(cb) {
            var className = t.getClassName();
            if (!qx.lang.Type.isArray(className))
              analyser.addClass(className);
            else
              className.forEach(function(className) {
                analyser.addClass(className);
              });
            analyser.addClass(t.getTheme());
            analyser.analyseClasses(cb);
          },

          function(cb) {
            analyser.saveDatabase(cb);
          },

          function(cb) {
            // Write a copy of the database as a javacript file
            var db = analyser.getDatabase();
            fs.writeFile(t.getOutputDir() + "db.js", "var db = " + JSON.stringify(db, null, 2));

            // Get dependencies
            var application = new qxcompiler.Application(t.getClassName()).set({
              theme: t.getTheme(),
              analyser: analyser
            });
            application.calcDependencies();

            var target = t.getTarget();
            log.info("Writing target " + target);
            target.setApplication(application);
            target.generateApplication(cb);
          }
        ],
        cb);
    }
  }
});


