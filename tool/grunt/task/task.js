/* *****************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Richard Sternagel (rsternagel)

***************************************************************************** */

'use strict';

// native
var fs = require('fs');
var os = require('os');
var path = require('path');

// third party
var shell = require('shelljs');
var hooker = require('hooker');

// lib
var qx = {};
qx.tool = {};
qx.tool.Cache = require('../lib/qx/tool/Cache');

var queryAndWriteCurrentJobs = function(grunt, cacheFilePath, cache) {
  var cmd = 'python generate.py --list-jobs';
  var jobs = {};

  var stdout = shell.exec(cmd, {silent:true}).output;
  jobs.timestamp = new Date().getTime();
  try {
    jobs.map = JSON.parse(stdout);
    cache.write(cacheFilePath, JSON.stringify(jobs));
  } catch (syntaxError) {
    grunt.warn("Aborted JSON parsing. 'python generate.py --list-jobs' "+
               "doesn't generate valid JSON:\n" + syntaxError.message);
  }

  return jobs.map;
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

var getMalfunctionedJobs = function() {
  return [
    "migration" // the migration job doesn't work because user input is needed
  ];
};

var registerGeneratorJobsAsTasks = function(grunt, jobs, malfunctionedJobs) {
  var sortedJobNames = Object.keys(jobs).sort();
  sortedJobNames.forEach(function (jobName) {
    var jobDesc = jobs[jobName];

    if (malfunctionedJobs.indexOf(jobName) === -1) {
      grunt.registerTask(jobName, jobDesc, function (job) {
        grunt.task.run(["generate:"+jobName]);
      });
    } else {
      grunt.registerTask(jobName, jobDesc, function (job) {
        grunt.warn("The '" + jobName + "' doesn't work with grunt, " +
          "please use the real generator './generate.py " + jobName + "' instead.");
      });
    }

  });
};

var registerTasks = function(grunt) {
  var conf = grunt.config.get('common');
  var cache = new qx.tool.Cache(conf.CACHE);
  var files = {
    "config": "config.json",
    "jobsAndDesc": "jobsAndDesc-" + fs.realpathSync(conf.ROOT)
  };

  grunt.loadTasks(conf.QOOXDOO_PATH + '/tool/grunt/task/generate');

  var jobs = retrieveGeneratorJobsFromCache(files, cache);
  if (jobs) {
    registerGeneratorJobsAsTasks(grunt, jobs, getMalfunctionedJobs());
  } else {
    jobs = queryAndWriteCurrentJobs(grunt, files.jobsAndDesc, cache);
    if (jobs !== null) {
      registerGeneratorJobsAsTasks(grunt, jobs, getMalfunctionedJobs());
    }
  }
};

// exports
module.exports.registerTasks = registerTasks;
