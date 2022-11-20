/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017 Zenesis Ltd

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com, @johnspackman)

************************************************************************ */

const fs = require("fs");
const path = require("upath");
const chokidar = require("chokidar");

qx.Class.define("qx.tool.cli.Watch", {
  extend: qx.core.Object,

  construct(maker) {
    super();
    this.__maker = maker;
    this.__stats = {
      classesCompiled: 0
    };

    this.__debounceChanges = {};
    this.__configFilenames = [];
    this.__runWhenWatching = {};

    maker.addListener("writtenApplication", this._onWrittenApplication, this);
  },

  properties: {
    debug: {
      init: false,
      check: "Boolean"
    }
  },

  events: {
    making: "qx.event.type.Event",
    remaking: "qx.event.type.Event",
    made: "qx.event.type.Event",
    configChanged: "qx.event.type.Event"
  },

  members: {
    __runningPromise: null,
    __applications: null,
    __watcherReady: false,
    __maker: null,
    __stats: null,
    __making: null,
    __stopping: false,
    __outOfDate: null,
    __makeTimerId: null,
    __debounceChanges: null,
    __configFilenames: null,
    __madeApplications: null,

    /** @type{Map<String,Object>} list of runWhenWatching configurations, indexed by app name */
    __runWhenWatching: null,

    async setConfigFilenames(arr) {
      if (!arr) {
        this.__configFilenames = [];
      } else {
        this.__configFilenames = arr.map(filename => path.resolve(filename));
      }
    },

    setRunWhenWatching(appName, config) {
      this.__runWhenWatching[appName] = config;
      let arr = qx.tool.utils.Utils.parseCommand(config.command);
      config._cmd = arr.shift();
      config._args = arr;
    },

    async _onWrittenApplication(evt) {
      let appInfo = evt.getData();
      let name = appInfo.application.getName();
      let config = this.__runWhenWatching[name];
      if (!config) {
        return;
      }

      if (config._process) {
        try {
          await qx.tool.utils.Utils.killTree(config._process.pid);
        } catch (ex) {
          //Nothing
        }
        if (config._processPromise) {
          await config._processPromise;
        }
        config._process = null;
      }

      console.log(
        "Starting application: " + config._cmd + " " + config._args.join(" ")
      );

      config._processPromise = new qx.Promise((resolve, reject) => {
        let child = (config._process = require("child_process").spawn(
          config._cmd,
          config._args
        ));

        child.stdout.setEncoding("utf8");
        child.stdout.on("data", data => console.log(data));
        child.stderr.setEncoding("utf8");
        child.stderr.on("data", data => console.log(data));

        child.on("close", function (code) {
          console.log("Application has terminated");
          config._process = null;
          resolve();
        });
        child.on("error", err =>
          console.error("Application has failed: " + err)
        );
      });
    },

    start() {
      if (this.isDebug()) {
        qx.tool.compiler.Console.debug("DEBUG: Starting watch");
      }
      if (this.__runningPromise) {
        throw new Error("Cannot start watching more than once");
      }
      this.__runningPromise = qx.tool.utils.Utils.newExternalPromise();

      var dirs = [];
      var analyser = this.__maker.getAnalyser();
      analyser.addListener("compiledClass", () => {
        this.__stats.classesCompiled++;
      });

      dirs.push(qx.tool.config.Compile.config.fileName);
      dirs.push("compile.js");
      analyser.getLibraries().forEach(function (lib) {
        let dir = path.join(lib.getRootDir(), lib.getSourcePath());
        dirs.push(dir);
        dir = path.join(lib.getRootDir(), lib.getResourcePath());
        dirs.push(dir);
        dir = path.join(lib.getRootDir(), lib.getThemePath());
        dirs.push(dir);
      });
      if (analyser.getProxySourcePath()) {
        dirs.push(path.resolve(analyser.getProxySourcePath()));
      }
      var applications = (this.__applications = []);
      this.__maker.getApplications().forEach(function (application) {
        var data = {
          application: application,
          dependsOn: {},
          outOfDate: false
        };

        applications.push(data);
        let dir = application.getBootPath();
        if (dir && !dirs.includes(dir)) {
          dirs.push(dir);
        }
        let localModules = application.getLocalModules();
        for (let requireName in localModules) {
          let dir = localModules[requireName];
          if (dir && !dirs.includes(dir)) {
            dirs.push(dir);
          }
        }
      });
      if (this.isDebug()) {
        qx.tool.compiler.Console.debug(
          `DEBUG: applications=${JSON.stringify(
            applications.map(d => d.application.getName()),
            2
          )}`
        );

        qx.tool.compiler.Console.debug(
          `DEBUG: dirs=${JSON.stringify(dirs, 2)}`
        );
      }
      var confirmed = [];
      Promise.all(
        dirs.map(
          dir =>
            new Promise((resolve, reject) => {
              dir = path.resolve(dir);
              fs.stat(dir, function (err) {
                if (err) {
                  if (err.code == "ENOENT") {
                    resolve();
                  } else {
                    reject(err);
                  }
                  return;
                }

                // On case insensitive (but case preserving) filing systems, qx.tool.utils.files.Utils.correctCase
                // is needed corrects because chokidar needs the correct case in order to detect changes.
                qx.tool.utils.files.Utils.correctCase(dir).then(dir => {
                  confirmed.push(dir);
                  resolve();
                });
              });
            })
        )
      ).then(() => {
        if (this.isDebug()) {
          qx.tool.compiler.Console.debug(
            `DEBUG: confirmed=${JSON.stringify(confirmed, 2)}`
          );
        }

        var watcher = (this._watcher = chokidar.watch(confirmed, {
          //ignored: /(^|[\/\\])\../
        }));
        watcher.on("change", filename =>
          this.__onFileChange("change", filename)
        );

        watcher.on("add", filename => this.__onFileChange("add", filename));
        watcher.on("unlink", filename =>
          this.__onFileChange("unlink", filename)
        );

        watcher.on("ready", () => {
          this.__watcherReady = true;
          this.__make();
        });
        watcher.on("error", err => {
          qx.tool.compiler.Console.print(
            err.code == "ENOSPC"
              ? "qx.tool.cli.watch.enospcError"
              : "qx.tool.cli.watch.watchError",
            err
          );
        });
      });
    },

    async stop() {
      this.__stopping = true;
      this._watcher.close();
      if (this.__making) {
        await this.__making;
      }
    },

    __make() {
      if (this.__making) {
        this.__makeNeedsRestart = true;
        return this.__making;
      }
      this.fireEvent("making");
      var t = this;
      var Console = qx.tool.compiler.Console;

      function make() {
        Console.print("qx.tool.cli.watch.makingApplications");
        t.__madeApplications = null;
        var startTime = new Date().getTime();
        t.__stats.classesCompiled = 0;
        t.__outOfDate = false;

        return t.__maker
          .make()
          .then(() => {
            if (t.__stopping) {
              Console.print("qx.tool.cli.watch.makeStopping");
              return null;
            }

            if (t.__outOfDate) {
              return new qx.Promise(resolve => {
                setImmediate(function () {
                  Console.print("qx.tool.cli.watch.restartingMake");
                  t.fireEvent("remaking");
                  make().then(resolve);
                });
              });
            }

            var analyser = t.__maker.getAnalyser();
            var db = analyser.getDatabase();
            var promises = [];
            t.__applications.forEach(data => {
              data.dependsOn = {};
              var deps = data.application.getDependencies();
              deps.forEach(function (classname) {
                let info = db.classInfo[classname];
                let lib = analyser.findLibrary(info.libraryName);
                let parts = [lib.getRootDir(), lib.getSourcePath()].concat(
                  classname.split(".")
                );

                let filename = path.resolve.apply(path, parts) + ".js";
                data.dependsOn[filename] = true;
              });

              let localModules = data.application.getLocalModules();
              for (let requireName in localModules) {
                let filename = path.resolve(localModules[requireName]);
                data.dependsOn[filename] = true;
              }

              var filename = path.resolve(data.application.getLoaderTemplate());
              promises.push(
                qx.tool.utils.files.Utils.correctCase(filename).then(
                  filename => (data.dependsOn[filename] = true)
                )
              );
            });
            return Promise.all(promises).then(() => {
              var endTime = new Date().getTime();
              Console.print(
                "qx.tool.cli.watch.compiledClasses",
                t.__stats.classesCompiled,
                qx.tool.utils.Utils.formatTime(endTime - startTime)
              );

              t.fireEvent("made");
            });
          })
          .then(() => {
            t.__making = null;
          })
          .catch(err => {
            Console.print("qx.tool.cli.watch.compileFailed", err);
            t.__making = null;
            t.fireEvent("made");
          });
      }

      const runIt = () =>
        make().then(() => {
          if (this.__makeNeedsRestart) {
            delete this.__makeNeedsRestart;
            return runIt();
          }
          return null;
        });

      return (this.__making = runIt());
    },

    __scheduleMake() {
      if (this.__making) {
        this.__makeNeedsRestart = true;
        return this.__making;
      }

      if (this.__makeTimerId) {
        clearTimeout(this.__makeTimerId);
      }
      this.__makeTimerId = setTimeout(() => this.__make());
      return null;
    },

    __onFileChange(type, filename) {
      const Console = qx.tool.compiler.Console;
      if (!this.__watcherReady) {
        return null;
      }
      filename = path.normalize(filename);

      const handleFileChange = async () => {
        var outOfDate = false;

        if (this.__configFilenames.find(str => str == filename)) {
          if (this.isDebug()) {
            Console.debug(`DEBUG: onFileChange: configChanged`);
          }
          this.fireEvent("configChanged");
          return;
        }

        let outOfDateApps = {};
        this.__applications.forEach(data => {
          if (data.dependsOn[filename]) {
            outOfDateApps[data.application.getName()] = data.application;
            outOfDate = true;
          } else {
            var boot = data.application.getBootPath();
            if (boot) {
              boot = path.resolve(boot);
              if (filename.startsWith(boot)) {
                outOfDateApps[data.application.getName()] = true;
                outOfDate = true;
              }
            }
          }
        });
        let outOfDateAppNames = Object.keys(outOfDateApps);
        if (this.isDebug()) {
          if (outOfDateAppNames.length) {
            Console.debug(
              `DEBUG: onFileChange: ${filename} impacted applications: ${JSON.stringify(
                outOfDateAppNames,
                2
              )}`
            );
          }
        }

        let analyser = this.__maker.getAnalyser();
        let fName = "";
        let isResource = analyser.getLibraries().some(lib => {
          var dir = path.resolve(
            path.join(lib.getRootDir(), lib.getResourcePath())
          );

          if (filename.startsWith(dir)) {
            fName = path.relative(dir, filename);
            return true;
          }
          dir = path.resolve(path.join(lib.getRootDir(), lib.getThemePath()));
          if (filename.startsWith(dir)) {
            fName = path.relative(dir, filename);
            return true;
          }
          return false;
        });

        if (isResource) {
          let rm = analyser.getResourceManager();
          let target = this.__maker.getTarget();
          if (this.isDebug()) {
            Console.debug(`DEBUG: onFileChange: ${filename} is a resource`);
          }
          let asset = rm.getAsset(fName, type != "unlink");
          if (asset && type != "unlink") {
            await asset.sync(target);
            let dota = asset.getDependsOnThisAsset();
            if (dota) {
              await qx.Promise.all(dota.map(asset => asset.sync(target)));
            }
          }
        }

        if (outOfDate) {
          this.__outOfDate = true;
          this.__scheduleMake();
        }
      };

      const runIt = dbc =>
        handleFileChange().then(() => {
          if (dbc.restart) {
            delete dbc.restart;
            return runIt(dbc);
          }
          return null;
        });

      let dbc = this.__debounceChanges[filename];
      if (!dbc) {
        dbc = this.__debounceChanges[filename] = {
          types: {}
        };
      }

      dbc.types[type] = true;
      if (dbc.promise) {
        if (this.isDebug()) {
          Console.debug(
            `DEBUG: onFileChange: seen '${filename}', but restarting promise`
          );
        }
        dbc.restart = 1;
        return dbc.promise;
      }
      if (dbc.timerId) {
        clearTimeout(dbc.timerId);
        dbc.timerId = null;
      }

      if (this.isDebug()) {
        Console.debug(`DEBUG: onFileChange: seen '${filename}', queuing`);
      }
      dbc.timerId = setTimeout(() => {
        dbc.promise = runIt(dbc).then(
          () => delete this.__debounceChanges[filename]
        );
      }, 150);
      return null;
    },

    __onStop() {
      this.__runningPromise.resolve();
    }
  },

  defer() {
    qx.tool.compiler.Console.addMessageIds({
      "qx.tool.cli.watch.makingApplications": ">>> Making the applications...",
      "qx.tool.cli.watch.restartingMake":
        ">>> Code changed during make, restarting...",
      "qx.tool.cli.watch.makeStopping":
        ">>> Not restarting make because make is stopping...",
      "qx.tool.cli.watch.compiledClasses": ">>> Compiled %1 classes in %2"
    });

    qx.tool.compiler.Console.addMessageIds(
      {
        "qx.tool.cli.watch.compileFailed": ">>> Fatal error during compile: %1",
        "qx.tool.cli.watch.enospcError":
          ">>> ENOSPC error occured - try increasing fs.inotify.max_user_watches",
        "qx.tool.cli.watch.watchError":
          ">>> Error occured while watching files - file modifications may not be detected; error: %1"
      },

      "error"
    );
  }
});
