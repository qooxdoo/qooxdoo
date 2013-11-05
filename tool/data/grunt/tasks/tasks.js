'use strict';

var getSupersededJobs = function() {
  return {
    clean: "clean:clean",
    distclean: "clean:dist",
    info: "info"
  };
};

// register generator jobs for shell exists
var registerGeneratorJobs = function(grunt, jobs, supersededJobs) {
  jobs.forEach(function (genJob) {
    var jobName = genJob[0];
    var jobDesc = genJob[1];

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
  grunt.loadTasks(relSdkPath + '/tool/data/grunt/tasks/application');
  grunt.loadTasks(relSdkPath + '/tool/data/grunt/tasks/info/tasks');
  grunt.loadTasks(relSdkPath + '/tool/data/grunt/tasks/copy-files/tasks');
};

var registerTasks = function(grunt, generatorJobs) {
  var qx = grunt.config.get('qx');
  registerGeneratorJobs(grunt, generatorJobs, getSupersededJobs());
  registerNodeTasks(grunt, qx.QOOXDOO_PATH);
};


// exports
module.exports.registerTasks = registerTasks;
