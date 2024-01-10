/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo
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
var log = qx.tool.utils.LogManager.createLog("analyser");

/**
 * Application maker; supports multiple applications to compile against a single
 * target
 */
qx.Class.define("qx.tool.compiler.makers.AppMaker", {
  extend: qx.tool.compiler.makers.AbstractAppMaker,

  /**
   * Constructor
   * @param className {String|String[]} classname(s) to generate
   * @param theme {String} the theme classname
   */
  construct(className, theme) {
    super();
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
    addApplication(app) {
      this.__applications.push(app);
    },

    /**
     * Returns the array of applications
     * @returns {Application[]}
     */
    getApplications() {
      return this.__applications;
    },

    /*
     * @Override
     */
    async make() {
      var analyser = this.getAnalyser();
      let target = this.getTarget();

      await this.fireEventAsync("making");
      this.setSuccess(null);
      this.setHasWarnings(null);
      let success = true;
      let hasWarnings = false;

      // merge all environment settings for the analyser
      const compileEnv = qx.tool.utils.Values.merge(
        {},
        qx.tool.compiler.ClassFile.ENVIRONMENT_CONSTANTS,
        {
          "qx.compiler": true,
          "qx.compiler.version": qx.tool.config.Utils.getCompilerVersion()
        },

        this.getEnvironment(),
        target.getDefaultEnvironment(),
        target.getEnvironment()
      );

      let preserve = target.getPreserveEnvironment();
      if (preserve) {
        let tmp = {};
        preserve.forEach(key => (tmp[key] = true));
        preserve = tmp;
      } else {
        preserve = {};
      }

      let appEnvironments = {};
      this.getApplications().forEach(app => {
        appEnvironments[app.toHashCode()] = qx.tool.utils.Values.merge(
          {},
          compileEnv,
          app.getCalculatedEnvironment()
        );
      });

      // Analyze the list of environment variables, detect which are shared between all apps
      let allAppEnv = {};
      this.getApplications().forEach(app => {
        let env = appEnvironments[app.toHashCode()];
        Object.keys(env).forEach(key => {
          if (!allAppEnv[key]) {
            allAppEnv[key] = {
              value: env[key],
              same: true
            };
          } else if (allAppEnv[key].value !== env[key]) {
            allAppEnv[key].same = false;
          }
        });
      });

      // If an env setting is the same for all apps, move it to the target for code elimination; similarly,
      //  if it varies between apps, then remove it from the target and make each app specify it individually
      this.getApplications().forEach(app => {
        let env = appEnvironments[app.toHashCode()];
        Object.keys(allAppEnv).forEach(key => {
          if (preserve[key]) {
            env[key] = compileEnv[key];
          } else if (allAppEnv[key].same) {
            delete env[key];
          } else if (env[key] === undefined) {
            env[key] = compileEnv[key];
          }
        });
      });

      // Cleanup to remove env that have been moved to the app
      Object.keys(allAppEnv).forEach(key => {
        if (!preserve[key] && allAppEnv[key].same) {
          compileEnv[key] = allAppEnv[key].value;
        } else {
          delete compileEnv[key];
        }
      });

      await analyser.open();
      analyser.setEnvironment(compileEnv);
      if (!this.isNoErase() && analyser.isContextChanged()) {
        log.log("enviroment changed - delete output dir");
        await this.eraseOutputDir();
        await qx.tool.utils.Utils.makeParentDir(this.getOutputDir());
        await analyser.resetDatabase();
      }

      await qx.tool.utils.Utils.promisifyThis(analyser.initialScan, analyser);
      await analyser.updateEnvironmentData();

      target.setAnalyser(analyser);
      this.__applications.forEach(app => app.setAnalyser(analyser));
      await target.open();

      for (let library of analyser.getLibraries()) {
        let fontsData = library.getFontsData();
        for (let fontName in fontsData) {
          let fontData = fontsData[fontName];
          let font = analyser.getFont(fontName);
          if (!font) {
            font = analyser.getFont(fontName, true);
            await font.updateFromManifest(fontData, library);
          }
        }
      }

      this.__applications.forEach(function (app) {
        app.getRequiredClasses().forEach(function (className) {
          analyser.addClass(className);
        });
        if (app.getTheme()) {
          analyser.addClass(app.getTheme());
        }
      });
      await analyser.analyseClasses();

      await analyser.saveDatabase();
      await this.fireEventAsync("writingApplications");

      // Detect which applications need to be recompiled by looking for classes recently compiled
      //  which is on the application's dependency list.  The first time `.make()` is called there
      //  will be no dependencies so we just compile anyway, but `qx compile --watch` will call it
      //  multiple times
      let compiledClasses = this.getRecentlyCompiledClasses(true);
      let db = analyser.getDatabase();

      var appsThisTime = await this.__applications.filter(async app => {
        let loadDeps = app.getDependencies();
        if (!loadDeps || !loadDeps.length) {
          return true;
        }
        let res = loadDeps.some(name => Boolean(compiledClasses[name]));
        let localModules = app.getLocalModules();
        for (let requireName in localModules) {
          let stat = await qx.tool.utils.files.Utils.safeStat(
            localModules[requireName]
          );

          res ||=
            stat.mtime.getTime() >
            (db?.modulesInfo?.localModules[requireName] || 0);
        }
        return res;
      });

      let allAppInfos = [];

      for (let i = 0; i < appsThisTime.length; i++) {
        let application = appsThisTime[i];
        if (application.getType() != "browser" && !compileEnv["qx.headless"]) {
          qx.tool.compiler.Console.print(
            "qx.tool.compiler.maker.appNotHeadless",
            application.getName()
          );
        }
        var appEnv = qx.tool.utils.Values.merge(
          {},
          compileEnv,
          appEnvironments[application.toHashCode()]
        );

        application.calcDependencies();
        if (application.getFatalCompileErrors()) {
          qx.tool.compiler.Console.print(
            "qx.tool.compiler.maker.appFatalError",
            application.getName()
          );

          success = false;
          continue;
        }
        if (!hasWarnings) {
          application.getDependencies().forEach(classname => {
            if (!db.classInfo[classname] || !db.classInfo[classname].markers) {
              return;
            }
            db.classInfo[classname].markers.forEach(marker => {
              let type = qx.tool.compiler.Console.getInstance().getMessageType(
                marker.msgId
              );

              if (type == "warning") {
                hasWarnings = true;
              }
            });
          });
        }

        let appInfo = {
          application,
          analyser,
          maker: this
        };

        allAppInfos.push(appInfo);
        await this.fireDataEventAsync("writingApplication", appInfo);
        await target.generateApplication(application, appEnv);
        await this.fireDataEventAsync("writtenApplication", appInfo);
      }

      await this.fireDataEventAsync("writtenApplications", allAppInfos);

      await analyser.saveDatabase();
      await this.fireEventAsync("made");
      this.setSuccess(success);
      this.setHasWarnings(hasWarnings);
    }
  }
});
