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
 * Application maker; supports multiple applications to compile against a single
 * target
 */
module.exports = qx.Class.define("qxcompiler.makers.AppMaker", {
  extend: require("./Maker"),

  /**
   * Constructor
   * @param className {String|String[]} classname(s) to generate
   * @param theme {String} the theme classname
   */
  construct: function(className, theme) {
    this.base(arguments);
    this.__applications = [];
    if (className) {
      var app = new qxcompiler.Application(className);
      if (theme)
        app.setTheme(theme);
      this.addApplication(app);
    }
  },

  properties: {
    /** Map of environment settings */
    environment: {
      init: null,
      nullable: true
    }
  },

  members: {
    __applications: null,

    /**
     * Adds an Application to be made
     * @param app
     */
    addApplication: function(app) {
      this.__applications.push(app);
    },

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
            t.__applications.forEach(function(app) {
              app.getClassNames().forEach(function(className) {
                analyser.addClass(className);
              });
              analyser.addClass(app.getTheme());
            });
            analyser.analyseClasses(cb);
          },

          function(cb) {
            analyser.saveDatabase(cb);
          },

          function(cb) {
            var target = t.getTarget();

            // Get dependencies
            async.each(t.__applications,
                function(application, cb) {
                  application.setAnalyser(analyser);
                  application.calcDependencies();

                  log.info("Writing target " + target + " application " + application.getName());
                  target.setAnalyser(analyser);
                  target.generateApplication(application, t.getEnvironment(), cb);
                },
                cb);
          }
        ],
        cb);
    }
  }
});


