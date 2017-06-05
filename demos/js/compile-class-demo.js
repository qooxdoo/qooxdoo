#!/usr/bin/node
/*
 * This is a quick demo that compiles (transpiles) just a single class, used for easy debuging and testing
 *
 */
var fs = require("fs");
var async = require("async");
var qxcompiler = require("../../lib/qxcompiler");

// Targets know how to output an application
var target = new qxcompiler.targets.SourceTarget("source-output");

// Makers use an Analyser to figure out what the Target should write; we don't really need this
//  for this compile demo, but it's useful to have the analyser from the maker to get the
//  database and write it to disk
var maker = new qxcompiler.makers.AppMaker("qxt.Application", "qxt.theme.Theme").set({
  target: target
});

// Set some environment values
maker.getAnalyser().setEnvironmentCheck("qx.debug", true);

async.series(
  [

    /*
     * An application is just a library - this is where we find the app
     */
    function(cb) {
      maker.addLibrary("../../testdata/qxt", cb);
    },

    /*
     * An application is just a library - this is where we find the app
     */
    function(cb) {
      maker.addLibrary("../../qooxdoo/application/demobrowser", cb);
    },

    /*
     * Add qooxdoo library
     */
    function(cb) {
      maker.addLibrary("../../qooxdoo/framework", cb);
    },

    /*
     * Scan the libraries; this is normally called automatically, but here we're short circuiting to
     * the class, so we have to do it ourselves if we want to find all the classes (i.e. qxWeb.js)
     */
    function(cb) {
      maker.getAnalyser().initialScan(cb);
    },

    /*
     * Compile stuff
     */
    function(cb) {
      /* "qx.ui.style.Stylesheet" constructor depends on qx.bom.Stylesheet */
      /* "qx.ui.form.AbstractField" - load dependency on "qx.ui.style.Stylesheet" implies load dependency on qx.bom.Stylesheet because of constructor dependency */
      /* "qx.module.Event" - for animation/Animation demo, dependencies via defer */

      async.eachSeries(["qxt.Application" /*"qx.ui.style.Stylesheet", "qx.ui.form.AbstractField" */],
        function(className, cb) {
          maker.getAnalyser().getClassInfo(className, function (err, info) {
            if (err)
              return cb(err);
            console.log("\n============ " + className + " ============\n" + JSON.stringify(info, null, 2));
            cb();
          });
        },
        cb);
    },

    /*
     * Write the database; we didn't load the database, but this is useful to have a look to see
     * whats generated
     */
    function(cb) {
      maker.getAnalyser().saveDatabase(cb);
    }

  ],
  function(err) {
    if (err)
      console.log("Error: " + err);
    else
      console.log("Done");
  });
