/**
 * Mixin containing special assert methods
 */
qx.Mixin.define("qx.test.io.MAssert", {
  members: {
    /**
     * Deep equal comparison, using Sinon's `deepEqual` comparison.
     * Two values are "deep equal" if:
     *
     *   - They are equal, according to samsam.identical
     *   (https://sinonjs.github.io/samsam/)
     *   - They are both date objects representing the same time
     *   - They are both arrays containing elements that are all deepEqual
     *   - They are objects with the same set of properties, and each property
     *     in obj1 is deepEqual to the corresponding property in obj2
     *
     * Supports cyclic objects.
     * @param {*} expected
     * @param {*} actual
     * @param {String?} msg
     */
    assertDeepEquals(expected, actual, msg) {
      if (!msg) {
        msg = `Failed to assert that ${qx.lang.Json.stringify(
          actual
        )} deeply equals ${qx.lang.Json.stringify(expected)}.`;
      }
      this.assert(qx.lang.Object.equals(expected, actual), msg);
    },

    /**
     * Asserts that a string fragment is contained in a result
     * @param {String} expectedFragment
     * @param {String} actual
     * @param {String?} msg
     */
    assertContains(expectedFragment, actual, msg) {
      this.assertString(expectedFragment);
      this.assertString(actual);
      if (!msg) {
        msg = `Failed to assert that '${actual}' contains '${expectedFragment}'.`;
      }
      this.assert(actual.includes(expectedFragment), msg);
    }
  }
});
