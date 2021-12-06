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
 * A model for the compile.json file
 */
qx.Class.define("qx.tool.config.Compile", {
  extend: qx.tool.config.Abstract,
  type: "singleton",
  statics: {
    config: {
      fileName: "compile.json",
      version: "^1.0.0"
    }
  },
  construct: function() {
    this.base(arguments, this.self(arguments).config);
  }
});
