/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo-compiler
 *
 *    Copyright:
 *      2011-2017 Zenesis Limited, http://www.zenesis.com
 *
 *    License:
 *      MIT: https://opensource.org/licenses/MIT
 *
 *      This software is provided under the same licensing terms as Qooxdoo,
 *      please see the LICENSE file in the Qooxdoo project's top-level directory
 *      for details.
 *
 *    Authors:
 *      * John Spackman (john.spackman@zenesis.com, @johnspackman)
 *
 * *********************************************************************** */



/**
 * Code is divided up into Parts, where each is a non-overlapping set of URIs for segmented
 * loading; the Part can support specific attributes, such as whether to be combined into
 * one file for the boot loader, whether to be minified, etc 
 */
qx.Class.define("qx.tool.compiler.app.Part", {
  extend: qx.core.Object,
  
  construct: function(name, include, exclude) {
    this.base(arguments);
    this.set({
      name: name,
      include: include,
      exclude: exclude||[]
    });
  },
  
  properties: {
    name: {
      nullable: false,
      check: "String"
    },
    
    combine: {
      init: false,
      nullable: false,
      check: "Boolean"
    },
    
    minify: {
      init: false,
      nullable: false,
      check: "Boolean"
    },
    
    include: {
      nullable: false,
      check: "Array"
    },
    
    exclude: {
      nullable: false,
      check: "Array"
    }
  }
});
