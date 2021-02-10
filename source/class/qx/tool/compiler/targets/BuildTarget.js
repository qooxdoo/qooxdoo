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
 * ************************************************************************/
/**
 * Compiles a "build" application, minified and self contained application
 */
qx.Class.define("qx.tool.compiler.targets.BuildTarget", {
  extend: qx.tool.compiler.targets.Target,

  properties: {
    /** Whether to minify the output */
    minify: {
      init: "mangle",
      check: [ "off", "minify", "mangle", "beautify" ],
      nullable: false
    },

    /** Whether to preserve unminified output */
    saveUnminified: {
      init: false,
      check: "Boolean",
      nullable: false
    },

    /** Whether to save the source in the map file */
    saveSourceInMap: {
      init: false,
      check: "Boolean",
      nullable: false
    },

    /** Deploy directory (guaranteed to have a trailing slash) */
    deployDir: {
      init: null,
      nullable: true,
      check: "String",
      transform: "_transformOutputDir"
    },

    /** Whether to deploy the source maps */
    deployMap: {
      init: false,
      check: "Boolean",
      nullable: false
    },

    defaultEnvironment: {
      init: { 
        "qx.debug" : false 
      },
      refine: true
    }
  },

  events: {
    /**
     * Fired when minification begins, data is a map containing:
     *  application {qx.tool.compiler.app.Application} the app being minified
     *  part: {String} the part being minified
     *  filename: {String} the part filename
     */
    "minifyingApplication": "qx.event.type.Data",

    /**
     * Fired when minification is done, data is a map containing:
     *  application {qx.tool.compiler.app.Application} the app being minified
     *  part: {String} the part being minified
     *  filename: {String} the part filename
     */
    "minifiedApplication": "qx.event.type.Data"
  },

  members: {
    /*
     * @Override
     */
    async _writeApplication() {
      let appMeta = this.getAppMeta();
      appMeta.setSourceUri(".");
      
      await appMeta.syncAssets();
      
      let doUglify = appMeta.getTarget().getMinify() != "off";
      let bootMeta = appMeta.getBootMetaJs();
      let bootPart = appMeta.getParts()[0];
      appMeta.getPackages().forEach(pkg => {
        pkg.setEmbedAllJavascript(true);
        if (bootPart.hasPackage(pkg)) {
          pkg.setNeedsWriteToDisk(false);
          bootMeta.addEmbeddedJs(pkg.getJavascript());
        }
        if (doUglify && pkg.isNeedsWriteToDisk()) {
          pkg.getJavascript().wrap(new qx.tool.compiler.targets.meta.Uglify(appMeta, pkg.getJavascript()));
        }
      });
      
      if (doUglify) {
        appMeta.getBootMetaJs().wrap(new qx.tool.compiler.targets.meta.Uglify(appMeta, bootMeta));
      }
      
      return await this.base(arguments);
    },

    /*
     * @Override
     */
    toString: function() {
      return "Build Target: " + this.getOutputDir();
    }
  }
});
