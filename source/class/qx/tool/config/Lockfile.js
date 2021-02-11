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
 * A model for the lockfile, which has a version, but no "official" schema (yet)
 */
const version = "2.1.0";
qx.Class.define("qx.tool.config.Lockfile", {
  extend: qx.tool.config.Abstract,
  type: "singleton",
  statics: {
    config: {
      fileName: qx.tool.cli.commands.Package.lockfile.filename,
      version,
      validate: false,
      createIfNotExists: true,
      templateFunction: () => ({
        libraries: [],
        version
      })
    }
  },
  construct: function() {
    this.base(arguments, this.self(arguments).config);
  }
});
