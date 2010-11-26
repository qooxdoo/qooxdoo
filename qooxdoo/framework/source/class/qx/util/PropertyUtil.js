/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * A helper class for accessing the property system directly.
 *
 * This class is rather to be used internally. For all regular usage of the
 * property system the default API should be sufficient.
 */
qx.Class.define("qx.util.PropertyUtil",
{
  statics :
  {
    /**
     * Get the property map of the given class
     *
     * @param clazz {Class} a qooxdoo class
     * @return {Map} A properties map as defined in {@link qx.Class#define}
     *   including the properties of included mixins and not including refined
     *   properties.
     */
    getProperties : function(clazz) {
      return clazz.$$properties;
    },


    /**
     * Get the property map of the given class including the properties of all
     * superclasses!
     *
     * @param clazz {Class} a qooxdoo class
     * @return {Map} The properties map as defined in {@link qx.Class#define}
     *   including the properties of included mixins of the current class and
     *   all superclasses.
     */
    getAllProperties : function(clazz)
    {

      var properties = {};
      var superclass = clazz;
      // go threw the class hierarchy
      while (superclass != qx.core.Object) {
        var currentProperties = this.getProperties(superclass);
        for (var property in currentProperties) {
          properties[property] = currentProperties[property];
        }
        superclass = superclass.superclass;
      }
      return properties;
    },



    /*
    -------------------------------------------------------------------------
      USER VALUES
    -------------------------------------------------------------------------
    */

    /**
     * Returns the user value of the given property
     *
     * @param object {Object} The object to access
     * @param propertyName {String} The name of the property
     * @return {var} The user value
     */
    getUserValue : function(object, propertyName) {
      return object["$$user_" + propertyName];
    },

    /**
    * Sets the user value of the given property
    *
    * @param object {Object} The object to access
    * @param propertyName {String} The name of the property
    * @param value {var} The value to set
    * @return {void}
    */
    setUserValue : function(object, propertyName, value) {
      object["$$user_" + propertyName] = value;
    },

    /**
    * Deletes the user value of the given property
    *
    * @param object {Object} The object to access
    * @param propertyName {String} The name of the property
    * @return {void}
    */
    deleteUserValue : function(object, propertyName) {
      delete(object["$$user_" + propertyName]);
    },


    /*
    -------------------------------------------------------------------------
      INIT VALUES
    -------------------------------------------------------------------------
    */

    /**
     * Returns the init value of the given property
     *
     * @param object {Object} The object to access
     * @param propertyName {String} The name of the property
     * @return {var} The init value
     */
    getInitValue : function(object, propertyName) {
      return object["$$init_" + propertyName];
    },

    /**
    * Sets the init value of the given property
    *
    * @param object {Object} The object to access
    * @param propertyName {String} The name of the property
    * @param value {var} The value to set
    * @return {void}
    */
    setInitValue : function(object, propertyName, value) {
      object["$$init_" + propertyName] = value;
    },

    /**
    * Deletes the init value of the given property
    *
    * @param object {Object} The object to access
    * @param propertyName {String} The name of the property
    * @return {void}
    */
    deleteInitValue : function(object, propertyName) {
      delete(object["$$init_" + propertyName]);
    },


    /*
    -------------------------------------------------------------------------
      THEME VALUES
    -------------------------------------------------------------------------
    */

    /**
     * Returns the theme value of the given property
     *
     * @param object {Object} The object to access
     * @param propertyName {String} The name of the property
     * @return {var} The theme value
     */
    getThemeValue : function(object, propertyName) {
      return object["$$theme_" + propertyName];
    },

    /**
    * Sets the theme value of the given property
    *
    * @param object {Object} The object to access
    * @param propertyName {String} The name of the property
    * @param value {var} The value to set
    * @return {void}
    */
    setThemeValue : function(object, propertyName, value) {
      object["$$theme_" + propertyName] = value;
    },

    /**
    * Deletes the theme value of the given property
    *
    * @param object {Object} The object to access
    * @param propertyName {String} The name of the property
    * @return {void}
    */
    deleteThemeValue : function(object, propertyName) {
      delete(object["$$theme_" + propertyName]);
    },


    /*
    -------------------------------------------------------------------------
      THEMED PROPERTY
    -------------------------------------------------------------------------
    */

    /**
     * Sets a themed property
     *
     * @param object {Object} The object to access
     * @param propertyName {String} The name of the property
    * @param value {var} The value to set
     * @return {void}
     */
    setThemed : function(object, propertyName, value)
    {
      var styler = qx.core.Property.$$method.setThemed;
      object[styler[propertyName]](value);
    },

    /**
    * Resets a themed property
    *
    * @param object {Object} The object to access
    * @param propertyName {String} The name of the property
    * @return {void}
    */
    resetThemed : function(object, propertyName)
    {
      var unstyler = qx.core.Property.$$method.resetThemed;
      object[unstyler[propertyName]]();
    }
  }
});