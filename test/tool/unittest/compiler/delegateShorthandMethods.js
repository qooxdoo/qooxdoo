// Regression fixture for GitHub issue #10591 - loaded by qx.test.tool.compiler.ClassFile

qx.Class.define("delegateShorthandMethods",
 {
    // These generate a compiler warning that `property` and `value` are
    // unresolved. The warnings can be eliminated by changing the
    // function declaration type from
    //
    //   get(property) {
    //
    // to
    //
    //   get : function(property) {
    //
    // This code here demonstrates the error, which also occurs in
    // qx.data.Array in the new-class-property-system branch
    //
    delegate: {
      get(property) {
        return property === "0";
      },

      set(property, value) {
        this[property] = !!value;
      }
    }
 });
