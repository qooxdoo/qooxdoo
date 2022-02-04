/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo
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
 *      * Henner Kollmann (henner.kollmann@gmx.de)
 *
 *
 * *********************************************************************** */

const path = require("upath");
/**
 * @external(qx/tool/loadsass.js)
 * @ignore(loadSass)
 */
/* global loadSass */
const sass = loadSass();
const fs = qx.tool.utils.Promisify.fs;

qx.Class.define("qx.tool.compiler.resources.ScssConverter", {
  extend: qx.tool.compiler.resources.ResourceConverter,

  construct() {
    super();
  },

  members: {
    matches(filename) {
      filename = path.basename(filename);
      return filename[0] != "_" && filename.endsWith(".scss");
    },

    getDestFilename(target, asset) {
      let filename;
      if (!qx.tool.compiler.resources.ScssConverter.isNewCompiler()) {
        filename = path.join(
          target.getOutputDir(),
          "resource",
          asset.getFilename().replace(/\bscss\b/g, "css")
        );
      } else {
        filename = path.join(
          target.getOutputDir(),
          "resource",
          asset.getFilename().replace(/\.scss$/, ".css")
        );
      }
      return filename;
    },

    async convert(target, asset, srcFilename, destFilename, isThemeFile) {
      if (qx.tool.compiler.resources.ScssConverter.COPY_ORIGINAL_FILES) {
        let copyFilename = path.join(
          target.getOutputDir(),
          "resource",
          asset.getFilename()
        );

        await qx.tool.utils.files.Utils.copyFile(srcFilename, copyFilename);
      }

      if (!qx.tool.compiler.resources.ScssConverter.isNewCompiler()) {
        return this.legacyMobileSassConvert(
          target,
          asset,
          srcFilename,
          destFilename
        );
      }

      let scssFile = new qx.tool.compiler.resources.ScssFile(
        target,
        asset.getLibrary(),
        asset.getFilename()
      );

      scssFile.setThemeFile(isThemeFile);
      return scssFile.compile(destFilename);
    },

    /**
     * The traditional SASS compilation; it does not use the newer advanced SASS compiler and so
     * does not support relative `url()` paths and automatically has Qooxdoo SASS built in.
     */
    async legacyMobileSassConvert(target, asset, srcFilename, destFilename) {
      if (qx.tool.compiler.resources.ScssConverter.COPY_ORIGINAL_FILES) {
        let copyFilename = path.join(
          target.getOutputDir(),
          "resource",
          asset.getFilename()
        );

        await qx.tool.utils.files.Utils.copyFile(srcFilename, copyFilename);
      }

      let qooxdooPath = target.getAnalyser().getQooxdooPath();
      let data = await fs.readFileAsync(srcFilename, "utf8");
      if (!data || !data.trim()) {
        await fs.writeFileAsync(destFilename, "");
        await fs.unlinkAsync(destFilename + ".map");
      } else {
        let sassOptions = {
          data: data,
          includePaths: [
            path.dirname(srcFilename),
            path.join(qooxdooPath, "source/resource/qx/mobile/scss"),
            path.join(qooxdooPath, "source/resource/qx/scss")
          ],

          outFile: destFilename,
          sourceMap: destFilename + ".map",
          outputStyle: "compressed"
        };

        let result = await qx.tool.utils.Promisify.call(cb =>
          sass.render(sassOptions, (err, result) => {
            if (err) {
              cb(new Error(err.message));
            } else {
              cb(null, result);
            }
          })
        );

        await fs.writeFileAsync(destFilename, result.css);
        await fs.writeFileAsync(destFilename + ".map", result.map);
      }
    }
  },

  statics: {
    /** @type {Boolean} Default is true for the API, the CLI will set this to null */
    USE_V6_COMPILER: true,

    /** @type {Boolean} Whether to copy .scss files */
    COPY_ORIGINAL_FILES: false,

    isNewCompiler() {
      if (qx.tool.compiler.resources.ScssConverter.USE_V6_COMPILER === null) {
        console.warn(
          "DEPRECATED: Using the Qooxdoo v5 style of SASS Compilation; this is backwards compatible " +
            "but the default will change in v7 to use the new style (see https://git.io/JfTPV for details, and how " +
            "to disable this warning)."
        );

        qx.tool.compiler.resources.ScssConverter.USE_V6_COMPILER = false;
      }
      return qx.tool.compiler.resources.ScssConverter.USE_V6_COMPILER;
    }
  }
});
