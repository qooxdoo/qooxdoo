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
const UglifyJS = require("terser");

qx.Class.define("qx.tool.compiler.targets.meta.Uglify", {
  extend: qx.tool.compiler.targets.meta.AbstractJavascriptMeta,

  /**
   * Constructor
   *
   * @param appMeta {qx.tool.compiler.targets.meta.ApplicationMeta}
   * @param jsMeta {AbstractJavascriptMeta} the source
   */
  construct(appMeta, jsMeta) {
    super(appMeta, jsMeta.getFilename());
    this.__jsMeta = jsMeta;
  },

  properties: {
    needsWriteToDisk: {
      init: true,
      refine: true
    }
  },

  members: {
    __jsMeta: null,

    /*
     * @Override
     */
    async writeSourceCodeToStream(ws) {
      var uglifyOpts = {
        compress: {
          sequences: false
        },

        output: {
          comments: "some"
        }
      };

      switch (this._appMeta.getTarget().getMinify()) {
        case "off":
          return;

        case "minify":
          uglifyOpts.mangle = false;
          break;

        case "beautify":
          uglifyOpts.mangle = false;
          uglifyOpts.output.beautify = true;
          break;

        case "mangle":
          uglifyOpts.mangle = true;
          break;
      }

      var application = this._appMeta.getApplication();

      var outJsFilename = this.__jsMeta.getFilename();
      let baseJsFilename = path.basename(outJsFilename);

      let inSourceCode = await (async () => {
        let ss = new qx.tool.utils.Utils.ToStringWriteStream();
        let ws = new qx.tool.utils.Utils.LineCountingTransform();
        ws.pipe(ss);
        await new Promise(async resolve => {
          ws.on("finish", resolve);
          await this.__jsMeta.writeSourceCodeToStream(ws);
          ws.end();
        });
        return ss.toString();
      })();

      let inSourceMap = await this.__jsMeta.getSourceMap();
      this.fireDataEvent("minifyingApplication", {
        application: application,
        filename: baseJsFilename
      });

      uglifyOpts.sourceMap = {
        content: inSourceMap,
        url: baseJsFilename + ".map",
        includeSources: true
      };

      var result = await UglifyJS.minify(inSourceCode, uglifyOpts);
      var err = result.error;
      if (err) {
        if (err.name == "SyntaxError") {
          qx.tool.compiler.Console.print(
            "qx.tool.compiler.build.uglifyParseError",
            err.line,
            err.col,
            err.message,
            baseJsFilename
          );
        }
        throw new Error("UglifyJS failed to minimise: " + (err.message || err));
      }
      await fs.writeFileAsync(outJsFilename, result.code, { encoding: "utf8" });
      await fs.writeFileAsync(outJsFilename + ".map", result.map, {
        encoding: "utf8"
      });

      if (this._appMeta.getTarget().isSaveUnminified()) {
        await fs.writeFileAsync(outJsFilename + ".unminified", inSourceCode, {
          encoding: "utf8"
        });

        await fs.writeFileAsync(
          outJsFilename + ".unminified.map",
          JSON.stringify(inSourceMap, null, 2),
          { encoding: "utf8" }
        );
      }

      this.fireDataEvent("minifiedApplication", {
        application: application,
        filename: baseJsFilename
      });
    }
  }
});
