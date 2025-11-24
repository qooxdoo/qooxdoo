qx.Class.define("classIssue10623", {
  statics: {
    // Test function parameter with object rest
    testFunctionParam({ destruct1, destruct2, ...restDestruct }) {
      console.log(destruct1, destruct2, restDestruct);
      return { destruct1, destruct2, restDestruct };
    },

    // Test variable declaration with object rest
    testVariableDecl(arg0) {
      const { destruct1, destruct2, ...restDestruct } = arg0;
      console.log(destruct1, destruct2, restDestruct);
      return { destruct1, destruct2, restDestruct };
    },

    // Test nested object rest in function params
    testNestedParam({ a, b, nested: { c, d, ...restNested }, ...rest }) {
      console.log(a, b, c, d, restNested, rest);
      return { a, b, c, d, restNested, rest };
    },

    // Test object rest with default values
    testWithDefaults({ a = 1, b = 2, ...rest }) {
      console.log(a, b, rest);
      return { a, b, rest };
    }
  }
});
