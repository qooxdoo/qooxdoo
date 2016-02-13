/**
 * Demos parsing the configuration of a project; reads the Qooxdoo project from
 * the current directory and output the merged configuration file into 
 * merged-config.json
 * 
 */
var fs = require("fs");
var async = require('async');
var qxcompiler = require("../lib/qxcompiler");

var OPTIONS = {
  buildType: process.argv[2]||"source",
  processResources: true
};

var config = new qxcompiler.config.ConfigFile("config.json");
config.load(function(err) {
  if (err)
    return log.fatal(err);
  
  var jobs = config.getJobs(OPTIONS.buildType);
  for (var i = 0; i < jobs.length; i++) {
    var job = jobs[i];
    console.log("=== Job: " + job.name);
    console.log(JSON.stringify(job, null, 2));
  }
});

