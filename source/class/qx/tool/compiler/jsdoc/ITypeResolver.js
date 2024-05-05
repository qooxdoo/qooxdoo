qx.Interface.define("qx.tool.compiler.jsdoc.ITypeResolver", {
  members: {
    /**
     * Given a possible typename, this converts it into a fully qualified classname if possible;
     * because of historical documentation, the typename may be just a classname without
     * the package.  This method will attempt to resolve the type to a fully qualified classname, and
     * only returns the fully qualified name if it actually exists.
     *
     * Otherwise, it returns what it is given as `typename`
     *
     * @param typename {String} the typename to resolve
     */
    resolveType(typename) {}
  }
});
