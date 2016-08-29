/* ************************************************************************
 *
 *    qxcompiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/johnspackman/qxcompiler
 *
 *    Copyright:
 *      2011-2016 Zenesis Limited, http://www.zenesis.com
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
var path = require('path');
var async = require("async");
var qx = require("qooxdoo");
var util = require("../../util");

var log = util.createLog("config");

function mergeValues() {
  var result = arguments[0]||{};
  for (var i = 1; i < arguments.length; i++) {
    var src = arguments[i];
    if (src === null || src === undefined)
      continue;
    for (var name in src) {
      if (name[0] == '=') {
        var actualName = name.substring(1);
        delete result[actualName];
        mergeValue(result, actualName, src[name]);
      } else {
        mergeValue(result, name, src[name]);
      }
    }
  }
  return result;
}

function mergeValue(result, name, srcValue) {
  if (result[name] instanceof Array) {
    mergeArray(result[name], srcValue);

  } else if (typeof result[name] == "object") {
    mergeValues(result[name], srcValue);

  } else if (!result[name]) {
    if (srcValue instanceof Array)
      mergeArray(result[name] = [], srcValue);
    else if (typeof srcValue == "object")
      mergeValues(result[name] = {}, srcValue);
    else
      result[name] = srcValue;
  }
}

/**
 * Merges an array
 * @param src
 * @param dest
 * @returns
 */
function mergeArray(dest, src) {
  for (var i = 0; i < src.length; i++) {
    var value = src[i];
    if (dest.indexOf(value) < 0)
      dest.push(value);
  }
  return dest;
}

/**
 * Clones an object
 * @param obj
 * @returns
 */
function clone(obj) {
  if (obj === undefined || obj === null)
    return obj;
  return mergeValues({}, obj);
}

/**
 * Configuration File
 * @param filename
 * @param parentConfig
 * @param include
 * @returns {ConfigFile}
 */
