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

require("qooxdoo");

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
      if (theme) {
        app.setTheme(theme); 
      }
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
    make: function() {
      var analyser = this.getAnalyser();
      
      // merge all environment settings for the analyser
      const compileEnv = qx.tool.compiler.utils.Values.merge({}, 
          qx.tool.compiler.ClassFile.ENVIRONMENT_CONSTANTS,
          {
            "qx.compilerVersion": qx.tool.compiler.Version.VERSION
          },
          this.getEnvironment(),
          this.getTarget().getEnvironment());
      
      // Application env settings must be removed from the global and bumped into the application's
      //  environment settings (to avoid code elimination)
      const allAppEnv = {};
      this.getApplications().forEach(app => {
        let appEnv = app.getEnvironment();
        if (appEnv) {
          for (let key in appEnv) {
            allAppEnv[key] = true;
          }
        }
      });
      this.getApplications().forEach(app => {
        let appEnv = app.getEnvironment();
        if (appEnv) {
          for (let key in allAppEnv) {
            if (compileEnv[key] !== undefined && appEnv[key] === undefined) {
              appEnv[key] = compileEnv[key];
            }
          }
        }
      });
      for (let key in allAppEnv) {
        delete compileEnv[key];
      }
      
      return this.checkCompileVersion()
        .then(() => this.writeCompileVersion())
        .then(() => {
          analyser.setEnvironment(compileEnv);

          this.getTarget().setAnalyser(analyser);
          this.__applications.forEach(app => app.setAnalyser(analyser));
          
          return this.getTarget().open();
        })
        .then(() => analyser.open())
        .then(() => {
          if (this.isOutputTypescript()) {
            analyser.getLibraries().forEach(library => {
              var symbols = library.getKnownSymbols();
              for (var name in symbols) {
                var type = symbols[name];
                if (type === "class" && name !== "q" && name !== "qxWeb") {
                  analyser.addClass(name); 
                }
              }
            });
          }
          
          this.__applications.forEach(function(app) {
            app.getRequiredClasses().forEach(function(className) {
              analyser.addClass(className);
            });
            if (app.getTheme()) {
              analyser.addClass(app.getTheme());
            }
          });
          return qx.tool.compiler.utils.Promisify.call(cb => analyser.analyseClasses(cb));
        })
        .then(() => {
          var target = this.getTarget();
          this.fireEvent("writingApplications");
          
          var promises = this.__applications.map(application => {
            var appEnv = qx.tool.compiler.utils.Values.merge({}, compileEnv, application.getEnvironment());
            application.calcDependencies();
            if (application.getFatalCompileErrors()) {
              qx.tool.compiler.Console.print("qx.tool.compiler.maker.appFatalError", application.getName());
              return undefined;
            }
            
            this.fireDataEvent("writingApplication", application);
            return target.generateApplication(application, appEnv)
              .then(() => this.fireDataEvent("writtenApplication", application));
          });
          
          return qx.Promise.all(promises)
            .then(() => {
              this.fireEvent("writtenApplications");
              if (this.isOutputTypescript()) {
                return new qx.tool.compiler.targets.TypeScriptWriter(target)
                  .set({ outputTo: this.getOutputTypescriptTo() })
                  .run();
              }
              return undefined;
            });
        })
        .then(() => analyser.saveDatabase());
    }
  }
});
