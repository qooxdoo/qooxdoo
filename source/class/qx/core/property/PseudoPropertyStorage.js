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
 * Implementation of property storage for psuedo properties
 */
qx.Bootstrap.define("qx.core.property.PseudoPropertyStorage", {
  extend: Object,
  implement: qx.core.property.IPropertyStorage,

  construct(property, clazz) {
    super();
    this.__upname = qx.Bootstrap.firstUp(property.getPropertyName());
    this.__isAsyncStorage = !!clazz.prototype["get" + this.__upname + "Async"];
  },

  members: {
    /** @type{String} capitalised name of the property */
    __upname: null,

    /** @type{Boolean} whether this is for async storage */
    __isAsyncStorage: null,

    /**
     * @Override
     */
    get(thisObj, property) {
      let get = thisObj["get" + this.__upname];
      return get.call(thisObj);
    },

    /**
     * @Override
     */
    async getAsync(thisObj, property) {
      let get = thisObj["get" + this.__upname + "Async"] || thisObj["get" + this.__upname];
      return await get.call(thisObj);
    },

    /**
     * @Override
     */
    set(thisObj, property, value) {
      let set = thisObj["set" + this.__upname];
      set.call(thisObj, value);
    },

    /**
     * @Override
     */
    async setAsync(thisObj, property, value) {
      let set = thisObj["set" + this.__upname + "Async"] || thisObj["set" + this.__upname];
      await set.call(thisObj, value);
    },

    /**
     * @Override
     */
    reset(thisObj, property, value) {
      thisObj["reset" + this.__upname]();
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
      return this.__isAsyncStorage;
    }
  }
});
