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
var q = require('qooxdoo');

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
    clean: {
      options: {
        force: true
      },
      source: ["<%= common.SOURCE_PATH %>/script"],
      build: ["<%= common.BUILD_PATH %>"],
      api: ["<%= common.ROOT %>/api"],
      test: ["<%= common.ROOT %>/test"],
      inspector: ["<%= common.ROOT %>/inspector"],
      app: ["<%= common.SOURCE_PATH %>/script",
              "<%= common.BUILD_PATH %>",
              "<%= common.ROOT %>/api",
              "<%= common.ROOT %>/test",
              "<%= common.ROOT %>/inspector"],
      cache: ["<%= common.CACHE_KEY.compile %>",
              "<%= common.CACHE_KEY.downloads %>"]
    },
    /* grunt-qx-source */
    source: {
      options: {
        appName: "<%= common.APPLICATION %>",
        qxPath: "<%= common.QOOXDOO_PATH %>",
        qxIconTheme: "<%= common.QXICONTHEME %>",
        locales:  "<%= common.LOCALES %>",
        sourcePath: "<%= common.SOURCE_PATH %>/script",
        cachePath: "<%= common.CACHE %>",
        loaderTemplate: "<%= common.QOOXDOO_PATH %>/tool/data/generator/loader.tmpl.js",
        environment: common.ENVIRONMENT,
        includes: ["<%= common.APPLICATION_MAIN_CLASS %>", "<%= common.QXTHEME %>"],
        excludes: [],
        libraries: [
          "<%= common.QOOXDOO_PATH %>/framework/Manifest.json",
          "<%= common.ROOT %>/Manifest.json"
        ]
      }
    },
    /* grunt-qx-build */
    build: {
      options: {
        appName: "<%= common.APPLICATION %>",
        qxPath: "<%= common.QOOXDOO_PATH %>",
        qxIconTheme: "<%= common.QXICONTHEME %>",
        locales:  "<%= common.LOCALES %>",
        sourcePath: "<%= common.SOURCE_PATH %>",
        buildPath: "<%= common.BUILD_PATH %>",
        cachePath: "<%= common.CACHE %>",
        loaderTemplate: "<%= common.QOOXDOO_PATH %>/tool/data/generator/loader.tmpl.js",
        environment: deepmerge(common.ENVIRONMENT, {
          "qx.debug" : false,
          "qx.debug.databinding" : false,
          "qx.debug.dispose" : false,
          "qx.debug.ui.queue" : false,
          "qx.debug.io" : false
        }),
        includes: ["<%= common.APPLICATION_MAIN_CLASS %>", "<%= common.QXTHEME %>"],
        excludes: [],
        libraries: [
          "<%= common.QOOXDOO_PATH %>/framework/Manifest.json",
          "<%= common.ROOT %>/Manifest.json"
        ]
      }
    },
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

var mergeConfig = function(config, renameMap) {
  var task = "";
  var prop = "";
  var confKey = "";
  var confKeyProp = "";
  var newTaskName = "";
  var oldTaskName = "";

  var mergedConfig = deepmerge(getConfig(), config);

  // possibility to rename tasks (i.e. config)
  if (renameMap) {
    for (oldTaskName in renameMap) {
      newTaskName = renameMap[oldTaskName];
      mergedConfig[newTaskName] = mergedConfig[oldTaskName];
      delete mergedConfig[oldTaskName];
    }
  }

  // TODO:
  //  Consider:
  //    * Recycle '={confKey}'-syntax from config.json or sth. better?
  //    * Introduce '!{confKeyProp}'-syntax for removing of confKeyProp?!

  for (task in mergedConfig) {
    for (prop in mergedConfig[task]) {
      if (prop === "options") {
        for (confKey in mergedConfig[task].options) {
          if (q.Bootstrap.isObject(mergedConfig[task].options[confKey])) {
            for (confKeyProp in mergedConfig[task].options[confKey]) {
              if (confKeyProp[0] === "!") {
                // remove !{confKeyProp}
                delete mergedConfig[task].options[confKey][confKeyProp.substr(1)];
                delete mergedConfig[task].options[confKey][confKeyProp];
              }
            }
          }
          if (confKey[0] === "=") {
            // overwrite std mergedConfig and remove "={confKey}"
            mergedConfig[task].options[confKey.substr(1)] = mergedConfig[task].options[confKey];
            delete mergedConfig[task].options[confKey];
          }
        }
      }
    }
  }

  return mergedConfig;
};


// exports
module.exports.getConfig = getConfig;
module.exports.mergeConfig = mergeConfig;
