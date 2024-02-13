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
 * Property storage for properties which have explicit getter/setter methods in the property definition
 */
qx.Bootstrap.define("qx.core.property.ExplicitPropertyStorage", {
  extend: qx.core.Object,
  implement: qx.core.property.IPropertyStorage,

  construct(property, clazz) {
    super();
    let upname = qx.Bootstrap.firstUp(property.getPropertyName());
    this.__get = clazz.prototype["get" + upname];
    this.__getAsync = clazz.prototype["get" + upname + "Async"] || this.__get;
    this.__set = clazz.prototype["set" + upname];
    this.__setAsync = clazz.prototype["set" + upname + "Async"] || this.__set;
  },

  members: {
    /**
     * @Override
     */
    get(thisObj, property) {
      return this.__get.call(thisObj);
    },

    /**
     * @Override
     */
    async getAsync(thisObj, property) {
      return this.__getAsync.call(thisObj);
    },

    /**
     * @Override
     */
    set(thisObj, property, value) {
      this.__set.call(thisObj, value);
    },

    /**
     * @Override
     */
    async setAsync(thisObj, property, value) {
      this.__setAsync.call(thisObj, value);
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
      return this.__setAsync !== this.__set;
    }
  }
});
