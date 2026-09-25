qx.Interface.define("qx.tool.compiler.meta.IShadowMetaDatabaseApi", {
  members: {
    /**
     * Sets the environment checks to be used for symbol type detection. This is needed to allow the
     * compiler to detect environment symbols, which are not classes or packages but are still important
     * for the compiler to know about, eg to detect whether a symbol is a class or an environment when
     * processing `qx.core.Environment.get`.
     *
     * @param {qx.tool.compiler.meta.Metadatabase.EnvironmentCheck[]} environmentChecks
     */
    async setEnvironmentChecks(environmentChecks) {},

    /**
     * Updates the class meta in the shadow database. The meta data is passed as a shared buffer to avoid the overhead of copying large meta data objects between threads.
     *
     * @param {SharedArrayBuffer} sharedBufferMetaData the class meta data as a shared buffer
     * @returns {Promise<void>}
     */
    async updateClassMeta(sharedBufferMetaData) {}
  }
});
