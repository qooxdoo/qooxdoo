/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)
     * Daniel Wagner (danielwagner)

************************************************************************ */

var debug = false;
var graphWidth = 800;
var graphHeight = 300;

// -----------------------------------------------------------------------------

var exec  = require('child_process').exec;
var fs = require("fs");

// read json file
var now = new Date();
var jsonFileName = "data/perf-data-" + now.toISOString().substr(0, 10) + ".json";

if (!fs.existsSync(jsonFileName)) {
  var yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));
  jsonFileName = "data/perf-data-" + yesterday.toISOString().substr(0, 10) + ".json";
}
debug && console.log("Reading perfomance data file", jsonFileName);
var data = JSON.parse(fs.readFileSync(jsonFileName, "utf8"));

data.forEach(processEntry);

function processEntry(entry, id) {
  var filename = entry.browsername + "-" +
    //entry.browserversion + "-" +
    entry.testname.replace(/:/g, ".");
    debug && console.log("DB filename:", filename);
  createDataBase(filename, function() {
    writeData(filename, entry, function() {
      createGraph(filename, function() {
        console.log("All done");
      });
    });
  });
}

function createDataBase(filename, callback) {
  filename = "./rrd/" + filename + ".rrd";
  if (!fs.existsSync(filename)) {
    var createCmd = "rrdtool create " + filename +
    " --step 86400" + // 24h update interval
    //" --step 60" +
    //" --start " + Math.floor(new Date(now.getTime() - (24 * 60 * 60 * 1000)).getTime() / 1000) + // yesterday
    " --start -1days" +
    " DS:iterations:GAUGE:172800:U:U" + // max interval 72hrs
    " DS:ownTime:GAUGE:172800:U:U" +
    " DS:renderTime:GAUGE:172800:U:U" +
    " RRA:AVERAGE:0.5:1:28" + // Individual values, keep for 1 month
    " RRA:AVERAGE:0.5:7:180 "; // Average over 7 days, keep for 6 months
    debug && console.log("Creating database:", createCmd);

    exec(createCmd, function(error, stdout, stderr) {
      if (error) {
        console.log("Error while creating database:", error, stdout, stderr);
      } else {
        debug && console.error("Database created", stdout ? ": " + stdout : "");
        callback();
      }
    });
  } else {
    callback();
  }
}

function writeData(filename, entry, callback) {
  filename = "./rrd/" + filename + ".rrd";
  debug && console.log("Write: ", entry);
  var updateCmd = "rrdtool update " + filename +
  " " + [Math.floor(entry.date / 1000), entry.iterations, entry.ownTime, entry.renderTime].join(":");
  debug && console.log("Updating database: ", updateCmd);
  exec(updateCmd, function(error, stdout, stderr) {
    if (error) {
      console.error("Error while updating database:", error, stdout, stderr);
    } else {
      debug && console.log("Database updated", stdout ? ": " + stdout : "");
      callback();
    }
  });
}

function createGraph(filename, callback) {
  var rrdFilename = "./rrd/" + filename + ".rrd";
  filename = "./graphs/" + filename + ".png";
  var startDate = "-14days";
  var graphCmd = "rrdtool graph -w " + graphWidth + " -h " + graphHeight +
  " " + filename + " --start " + startDate +
  " --vertical-label \"Iterations\"" +
  " DEF:iterations=" + rrdFilename + ":iterations:AVERAGE LINE2:iterations#FF0000:Iterations";
  debug && console.log("Creating graph:", graphCmd);
  exec(graphCmd, function(error, stdout, stderr) {
    if (error) {
      console.error(error, stdout, stderr);
    } else {
      callback();
    }
  });
}
