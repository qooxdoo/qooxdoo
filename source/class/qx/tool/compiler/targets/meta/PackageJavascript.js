/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo-compiler
 *
 *    Copyright:
 *      2011-2021 Zenesis Limited, http://www.zenesis.com
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

const path = require("upath");

/**
 * A PackageJavascript is the serialisation of the javascript required to produce a package;
 * at the minimum, this is the locales and resources provided by the package, but also can be
 * the javascript code from loaded classes, all merged into one .js file for the browser.
 */
qx.Class.define("qx.tool.compiler.targets.meta.PackageJavascript", {
  extend: qx.tool.compiler.targets.meta.AbstractJavascriptMeta,

  /**
   * Constructor
   */
  construct(appMeta, pkg) {
    super(
      appMeta,
      `${appMeta.getApplicationRoot()}package-${pkg.getPackageIndex()}.js`
    );

    this.__pkg = pkg;
  },

  properties: {
    needsWriteToDisk: {
      init: true,
      refine: true
    }
  },

  members: {
    __sourceMapOffsets: null,

    /*
     * @Override
     */
    async writeSourceCodeToStream(ws) {
      let pkg = this.__pkg;
      let data = {
        locales: pkg.getLocales(),
        resources: {},
        translations: pkg.getTranslations()
      };

      pkg.getAssets().forEach(asset => {
        let ext = path.extname(asset.getFilename());
        if (ext.length) {
          ext = ext.substring(1);
        }
        let fileInfo = asset.getFileInfo();
        var arr = (data.resources[asset.getFilename()] = [
          fileInfo.width,
          fileInfo.height,
          ext,
          asset.getLibrary().getNamespace()
        ]);

        if (fileInfo.composite !== undefined) {
          arr.push(fileInfo.composite);
          arr.push(fileInfo.x);
          arr.push(fileInfo.y);
        }
      });

      if (pkg.isEmbedAllJavascript()) {
        this.__sourceMapOffsets = [];
        let strip = new qx.tool.utils.Utils.StripSourceMapTransform();
        strip.pipe(ws);
        await new Promise(async resolve => {
          for (let i = 0; i < pkg.getJavascriptMetas().length; i++) {
            let js = pkg.getJavascriptMetas()[i];
            this.__sourceMapOffsets.push(ws.getLineNumber());
            await js.unwrap().writeSourceCodeToStream(strip);
            strip.write("\n");
          }
          resolve();
        });
        ws.write(
          `//# sourceMappingURL=${path.basename(
            this.getFilename()
          )}.map?dt=${new Date().getTime()}\n`
        );
      }

      ws.write(
        `qx.$$packageData['${this.__pkg.getPackageIndex()}'] = ${JSON.stringify(
          data,
          null,
          2
        )};\n`
      );
    },

    /*
     * @Override
     */
    async writeToDisk() {
      await super.writeToDisk();
      if (!this.__pkg.isEmbedAllJavascript()) {
        for (let i = 0; i < this.__pkg.getJavascriptMetas().length; i++) {
          await this.__pkg.getJavascriptMetas()[i].unwrap().writeToDisk();
        }
      }
    },

    /*
     * @Override
     */
    async getSourceMap() {
      if (!this.__pkg.isEmbedAllJavascript()) {
        return null;
      }
      if (this.__sourceMapOffsets === null) {
        throw new Error(
          `Cannot get the source map for ${this} until the stream has been written`
        );
      }
      return this._copySourceMap(
        this.__pkg.getJavascriptMetas(),
        this.__sourceMapOffsets
      );
    }
  }
});
