'use strict';

var fs = require('fs');
var crypto = require('crypto');
var child_process = require('child_process');

/**
 * TODO: This is a quick hack from http://stackoverflow.com/a/15365656/127465
 * It should eventually be replaced by something more decent, like
 * https://npmjs.org/package/temporary
 */
function temp_file_name(path) {
  var filename;
  do {
    filename = 'conf'+crypto.randomBytes(4).readUInt32LE(0)+'.tmp';
  } while (fs.existsSync(path + "/" + filename));
  return filename;
}

module.exports = function(grunt) {

  // 'generate.py' shell exit
  grunt.registerTask('generate', 'Use the generator of qooxdoo.', function(job) {
    //grunt.log.write("Args: " + job + "," + args);
    var opt_string = grunt.option('gargs');
    var done = this.async();
    var child;
    var child_killed = false;

    /*
     * Customize generator jobs from Gruntfile.
     *
     * read grunt.config.generator_config, which should have the normal Generator
     * config.json structure.
     * write it out as a temp. generator .json config which top
     * level-"include"s the default config.json (or the one named with -c)
     */

    var config_map = grunt.config.get('generator_config');
    // link to original config file
    if (!config_map.include) {
      config_map.include = [];
    }
    config_map.include.push(
      // TODO: inspect if gargs has '-c <otherconfig>'
      // TODO: with this synthetic config file, the original 'default' job is not detected
       {
          "path" : "./config.json",
          "bypass-export-list" : true
        });

    // create random tmpfile name
    var gen_conf_file = temp_file_name(".") + ".json";

    fs.writeFile(gen_conf_file, JSON.stringify(config_map, null, 4), function(err) {
      if(err) {
        console.log(err);
        //exit(1)
      }
    });


    var cmd = [
      'python generate.py',
      (job || ''),
      //'-s',
      '-c ' + gen_conf_file,
      (opt_string || '')
    ].join(' ');

    grunt.log.write("Running: '" + cmd + "'");

    child = child_process.exec(cmd,
      function (error, stdout, stderr) {
        if (error !== null && !child_killed) {
          grunt.log.error('stderr: ' + stderr);
          grunt.log.error('exec error: ' + error);
        }
        done(error === null);
    });

    // forward child STDOUT
    child.stdout.on("data", function(data) {
      grunt.log.write(data);
    });

    // forward child STDERR
    child.stderr.on("data", function(data) {
      grunt.log.error(data);
    });

    // clean-up on child exit
    child.on('close', function(code) {
      fs.unlinkSync(gen_conf_file);
      if (child_killed) {
        grunt.fail.fatal("Interrupting task", 0);
      }
    });

    // handle interrupt signal (Ctrl-C)
    process.on('SIGINT', function() {
      child.kill('SIGINT'); // forward to child
      child_killed = true;
      //fs.unlinkSync(gen_conf_file);  // is done automatically on 'close'
    });

  });

  // A very basic default task.
  grunt.registerTask('default', 'Running the generator default job.', function() {
    grunt.task.run(["generate"]);
  });

};
