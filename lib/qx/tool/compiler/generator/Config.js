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
var path = require('path');
require("qooxdoo");
var util = require("../util");

var log = util.createLog("config");

require("./ConfigFile");


/**
 * Merges two configuration objects; keys in src begining "=" are explicit values that overwrite,
 * otherwise scalars are not overwritten and arrays/objects are merged
 * @param src
 * @param dest
 * @returns
 */
function mergeValuesV1(src, dest) {
  for (var name in src) {
    var srcValue;
    var destValue;
    srcValue = src[name];
    if (name.charAt(0) == '=') {
      name = name.substring(1);
      destValue = undefined;
    } else {
      destValue = dest[name];
    }

    if (destValue) {
      if (destValue instanceof Array) {
        mergeArrayV1(srcValue, destValue);
        continue;
      } else if (typeof destValue == "object") {
        mergeValuesV1(srcValue, destValue);
        continue;
      }
      continue;
    }
    if (srcValue instanceof Array)
      mergeArrayV1(srcValue, dest[name] = []);
    else if (typeof srcValue == "object")
      mergeValuesV1(srcValue, dest[name] = {});
    else
      dest[name] = srcValue;
  }
  return dest;
}

/**
 * Merges an array
 * @param src
 * @param dest
 * @returns
 */
function mergeArrayV1(src, dest) {
  for (var i = 0; i < src.length; i++) {
    var value = src[i];
    if (dest.indexOf(value) < 0)
      dest.push(value);
  }
  return dest;
}


