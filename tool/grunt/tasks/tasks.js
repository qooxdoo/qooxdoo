/* *****************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
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

// lib
var qx = {};
qx.tool = {};
qx.tool.Cache = require('../lib/qx/tool/Cache');


// functions
var queryAndWriteCurrentJobs = function(cacheFilePath, cache) {
  var cmd = 'python generate.py --list-jobs';
  var jobs = {};

  var stdout = shell.exec(cmd, {silent:true}).output;
  jobs.timestamp = new Date().getTime();
  jobs.map = JSON.parse(stdout);
  cache.write(cacheFilePath, JSON.stringify(jobs));
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

var getSupersededJobs = function() {
  return {
    // defer replacement of generate:clean and generate:distclean
    // clean: "clean:clean",
    // distclean: "clean:dist",
    info: "info",
    // source: "source"
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
  grunt.loadTasks(relSdkPath + '/tool/grunt/tasks/generate');
  grunt.loadTasks(relSdkPath + '/tool/grunt/tasks/info/tasks');
  // grunt.loadTasks(relSdkPath + '/tool/grunt/tasks/source/tasks');
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
    registerGeneratorJobsAsTasks(grunt, jobs, getSupersededJobs());
    registerNodeTasks(grunt, conf.QOOXDOO_PATH);
  } else {
    jobs = queryAndWriteCurrentJobs(files.jobsAndDesc, cache);
    if (jobs !== null) {
      registerGeneratorJobsAsTasks(grunt, jobs, getSupersededJobs());
    }
    registerNodeTasks(grunt, conf.QOOXDOO_PATH);
  }
};

// exports
module.exports.registerTasks = registerTasks;
