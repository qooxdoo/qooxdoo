#!/usr/bin/node
/*
 * This demonstrates compiling an entire application, as a "source" target
 *
 */

var fs = require("fs");
var async = require("async");
var qxcompiler = require("../../lib/qxcompiler");

var STARTTIME = new Date();

// Makers use an Analyser to figure out what the Target should write
var maker = new qxcompiler.makers.DemoBrowserMaker("../../qooxdoo").set({
  // Targets know how to output an application
  target: new qxcompiler.targets.SourceTarget("../../testdata/demobrowser/source-output")
});

maker.make(function(err) {
    if (err)
      console.log("Error: " + err);
    else {
      var diff = new Date().getTime() - STARTTIME.getTime();
      diff /= 1000;
      var mins = Math.floor(diff / 60);
      var secs = diff - (mins * 60);
      console.log("Done in " + mins + "m " + secs + "s");
    }
  });

