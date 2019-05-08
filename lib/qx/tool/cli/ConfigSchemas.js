/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2019 The qooxdoo developers

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Boulanger (info@bibliograph.org, @cboulanger)

************************************************************************ */

/**
 * This class contains constants used for locating and versioning
 * of the different configuration files
 */
qx.Class.define("qx.tool.cli.ConfigSchemas", {

  statics: {

    library: {
      filename: "Manifest.json",
      schema: "https://qooxdoo.org/schema/Manifest.json/v2"
    },

    compiler: {
      filename: "compile.json",
      schema: "https://qooxdoo.org/schema/compile.json/v1"
    },

    lockfile: {
      filename: "contrib.json",
      version: "2.1"
    }
  }
});