qx.Class.define("qx.tool.compiler.generator.Config", {
  extend: qx.core.Object,

  construct: function (filename, jobName) {
    this.base(arguments);
    this.__filename = filename;
    this.__libraries = {};
    this.__globalMacros = {
      QOOXDOO_VERSION: 0,
      QOOXDOO_REVISION: 0
    };
  },

  members: {
    __libraries: null,
    __globalMacros: null,
    rootConfig: null,

    /**
     * Loads the configuration
     * @param callback
     */
    load: function (callback) {
      this.rootConfig = new qx.tool.compiler.generator.ConfigFile(this, this.__filename);
      this.rootConfig.load(callback);
    },

    /**
     * Gets a library for a given path, caching the result
     * @param path
     * @returns
     */
    getLibrary: function (path) {
      var library = this.__libraries[path];
      if (library)
        return library;

      var src = fs.existsSync(path) && fs.readFileSync(path);
      if (!src)
        return null;
      var json = eval("(" + src + ")");
      console.log("Loading Manifest " + JSON.stringify(path));
      var pos = path.lastIndexOf('/');
      var rootDir = path.substring(0, pos);
      library = {
        rootDir: rootDir,
        sourcePath: json.provides["class"],
        resourcePath: json.provides["resource"],
        libraryName: json.provides.namespace
      };

      if (json.provides.namespace == "qx") {
        path = rootDir + "/../version.txt";
        src = fs.existsSync(path) && fs.readFileSync(path);
        if (src) {
          var m = ("" + src).match(/(\d+).(\d+)/);
          if (m) {
            this.__globalMacros.QOOXDOO_VERSION = m[1] || "0";
            this.__globalMacros.QOOXDOO_REVISION = m[2] || "0";
          }
        }
      }

      return this.__libraries[path] = library;
    },

    /**
     * Returns a library for a given namespace
     * @param ns
     * @returns
     */
    getLibraryByName: function (ns) {
      for (var path in this.__libraries) {
        var library = this.__libraries[path];
        if (library.libraryName == ns)
          return library;
      }
      return null;
    },

    /**
     * Returns a global macro, undefined if not defined
     * @param name
     * @returns {*}
     */
    getGlobalMacro: function(name) {
      return this.__globalMacros[name];
    },

    /**
     * Returns the jobs for a given job name; because jobs can run other jobs, this returns
     * an array of jobs which must be executed in order
     */
    getJobs: function (jobName) {
      var job = this.rootConfig.getJob(jobName);
      var jobs = [];
      if (typeof job.run !== undefined) {
        for (var i = 0; i < job.run.length; i++) {
          var innerJob = this.rootConfig.getJob(job.run[i]);
          jobs.push(innerJob);
        }
      }
      jobs.push(job);
      return jobs;
    },


    /**
     * Returns the root config data, including data merged from included config files
     */
    getRootConfig: function () {
      return rootConfig;
    },


    /**
     * Creates a basic configuration required by the analyser
     */
    getAnalyserConfig: function (jobName) {
      var result = {
        libraries: [],
        includeClasses: [],
        excludeClasses: [],
        locales: (this.rootConfig.data.let && this.rootConfig.data.let.LOCALES) || null,
        namespace: (this.rootConfig.manifest && this.rootConfig.manifest.provides && this.rootConfig.manifest.provides.namespace) || null,
        environment: {}
      };

      var self = this;

      function runJob(job) {
        //console.log("==== JOB " + job.name + ": " + JSON.stringify(job, null, 2));

        if (job.run) {
          job.run.forEach(function (jobName) {
            var childJob = self.rootConfig.getJob(jobName);
            if (!childJob)
              console.log("Cannot find job " + jobName);
            else {
              childJob = qx.tool.compiler.generator.ConfigFile.clone(childJob);
              var parentJobClone = qx.tool.compiler.generator.ConfigFile.clone(job);
              delete parentJobClone.run;
              mergeValuesV1(parentJobClone, childJob);
              runJob(childJob);
            }
          });
        }
        if (job.compile) {
          if (job.library) {
            job.library.forEach(function (libRef) {
              var path = libRef.manifest;
              path = self.rootConfig.demacro(path);
              var library = getLibrary(path);
              if (library)
                result.libraries.push(library);
            });
          }
        }
        if (job.include) {
          job.include.forEach(function (className) {
            className = self.rootConfig.demacro(className) || className;
            if (result.includeClasses.indexOf(className) < 0)
              result.includeClasses.push(className);
          });
        }
        if (job.exclude) {
          job.exclude.forEach(function (className) {
            className = self.rootConfig.demacro(className) || className;
            if (result.excludeClasses.indexOf(className) < 0)
              result.excludeClasses.push(className);
          });
        }
        if (job.environment) {
          for (var name in job.environment) {
            result.environment[name] = self.rootConfig.demacro(job.environment[name]);
          }
        }
      }

      var job = this.rootConfig.getJob(jobName || "source");

      if (job)
        runJob(job);

      return result;
    },

    /**
     * Gets the image splitting directives from the config file
     */
    getImageSplitting: function () {
      var self = this;
      var jobs = this.getJobs("image-clipping");
      if (!jobs || !jobs.length)
        return null;
      var result = {
        clipping: []
      };
      jobs.forEach(function (job) {
        var images = job["slice-images"] && job["slice-images"]["images"];
        if (!images)
          return;

        for (var imgPath in images) {
          var info = images[imgPath];
          var sourcePath = path.join(configDir, self.demacro(imgPath, job));
          var clip = {
            sourcePath: sourcePath,
            prefix: path.join(path.dirname(sourcePath), self.demacro(info.prefix, job)),
            borderWidth: info["border-width"]
          };
          result.clipping.push(clip);
        }
      });
      return result;
    },

    getImageCombining: function () {
      var self = this;
      var jobs = this.getJobs("image-combine");
      if (!jobs || !jobs.length)
        return null;
      var result = {
        combine: []
      };
      jobs.forEach(function (job) {
        var images = job["combine-images"] && job["combine-images"]["images"];
        if (!images)
          return;

        for (var imgPath in images) {
          var info = images[imgPath];
          var sourcePath = path.join(configDir, self.demacro(imgPath, job));
          var prefix = path.join(configDir, self.demacro(info.prefix[0], job));
          console.log("sourcePath=" + sourcePath + ", prefix=" + prefix);
          var combine = {
            sourcePath: sourcePath,
            combinedId: (info.prefix[1] || "") + sourcePath.substring(prefix.length + 1).replace(/\.\w+$/, ''),
            input: [],
            layout: info.layout
          };
          result.combine.push(combine);

          for (var i = 0; i < info.input.length; i++) {
            var prefix = path.join(configDir, self.demacro(info.input[i].prefix[0], job));
            var idPrefix = info.input[i].prefix[1] || "";
            var files = info.input[i].files;
            for (var j = 0; j < files.length; j++) {
              var inputPath = path.join(configDir, self.demacro(files[i], job));
              var fileInfo = {
                sourcePath: inputPath,
                imageId: idPrefix + inputPath.substring(prefix.length + 1).replace(/\.\w+$/, '')
              };
              combine.input.push(fileInfo);
            }
          }
        }
      });
      return result;
    }
  }
});
