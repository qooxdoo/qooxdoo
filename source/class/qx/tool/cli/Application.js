/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2020 Henner Kollmann

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Henner Kollmann (Henner.Kollmann@gmx.de, @hkollmann)

************************************************************************ */
/**
 * This is the main application class of the compiler.
 *
 * @asset(qx/tool/*)
 *
 */
qx.Class.define("qx.tool.cli.Application", {
  extend: qx.application.Basic,
  members: {
    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     */
    async main() {
      process.exitCode = 0;
      try {
        await new qx.tool.cli.Cli().run();
      } catch (e) {
        qx.tool.compiler.Console.error("Error: " + (e.stack || e.message));
        process.exitCode = 1;
      } finally {
        process.exit();
      }
    }
  },

  defer(statics) {
    qx.log.Logger.setLevel("error");
  }
});
