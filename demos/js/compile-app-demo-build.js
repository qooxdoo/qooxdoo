#!/usr/bin/node
/*
 * This demonstrates compiling an entire application, as a "source" target
 *
 */

var fs = require("fs");
var async = require("async");
var qxcompiler = require("../../lib/qxcompiler");

var STARTTIME = new Date();

var QOOXDOO_PATH = "../../qooxdoo";

// Makers use an Analyser to figure out what the Target should write
var maker = new qxcompiler.makers.AppMaker().set({
  // Targets know how to output an application
  target: new qxcompiler.targets.BuildTarget("../../testdata/qxt/build-output"),
  locales: [ "en", "es" ]
});
maker.setEnvironment({
  "qxt.customEnvironment": "this is custom (build target)",
  "qx.debug": false
});
maker.addApplication(new qxcompiler.Application("qxt.Application").set({
  theme: "qxt.theme.Theme",
  name: "appone",
  environment: {
    "qxt.applicationName": "App One"
  }
}));
maker.addApplication(new qxcompiler.Application("qxt.Application").set({
  theme: "qx.theme.Simple",
  name: "apptwo",
  environment: {
    "qxt.applicationName": "App Two"
  }
}));

async.series(
    [
      /*
       * An application is just a library - this is where we find the app
       */
      function (cb) {
        maker.addLibrary("../../testdata/qxt", cb);
      },

      /*
       * Add qooxdoo library
       */
      function (cb) {
        maker.addLibrary(QOOXDOO_PATH + "/framework", cb);
      },

      /*
       * Add a contrib
       */
      function (cb) {
        maker.addLibrary("../../testdata/contrib/UploadMgr", cb);
      },

      /*
       * Make it
       */
      function (cb) {
        maker.make(cb);
      }

    ],
    function (err) {
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
