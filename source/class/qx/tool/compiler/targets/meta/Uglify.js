const fs = qx.tool.utils.Promisify.fs;
const path = require("upath");
const UglifyJS = require("uglify-es");

qx.Class.define("qx.tool.compiler.targets.meta.Uglify", {
  extend: qx.tool.compiler.targets.meta.AbstractJavascriptMeta,
  
  /**
   * Constructor
   * 
   * @param appMeta {qx.tool.compiler.targets.meta.ApplicationMeta}
   * @param jsMeta {AbstractJavascriptMeta} the source
   */
  construct(appMeta, jsMeta) {
    this.base(arguments, appMeta, jsMeta.getFilename());
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
      await qx.tool.utils.files.Utils.safeUnlink(outJsFilename + ".unminified");
      await qx.tool.utils.files.Utils.safeRename(outJsFilename, outJsFilename + ".unminified");
      
      let inSourceMap = await this.__jsMeta.getSourceMap();
      await qx.tool.utils.files.Utils.safeUnlink(outJsFilename + ".unminified.map");
      await qx.tool.utils.files.Utils.safeRename(outJsFilename + ".map", outJsFilename + ".unminified.map");

      this.fireDataEvent("minifyingApplication", { application: application, filename: baseJsFilename });
      uglifyOpts.sourceMap = {
        content: inSourceMap,
        url: baseJsFilename + ".map",
        includeSources: true
      };
      var result = UglifyJS.minify(inSourceCode, uglifyOpts);
      var err = result.error;
      if (err) {
        if (err.name == "SyntaxError") {
          qx.tool.compiler.Console.print("qx.tool.compiler.build.uglifyParseError", err.line, err.col, err.message, baseJsFilename);
        }
        throw new Error("UglifyJS failed to minimise: " + (err.message||err));
      }
      await fs.writeFileAsync(outJsFilename, result.code, { encoding: "utf8" });
      if (!this._appMeta.getTarget().isSaveUnminified()) {
        await qx.tool.utils.files.Utils.safeUnlink(outJsFilename + ".unminified");
        await qx.tool.utils.files.Utils.safeUnlink(outJsFilename + ".unminified.map");
      }
      await fs.writeFileAsync(outJsFilename + ".map", result.map, { encoding: "utf8" });
      this.fireDataEvent("minifiedApplication", { application: application, filename: baseJsFilename });
    }
  }
});
