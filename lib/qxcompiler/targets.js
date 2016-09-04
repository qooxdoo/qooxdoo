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

module.exports = {
  Target: require("./targets/Target"),
  BuildTarget: require("./targets/BuildTarget"),
  HybridTarget: require("./targets/HybridTarget"),
  SourceTarget: require("./targets/SourceTarget")
};
