'use strict';

var os = require('os');
var deepmerge = require('deepmerge');

var getConfig = function() {
  return {
    grunt_qx: {
      "ROOT" : ".",
      "QOOXDOO_PATH" : "../../..",
      "TMPDIR": os.tmpdir(),
      "CACHE" : "<%= grunt_qx.TMPDIR %>/qx<%= qx.QOOXDOO_VERSION %>/cache",
      "CACHE_KEY" :
      {
        "compile" : "<%= grunt_qx.CACHE %>",
        "downloads" : "<%= grunt_qx.CACHE %>/downloads",
      },
      "SOURCE_PATH" : "<%= grunt_qx.ROOT %>/source",
      "BUILD_PATH" : "<%= grunt_qx.ROOT %>/build"
    },
    /* grunt-contrib-clean */
    clean: {
      options: {
        force: true
      },
      clean: ["<%= grunt_qx.SOURCE_PATH %>/script/<%= grunt_qx.APPLICATION %>*.js",
              "<%= grunt_qx.BUILD_PATH %>/script/<%= grunt_qx.APPLICATION %>*.js"],
      dist:  ["<%= grunt_qx.SOURCE_PATH %>/script",
              "<%= grunt_qx.BUILD_PATH %>",
              "<%= grunt_qx.ROOT %>/api",
              "<%= grunt_qx.ROOT %>/test",
              "<%= grunt_qx.ROOT %>/inspector",
              "<%= grunt_qx.ROOT %>/simulator"],
      cache: ["<%= grunt_qx.CACHE_KEY.compile %>",
              "<%= grunt_qx.CACHE_KEY.downloads %>"]
    },
    /* grunt-qx-info */
    info: {
      options: {
        qxPath: "<%= grunt_qx.QOOXDOO_PATH %>",
        cachePaths: "<%= grunt_qx.CACHE_KEY %>"
      }
    },

    /* qx-copy-files */
    "copy-files" : {
      options: {
        files  : [
          "index.html"
        ],
        source : "<%= grunt_qx.SOURCE_PATH %>",
        target : "<%= grunt_qx.BUILD_PATH %>",
      }
    }
  };
};

var mergeConfig = function(config) {
  return deepmerge(getConfig(), config);
};


// exports
module.exports.getConfig = getConfig;
module.exports.mergeConfig = mergeConfig;
