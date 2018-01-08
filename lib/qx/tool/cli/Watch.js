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

const {promisify} = require('util');

const qx = require("qooxdoo");
const qxcompiler = require('qxcompiler');
const fs = require('fs');
const path = require('path');
const JsonToAst = require("json-to-ast");
const chokidar = require('chokidar');

require("./Utils");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

qx.Class.define("qxcli.Watch", {
  extend: qx.core.Object,
  
  construct: function(maker) {
    this.base(arguments);
    this.__maker = maker;
    this.__stats = {
      classesCompiled: 0  
    };
  },
  
  members: {
    __runningPromise: null,
    __applications: null,
    
    start: function() {
      if (this.__runningPromise)
        throw new Error("Cannot start watching more than once");
      this.__runningPromise = qxcli.Utils.newExternalPromise();
      
      var dirs = [ ];
      var analyser = this.__maker.getAnalyser();
      analyser.addListener("compiledClass", function() {
        this.__stats.classesCompiled++;
      }, this);
      dirs.push("compile.json");
      dirs.push("compile.js");
      analyser.getLibraries().forEach(function(lib) {
        var dir = path.join(lib.getRootDir(), lib.getSourcePath());
        dirs.push(dir);
        var dir = path.join(lib.getRootDir(), lib.getResourcePath());
        dirs.push(dir);
        var dir = path.join(lib.getRootDir(), lib.getBootPath());
        dirs.push(dir);
        var dir = path.join(lib.getRootDir(), lib.getThemePath());
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
      }.bind(this));
      var confirmed = [];
      Promise.all(dirs.map((dir) => new Promise((resolve, reject) => {
        fs.stat(dir, function(err) {
          if (err)
            return err.code == "ENOENT" ? resolve() : reject(err);
            
          qx.tool.compiler.files.Utils.correctCase(dir).then((dir) => {
            confirmed.push(dir);
            resolve();
          });
        });
      }))).then(() => {
        var watcher = this._watcher = chokidar.watch(confirmed, {
          //ignored: /(^|[\/\\])\../
        });
        watcher.on("change", (filename) => this.__onFileChange("change", filename));
        watcher.on("add", (filename) => this.__onFileChange("add", filename));
        watcher.on("unlink", (filename) => this.__onFileChange("unlink", filename));
        this.__make();
      });
    },
    
    stop: function() {
      this._watcher.close();
    },
    
    __make: function() {
      if (this.__making)
        return;
      this.fireEvent("making");
      var t = this;
      this.__making = true;
      var Console = qx.tool.compiler.Console;
      
      function formatTime(millisec) {
        var seconds = Math.floor(millisec / 1000);
        var minutes = Math.floor(seconds / 60);
        var hours = Math.floor(minutes / 60);
        millisec = millisec % 1000;
        
        var result = "";
        if (hours) {
          result += ((hours > 9) ? hours : "0" + hours) + "h ";
        }
        if (hours || minutes) {
          result += ((minutes > 9) ? minutes : "0" + minutes) + "m ";
        }
        if (seconds > 9 || (!hours && !minutes))
          result += seconds;
        else if (hours || minutes)
          result += "0" + seconds;
        result +=  "." + ((millisec > 99) ? "" : millisec > 9 ? "0" : "00") + millisec + "s";
        return result;
      }
      
      function make() {
        Console.print("qxcli.watch.makingApplications");
        var startTime = new Date().getTime();
        t.__stats.classesCompiled = 0;
        t.__outOfDate = false;
        t.__maker.make(function(err) {
          if (err) {
            Console.print("qxcli.watch.compileFailed", err);
            t.__making = false;
            t.fireEvent("made");
            return;
          }
          if (t.__outOfDate) {
            setImmediate(function() {
              Console.print("qxcli.watch.restartingMake");
              t.fireEvent("remaking");
              make();
            });
          } else {
            var analyser = t.__maker.getAnalyser();
            var db = analyser.getDatabase();
            var promises = [];
            t.__applications.forEach(function(data) {
              data.dependsOn = {};
              var deps = data.application.getDependencies();
              deps.forEach(function(classname) {
                var info = db.classInfo[classname];
                var lib = analyser.findLibrary(info.libraryName);
                var parts = [ lib.getRootDir(), lib.getSourcePath() ].concat(classname.split('.'));
                var filename = path.resolve.apply(path, parts) + ".js";
                promises.push(qx.tool.compiler.files.Utils.correctCase(filename)
                  .then((filename) => data.dependsOn[filename] = true));
              });
              var filename = path.resolve(data.application.getLoaderTemplate());
              promises.push(qx.tool.compiler.files.Utils.correctCase(filename)
                .then((filename) => data.dependsOn[filename] = true));
            });
            Promise.all(promises).then(() => {
              var endTime = new Date().getTime();
              Console.print("qxcli.watch.compiledClasses", t.__stats.classesCompiled, formatTime(endTime - startTime));
              t.__making = false;
              t.fireEvent("made");
            });
          }
        });
      }
      
      make();
    },
    
    __scheduleMake: function() {
      var t = this;
      if (!t.__making) {
        if (t.__timerId)
          clearTimeout(t.__timerId);
        t.__timerId = setTimeout(function() {
          t.__make();
        }, 500);
      }
    },
    
    __onFileChange: function(type, filename) {
      var t = this;
      var outOfDate = false;

   
      t.__applications.forEach(function(data) {
        if (data.dependsOn[filename]) {
          outOfDate = true;
        }
      });

      if (!outOfDate) {
        t.__maker.getAnalyser().getLibraries().forEach(function(lib) {
          var boot = path.join(lib.getRootDir(), lib.getBootPath());
          boot = path.resolve(boot);
          if (filename.startsWith(boot))
            outOfDate = true;
        });
      }
      if (!outOfDate) {
        t.__maker.getAnalyser().getLibraries().forEach(function(lib) {
          var dir = path.join(lib.getRootDir(), lib.getResourcePath());
          dir = path.resolve(dir);
          if (filename.startsWith(dir))
            outOfDate = true;
        });
      }
      if (!outOfDate) {
        t.__maker.getAnalyser().getLibraries().forEach(function(lib) {
        var dir = path.join(lib.getRootDir(), lib.getThemePath());
        dir = path.resolve(dir);
        if (filename.startsWith(dir))
          outOfDate = true;
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
      "qxcli.watch.makingApplications": ">>> Making the applications...",
      "qxcli.watch.restartingMake" : ">>> Code changed during make, restarting...",
      "qxcli.watch.compiledClasses": ">>> Compiled %1 classes in %2",
      "qxcli.watch.compileFailed": ">>> Fatal error during compile: %1"
    });
  }
});