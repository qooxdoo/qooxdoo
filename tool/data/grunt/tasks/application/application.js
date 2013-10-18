'use strict';

var fs = require('fs');

/**
 * Run generate.py ??? to obtain job list.
 */
function get_current_jobs() {
    var done = this.async();

    var exec = require('child_process').exec, child;

    var cmd = './generate.py __x_';

    child = exec(cmd,
      function (error, stdout, stderr) {
        if (error !== null) {
          console.error('stderr: ' + stderr);
          console.error('exec error: ' + error);
        }
        done(error === null);
    });

    child.stdout.on("data", function(data) {
      console.log(data);
    })

}

//var generator_jobs = get_current_jobs();


module.exports = function(grunt) {

  // 'generate.py' shell exit
  grunt.registerTask('generate', 'Use the generator of qooxdoo.', function(job) {
    //grunt.log.write("Args: " + job + "," + args);
    var opt_string = grunt.option('gargs');
    var done = this.async();

    var exec = require('child_process').exec, child;

    /*
     * Customize generator jobs from Gruntfile.
     *
     * TODO: read grunt.config, write it out as a temp. generator .json config
     * which includes the default config.json (or the one named with -c), and
     * has all the grunt.config vars as global 'let' vars
     */

    var config_map = {
      "include" : [ { "path" : "./config.json" } ],
      "let" : grunt.config.get('qx'),
    };

    var gen_conf_file = "./config1.json";

    fs.writeFile(gen_conf_file, JSON.stringify(config_map, null, 4), function(err) {
      if(err) {
        console.log(err);
        //exit(1)
      }
    });

    var cmd = [
      './generate.py',
      (job || ''),
      '-s -c ' + gen_conf_file,
      (opt_string || '')
    ].join(' ');

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

  // A very basic default task.
  grunt.registerTask('default', 'Running the generator default job.', function() {
    grunt.task.run(["generate"]);
  });

};
