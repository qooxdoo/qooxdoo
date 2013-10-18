'use strict';

var os = require('os');
var deepmerge = require('deepmerge');

var getConfig = function() {
  return {
    qx: {
      "ROOT" : ".",
      "QOOXDOO_PATH" : "../../..",
      "TMPDIR": os.tmpdir(),
      "CACHE" : "<%= qx.TMPDIR %>/qx<%= qx.QOOXDOO_VERSION %>/cache",
      "CACHE_KEY" :
      {
        "compile" : "<%= qx.CACHE %>",
        "downloads" : "<%= qx.CACHE %>/downloads",
      },
      "SOURCE_PATH" : "<%= qx.ROOT %>/source",
      "BUILD_PATH" : "<%= qx.ROOT %>/build"
    },
    /* grunt-contrib-clean */
    clean: {
      options: {
        force: true
      },
      clean: ["<%= qx.SOURCE_PATH %>/script/<%= qx.APPLICATION %>*.js",
              "<%= qx.BUILD_PATH %>/script/<%= qx.APPLICATION %>*.js"],
      dist:  ["<%= qx.SOURCE_PATH %>/script",
              "<%= qx.BUILD_PATH %>",
              "<%= qx.ROOT %>/api",
              "<%= qx.ROOT %>/test",
              "<%= qx.ROOT %>/inspector",
              "<%= qx.ROOT %>/simulator"],
      cache: ["<%= qx.CACHE_KEY.compile %>",
              "<%= qx.CACHE_KEY.downloads %>"]
    }
  };
};

var mergeConfig = function(config) {
  return deepmerge(getConfig(), config);
};

var getSupersededJobs = function() {
  return {
    clean: "clean:clean",
    distclean: "clean:dist"
  };
};

module.exports.getConfig = getConfig;
module.exports.mergeConfig = mergeConfig;
module.exports.getSupersededJobs = getSupersededJobs;

