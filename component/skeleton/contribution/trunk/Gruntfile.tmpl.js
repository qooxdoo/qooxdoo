var QOOXDOO_PATH = "${REL_QOOXDOO_PATH}";

var generator_jobs = [
  ['api', 'create api doc for the current library'],
  ['api-data', 'create api doc json data files'],
  ['clean', 'remove local cache and generated .js files (source/build)'],
  ['dependencies', 'create a dependencies.json file for the library'],
  ['distclean', 'remove the cache and all generated artefacts of this library (source, build, ...)'],
  ['fix', 'normalize whitespace in .js files of the current library (tabs, eol, ...)'],
  ['info', 'collects environment information like the qooxdoo version etc., and prints it out'],
  ['inspector', 'create an inspector instance in the current library'],
  ['lint', 'check the source code of the .js files of the current library'],
  ['migration', 'migrate the .js files of the current library to the current qooxdoo version'],
  ['pretty', 'pretty-formatting of the source code of the current library'],
  ['test', 'create a test runner app for unit tests of the current library'],
  ['test-source', 'create a test runner app for unit tests (source version) of the current library'],
  ['translation', 'create .po files for current library'],
  
];

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    }
  });


  grunt.loadTasks(QOOXDOO_PATH + '/tool/grunt/tasks/application');
  
  // register generator jobs for shell exists
  generator_jobs.forEach(function (gen_job) {
    grunt.registerTask(gen_job[0], gen_job[1], function (job) {
        grunt.task.run(["generate:"+gen_job[0]]);
    });
  });

};
