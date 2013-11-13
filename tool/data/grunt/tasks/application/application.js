'use strict';

var fs = require('fs');
var crypto = require('crypto');

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

/**
 * TODO: This is a quick hack from http://stackoverflow.com/a/15365656/127465 
 * It should eventually be replaced by something more decent, like
 * https://npmjs.org/package/temporary
 */
function temp_file_name(path) {
  var filename;
  do {
    filename = 'conf'+crypto.randomBytes(4).readUInt32LE(0)+'.tmp';
  } while (fs.existsSync(path + "/" + filename))
  return filename;
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
     * read grunt.config.qx, write it out as a temp. generator .json config
     * which includes the default config.json (or the one named with -c), and
     * has all the grunt.config vars as global 'let' vars
     *
     * TODO: support more than just global 'let'
     */

    var config_map = {
      // TODO: inspect if gargs has '-c <otherconfig>'
      // TODO: with this synthetic config file, the original 'default' job is not detected
      "include" : [ 
        { 
          "path" : "./config.json",
          "bypass-export-list" : true
        } ],
      "let" : grunt.config.get('qx'),
    };

    // create random tmpfile name
    var gen_conf_file = temp_file_name(".") + ".json";

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
    });

    child.on('close', function(code) {
      fs.unlinkSync(gen_conf_file);
    });

  });

  // A very basic default task.
  grunt.registerTask('default', 'Running the generator default job.', function() {
    grunt.task.run(["generate"]);
  });

};
