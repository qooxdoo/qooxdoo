'use strict';

var fs = require('fs');
var os = require('os');
var deepmerge = require('deepmerge');

var common = {
  "ROOT" : ".",
  "QOOXDOO_PATH" : "../../..",
  "TMPDIR": os.tmpdir(),
  "CACHE" : "<%= common.TMPDIR %>/qx<%= common.QOOXDOO_VERSION %>/cache",
  "CACHE_KEY" :
  {
    "compile" : "<%= common.CACHE %>",
    "downloads" : "<%= common.CACHE %>/downloads",
  },
  "SOURCE_PATH" : "<%= common.ROOT %>/source",
  "BUILD_PATH" : "<%= common.ROOT %>/build"
};

function getQxVersion(qxPath) {
  var vers = fs.readFileSync(fs.realpathSync(__dirname + '/' + qxPath) + '/version.txt', 'utf-8');
  return vers.trim();
}

common.QOOXDOO_VERSION = getQxVersion(common.QOOXDOO_PATH);

var getConfig = function() {
  var config = {
    generator_config: {
      let: {}
    },

    common : common,

    /* grunt-contrib-clean */
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
    /* grunt-qx-info */
    info: {
      options: {
        qxPath: "<%= common.QOOXDOO_PATH %>",
        cachePaths: "<%= common.CACHE_KEY %>"
      }
    },

    /* qx-copy-files */
    "copy-files" : {
      options: {
        files  : [
          "index.html"
        ],
        source : "<%= common.SOURCE_PATH %>",
        target : "<%= common.BUILD_PATH %>",
      }
    }
  };

  return config;
};

var mergeConfig = function(config) {
  return deepmerge(getConfig(), config);
};


// exports
module.exports.getConfig = getConfig;
module.exports.mergeConfig = mergeConfig;
