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
 * Property implementations must support this interface
 */
qx.Interface.define("qx.core.property.IProperty", {
  members: {
    /**
     * Configures the property from a property definition; note that this can be called
     * after `clone` or after constructing a new object
     *
     * @param {*} def the property definition as written by the user
     */
    configure(def, clazz) {},

    /**
     * Called to define the property on a class prototype
     *
     * @param {qx.Class} clazz the class having the property defined
     * @param {Boolean?} patch whether patching an existing class
     */
    defineProperty(clazz, patch) {}
  }
});
