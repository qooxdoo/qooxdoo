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

// third-party
var program = require('commander');
var shell = require('shelljs');

program
  .version('0.0.1')
  .option('-n, --noglobalmod', 'Don\'t create global symlinks')
  .on('--help', function(){
    console.log('  Run this for bootstraping the Grunt toolchain.');
    console.log('');
  })
  .parse(process.argv);

var rootDir = shell.pwd();
var packages = [];
var tasks = [];

// install all packages and link them
shell.cd("task/package");

// cache is used by others so install first
shell.exec("node runNpmCmd.js install cache");
if (!program.noglobalmod) {
  shell.exec("node runNpmCmd.js link cache");
}
var usingCachePackages = ["dependency", "compression"];
usingCachePackages.forEach(function(pkg) {
  shell.cd(pkg);
  shell.exec("npm link qx-cache");
  shell.cd("../");
});

// exclude runNpmCmd.js through filtering
packages = shell.ls(".").filter(function(dirOrFile) { return !dirOrFile.match(/\.js$/); });
shell.exec("node runNpmCmd.js install");
if (!program.noglobalmod) {
  shell.exec("node runNpmCmd.js link");
}
shell.cd(rootDir);

// install all tasks and use linked packages ("qx-*")
tasks = ['source', 'build'];
tasks.forEach(function(task){
  shell.cd("task/"+task);
  packages.forEach(function(pkg) {
    shell.exec("npm link qx-"+pkg);
  });
  packages.forEach(function(pkg) {
    shell.exec("npm install");
  });
  shell.cd(rootDir);
});
