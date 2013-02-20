var exec  = require('child_process').exec;
var fs = require("fs");

// read json file
var now = new Date();
var jsonFileName = "perf-data-" + now.toISOString().substr(0, 10) + ".json";
var data = JSON.parse(fs.readFileSync(jsonFileName, "utf8"));

data.forEach(processEntry);





function processEntry(entry, id) {
  var filename = entry.browsername + "-" +
    entry.browserversion + "-" +
    entry.testname + ".rrd";
  createDataBase(filename, function() {
    writeData(filename, entry);
  });
}

function createDataBase(filename, callback) {
  if (!fs.existsSync(filename)) {
    exec("pwd", function(error, stdout, stderr) {
      console.log("Database created: ", stdout);
      callback();
    });
  } else {
    callback();
  }
};


function writeData(filename, entry) {
  console.log("Write: ", entry);
}