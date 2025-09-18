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
   * @param {Function} clazz Qooxdoo class which the property relates to
   */
  construct(property, clazz) {
    super();
    let def = property.getDefinition();
    this.__get = def.get;
    this.__getAsync = def.getAsync || def.get;
    this.__set = def.set;
    this.__setAsync = def.setAsync || def.set;
  },

  members: {
    /**
     * @Override
     */
    get(thisObj, property) {
      return this.__get.call(thisObj, property, thisObj);
    },

    /**
     * @Override
     */
    getAsync(thisObj, property) {
      return this.__getAsync.call(thisObj, property, thisObj);
    },

    /**
     * @Override
     */
    set(thisObj, property, value) {
      this.__set.call(thisObj, value, property, thisObj);
    },

    /**
     * @Override
     */
    setAsync(thisObj, property, value) {
      return this.__setAsync.call(thisObj, property, value);
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
    isAsyncStorage() {
      return this.__property.isAsync();
    }
  }
});
