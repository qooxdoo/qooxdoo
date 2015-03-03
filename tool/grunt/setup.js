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
var fs = require('fs');

// third-party
var program = require('commander');
var shell = require('shelljs');

program
  .version('0.0.1')
  .on('--help', function(){
    console.log('  Run this for bootstraping the Grunt toolchain.');
    console.log('');
  })
  .parse(process.argv);

var rootDir = shell.pwd();
var packages = [];
var usingCachePackages = [];
var tasks = [];
var usedByTasksPackages = [];

// install all packages
shell.cd('task/package');

// cache is used by others so install first
shell.exec('node runNpmCmd.js install cache');
usingCachePackages = ['dependency', 'compression'];
usingCachePackages.forEach(function(pkg) {
  shell.cd(pkg);
  // symlink cache package
  if (shell.test('-L', 'node_modules/qx-cache')) {
    fs.unlinkSync('node_modules/qx-cache');
  }
  shell.mkdir('-p', 'node_modules');
  fs.symlinkSync('../../cache/', 'node_modules/qx-cache', 'dir');
  shell.cd('../');
});

// exclude runNpmCmd.js through filtering (exclude cache because it's already installed)
packages = shell.ls('.').filter(function(dirOrFile) {
  return (['cache'].indexOf(dirOrFile) === -1 && dirOrFile.indexOf('.') === -1);
});
packages.forEach(function(pkg) {
  shell.exec('node runNpmCmd.js install '+pkg);
});
shell.cd(rootDir);

// install all tasks and symlink packages ('qx-*')
tasks = ['source', 'build'];
usedByTasksPackages = ['compression', 'dependency', 'library', 'resource', 'translation', 'locale'];
tasks.forEach(function(task){
  shell.cd('task/'+task);
  packages.forEach(function(pkg) {
    usedByTasksPackages.forEach(function(usedPkg) {
      var nodeModulePath = 'node_modules/qx-'+usedPkg;
      if (shell.test('-L', nodeModulePath)) {
        fs.unlinkSync(nodeModulePath);
      }
      shell.mkdir('-p', 'node_modules');
      fs.symlinkSync('../../package/'+usedPkg+'/', nodeModulePath, 'dir');

    });
    shell.exec('npm install');
  });
  shell.cd(rootDir);
});
