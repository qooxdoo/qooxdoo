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
 * Property storage for properties which have explicit getter/setter methods in the property definition
 */
qx.Bootstrap.define("qx.core.property.ExplicitPropertyStorage", {
  extend: Object,
  implement: qx.core.property.IPropertyStorage,

  /**
   * @param {qx.core.property.Property} property
   */
  construct(property) {
    super();
    this.__property = property;
  },

  members: {
    /**
     * @type {qx.core.property.Property}
     */
    __property: null,
    
    /**
     * @Override
     */
    get(thisObj, property) {
      return this.__property.getDefinition().get.call(thisObj, property, thisObj);
    },

    /**
     * @Override
     */
    getAsync(thisObj, property) {
      return this.__property.getDefinition().getAsync.call(thisObj, property, thisObj);
    },

    /**
     * @Override
     */
    set(thisObj, property, value) {
      this.__property.getDefinition().set.call(thisObj, value, property, thisObj);
    },

    /**
     * @Override
     */
    dereference(thisObj, property) {
      // Nothing
    },

    /**
     * @Override
     */
    supportsGetAsync() {
      return !!this.__property.getDefinition().getAsync;
    }
  }
});
