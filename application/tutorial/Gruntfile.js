// requires
var util = require('util');
var qx = require("../../tool/grunt");

// grunt
module.exports = function(grunt) {
  var config = {
    generator_config: {
      let: {
      }
    },

    common: {
      "APPLICATION" : "tutorial",
      "LOCALES": ["en"],
      "QOOXDOO_PATH" : "../..",
      "QXTHEME": "qx.theme.Indigo"
    },

    source: {
      options: {
        appName: "<%= common.APPLICATION %>",
        qxPath: "<%= common.QOOXDOO_PATH %>",
        sourcePath: "<%= common.SOURCE_PATH %>/script",
        locales:  "<%= common.LOCALES %>",
        includes: ["<%= common.APPLICATION %>.*", "qx.*"],
        excludes: [
         "qx.test.*",
         "qx.dev.unit.*",
         "qx.dev.FakeServer",  // as this depends on qx.dev.unit classes
        ],
        environment: {
          "qx.debug.ui.queue" : true,
          "qx.nativeScrollBars" : true,
          "qx.mobile.emulatetouch" : true
        },
        libraries: [
          "<%= common.QOOXDOO_PATH %>/component/library/logpane/Manifest.json",
          "<%= common.QOOXDOO_PATH %>/component/library/versionlabel/Manifest.json",
          "<%= common.QOOXDOO_PATH %>/application/playground/Manifest.json"
        ]
      }
    }
  };

  var mergedConf = qx.config.mergeConfig(config);
  // console.log(util.inspect(mergedConf, false, null));
  grunt.initConfig(mergedConf);

  qx.task.registerTasks(grunt);
};

