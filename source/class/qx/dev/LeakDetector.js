/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2025-26 Zenesis Limited, https://www.zenesis.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com)

************************************************************************ */

/**
 * Adds leak detection to qx.core.Object, so that we can track constructed and destructed
 * Qooxdoo objects.  WeakRefs are used so that we do not prevent garbage collection, which
 * means that we only operate on platforms which support WeakRef - this code will warn if
 * WeakRef does not exist and will not crash if WeakRef is not supported (it will just do
 * nothing).
 *
 * @ignore(WeakRef)
 */
qx.Class.define("qx.dev.LeakDetector", {
  extend: qx.core.Object,

  construct() {
    super();
    this.__lookup = {};
    if (WeakRef === undefined) {
      console.warn(
        "LeakDetector: WeakRef not supported on this platform, qx.core.LeakDetector will not be able to track objects"
      );
      return;
    }
  },

  members: {
    /** @type<String,WeakRef<qx.core.Object>> Lookup by hash code of all objects */
    __lookup: null,

    /**
     * Collects statistics on currently alive objects, grouped by class name
     *
     * @returns {Object<String,Integer>} count of class instances, indexex by classname
     */
    getStaticsByClass() {
      let classes = {};
      for (let hash in this.__lookup) {
        let ref = this.__lookup[hash];
        let obj = ref.deref();
        if (obj) {
          let classname = obj.classname;
          if (!classes[classname]) {
            classes[classname] = 0;
          }
          classes[classname]++;
        } else {
          // Object has been GC'd, remove from lookup
          delete this.__lookup[hash];
        }
      }
      let arr = [];
      for (let key in classes) {
        arr.push({
          key: key,
          count: classes[key]
        });
      }
      return arr;
    },

    /**
     * Called when an object is constructed
     *
     * @param {qx.core.Object} obj
     */
    objectConstructed(obj) {
      if (WeakRef === undefined) {
        return;
      }
      let hash = obj.toHashCode();
      if (this.__lookup[hash]) {
        throw new Error("LeakDetector: Object already constructed?", obj);
      }
      this.__lookup[hash] = new WeakRef(obj);
    },

    /**
     * Called when an object is destructed
     *
     * @param {qx.core.Object} obj
     */
    objectDestructed(obj) {
      let hash = obj.toHashCode();
      if (this.__lookup[hash]) {
        delete this.__lookup[hash];
      }
    },

    /**
     * Called when an object is disposed
     *
     * @param {qx.core.Object} obj
     */
    objectDisposed(obj) {
      let hash = obj.toHashCode();
      if (this.__lookup[hash]) {
        delete this.__lookup[hash];
      }
    }
  },

  statics: {
    /** @type{qx.dev.LeakDetector} */
    __instance: null,

    /**
     *
     * @returns {qx.dev.LeakDetector} The singleton instance
     */
    getInstance() {
      if (this.__instance === null) {
        if (!qx.core.Environment.get("qx.dev.LeakDetector.enabled")) {
          console.warn(
            "LeakDetector singleton instance not available (recompile with 'qx.dev.LeakDetector.enabled' set to true to enable)"
          );
          return null;
        } else {
          this.__instance = new qx.dev.LeakDetector();
        }
      }
      return this.__instance;
    }
  },

  environment: {
    "qx.dev.LeakDetector.enabled": false
  }
});
