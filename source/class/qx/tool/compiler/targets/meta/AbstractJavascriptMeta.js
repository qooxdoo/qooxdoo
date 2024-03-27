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
const sourceMap = require("source-map-js");

/**
 * An AbstractJavascriptMeta provides an abstraction of some source code, and might be
 * comprised of a number of input files which are merged together as required.
 *
 * This object could represent a file which already exists on disk (eg a transpiled
 * source file), or something that is generated on the fly (such as a index.js), or
 * a compilation of files (eg a part)
 */
qx.Class.define("qx.tool.compiler.targets.meta.AbstractJavascriptMeta", {
  extend: qx.core.Object,

  /**
   * Constructor
   *
   * @param appMeta {qx.tool.compiler.targets.meta.ApplicationMeta}
   * @param filename {String} the sourcefile
   * @param originalSourceFile {String?} the URI to give to the source map
   */
  construct(appMeta, filename, originalSourceFile) {
    super();
    this._appMeta = appMeta;
    this.__filename = filename;
    this.__originalSourceFile = originalSourceFile;
  },

  properties: {
    /** If true, this is generated on the fly and needs to be output */
    needsWriteToDisk: {
      init: false,
      check: "Boolean"
    }
  },

  members: {
    _appMeta: null,
    __filename: null,
    __originalSourceFile: null,
    __wrapper: null,

    /**
     * Returns the ApplicationMeta
     *
     * @return {ApplicationMeta}
     */
    getAppMeta() {
      return this._appMeta;
    },

    /**
     * Returns the filename for the output of this JS
     *
     * @return {String}
     */
    getFilename() {
      return this.__filename;
    },

    wrap(jsMeta) {
      this.__wrapper = jsMeta;
    },

    getWrapper() {
      return this.__wrapper;
    },

    unwrap() {
      if (this.__wrapper) {
        return this.__wrapper.unwrap();
      }
      return this;
    },

    /**
     * Writes the file to disk, if appropriate
     */
    async writeToDisk() {
      if (this.isNeedsWriteToDisk()) {
        let ws = new qx.tool.utils.Utils.LineCountingTransform();
        ws.pipe(fs.createWriteStream(this.__filename, "utf8"));
        await new Promise(async resolve => {
          ws.on("finish", resolve);
          await this.writeSourceCodeToStream(ws);
          ws.end();
        });

        let map = await this.getSourceMap();
        if (map) {
          await fs.writeFileAsync(
            this.__filename + ".map",
            JSON.stringify(map, null, 2),
            "utf8"
          );
        }
      }
    },

    /**
     * Writes the source code as a stream, merging source files etc
     * as necessary
     *
     * @param ws {NodeJS.WritableStream} the stream to write to
     */
    async writeSourceCodeToStream(ws) {
      throw new Error(
        `No implementation for ${this.classname}.writeSourceCodeToStream`
      );
    },

    /**
     * Reads the source map as a string
     */
    async getSourceMap() {
      return null;
    },

    /**
     * Utility method that merges multiple source maps
     */
    async _copySourceMap(jsMetas, lineOffsets) {
      let generator = new sourceMap.SourceMapGenerator({
        file: this.getFilename() + ".map"
      });

      for (let i = 0; i < jsMetas.length; i++) {
        let js = jsMetas[i];
        let lineOffset = lineOffsets[i];
        let data = await js.getSourceMap();
        if (data) {
          var map = new sourceMap.SourceMapConsumer(data);
          map.eachMapping(mapping => {
            mapping = {
              generated: {
                line: mapping.generatedLine + lineOffset,
                column: mapping.generatedColumn
              },

              original: {
                line: mapping.originalLine || 1,
                column: mapping.originalColumn || 1
              },

              source: mapping.source || js.getFilename()
            };

            generator.addMapping(mapping);
          });
          if (
            this._appMeta.getTarget().getSaveSourceInMap &&
            this._appMeta.getTarget().getSaveSourceInMap()
          ) {
            map.sources.forEach(source =>
              generator.setSourceContent(source, map.sourceContentFor(source))
            );
          }
        }
      }
      let res = JSON.parse(generator.toString());
      if (
        this._appMeta.getTarget().getSourceMapRelativePaths &&
        this._appMeta.getTarget().getSourceMapRelativePaths()
      ) {
        for (let i = 0; i < res.sources.length; i++) {
          res.sources[i] = path.relative("", res.sources[i]);
        }
      }
      return res;
    }
  }
});
