// requires
var shell = require("shelljs");
var path = require("path");

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
    'Install npm dependencies of whole SDK (i.e. "npm install" all package.json files)',
    function() {
      var rootDir = shell.pwd();
      var isPackageJson = function(file) {
        return file.match(/package\.json$/) && !file.match("node_modules");
      };
      var pkgJsonPaths = shell.find('.').filter(isPackageJson);

      pkgJsonPaths.forEach(function(filePath) {
        var basePath = path.dirname(filePath);
        grunt.log.subhead("Installing " + basePath);
        shell.cd(basePath);
        shell.exec('npm install');
        shell.cd(rootDir);
      });
    }
  );
};



