'use strict';

// native
var fs = require('fs');
var os = require('os');
var path = require('path');

// third party
var deepmerge = require('deepmerge');

var common = {
  "ROOT": ".",
  "QOOXDOO_PATH" : "../../..",
  "TMPDIR": os.tmpdir(),
  "CACHE": "<%= common.TMPDIR %>/qx<%= common.QOOXDOO_VERSION %>/cache",
  "CACHE_KEY":
  {
    "compile": "<%= common.CACHE %>",
    "downloads": "<%= common.CACHE %>/downloads",
  },
  "SOURCE_PATH": "<%= common.ROOT %>/source",
  "BUILD_PATH": "<%= common.ROOT %>/build"
};

var getQxVersion = function(relQxPath) {
  var vers = fs.readFileSync(fs.realpathSync(path.join(path.join(__dirname, relQxPath), 'version.txt')), 'utf-8');
  return vers.trim();
};

common.QOOXDOO_VERSION = getQxVersion(common.QOOXDOO_PATH);

var getConfig = function() {
  var config = {
    generator_config: {
      let: {}
    },

    common: common,

    /* grunt-contrib-clean */
    // defer replacement of generate:clean and generate:distclean
    /*
    clean: {
      options: {
        force: true
      },
      clean: ["<%= common.SOURCE_PATH %>/script/<%= common.APPLICATION %>*.js",
              "<%= common.BUILD_PATH %>/script/<%= common.APPLICATION %>*.js"],
      dist:  ["<%= common.SOURCE_PATH %>/script",
              "<%= common.BUILD_PATH %>",
              "<%= common.ROOT %>/api",
              "<%= common.ROOT %>/test",
              "<%= common.ROOT %>/inspector",
              "<%= common.ROOT %>/simulator"],
      cache: ["<%= common.CACHE_KEY.compile %>",
              "<%= common.CACHE_KEY.downloads %>"]
    },
    */
    /* grunt-qx-info */
    info: {
      options: {
        qxPath: "<%= common.QOOXDOO_PATH %>",
        cachePaths: "<%= common.CACHE_KEY %>"
      }
    },
  };

  return config;
};

var mergeConfig = function(config) {
  return deepmerge(getConfig(), config);
};


// exports
module.exports.getConfig = getConfig;
module.exports.mergeConfig = mergeConfig;
