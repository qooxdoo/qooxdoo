// global conf
var _qx = {
  sdkPath: "../generatorjs.git",
  generatorJobs: ${JOBS_AND_DESCS}
};

// requires
var appConf = require(_qx.sdkPath + '/tool/data/grunt/config/application.js');

// register generator jobs for shell exists
var registerGeneratorJobs = function(grunt, jobs, supersededJobs) {
  jobs.forEach(function (genJob) {
    var jobName = genJob[0];
    var jobDesc = genJob[1];

    if (supersededJobs[jobName] !== undefined) {
      // register proper grunt task
      // grunt.registerTask(jobName, jobDesc, function () {
      //   grunt.task.run([supersededJobs[jobName]]);
      // });
    } else {
      // register generator job as task
      grunt.registerTask(jobName, jobDesc, function (job) {
        grunt.task.run(["generate:"+jobName]);
      });
    }
  });
};

var registerQxJobTasks = function(grunt) {
  grunt.loadTasks(_qx.sdkPath + '/tool/data/grunt/tasks/application');
};

// grunt
module.exports = function(grunt) {
  var config = {
    qx: {
      "APPLICATION": "${Namespace}",
      "QOOXDOO_PATH": "${REL_QOOXDOO_PATH}",
      "QOOXDOO_VERSION": "${QOOXDOO_VERSION}",
      "QXTHEME": "${Namespace}.theme.Theme",
      "TMPDIR": "${TMPDIR}",
      "API_EXCLUDE": ["qx.test.*", "<%= APPLICATION %>.theme.*", "<%= APPLICATION %>.test.*", "<%= APPLICATION %>.simulation.*"],
      "LOCALES": [ "en" ],
      "CACHE": "${Cache}",
      "ROOT": "."
    },
    /*
    myTask: {
      options: {},
      myTarget: {
        options: {}
      }
    }
    */
  };

  var mergedConf = appConf.mergeConfig(config);
  // console.log(mergedConf);
  // process.exit();
  grunt.initConfig(mergedConf);

  registerGeneratorJobs(grunt, _qx.generatorJobs, appConf.getSupersededJobs());
  registerQxJobTasks(grunt);

  grunt.loadNpmTasks('grunt-contrib-clean');
};
