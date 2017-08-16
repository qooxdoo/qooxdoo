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
  Analyser: require("./qxcompiler/Analyser"),
  ClassFile: require("./qxcompiler/ClassFile"),
  Cldr: require("./qxcompiler/Cldr"),
  Generator: require("./qxcompiler/generator/Generator"),
  Library: require("./qxcompiler/Library"),
  Preprocess: require("./qxcompiler/Preprocess"),
  Translation: require("./qxcompiler/Translation"),
  app: require("./qxcompiler/app"),
  generator: require("./qxcompiler/generator"),
  files: require("./qxcompiler/files"),
  makers: require("./qxcompiler/makers"),
  resources: require("./qxcompiler/resources"),
  targets: require("./qxcompiler/targets"),
  utils: {
    IndexedArray: require("./qxcompiler/utils/IndexedArray")
  }
};

debugger;
