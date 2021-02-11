const fs = qx.tool.utils.Promisify.fs;
const path = require("upath");

/**
 * Represents a "polyfill.js" that is generated as part of a compile 
 */
qx.Class.define("qx.tool.compiler.targets.meta.PolyfillJs", {
  extend: qx.tool.compiler.targets.meta.AbstractJavascriptMeta,
  
  construct(appMeta) {
    this.base(arguments, appMeta, `${appMeta.getApplicationRoot()}polyfill.js`);
  },
  
  properties: {
    needsWriteToDisk: {
      init: true,
      refine: true
    }
  },
  
  members: {
    
    /*
     * @Override
     */
    async writeSourceCodeToStream(ws) {
      const srcFilename = path.join(require.resolve("@babel/polyfill"), "../../dist/polyfill.js");
      let rs = fs.createReadStream(srcFilename, "utf8");
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
      return null;
    }
  }
});
