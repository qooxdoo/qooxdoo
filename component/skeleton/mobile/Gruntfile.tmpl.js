var QOOXDOO_PATH = "${REL_QOOXDOO_PATH}";

var generator_jobs = [
  ['api', 'create api doc for the current library'],
  ['api-data', 'create api doc json data files'],
  ['build', 'create build version of current application'],
  ['clean', 'remove local cache and generated .js files (source/build)'],
  ['dependencies', 'create a dependencies.json file for the library'],
  ['distclean', 'remove the cache and all generated artefacts of this library (source, build, ...)'],
  ['fix', 'normalize whitespace in .js files of the current library (tabs, eol, ...)'],
  ['info', 'collects environment information like the qooxdoo version etc., and prints it out'],
  ['inspector', 'create an inspector instance in the current library'],
  ['lint', 'check the source code of the .js files of the current library'],
  ['migration', 'migrate the .js files of the current library to the current qooxdoo version'],
  ['minify-css', 'minifies CSS files'],
  ['pretty', 'pretty-formatting of the source code of the current library'],
  ['profiling', 'includer job, to activate profiling'],
  ['simulation-build', 'create a runner app for simulated interaction tests'],
  ['simulation-run', 'launches simulated interaction tests generated with simulation-build'],
  ['source', 'create source version of current application'],
  ['source-all', 'create source version of current application, with all classes'],
  ['source-httpd-config', 'generate a httpd configuration for the source version'],
  ['source-hybrid', 'create a hybrid application (application classes as individual files, others catenated)'],
  ['source-server', 'start a lightweight web server that exports the source version'],
  ['source-server-reload', 'web server for source version, with active reload (requires running \'watch\' job)'],
  ['test', 'create a test runner app for unit tests of the current library'],
  ['test-mobile', 'create a mobile test runner app for unit tests of the current library'],
  ['test-mobile-source', 'create a basic (server-side/headless) test runner app for unit tests (source version) of the current library'],
  ['test-source', 'create a test runner app for unit tests (source version) of the current library'],
  ['translation', 'create .po files for current library'],
  ['validate-config', 'validates the \'config.json\' itself \'if jobname arg is given checks dedicated job only'],
  ['validate-manifest', 'validates the given filepath as manifest (defaults to \'./Manifest.json\')'],
  ['watch', 'watch source files for changes and run the default job automatically'],
  ['watch-scss', 'Watch and compile custom.scss'],
  
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


  grunt.loadTasks(QOOXDOO_PATH + '/tool/data/grunt/tasks/application');
  
  // register generator jobs for shell exists
  generator_jobs.forEach(function (gen_job) {
    grunt.registerTask(gen_job[0], gen_job[1], function (job) {
        grunt.task.run(["generate:"+gen_job[0]]);
    });
  });

};
