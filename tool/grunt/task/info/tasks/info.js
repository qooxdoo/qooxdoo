/*
 * grunt-qx-info
 */
'use strict';

var os = require('os');
var path = require('path');
var fs = require('fs');

module.exports = function(grunt) {

  // TODO: Could be obtained from a (to be developed) cache module
  var CACHE_CHECK_FILE = ".cache_check_file";

  var taskDesc = 'Collects environment information like the qooxdoo version etc., and prints it out';

  grunt.registerTask('info', taskDesc, function() {
    grunt.log.subhead('Environment info:');
    grunt.log.writeln('Platform: ' + os.type() + " " + os.arch() + " " + os.release());
    grunt.log.writeln('Node.js: ' + process.version);
    grunt.log.writeln('Grunt: ' + grunt.version);

    var options = this.options();

    if ('qxPath' in options) {
      var qxPath = options.qxPath;
      grunt.log.subhead('qooxdoo info:');
      grunt.log.ok('qooxdoo path: ' + path.resolve(qxPath));

      var version = grunt.file.read(path.join(qxPath, "version.txt"));
      grunt.log.ok('Framework version: ' + version.trim());

      var classFile = path.join(qxPath, "framework", "source", "class", "qx", "Class.js");
      if (grunt.file.isFile(classFile)) {
        grunt.log.ok("qooxdoo SDK looks OK");
      } else {
        grunt.log.warn("qooxdoo SDK seems missing framework/source/class/qx/Class.js!");
      }
    }

    /*
      // TODO:
      grunt.log.subhead("Looking for generated versions...");

      try:
          expandedjobs = confObj.resolveExtendsAndRuns(["build-script", "source-script"])
          confObj.includeSystemDefaults(expandedjobs)
          confObj.resolveMacros(expandedjobs)
      except Exception:
          expandedjobs = []

      if expandedjobs:
          # make sure we're working with Job() objects (bug#5896)
          expandedjobs = [confObj.getJob(x) for x in expandedjobs]

          # check for build loader
          buildScriptFile =  expandedjobs[0].get("compile-options/paths/file", None)
          if buildScriptFile:
              buildScriptFilePath = confObj.absPath(buildScriptFile)
              console.info("Build version generated: %s" % os.path.isfile(buildScriptFilePath) )

          # check for source loader
          sourceScriptFile =  expandedjobs[1].get("compile-options/paths/file", None)
          if sourceScriptFile:
              sourceScriptFilePath = confObj.absPath(sourceScriptFile)
              console.info("Source version generated: %s" % os.path.isfile(sourceScriptFilePath) )
      else:
          console.info("nope")
    */

    if ('cachePaths' in options) {
      var cachePaths = options.cachePaths;
      if (cachePaths) {
        if ('compile' in cachePaths) {
          var compDir = path.normalize(cachePaths.compile);
          grunt.log.subhead("Compile cache:");
          grunt.log.ok("Path: " + compDir);
          if (grunt.file.isDir(compDir)) {
            grunt.log.ok("Dir exists: true");
            grunt.log.ok("Cache file revision: " + grunt.file.read(compDir + "/" + CACHE_CHECK_FILE));
            grunt.log.ok("Elements in cache: " + fs.readdirSync(compDir).length);
          } else {
            grunt.log.warn("Dir exists: false");
          }
        }
        if ('downloads' in cachePaths) {
          var downDir = path.normalize(cachePaths.downloads);
          grunt.log.subhead("Download cache:");
          grunt.log.ok("Path: " + downDir);
          if (grunt.file.isDir(downDir)) {
            grunt.log.ok("Dir exists: true");
            grunt.log.ok("Elements in cache: " + fs.readdirSync(downDir).length);
          } else {
            grunt.log.warn("Dir exists: false");
          }
        }
      }
    }
  });

};
