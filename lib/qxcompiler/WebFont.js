/* ************************************************************************
 *
 *    qxcompiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qxcompiler
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
 * ************************************************************************/


/**
 * Represents a WebFont provided by a Library
 */
qx.Class.define("qxcompiler.WebFont", {
  extend: qx.core.Object,
  
  construct: function(library) {
    this.base(arguments);
    this.__library = library;
  },

  properties: {
    /** The name of the webfont */
    name: {
      check: "String"
    },
    
    /** The default size */
    defaultSize: {
      check: "Integer"
    },
    
    /** Optional mapping filename */
    mapping: {
      init: null,
      nullable: true,
      check: "String"
    },
    
    /** {String[]} Resources that make up the font; an array of Strings, each of which can be a URL or a local file */
    resources: {
      check: "Array"
    }
  },
  
  members: {
    __library: null,
    
    /**
     * Called by {Target} to compile the fonts, called once per application build
     * (NOTE:: right now, this is called for each application - that is soon to be fixed)
     * 
     * @param target {qxcompiler.targets.Target} the target
     * @return {Promise} 
     */
    generateForTarget: async function(target) {
      console.log("WebFont Generation of " + this.getName() + 
        "\n   Library: " + this.__library.getNamespace() +
        "\n   Library Dir: " + this.__library.getRootDir() +
        "\n   Target Dir: " + target.getOutputDir());
      return Promise.resolve();
    },
    
    /**
     * Called by Target to add fonts to an application
     * 
     * @param target {qxcompiler.targets.Target} the target
     * @param application {qxcompiler.app.Application} the application being built
     * @return {Promise} 
     */
    generateForApplication: async function(target, application) {
      console.log("WebFont configuration of " + this.getName() + 
          "\n   Application Name: " + application.getName() + 
          "\n   Application Dir: " + target.getApplicationRoot(application) + 
          "\n   Library: " + this.__library.getNamespace() +
          "\n   Library Dir: " + this.__library.getRootDir() +
          "\n   Target Dir: " + target.getOutputDir());
        return Promise.resolve();
    }
  }
});
