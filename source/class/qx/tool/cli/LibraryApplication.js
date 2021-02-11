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
 * This is the main application class of the compiler; it does nothing
 * during startup so that it can be used as a library
 * 
 * @asset(qx/tool/*)
 * @use qx.tool.cli.Cli
 */
qx.Class.define("qx.tool.cli.LibraryApplication", {
  extend: qx.application.Basic,
  members: {
    main() {
      // Nothing to do
    }
  }
});
