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
 * Script to initialise a new qooxdoo application, or upgrade an old (pre-6.0) application
 */
require("../../../lib/qx/tool/cli/commands/Upgrade");
module.exports = qx.tool.cli.commands.Upgrade.getYargsCommand();
