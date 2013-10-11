'use strict';

var generator_jobs = [
  'api',
  'lint',
  
];

module.exports = function(grunt) {

  // 'generate.py' shell exit
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

  // register generator jobs for shell exists
  generator_jobs.forEach(function (gen_job) {
    grunt.registerTask(gen_job, "Running generator job '"+gen_job+"'.", 
      function (job) {
        grunt.task.run(["generate:"+gen_job]);
    });
  });

  // A very basic default task.
  grunt.registerTask('default', 'Running the generator default job.', function() {
    grunt.task.run(["generate"]);
  });

};
