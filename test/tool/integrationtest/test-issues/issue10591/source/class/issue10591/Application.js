/* ************************************************************************

   Copyright: 2023 qooxdoo developers

   License: MIT license

   Authors:

************************************************************************ */

/**
 * Test for issue #10591 - ES6 shorthand methods in delegate objects
 *
 * This test verifies that the compiler correctly handles ES6 shorthand
 * method syntax in delegate objects without generating spurious
 * "Unresolved use of symbol" warnings for method parameters.
 */
qx.Class.define("issue10591.Application", {
  extend: qx.application.Basic,

  members: {
    main() {
      this.base(arguments);

      // Test the delegate functionality
      var testArray = new issue10591.TestArray([1, 2, 3]);

      // Test array-like access using delegate
      console.log("testArray[0] =", testArray[0]); // should be 1
      testArray[1] = 99;
      console.log("testArray[1] =", testArray[1]); // should be 99

      // Test regular property access
      console.log("testArray.getLength() =", testArray.getLength()); // should be 3
    }
  }
});
