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

const fs = qx.tool.utils.Promisify.fs;
const path = require("upath");

/**
 * Represents a "polyfill.js" that is generated as part of a compile
 */
qx.Class.define("qx.tool.compiler.targets.meta.PolyfillJs", {
  extend: qx.tool.compiler.targets.meta.AbstractJavascriptMeta,

  construct(appMeta) {
    super(appMeta, `${appMeta.getApplicationRoot()}polyfill.js`);
  },

  properties: {
    needsWriteToDisk: {
      init: true,
      refine: true
    }
  },

  members: {
    /**
     * @Override
     */
    async writeSourceCodeToStream(ws) {
      await this.__write(path.join(this.__getCoreJsDir(), "minified.js"), ws);

      await new Promise(resolve => {
        ws.write("\n", resolve);
      });
      await this.__write(
        path.join(require.resolve("regenerator-runtime"), "../runtime.js"),
        ws
      );
    },

    /**
     * @Override
     *
     * Only the source target writes polyfill.js to disk; it gets core-js-bundle's
     * source map, which still fits because minified.js is written first and unchanged.
     * The build target embeds the polyfills, without a map, in index.js
     */
    async writeToDisk() {
      await super.writeToDisk();
      if (!this.isNeedsWriteToDisk()) {
        return;
      }
      let filename = this.getFilename();
      let coreJsDir = this.__getCoreJsDir();
      let map = JSON.parse(
        await fs.readFileAsync(path.join(coreJsDir, "minified.js.map"), "utf8")
      );

      // The map's only source is called "0", but it is core-js-bundle's index.js; name
      //  it by its path, as the maps of the classes do, so that tools such as coverage
      //  reporters find the real file
      let indexJs = path.join(coreJsDir, "index.js");
      let target = this._appMeta.getTarget();
      map.file = path.basename(filename);
      map.sources = [
        target.getSourceMapRelativePaths && target.getSourceMapRelativePaths()
          ? path.relative("", indexJs)
          : indexJs
      ];
      map.sourcesContent = [await fs.readFileAsync(indexJs, "utf8")];

      await fs.appendFileAsync(
        filename,
        `//# sourceMappingURL=${path.basename(filename)}.map\n`,
        "utf8"
      );
      await fs.writeFileAsync(filename + ".map", JSON.stringify(map), "utf8");
    },

    __getCoreJsDir() {
      return path.dirname(require.resolve("core-js-bundle"));
    },

    async __write(srcFilename, ws) {
      // core-js-bundle's minified.js ends with `//# sourceMappingURL=minified.js.map`;
      //  writeToDisk adds a reference to polyfill.js.map instead
      let rs = fs.createReadStream(srcFilename, "utf8");
      let strip = new qx.tool.utils.Utils.StripSourceMapTransform();
      await new Promise((resolve, reject) => {
        strip.on("end", resolve);
        rs.on("error", reject);
        rs.pipe(strip).pipe(ws, { end: false });
      });
    },

    /**
     * @Override
     */
    async getSourceMap() {
      return null;
    }
  }
});
