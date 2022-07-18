/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2022 Derrell Lipman

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

qx.Bootstrap.define(
  "qx.core.propertystorage.Default",
  {
    type : "static",

    /*
     * This class must implement the
     * qx.core.propertystorage.IStorage... yet an Interface is not
     * allowed to require static functions. Assume that inteface
     * represents the requirements here, but don't actually
     * "implement" it.
     *
     * implement : [ qx.core.propertystorage.IStorage ],
     */

    statics :
    {
      init(propertyName, property, clazz)
      {
        // Create the storage for this property's current value
        Object.defineProperty(
          clazz.prototype,
          propertyName,
          {
            value        : property.init,
            writable     : true, // must be true for possible initFunction
            configurable : false,
            enumerable   : false
          });
      },

      get(prop)
      {
        return this[prop];
      },

      set(prop, value)
      {
        this[prop] = value;
      },

      dereference(prop, property)
      {
        // Called immediately after the destructor, if the
        // property has `dereference : true`.
        delete this[prop];
      }
    }
  });
