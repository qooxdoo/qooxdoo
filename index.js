/* ************************************************************************
 *
 *    qxcompiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/johnspackman/qxcompiler
 *
 *    Copyright:
 *      2011-2013 Zenesis Limited, http://www.zenesis.com
 *
 *    License:
 *      LGPL: http://www.gnu.org/licenses/lgpl.html
 *      EPL: http://www.eclipse.org/org/documents/epl-v10.php
 *
 *      This software is provided under the same licensing terms as Qooxdoo,
 *      please see the LICENSE file in the Qooxdoo project's top-level directory
 *      for details.
 *
 *    Authors:
 *      * John Spackman (john.spackman@zenesis.com)
 *
 * ************************************************************************/

module.exports = {
    Analyser: require("./lib/qxcompiler/Analyser"),
    Application: require("./lib/qxcompiler/Application"),
    ClassFile: require("./lib/qxcompiler/ClassFile"),
    Cldr: require("./lib/qxcompiler/Cldr"),
    Generator: require("./lib/qxcompiler/generator/Generator"),
    Library: require("./lib/qxcompiler/Library"),
    Preprocess: require("./lib/qxcompiler/Preprocess"),
    ResourceManager: require("./lib/qxcompiler/ResourceManager"),
    Translation: require("./lib/qxcompiler/Translation"),
    generator: require("./lib/qxcompiler/generator"),
    files: require("./lib/qxcompiler/files"),
    makers: require("./lib/qxcompiler/makers"),
    targets: require("./lib/qxcompiler/targets")
  };
