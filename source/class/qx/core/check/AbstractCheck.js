/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2023-24 Zenesis Limited (https://www.zenesis.com)

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (github.com/johnspackman)

************************************************************************ */

/**
 * Type checking for basic, native types
 */
qx.Bootstrap.define("qx.core.check.AbstractCheck", {
  extend: Object,
  implement: qx.core.check.ICheck,

  construct(nullable) {
    super();
    this.__nullable = !!nullable;
  },

  members: {
    /** @type{Boolean} whether null is allowed */
    __nullable: null,

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
      return check instanceof this.constructor;
    },

    /**
     * @override
     */
    needsDereference() {
      return false;
    },

    /**
     * @override
     */
    coerce(value, thisObj) {
      if (value === undefined) {
        return null;
      }
      if (value === null) {
        if (this.isNullable()) {
          return null;
        }
      } else if (this.matches(value, thisObj)) {
        return value;
      }
      value = this._coerceImpl(value, thisObj);
      if (value !== null && this.matches(value, thisObj)) {
        return value;
      }
      return null;
    },

    /**
     * @override
     */
    matches(value, thisObj) {
      if (value === null || value === undefined) {
        return this.isNullable();
      }
      return this._matchesImpl(value, thisObj);
    },

    /**
     * Default implementation for `matches` method - this has teh same semantics as `matches` but
     * handles the cases where the value is null or undefined.
     *
     * @param {*} value
     * @returns {Boolean}
     */
    _matchesImpl(value, thisObj) {
      return false;
    },

    /**
     * Default implementation for `coerce` method - this has the same semantics as `coerce` but
     * will only be called if `value` is not null or undefined and does not match the check.
     * The return value must pass the `matches` test for this check, and if it does not then
     * the value will be chnaged to null by `coerce()`
     *
     * @param {*} value
     * @returns {*}
     */
    _coerceImpl(value) {
      return value;
    }
  }
});
