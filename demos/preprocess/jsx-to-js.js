
var fs = require("fs");
var async = require("async");
var util = require("../lib/util");
require("../lib/qxcompiler/Preprocess");
var files = require("../lib/qxcompiler/files");

var pathsToScan = [];
var force = false;
for (var argv = process.argv, i = 2; i < argv.length; i++) {
  var arg = argv[i];
  if (arg == "-f")
    force = true;
  else
    pathsToScan.push(arg);
}
if (!pathsToScan.length)
  pathsToScan = [ "." ];

async.forEach(pathsToScan, function(path, cb) {
  var ff = new files.FindFiles(path).set({ matchFiles: /\.jsx$/ });
  ff.scan(function(file, cb) {
    var outputTo = file.replace(/\.jsx$/, ".js");
    if (force) {
      console.log(file + ": processing");
      var pp = new qxcompiler.Preprocess(file);
      pp.run(outputTo, cb);
    } else {
      files.Utils.newer(file, outputTo, function(newer) {
        if (newer) {
          console.log(file + ": processing");
          var pp = new qxcompiler.Preprocess(file);
          pp.run(outputTo, cb);
        } else {
          console.log(file + ": not modified");
        }
      });
    }
  }, cb);
});
