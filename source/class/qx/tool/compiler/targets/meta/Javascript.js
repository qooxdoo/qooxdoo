const fs = qx.tool.utils.Promisify.fs;

/**
 * An implementation of IJavascriptMeta for plain old javascript files
 */
qx.Class.define("qx.tool.compiler.targets.meta.Javascript", {
  extend: qx.tool.compiler.targets.meta.AbstractJavascriptMeta,
  
  /**
   * Constructor
   * 
   * @param appMeta {qx.tool.compiler.targets.meta.ApplicationMeta}
   * @param filename {String} the sourcefile
   * @param originalSourceFile {String?} the URI to give to the source map
   */
  construct(appMeta, filename, originalSourceFile) {
    this.base(arguments, appMeta, filename, originalSourceFile);
  },
  
  members: {
    
    /*
     * @Override
     */
    compile() {
      // Nothing
    },
    
    /*
     * @Override
     */
    async writeSourceCodeToStream(ws) {
      let rs = fs.createReadStream(this.getFilename(), "utf8");
      await new Promise((resolve, reject) => {
        rs.on("end", resolve);
        rs.on("error", reject);
        rs.pipe(ws, { end: false });
      });
    },
    
    /*
     * @Override
     */
    async getSourceMap() {
      if (!fs.existsSync(this.getFilename() + ".map")) {
        return null;
      }
      return await fs.readFileAsync(this.getFilename() + ".map", "utf8");
    }
  }
});
