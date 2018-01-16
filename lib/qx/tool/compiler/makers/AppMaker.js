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
 * ************************************************************************/

var fs = require("fs");
var path = require("path");
var async = require('async');
require("qooxdoo");
var util = require("../util");

var log = util.createLog("makers");

/**
 * Application maker; supports multiple applications to compile against a single
 * target
 */
module.exports = qx.Class.define("qx.tool.compiler.makers.AppMaker", {
  extend: require("./AbstractAppMaker"),

  /**
   * Constructor
   * @param className {String|String[]} classname(s) to generate
   * @param theme {String} the theme classname
   */
  construct: function(className, theme) {
    this.base(arguments);
    this.__applications = [];
    if (className) {
      var app = new qx.tool.compiler.app.Application(className);
      if (theme)
        app.setTheme(theme);
      this.addApplication(app);
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
      this.checkCompileVersion()
        .then(() => this.writeCompileVersion())
        .then(() => {
          var t = this;
          var analyser = this.getAnalyser();
          t.getTarget().setAnalyser(analyser);
          t.__applications.forEach((app) => app.setAnalyser(analyser));
          return new Promise((resolve, reject) => {
            async.series([
              function(cb) {
                t.getTarget().open(cb);
              },

              function(cb) {
                analyser.open(cb);
              },
              
              function(cb) {
                if (t.isOutputTypescript()) {
                  analyser.getLibraries().forEach((library) => {
                    var symbols = library.getKnownSymbols();
                    for (var name in symbols) {
                      var type = symbols[name];
                      if (type === "class" && name !== "q" && name !== "qxWeb")
                        analyser.addClass(name);
                    }
                  });
                }
                cb();
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
                t.fireEvent("writingApplications");

                // Get dependencies
                async.each(t.__applications,
                    function(application, cb) {
                      application.calcDependencies();
                      if (application.getFatalCompileErrors()) {
                        qx.tool.compiler.Console.print("qx.tool.compiler.maker.appFatalError", application.getName());
                        cb();
                      } else {
                        t.fireDataEvent("writingApplication", application);
                        var env = {
                          "qx.compilerVersion": qx.tool.compiler.Version.VERSION
                        };
                        env = Object.assign(env, qx.tool.compiler.makers.AbstractAppMaker.DEFAULT_ENVIRONMENT, t.getEnvironment());
                        target.generateApplication(application, env, (err) => {
                          t.fireDataEvent("writtenApplication", application);
                          cb(err);
                        });
                      }
                    },
                    function(err) {
                      t.fireEvent("writtenApplications");
                      if (t.isOutputTypescript()) {
                        new qx.tool.compiler.targets.TypeScriptWriter(target)
                          .set({ outputTo: t.getOutputTypescriptTo() })
                          .run()
                          .then(() => cb())
                          .catch((err) => cb(err));
                      } else
                        cb(err);
                    });
              }
            ],
            (err) => err ? reject(err) : resolve());
          });
        })
        .then(() => cb()).catch(cb);
    }
  }
});
