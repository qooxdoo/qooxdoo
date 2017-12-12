/* *****************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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
  return {
    generator_config: {
      let: {}
    },

    common: common
  };
};

var mergeConfig = function(config) {
  return deepmerge(getConfig(), config);
};


// exports
module.exports.getConfig = getConfig;
module.exports.mergeConfig = mergeConfig;
