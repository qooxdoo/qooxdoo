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
 * Immutable storage for native arrays
 */
qx.Bootstrap.define("qx.core.property.ImmutableArrayStorage", {
  extend: qx.core.property.SimplePropertyStorage,

  members: {
    /**
     * @Override
     */
    set(thisObj, property, value) {
      let oldValue = this.get(thisObj, property);
      if (oldValue) {
        qx.lang.Array.replace(oldValue, value || []);
      } else {
        super.set(thisObj, property, value);
      }
    }
  }
});
