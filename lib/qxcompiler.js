/* ************************************************************************
 *
 *    qxcompiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/johnspackman/qxcompiler
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

require("./qxcompiler/Analyser");
require("./qxcompiler/ClassFile");
require("./qxcompiler/Cldr");
require("./qxcompiler/Console");
require("./qxcompiler/generator/Generator");
require("./qxcompiler/Library");
require("./qxcompiler/Preprocess");
require("./qxcompiler/Translation");
require("./qxcompiler/Version");
require("./qxcompiler/app");
require("./qxcompiler/generator");
require("./qxcompiler/files");
require("./qxcompiler/makers");
require("./qxcompiler/resources");
require("./qxcompiler/targets");
require("./qxcompiler/utils/IndexedArray");

module.exports = qxcompiler;

debugger;
