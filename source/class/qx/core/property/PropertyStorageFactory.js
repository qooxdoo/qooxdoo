qx.Bootstrap.define("qx.core.property.PropertyStorageFactory", {
  extend: Object,

  statics: {
    /** @type {Object<String,qx.core.property.IPropertyStorage} the cached instances */
    __instances: {},

    /**
     * Returns the storage instance for the given class, creating it if necessary
     *
     * @param {qx.Class} clazz the storage class to get
     * @return {qx.core.property.IPropertyStorage}
     */
    getStorage(clazz, ...args) {
      let storage = this.__instances[clazz.classname];
      if (!storage) {
        storage = this.__instances[clazz.classname] = new clazz(...args);
      }
      return storage;
    }
  }
});
