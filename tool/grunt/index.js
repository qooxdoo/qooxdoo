/* *****************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Richard Sternagel (rsternagel)

***************************************************************************** */

// qooxdoo init needed before running grunt
'use strict';

// native
var fs = require('fs');
var path = require('path');

// exit early
if (!fs.existsSync(path.join(__dirname, "/node_modules"))) {
  console.log("Aborted due to missing setup.\n" +
              "Go to '" + path.join(__dirname, "/../..") + "' and run those commands:\n" +
              "npm install\n" +
              "grunt setup");
  process.exit();
}

var config = require('./config/application.js');
var task = require('./task/task.js');

// exports
module.exports.config = config;
module.exports.task = task;
