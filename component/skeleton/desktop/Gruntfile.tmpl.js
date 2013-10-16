var QOOXDOO_PATH = "${REL_QOOXDOO_PATH}";

var generator_jobs = ${JOBS_AND_DESCS};

module.exports = function(grunt) {
  var config = {
    qx: {
      "APPLICATION"  : "${Namespace}",
      "QOOXDOO_PATH" : "${REL_QOOXDOO_PATH}",
      "QXTHEME"      : "${Namespace}.theme.Theme",
      "API_EXCLUDE"  : ["qx.test.*", "<%= APPLICATION %>.theme.*", "<%= APPLICATION %>.test.*", "<%= APPLICATION %>.simulation.*"],
      "LOCALES"      : [ "en" ],
      "CACHE"        : "${Cache}",
      "ROOT"         : "."
    },
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
  };

  grunt.initConfig(config);

  grunt.loadTasks(QOOXDOO_PATH + '/tool/data/grunt/tasks/application');

  // register generator jobs for shell exists
  generator_jobs.forEach(function (gen_job) {
    grunt.registerTask(gen_job[0], gen_job[1], function (job) {
        grunt.task.run(["generate:"+gen_job[0]]);
    });
  });

};
