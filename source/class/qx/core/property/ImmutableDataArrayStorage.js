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
 * Immutable storage for `qx.data.Array`
 */
qx.Class.define("qx.core.property.ImmutableDataArrayStorage", {
  extend: qx.core.property.PropertyStorage,

  members: {
    /**
     * @Override
     */
    set(thisObj, property, value) {
      let oldValue = this.get(thisObj, property);
      if (oldValue) {
        oldValue.replace(value || []);
      } else {
        super.set(thisObj, property, value);
      }
    }
  }
});
