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
     * @param {*} value
     * @return {Boolean}
     */
    matches(value) {},

    /**
     * Tests whether the value is nullable
     *
     * @return {Boolean}
     */
    isNullable() {},

    /**
     * Tests whether this check is compatible with another check, ie this check
     * is a subclass of the other check or directly compatible
     *
     * @param {qx.core.check.ICheck} check
     * @return {boolean}
     */
    isCompatible(check) {}
  }
});
