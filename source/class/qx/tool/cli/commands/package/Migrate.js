/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017-2021 Christian Boulanger

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Boulanger (info@bibliograph.org, @cboulanger)

************************************************************************ */

/**
 * @deprecated {7.0.0}
 */
qx.Class.define("qx.tool.cli.commands.package.Migrate", {
  extend: qx.tool.cli.commands.Migrate,
  statics: {
    getYargsCommand: qx.tool.cli.commands.Migrate.getYargsCommand
  },

  members: {
    async process() {
      qx.tool.compiler.Console.warn(
        "`qx package migrate` has been deprecated in favor of `qx migrate`."
      );

      super.process();
    }
  }
});
