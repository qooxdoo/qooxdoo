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

require("@qooxdoo/framework");
const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");

require("./Utils");
require("../compiler");


qx.Class.define("qx.tool.cli.Watch", {
  extend: qx.core.Object,
  
  construct: function(maker) {
    this.base(arguments);
    this.__maker = maker;
    this.__stats = {
      classesCompiled: 0  
    };
  },
  events: {
    "making": "qx.event.type.Event",
    "remaking": "qx.event.type.Event",
    "made": "qx.event.type.Event"
  },  
  members: {
    __runningPromise: null,
    __applications: null,
    __watcherReady: false,
    
    start: function() {
      if (this.__runningPromise) {
        throw new Error("Cannot start watching more than once"); 
      }
      this.__runningPromise = qx.tool.cli.Utils.newExternalPromise();
      
      var dirs = [ ];
      var analyser = this.__maker.getAnalyser();
      analyser.addListener("compiledClass", function() {
        this.__stats.classesCompiled++;
      }, this);
      dirs.push("compile.json");
      dirs.push("compile.js");
      analyser.getLibraries().forEach(function(lib) {
        let dir = path.join(lib.getRootDir(), lib.getSourcePath());
        dirs.push(dir);
        dir = path.join(lib.getRootDir(), lib.getResourcePath());
        dirs.push(dir);
        dir = path.join(lib.getRootDir(), lib.getThemePath());
        dirs.push(dir);
      });
      var applications = this.__applications = [];
      this.__maker.getApplications().forEach(function(application) {
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
      });
      var confirmed = [];
      Promise.all(dirs.map(dir => new Promise((resolve, reject) => {
        dir = path.resolve(dir);
        fs.stat(dir, function(err) {
          if (err) {
            if (err.code == "ENOENT") {
              resolve();
            } else {
              reject(err);
            }  
            return;
          }
            
          // On case insensitive (but case preserving) filing systems, qx.tool.compiler.files.Utils.correctCase 
          // is needed corrects because chokidar needs the correct case in order to detect changes. 
          qx.tool.compiler.files.Utils.correctCase(dir).then(dir => {
            confirmed.push(dir);
            resolve();
          });
        });
      }))).then(() => {
        var watcher = this._watcher = chokidar.watch(confirmed, {
          //ignored: /(^|[\/\\])\../
        });
        watcher.on("change", filename => this.__onFileChange("change", filename));
        watcher.on("add", filename => this.__onFileChange("add", filename));
        watcher.on("unlink", filename => this.__onFileChange("unlink", filename));
        watcher.on("ready", () => {
          this.__watcherReady = true;
          this.__make();
        });
        watcher.on("error", err => {
          qx.tool.compiler.Console.print(err.code == "ENOSPC" ? "qx.tool.cli.watch.enospcError" : "qx.tool.cli.watch.watchError", err);
        });
      });
    },
    
    stop: function() {
      this._watcher.close();
    },
    
    __make: function() {
      if (this.__making) {
        return;
      }
      this.fireEvent("making");
      var t = this;
      this.__making = true;
      var Console = qx.tool.compiler.Console;
      
      function make() {
        Console.print("qx.tool.cli.watch.makingApplications");
        var startTime = new Date().getTime();
        t.__stats.classesCompiled = 0;
        t.__outOfDate = false;
        
        t.__maker.make()
          .then(() => {
            if (t.__outOfDate) {
              setImmediate(function() {
                Console.print("qx.tool.cli.watch.restartingMake");
                t.fireEvent("remaking");
                make();
              });
              return;
            }
            
            var analyser = t.__maker.getAnalyser();
            var db = analyser.getDatabase();
            var promises = [];
            t.__applications.forEach(data => {
              data.dependsOn = {};
              var deps = data.application.getDependencies();
              deps.forEach(function(classname) {
                var info = db.classInfo[classname];
                var lib = analyser.findLibrary(info.libraryName);
                var parts = [ lib.getRootDir(), lib.getSourcePath() ].concat(classname.split("."));
                var filename = path.resolve.apply(path, parts) + ".js";
                data.dependsOn[filename] = true;
              });
              var filename = path.resolve(data.application.getLoaderTemplate());
              promises.push(qx.tool.compiler.files.Utils.correctCase(filename)
                .then(filename => data.dependsOn[filename] = true));
            });
            Promise.all(promises).then(() => {
              var endTime = new Date().getTime();
              Console.print("qx.tool.cli.watch.compiledClasses", t.__stats.classesCompiled, qx.tool.cli.Utils.formatTime(endTime - startTime));
              t.__making = false;
              t.fireEvent("made");
            });
          })
          .catch(err => {
            Console.print("qx.tool.cli.watch.compileFailed", err);
            t.__making = false;
            t.fireEvent("made");
          });
      }
      
      make();
    },
    
    __scheduleMake: function() {
      var t = this;
      if (!t.__making) {
        if (t.__timerId) {
          clearTimeout(t.__timerId);
        }
        t.__timerId = setTimeout(function() {
          t.__make();
        }, 500);
      }
    },
    
    __onFileChange: function(type, filename) {
      if (!this.__watcherReady) {
        return; 
      }
      
      var t = this;
      var outOfDate = false;

   
      t.__applications.forEach(function(data) {
        if (data.dependsOn[filename]) {
          outOfDate = true;
        } else {
          var boot = data.application.getBootPath();
          if (boot) {
            boot = path.resolve(boot);
            if (filename.startsWith(boot)) {
              outOfDate = true;
            }
          }
        }
      });

      if (!outOfDate) {
        t.__maker.getAnalyser().getLibraries()
          .forEach(function(lib) {
            var dir = path.join(lib.getRootDir(), lib.getResourcePath());
            dir = path.resolve(dir);
            if (filename.startsWith(dir)) {
              outOfDate = true; 
            }
          });
      }
      if (!outOfDate) {
        t.__maker.getAnalyser().getLibraries()
          .forEach(function(lib) {
            var dir = path.join(lib.getRootDir(), lib.getThemePath());
            dir = path.resolve(dir);
            if (filename.startsWith(dir)) {
              outOfDate = true;
            }
          });
      }      
      if (outOfDate) {
        t.__outOfDate = true;
        t.__scheduleMake();
      }
    },
    
    __onStop: function() {
      this.__runningPromise.resolve();
    }
  },
  
  defer: function() {
    qx.tool.compiler.Console.addMessageIds({
      "qx.tool.cli.watch.makingApplications": ">>> Making the applications...",
      "qx.tool.cli.watch.restartingMake" : ">>> Code changed during make, restarting...",
      "qx.tool.cli.watch.compiledClasses": ">>> Compiled %1 classes in %2"
    });
    qx.tool.compiler.Console.addMessageIds({
      "qx.tool.cli.watch.compileFailed": ">>> Fatal error during compile: %1",
      "qx.tool.cli.watch.enospcError": ">>> ENOSPC error occured - try increasing fs.inotify.max_user_watches",
      "qx.tool.cli.watch.watchError": ">>> Error occured while watching files - file modifications may not be detected; error: %1"
    }, "error");
  }
});
