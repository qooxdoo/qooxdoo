/* ************************************************************************

   Copyright: 2023 qooxdoo developers

   License: MIT license

   Authors:

************************************************************************ */

/**
 * Test class with delegate using ES6 shorthand method syntax.
 *
 * This class demonstrates the use of ES6 shorthand methods in a delegate
 * object, which previously caused spurious "Unresolved use of symbol"
 * warnings for the method parameters (property, value).
 */
qx.Class.define("issue10591.TestArray", {
  extend: qx.core.Object,

  /**
   * Delegate allows array-like access using ES6 shorthand method syntax.
   * The compiler should NOT generate warnings about unresolved symbols
   * for the parameters: property, value
   */
  delegate: {
    get(property) {
      // property should NOT be flagged as "Unresolved use of symbol property"
      if (typeof property != "symbol" && +property === +property) {
        return this.getItem(property);
      } else {
        return this[property];
      }
    },

    set(property, value) {
      // property and value should NOT be flagged as unresolved symbols
      if (typeof property != "symbol" && +property === +property) {
        this.setItem(property, value);
      } else {
        this[property] = value;
      }
    },

    delete(property) {
      // property should NOT be flagged as "Unresolved use of symbol property"
      if (typeof property != "symbol" && +property === +property) {
        this.setItem(property, undefined);
      } else {
        delete this[property];
      }
    }
  },

  construct(items) {
    super();
    this.__array = items || [];
  },

  members: {
    __array: null,

    getItem(index) {
      return this.__array[index];
    },

    setItem(index, value) {
      this.__array[index] = value;
    },

    getLength() {
      return this.__array.length;
    }
  }
});
