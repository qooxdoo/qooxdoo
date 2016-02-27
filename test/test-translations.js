#!/usr/bin/node
/*
 * This demonstrates compiling an entire application, as a "source" target
 *
 */

var fs = require("fs");
var async = require("async");
var qxcompiler = require("../lib/qxcompiler");

var STARTTIME = new Date();

(function(cb) {
  var lib = new qxcompiler.Library();
  lib.loadManifest("../testdata/qxt", function(err) {
    if (err)
      return cb && cb(err);
    var trans = new qxcompiler.Translation(lib, "en");
    trans.read(function (err) {
      if (err)
        return cb(err);
      trans.writeTo("../testdata/qxt/source/translation/en.po.out", cb);
    });
  });

})(function(err) {
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
