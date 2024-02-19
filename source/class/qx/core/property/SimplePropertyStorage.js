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
 * Implementation of property storage for ordinary, non-async properties
 */
qx.Bootstrap.define("qx.core.property.SimplePropertyStorage", {
  extend: Object,
  implement: qx.core.property.IPropertyStorage,

  members: {
    /**
     * @Override
     */
    get(thisObj, property) {
      return thisObj["$$propertyValues"][property.getPropertyName()].value;
    },

    /**
     * @Override
     */
    async getAsync(thisObj, property) {
      return this.get(thisObj, property);
    },

    /**
     * @Override
     */
    set(thisObj, property, value) {
      thisObj["$$propertyValues"][property.getPropertyName()].value = value;
    },

    /**
     * @Override
     */
    async setAsync(thisObj, property, value) {
      this.set(thisObj, property, value);
    },

    /**
     * @Override
     */
    dereference(thisObj, property) {
      delete thisObj["$$propertyValues"][property.getPropertyName()];
    },

    /**
     * @Override
     */
    isAsyncStorage() {
      return false;
    }
  }
});
