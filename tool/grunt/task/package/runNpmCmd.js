#!/usr/bin/env node

/* *****************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Richard Sternagel (rsternagel)

***************************************************************************** */

'use strict';

// native
var exec  = require('child_process').exec;

// third-party
var program = require('commander');

program
  .version('0.0.1')
  .usage('command pkgA[ pkgB ...]')
  .on('--help', function(){
    console.log('  Examples:');
    console.log('');
    console.log('    $ runNpmCmd test             # none pkgs given means all');
    console.log('    $ runNpmCmd install dependency library');
    console.log('    $ runNpmCmd "run api" dependency library');
    console.log('');
  })
  .parse(process.argv);

// extract cmd to use
var command = '';
if (program.args < 1) {
  console.log('Abort: Missing npm command to execute.');
} else {
  command = program.args[0];
}

// extract packages to process (none given means all)
var packages = [];
if (program.args.length === 1) {
  packages = ['dependency', 'library', 'resource', 'translation', 'locale', 'compression', 'cache'];
} else {
  packages = program.args.slice(1);
}

// execute npm cmd on all packages
packages.forEach(function(pkg){
  exec('npm '+command, {cwd: pkg},
    function (error, stdout, stderr) {
      if (stdout || stderr) {
        if (stdout) {
          console.log('~~~ stdout ~~~:\n' + stdout);
        }
        if (stderr) {
          console.log('~~~ stderr ~~~:\n' + stderr);
        }
      } else {
        console.log('Done. npm command (\''+command+'\') didn\'t produce '+
                    'any output (for package \''+pkg+'\').');
      }
      if (error !== null) {
        console.log('exec error: ' + error);
      }
  });
});
