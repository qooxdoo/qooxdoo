/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017 Zenesis Ltd

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com, @johnspackman)

************************************************************************ */

/**
 * Command to handle compilation of the current project
 */
require("../../../lib/qx/tool/cli/commands/Compile");
module.exports = qx.tool.cli.commands.Compile.getYargsCommand();