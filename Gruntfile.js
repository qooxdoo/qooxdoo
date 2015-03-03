// requires
var shell = require("shelljs");

// grunt
module.exports = function(grunt) {
  grunt.initConfig({});

  // rm node_modules (grunt remove_node_modules <=> grunt setup)
  grunt.task.registerTask (
    'remove_node_modules',
    'Removes all node_modules directories',
    function() {
      var dirs = shell.find('.').filter(function(file) {
        return file.match(/node_modules$/);
      }).forEach(function(path) {
        shell.rm('-rf', path);
      });
    }
  );

  // setup toolchain and framework (grunt setup <=> grunt remove_node_modules)
  grunt.task.registerTask (
    'setup',
    'Setup toolchain and apps',
    function() {
      shell.cd('tool/grunt');
      shell.exec('npm install');
      shell.exec('node setup.js');
      shell.cd('../../framework');
      shell.exec('npm install');
    }
  );
};



