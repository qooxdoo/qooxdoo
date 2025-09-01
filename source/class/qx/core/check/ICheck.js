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
 * Type checking interface
 */
qx.Interface.define("qx.core.check.ICheck", {
  members: {
    /**
     * Tests whether the value matches the compatibility constraints in this check
     *
     * @param {*} value
     * @param {qx.core.Object} thisObj the object that the value is a property of
     * @return {Boolean}
     */
    matches(value, thisObj) {},

    /**
     * Tests whether the value is nullable
     *
     * @return {Boolean}
     */
    isNullable() {},

    /**
     * By default, the references to the values (current, init, ...) of the
     * property will be stored as references on the object. When disposing
     * this object, the references will not be deleted. Setting the
     * dereference key to true tells the property system to delete all
     * connections made by this property on dispose. This can be necessary for
     * disconnecting DOM objects to allow the garbage collector to work
     *
     * Properties can be explicitly set to dereference, but the ICheck allows the property
     * to detect this, based on the type of the property.
     *
     * Most implementations will return `false`
     *
     * @return {Boolean}
     */
    needsDereference() {},

    /**
     * Tests whether this check is compatible with another check, ie this check
     * is a subclass of the other check or directly compatible
     *
     * @param {qx.core.check.ICheck} check
     * @return {boolean}
     */
    isCompatible(check) {},

    /**
     * Attempts to coerce the value to match the constraints in this check
     *
     * @param {*} value
     * @param {qx.core.Object} thisObj the object that the value is a property of
     * @return {* | null} the coerced value, or null if coercion is not possible
     */
    coerce(value, thisObj) {}
  }
});
