'use strict';
module.exports = function(grunt) {

  grunt.registerTask('generate', 'Use the generator of qooxdoo.', function(job) {
    var done = this.async();

    var exec = require('child_process').exec,
        child;

    var cmd = './generate.py ' + (job || '');
    grunt.log.write("Running: '" + cmd + "'");

    child = exec(cmd,
      function (error, stdout, stderr) {
        if (error !== null) {
          grunt.log.error('stderr: ' + stderr);
          grunt.log.error('exec error: ' + error);
        }
        done(error === null);
    });

    child.stdout.on("data", function(data) {
      grunt.log.write(data);
    })
  });
};