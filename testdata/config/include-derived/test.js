var fs = require("fs");
var async = require("async");
var util = require("../../../lib/util");
var Config = require("../../../lib/qxcompiler/config.js");

var cfg = new Config.Config("derived.json");
cfg.load(function() {
  var data = cfg.getAnalyserConfig("qxoo-source");
  console.log(JSON.stringify(data, null, 2));
});

