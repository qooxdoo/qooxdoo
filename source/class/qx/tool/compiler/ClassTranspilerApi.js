const fs = require("fs");
const path = require("path");

/**
 * The server implementation of the API for transpiling classes, `qx.tool.compiler.IClassTranspilerApi`.
 */
qx.Class.define("qx.tool.compiler.ClassTranspilerApi", {
  extend: qx.core.Object,
  implement: [qx.tool.compiler.IClassTranspilerApi],

  construct() {
    super();
    this.__sourceTransformers = {};
  },

  members: {
    /** @type{Object<String, qx.tool.compiler.ISourceTransformer>} list of known source transformer instances*/
    __sourceTransformers: null,

    async test() {
      return Math.round(Math.random() * 100);
    },

    /**
     * Gets or creates a source transformer instance for the given class name.  Caches the result
     *
     * @param {String} classname
     * @return {qx.tool.compiler.ISourceTransformer}
     */
    async _getSourceTransformer(classname) {
      let transformer = this.__sourceTransformers[classname];
      if (!transformer) {
        let TransformerClass = qx.Class.getByName(classname);
        transformer = new TransformerClass();
        this.__sourceTransformers[classname] = transformer;
        await transformer.initialise();
      }
      return transformer;
    },

    /**
     * @Override
     */
    async transpileClass(transpileConfig) {
      let { sourceFilename, outputFilename } = transpileConfig;
      let source = await fs.promises.readFile(transpileConfig.sourceFilename, "utf8");

      let classFileConfig = new qx.tool.compiler.ClassFileConfig().set(transpileConfig.classFileConfig);
      let sourceTransformer = null;
      if (transpileConfig.sourceTransformer) {
        sourceTransformer = await this._getSourceTransformer(transpileConfig.sourceTransformer);
      }
      if (sourceTransformer && (await sourceTransformer.shouldTransform(transpileConfig))) {
        source = await sourceTransformer.transform(transpileConfig, source);
        await fs.promises.mkdir(path.dirname(outputFilename), { recursive: true });
        sourceFilename = outputFilename.replace(/\.js$/, ".trans.js");
        fs.promises.writeFile(sourceFilename, source, "utf8"); //no need to await this because this only starts to matter once the user starts running and debugging
      }

      let shadowMetaApi = qx.tool.worker.WorkerServer.getThisServerInstance().getApi(qx.tool.compiler.meta.IShadowMetaDatabaseApi);

      let classFileTranspiler = new qx.tool.compiler.ClassFile(
        shadowMetaApi,
        classFileConfig,
        transpileConfig.classname,
        transpileConfig.manglePrefix
      );
      let result = classFileTranspiler.compile(source, sourceFilename);

      if (result.code) {
        let mappingUrl;
        if (classFileConfig.getApplicationTypes().includes("browser")) {
          mappingUrl = path.basename(outputFilename) + ".map?dt=" + Date.now();
        } else {
          mappingUrl = path.resolve(outputFilename + ".map");
        }

        await fs.promises.mkdir(path.dirname(outputFilename), { recursive: true });
        await fs.promises.writeFile(outputFilename, result.code + "\n\n//# sourceMappingURL=" + mappingUrl, "utf8");
        await fs.promises.writeFile(outputFilename + ".map", JSON.stringify(result.map, null, 2), "utf8");
      }
      return result.dbClassInfo;
    }
  }
});
