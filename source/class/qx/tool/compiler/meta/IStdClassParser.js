qx.Interface.define("qx.tool.compiler.meta.IStdClassParser", {
  members: {
    /**
     * Parses the file and returns the metadata
     *
     * @param {String} metaRootDir Root directory of meta database
     * @param {String} libraryPath Path of the source files of the library that this file is found in
     * @param {String} classFilename the .js file to parse
     * @return {Promise<MetaData>} the parsed metadata
     */
    async parse(metaRootDir, libraryPath, classFilename) {}
  }
});
