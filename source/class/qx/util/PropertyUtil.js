/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * A helper class for accessing the property system directly.
 *
 * This class is rather to be used internally. For all regular usage of the
 * property system the default API should be sufficient.
 *
 * Prior to v8, this class included methods to get/set the user, theme, and init values
 * of properties independently - this methods circumvented the normal operation of the
 * property mechanism.  It could be argued that the `get` methods are alloweed, and
 * in some cases can be replicated via the property system, but their meaning was different,
 * ie even `getUserValue` would not return the value of the property, but the value set
 * by a user and not overridden by a theme.  For this reason, the `get` methods are not
 * truely compatible and anyone using those methods should think again about exactly what
 * they are trying to achieve, and probably revise their process.
 *
 * As it stands, any use of this class needs to be reviewed from v8 onwards because the
 * `getProperties`/`getAllProperties` methods return instances of `qx.core.property.Property`
 * and not the old POJO.
 */
qx.Class.define("qx.util.PropertyUtil", {
  statics: {
    /**
     * Get the property map of the given class
     *
     * @param clazz {qx.Class|qx.core.Object} a qooxdoo class
     * @return {Object<String,qx.core.property.Property>} A properties map as defined in {@link qx.Class#define}
     *   including the properties of included mixins and not including refined
     *   properties.
     */
    getProperties(clazz) {
      if (clazz instanceof qx.core.Object) {
        clazz = clazz.constructor;
      }
      return clazz.prototype.$$properties;
    },

    /**
     * Get the property map of the given class including the properties of all
     * superclasses
     *
     * @param clazz {qx.Class|qx.core.Object} a qooxdoo class
     * @return {Object<String,qx.core.property.Property>} The properties map as defined in {@link qx.Class#define}
     *   including the properties of included mixins of the current class and
     *   all superclasses.
     */
    getAllProperties(clazz) {
      if (clazz instanceof qx.core.Object) {
        clazz = clazz.constructor;
      }
      return clazz.prototype.$$allProperties;
    },

    /**
     * Returns the property object for a givemn property
     *
     * @param {qx.Class|qx.core.Object} clazz
     * @param {String} propertyName
     * @returns {qx.core.property.Property}
     */
    getProperty(clazz, propertyName) {
      if (clazz instanceof qx.core.Object) {
        clazz = clazz.constructor;
      }
      return clazz.prototype.$$allProperties[propertyName] || null;
    }
  }
});
