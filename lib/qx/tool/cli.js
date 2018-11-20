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

require("./cli/Cli.js");
require("./cli/ConfigDb.js");
require("./cli/LogAppender.js");
require("./cli/Utils.js");
require("./cli/Watch.js");
require("./cli/commands/Add.js");
require("./cli/commands/Clean.js");
require("./cli/commands/Command.js");
require("./cli/commands/Compile.js");
require("./cli/commands/Config.js");
require("./cli/commands/Contrib.js");
require("./cli/commands/Create.js");
require("./cli/commands/Lint.js");
require("./cli/commands/MConfig.js");
require("./cli/commands/Upgrade.js");
require("./cli/commands/add/Class.js");
require("./cli/commands/add/Script.js");
require("./cli/commands/contrib/Install.js");
require("./cli/commands/contrib/List.js");
require("./cli/commands/contrib/Publish.js");
require("./cli/commands/contrib/Remove.js");
require("./cli/commands/contrib/Update.js");

return qx.tool.cli;