qx.Class.define("qxcompiler.generator.ConfigFile", {
  extend: qx.core.Object,

  construct: function(config, filename, namespace) {
    this.base(arguments);
    this.__config = config;
    this.__filename = filename;
    this.__namespace = namespace;
  },

  statics: {
    clone: clone
  },


  members: {
    __config: null,
    __filename: null,
    __namespace: null,
    configDir: null,
    manifest: null,

    /**
     * Loads the config file
     */
    load: function(callback) {
      var t = this;

      async.waterfall(
          [
            // Make the path absolute
            function(callback) {
              // Get file and path
              fs.realpath(t.__filename, function(err, filename) {
                t.__filename = filename;
                var pos = filename.lastIndexOf('/');
                t.configDir = filename.substring(0, pos + 1);
                callback();
              });
            },

            // Optionally load manifest.json
            function(callback) {
              var manifestFilename = t.configDir + "Manifest.json";

              t.manifest = null;
              fs.exists(manifestFilename, function(exists) {
                if (!exists)
                  return callback(null);
                fs.readFile(manifestFilename, { encoding: "utf-8" }, function(err, data) {
                  if (err)
                    return callback(err);
                  t.manifest = eval("(" + data + ")"); // Have to use eval because qx uses comments, ie is not json compliant
                  callback(null);
                });
              });
            },

            // Check config.json exists
            function(callback) {
              fs.exists(t.__filename, function(exists) {
                if (!exists)
                  return callback(new Error("ERROR: Cannot find " + t.__filename));
                log.debug("Loading Config " + t.__filename);
                callback(null);
              });
            },

            // Get included files
            function(callback) {
              fs.readFile(t.__filename, { encoding: "utf-8" }, function(err, data) {
                if (err)
                  return callback(err);
                data = t.data = eval("(" + data + ")"); // Have to use eval because qx uses comments, not json compliant

                if (data.include) {
                  async.forEach(data.include,
                      function(incFile, callback) {
                        var incFilePath = t.demacro(incFile.path);
                        if (incFilePath[0] != '/')
                          incFilePath = path.join(t.configDir, incFilePath);
                        incFile.configFile = new qxcompiler.generator.ConfigFile(this.__config, incFilePath, incFile.as||null);
                        incFile.configFile.load(callback);
                      },
                      callback);
                } else
                  callback();
              });
            }
          ],
          callback);
    },

    getConfigDir: function() {
      return configDir;
    },

    /**
     * Finds a macro
     * @param name {String}
     * @param job {Object} the current job
     */
    findMacro: function(name, job) {
      if (job && job.let) {
        var value = job.let[name];
        if (value !== undefined)
          return value;
      }
      if (this.data.let) {
        var value = this.data.let[name];
        if (value !== undefined)
          return value;
      }
      if (this.data.include) {
        for (var incs = this.data.include, i = 0; i < incs.length; i++) {
          var value = incs[i].configFile.findMacro(name);
          if (value !== undefined)
            return value;
        }
      }
      return this.__config.getGlobalMacro(name)||null;
    },

    /**
     * Recursively expands macros in strings, arrays, objects
     * @param obj {String} string possibly containing macros to expand
     * @param job {Map?} the job definition; it's macros will be considered first, if job is given
     */
    demacro: function(obj, job) {
      var self = this;
      var RE_MACRO = /(\$\{[A-Za-z0-9_]+\})/;

      function demacroInner(str) {
        var m = RE_MACRO.exec(str);
        while (m) {
          var left = str.substring(0, m.index);
          var key = m[1].substring(2, m[1].length - 1);
          var right = str.substring(m.index + m[1].length);
          var value = self.findMacro(key, job)||"";
          str = left + value + right;
          m = RE_MACRO.exec(str);
        }
        return str;
      };

      if (!obj)
        return obj;
      if (typeof obj == "string")
        return demacroInner(obj);

      if (obj instanceof Array) {
        var res = [];
        for (var i = 0; i < obj.length; i++)
          res.push(this.demacro(obj[i]));
        return res;

      } else if (typeof obj == "object") {
        var res = {};
        for (var name in obj)
          res[name] = this.demacro(obj[name]);
        return res;
      }

      return obj;
    },

    /**
     * Splits a name into the namespace and name
     * @return {Object} namespace? {String}, name {String}
     */
    _splitName: function(jobName) {
      var m = jobName.match(/^((.*)::)?([a-zA-Z0-9-_]+)$/);
      if (!m)
        debugger;
      return { name: m[3], namespace: m[2]||null };
    },

    _hasNamespace: function(namespace) {
      if (this.__namespace === namespace)
        return true;
      for (var incs = t.data.include, i = 0; incs && i < incs.length; i++) {
        var inc = incs[i];
        if (inc.configFile.hasNamespace(namespace))
          return true;
      }
      return false;
    },

    /**
     * Gets a job definition
     */
    getJob: function(jobName) {
      var qName = this._splitName(jobName);
      var result = {};
      this.mergeJobInto(qName, result);
      result.name = jobName;
      return result;
    },

    getJobs: function(jobName) {
      var t = this;
      var jobs = [];
      var job = t.getJob(jobName);
      if (!job)
        return null;
      job = mergeValues({ let: this.data.let||{} }, job);
      jobs.push(job);
      for (var startIndex = 0; startIndex < jobs.length; ) {
        var job = jobs[startIndex];
        if (!job.run || !job.run.length) {
          startIndex++;
          continue;
        }

        jobs.splice(startIndex, 1);

        for (var i = 0; i < job.run.length; i++) {
          var runJobs = t.getJobs(job.run[i]);
          for (var j = 0; j < runJobs.length; j++) {
            runJobs[j] = mergeValues({}, runJobs[j], job);
            jobs.splice(startIndex++, 0, runJobs[j]);
          }
        }
      }

      return jobs;
    },

    getMacros: function() {
      var result = {};
      this._getMacrosInto(result);
      return result;
    },

    _getMacrosInto: function(result) {
      for (var incs = this.data.include, i = 0; incs && i < incs.length; i++) {
        var inc = incs[i];
        inc.configFile._getMacrosInto(result);
      }

      if (this.data.let) {
        for (var name in this.data.let) {
          if (name[0] == '=') {
            result[name.substring(1)] = this.data.let[name];
          } else {
            mergeValue(result, name, this.data.let[name]);
          }
        }
      }
    },

    /**
     * Finds a job definition, merging the into result
     */
    mergeJobInto: function(qName, result, rootConfig) {
      rootConfig = rootConfig||this;
      var t = this;
      if (typeof qName == "string")
        qName = t._splitName(qName);

      function mergeJobIntoInner() {
        var job = t.data.jobs[qName.name];
        if (job) {
          job = clone(job);
          if (t.data.let) {
            if (!job.let)
              job.let = {};
            mergeValues(job.let, t.data.let);
          }
          if (job.extend) {
            for (var i = 0; i < job.extend.length; i++) {
              rootConfig.mergeJobInto(job.extend[i], result, rootConfig);
            }
          }
          if (job.run) {
            for (var i = 0; i < job.run.length; i++) {
              var run = job.run[i];
              if (t.__namespace && run.indexOf(':') < 0)
                job.run[i] = run = t.__namespace + "::" + run;
            }
          }
          mergeValues(result, job);
        }
      }

      function iterateConfigs(configFile, callback) {
        for (var incs = configFile.data.include, i = 0; incs && i < incs.length; i++) {
          var inc = incs[i];
          if (callback(inc.configFile) === false)
            return false;
          if (iterateConfigs(inc.configFile, callback) === false)
            return false;
        }
        return true;
      }

      if (qName.namespace) {
        if (qName.namespace === t.__namespace) {
          mergeJobIntoInner();
          return;
        }

        iterateConfigs(t, function(configFile) {
          if (configFile.__namespace === qName.namespace) {
            configFile.mergeJobInto(qName.name, result);
            return false;
          }
          return true;
        });

      } else {
        iterateConfigs(t, function(configFile) {
          if (!configFile.__namespace) {
            configFile.mergeJobInto(qName.name, result, rootConfig);
          }
          return true;
        });

        mergeJobIntoInner();
      }
    }

  }
});

