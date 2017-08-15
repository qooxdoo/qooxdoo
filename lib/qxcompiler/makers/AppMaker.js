/* ************************************************************************
 *
 *    qxcompiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qxcompiler
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
      var app = new qxcompiler.app.Application(className);
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

    /**
     * Returns the array of applications
     * @returns {Application[]}
     */
    getApplications: function() {
      return this.__applications;
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
              app.getRequiredClasses().forEach(function(className) {
                analyser.addClass(className);
              });
              if (app.getTheme())
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
