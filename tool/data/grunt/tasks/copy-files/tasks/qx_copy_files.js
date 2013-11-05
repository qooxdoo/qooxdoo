/*
 * qx-copy-files
 * 
 *
 * Copyright (c) 2013 1&1
 * Licensed under the LGPL/EPL license.
 */

'use strict';

var os = require('os');
var path = require('path');
var fs = require('fs');

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerTask('copy-files', 'A qooxdoo-specific file copy task', function() {
    var options = this.options();
    //console.log(options);

    options.files.forEach(function(f) {
      
      var srcpath = path.join(options.source, f);
      var dstpath = path.join(options.target, f);

      if (!grunt.file.exists(srcpath)) {
        grunt.log.warn('Source file "' + srcpath + '" not found.');
        return false;
      }

      grunt.file.copy(srcpath, dstpath, {encoding: null});

      // Print a success message.
      grunt.log.writeln('Copyied: ' + srcpath + ' to ' + dstpath);
    });
  });

};
