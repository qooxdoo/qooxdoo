/* *****************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Richard Sternagel (rsternagel)

***************************************************************************** */

'use strict';

// native
var fs = require('fs');
var os = require('os');
var path = require('path');

// third party
var deepmerge = require('deepmerge');

var common = {
  "ROOT": ".",
  "QOOXDOO_PATH": "../../..",
  "QXTHEME": "<%= common.APPLICATION %>.theme.Theme",
  "QXICONTHEME": ["Tango"],
  "TMPDIR": os.tmpdir(),
  "CACHE": "<%= common.TMPDIR %>/qx<%= common.QOOXDOO_VERSION %>/cache",
  "CACHE_KEY":
  {
    "compile": "<%= common.CACHE %>",
    "downloads": "<%= common.CACHE %>/downloads",
  },
  "APPLICATION_MAIN_CLASS" : "<%= common.APPLICATION %>.Application",
  "SOURCE_PATH": "<%= common.ROOT %>/source",
  "BUILD_PATH": "<%= common.ROOT %>/build",
  "ENVIRONMENT": {
    "qx.application": "<%= common.APPLICATION %>.Application",
    "qx.revision":"",
    "qx.theme": "<%= common.QXTHEME %>",
    "qx.version":"<%= common.QOOXDOO_VERSION %>"
  }
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
    /* grunt-qx-source */
    /*
    source: {
      options: {
        appName: "<%= common.APPLICATION %>",
        qxPath: "<%= common.QOOXDOO_PATH %>",
        qxIconTheme: "<%= common.QXICONTHEME %>",
        locales:  "<%= common.LOCALES %>",
        sourcePath: "<%= common.SOURCE_PATH %>/script",
        environment: common.ENVIRONMENT,
        includes: ["<%= common.APPLICATION_MAIN_CLASS %>", "<%= common.QXTHEME %>"],
        excludes: [],
        libraries: [
          "<%= common.QOOXDOO_PATH %>/framework/Manifest.json",
          "<%= common.ROOT %>/Manifest.json"
        ]
      }
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
  // TODO how to overwrite std config?
  // recycle '={key}'-syntax from config.json?
  return deepmerge(getConfig(), config);
};


// exports
module.exports.getConfig = getConfig;
module.exports.mergeConfig = mergeConfig;
