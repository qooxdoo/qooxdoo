/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2024 Zenesis Limited (https://www.zenesis.com)

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (github.com/johnspackman)

************************************************************************ */

/**
 * Implementation of check for any value
 */
qx.Bootstrap.define("qx.core.check.ArrayCheck", {
  extend: Object,
  implement: qx.core.check.ICheck,

  construct(values, nullable) {
    super();
    this.__values = values;
    this.__nullable = nullable;
  },

  members: {
    /** @type{Array} list of allowed values */
    __values: null,

    /** @type{Boolean} whether null is allowed */
    __nullable: null,

    /**
     * @override
     */
    matches(value) {
      if (value === null) {
        return this.__nullable;
      }

      if (value instanceof String) {
        value = value.valueOf();
      }

      if (this.__values.indexOf(value) !== -1) {
        return true;
      }

      throw new Error(
        "Expected value to be one of: " + JSON.stringify(this.__values)
      );
    },

    /**
     * @override
     */
    isNullable() {
      return this.__nullable;
    },

    /**
     * @override
     */
    isCompatible(check) {
      if (check instanceof qx.core.check.ArrayCheck) {
        for (let i = 0; i < this.__values.length; i++) {
          if (check.__values.indexOf(this.__values[i]) === -1) {
            return false;
          }
        }
      }
      return true;
    },

    /**
     * @override
     */
    needsDereference() {
      return false;
    }
  }
});
