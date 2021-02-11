/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo-compiler
 *
 *    Copyright:
 *      2011-2019 Zenesis Limited, http://www.zenesis.com
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

const crypto = require("crypto");
const sourceMap = require("source-map");

/**
 * Copies multiple javascript source files into a single destination, preserving (merging)
 * source maps as it goes.
 *
 * This will not rewrite the output files if the file content will not change.
 */
qx.Class.define("qx.tool.compiler.targets.SourceCodeCopier", {
  extend: qx.core.Object,

  /**
   * Constructor
   * @param outputFilename {String} the destination file for combined output
   */
  construct: function(outputFilename) {
    this.base(arguments);

    let pos = outputFilename.lastIndexOf(".");
    let basename = outputFilename.substring(0, pos);

    this.__tmpFilename = basename + "-tmp.js";
    this.__outputFilename = basename + ".js";
    this.__mapFilename = basename + ".js.map";

    this.__ws = fs.createWriteStream(this.__tmpFilename);
    this.__hash = crypto.createHash("sha256");
    this.__hash.setEncoding("hex");

    this.__generator = new sourceMap.SourceMapGenerator({
      file: this.__mapFilename
    });
    this.__lineOffset = 0;
  },

  members: {
    /** {String} Output filename for combined javascript */
    __outputFilename: null,

    /** {String} output filename for temporary code */
    __tmpFilename: null,

    /** {String} output filename for the combined sourcemap */
    __mapFilename: null,

    /** {String} write stream for javascript */
    __ws: null,

    /** {crypto.createHash} hash accumulator for combined javascript */
    __hash: null,

    /** {String} hash value for existing combined javascript */
    __existingHashValue: null,
    
    __generator: null,
    __lineOffset: null,
        
    /**
     * Returns the file the code is copied to
     */
    getOutputFilename() {
      return this.__outputFilename;
    },

    /**
     * Opens the output
     */
    async open() {
      let stat = await qx.tool.utils.files.Utils.safeStat(this.__outputFilename);
      if (stat) {
        let hash = crypto.createHash("sha256");
        hash.setEncoding("hex");
        let data = await fs.readFileAsync(this.__outputFilename, "utf8");
        hash.write(data);
        this.__existingHashValue = this.__hash.read();
      }
    },

    /**
     * Helper method to write output
     * @param str {String} data to write
     */
    __write(str) {
      this.__hash.write(str);
      this.__ws.write(str);
    },

    /**
     * Adds a source file to the output
     *
     * @param jsFilename {String} filename to add
     * @param jsUri {String} uri of the file being added, relative to the output directory
     */
    async addSourceFile(jsFilename, jsUri) {
      let jsMapFilename = jsFilename + ".map";
      let numLines = 0;
      let data = await fs.readFileAsync(jsFilename, "utf8");
      data = data.replace(/\/\/[@#]\ssourceMappingURL[^\r\n]*/g, "//");
      data += "\n";
      this.__write(data);
      for (var i = 0; i < data.length; i++) {
        if (data[i] === "\n") {
          numLines++;
        }
      }

      let stat = await qx.tool.utils.files.Utils.safeStat(jsMapFilename);
      if (stat) {
        let source = jsUri || jsFilename;
        data = await fs.readFileAsync(jsMapFilename, "utf8");
        var map = new sourceMap.SourceMapConsumer(data);
        map.eachMapping(mapping => {
          mapping = {
            generated: {
              line: mapping.generatedLine + this.__lineOffset,
              column: mapping.generatedColumn
            },
            original: {
              line: mapping.originalLine || 1,
              column: mapping.originalColumn || 1
            },
            source: source
          };
          this.__generator.addMapping(mapping);
        });
        map.sources.forEach(origSource => this.__generator.setSourceContent(source, map.sourceContentFor(origSource)));
      }

      this.__lineOffset += numLines;
    },

    /**
     * Closes the output
     */
    async close() {
      this.__write("\n//# sourceMappingURL=" + path.basename(this.__mapFilename) + "\n");
      this.__ws.end();
      this.__hash.end();
      var hashValue = this.__hash.read();
      if (!this.__existingHashValue || hashValue !== this.__existingHashValue) {
        await fs.renameAsync(this.__tmpFilename, this.__outputFilename);
        await fs.writeFileAsync(this.__mapFilename, JSON.stringify(JSON.parse(this.__generator.toString()), null, 2), "utf8");
        return true;
      } 
      await fs.unlinkAsync(this.__tmpFilename);
      return false;
    }
  }
});
