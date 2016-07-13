/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)
     * Daniel Wagner (danielwagner)

************************************************************************ */

var debug = true;
var graphWidth = 800;
var graphHeight = 300;
var colors = {
  master: "#FF0000",
  diet : "#0000FF",
  unknown : "#AFAFAF"
};

// -----------------------------------------------------------------------------

var exec  = require('child_process').exec;
var fs = require("fs");

var now = new Date();

// read json file
var jsonFileName;

var fileArg = process.argv[2];
if (fileArg) {
  // file name from command line argument
  if (fs.existsSync(fileArg)) {
    jsonFileName = fileArg;
  } else {
    console.error("Data file does not exist: " + fileArg)
    process.exit(1);
  }
} else {
  // today's data file
  jsonFileName = "data/perf-data-" + now.toISOString().substr(0, 10) + ".json";
  if (!fs.existsSync(jsonFileName)) {
    var yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    jsonFileName = "data/perf-data-" + yesterday.toISOString().substr(0, 10) + ".json";
  }
}

if (!fs.existsSync(jsonFileName)) {
  console.error("No data file found!")
  process.exit(1);
}

debug && console.log("Reading perfomance data file", jsonFileName);
var data = JSON.parse(fs.readFileSync(jsonFileName, "utf8"));
var branches = {};

data.forEach(processEntry);

function processEntry(entry, id) {
  var branch = entry.branch || "master";
  branches[branch] = true;
  var filename = branch + "-" + entry.browsername + "-" +
    //entry.browserversion + "-" +
    entry.testname.replace(/:/g, ".");
    debug && console.log("DB filename:", filename);
  createDataBase(filename, function() {
    writeData(filename, entry, function() {
      createGraph(filename, function() {
        console.log("Entry done:", filename);
      });
    });
  });
}

function createDataBase(filename, callback) {
  filename = "./rrd/" + filename + ".rrd";
  if (!fs.existsSync(filename)) {
    var createCmd = "rrdtool create " + filename +
    " --step 86400" + // 24h update interval
    " --start 1363800997" +
    " DS:iterations:GAUGE:172800:0:U" + // max interval 72hrs
    " DS:ownTime:GAUGE:172800:0:U" +
    " DS:renderTime:GAUGE:172800:0:U" +
    " RRA:LAST:0.5:1:28" + // Individual values, keep for 1 month
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
  var updateCmd = "rrdtool updatev " + filename +
  " " + [Math.floor(entry.date / 1000), entry.iterations, entry.ownTime, entry.renderTime].join(":");
  debug && console.log("Updating database: ", updateCmd);
  exec(updateCmd, function(error, stdout, stderr) {
    if (error) {
      console.error("Error while updating database:", error, stdout, stderr);
      callback();
    } else {
      debug && console.log("Database updated", stdout ? ": " + stdout : "");
      callback();
    }
  });
}

function createGraph(filename, callback) {
  var baseFileName = filename.split("-");
  baseFileName.shift();
  baseFileName = baseFileName.join("-");
  filename = "./graphs/" + baseFileName + ".png";
  var startDate = "-30days";
  var graphCmd = "rrdtool graph -w " + graphWidth + " -h " + graphHeight +
  " " + filename + " --start " + startDate +
  " --vertical-label \"Iterations\"";

  for (var branch in branches) {
    var rrdFilename = "./rrd/" + branch + "-" + baseFileName + ".rrd";
    graphCmd += " DEF:iterations-" + branch + "=" + rrdFilename + ":iterations" +
    ":LAST LINE2:iterations-" + branch + colors[branch] + ":" + branch;
  }

  debug && console.log("Creating graph:", graphCmd);
  exec(graphCmd, function(error, stdout, stderr) {
    if (error) {
      console.error(error, stdout, stderr);
    } else {
      callback();
    }
  });
}
