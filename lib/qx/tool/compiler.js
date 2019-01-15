/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo-compiler
 *
 *    Copyright:
 *      2011-2016 Zenesis Limited, http://www.zenesis.com
 *
 *    License:
 *      MIT: http://opensource.org/licenses/MIT.
 *
 *    Authors:
 *      * John Spackman (john.spackman@zenesis.com)
 *
 * ************************************************************************/

require("./compiler/Analyser");
require("./compiler/ClassFile");
require("./compiler/Console");
require("./compiler/Preprocess");
require("./compiler/Version");
require("./compiler/app");
require("./compiler/generator");
require("./compiler/files");
require("./compiler/makers");
require("./compiler/resources");
require("./compiler/targets");
require("./compiler/utils/IndexedArray");
require("./compiler/utils/Json");
require("./compiler/utils/Logger");
require("./compiler/utils/LogManager");
require("./compiler/utils/Promisify");
require("./compiler/utils/Values");

module.exports = qx.tool.compiler;
