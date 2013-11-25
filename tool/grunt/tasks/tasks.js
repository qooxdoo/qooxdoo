'use strict';


// requires
var fs = require('fs');
var async = require('async');
var os = require('os');
var path = require('path');

var qx = {};
qx.tool = {};
qx.tool.Cache = require('../lib/qx/tool/Cache');


// functions
var queryAndWriteCurrentJobs = function(cacheFilePath, cache, callback) {
    var exec = require('child_process').exec;
    var cmd = 'python generate.py --list-jobs';
    var jobs = {};

    exec(cmd,
      function (error, stdout, stderr) {
        if (error === null) {
          jobs.timestamp = new Date().getTime();
          jobs.map = JSON.parse(stdout);
          cache.write(cacheFilePath, JSON.stringify(jobs));
          callback(null, jobs.map);
        } else {
          callback(stderr + '|' + error);
        }
    });
};

var getCacheContents = function(cacheFilePath, cache) {
  return JSON.parse(cache.read(cacheFilePath));
};

var retrieveGeneratorJobsFromCache = function(files, cache) {
    if (!fs.existsSync(files.config)) {
      // fail early
      return;
    }

    var cachedJobs = {};
    if (cache.has(files.jobsAndDesc)) {
      cachedJobs = getCacheContents(files.jobsAndDesc, cache);
    }

    var configTimestamp = fs.statSync(files.config).ctime.getTime();

    return (cachedJobs && cachedJobs.timestamp && cachedJobs.timestamp >= configTimestamp)
           ? cachedJobs.map
           : null;
};

var getSupersededJobs = function() {
  return {
    clean: "clean:clean",
    distclean: "clean:dist",
    info: "info"
  };
};

var registerGeneratorJobsAsTasks = function(grunt, jobs, supersededJobs) {
  var sortedJobNames = Object.keys(jobs).sort();
  sortedJobNames.forEach(function (jobName) {
    var jobDesc = jobs[jobName];

    if (supersededJobs[jobName] === undefined) {
      // register generator job as task if there's
      // no replacement implemented in node
      grunt.registerTask(jobName, jobDesc, function (job) {
        grunt.task.run(["generate:"+jobName]);
      });
    }
  });
};

var registerNodeTasks = function(grunt, relSdkPath) {
  // TODO:
  //   * move to registerGeneratorJobs
  //   * rename in tasks/generator
  grunt.loadTasks(relSdkPath + '/tool/grunt/tasks/application');
  grunt.loadTasks(relSdkPath + '/tool/grunt/tasks/info/tasks');
  grunt.loadTasks(relSdkPath + '/tool/grunt/tasks/copy-files/tasks');
};

var registerTasks = function(grunt) {
  var conf = grunt.config.get('common');
  var cache = new qx.tool.Cache(conf.CACHE);
  var files = {
    "config": "config.json",
    "jobsAndDesc": "jobsAndDesc-" + fs.realpathSync(conf.ROOT)
  };
  var jobs = retrieveGeneratorJobsFromCache(files, cache);

  if (jobs) {
    // synchronously
    registerGeneratorJobsAsTasks(grunt, jobs, getSupersededJobs());
    registerNodeTasks(grunt, conf.QOOXDOO_PATH);
  } else {
    // asynchronously: run 'generate.py --list-jobs'
    async.series([
        function(callback) {
          queryAndWriteCurrentJobs(files.jobsAndDesc, cache, callback);
        }
      ],
      function(err, results) {
        if (err) {
          throw err;
        }

        jobs = (results) ? results : retrieveGeneratorJobsFromCache(files, cache);
        if (jobs !== null) {
          registerGeneratorJobsAsTasks(grunt, jobs, getSupersededJobs());
        }
        registerNodeTasks(grunt, conf.QOOXDOO_PATH);
      }
    );
  }
};

// exports
module.exports.registerTasks = registerTasks;
