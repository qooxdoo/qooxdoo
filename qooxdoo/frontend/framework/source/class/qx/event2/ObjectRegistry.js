/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Generic object registry.
 *
 * Stores a collection of generic JavaSctip objects into a registry.
 * The registered objects can be retrieved by their qooxdoo hash code
 * returned by {@link qx.core.Object.toHashCode}.
 */
qx.Class.define("qx.event2.ObjectRegistry",
{
  extend : qx.core.Object,

  construct : function() {
    this.__registry = {};
  },

  members :
  {

    /**
     * Get an object by its qooxdoo hash value. The object must be registered
     * before using {@link #registerElement}.
     *
     * @param hash {Integer} qooxdoo hash value of the object
     */
    getByHash : function(hash) {
      return this.__registry[hash];
    },


    /**
     * Register an object node
     *
     * @param obj {Element} Object to register
     * @return {Integer} Hash code of the object
     */
    register : function(obj) {
      var hash = qx.core.Object.toHashCode(obj);
      this.__registry[hash] = obj;
      return hash;
    },


    /**
     * Remove the object from the registry
     *
     * @param obj {Element} Object to remove
     */
    unregister : function(obj) {
      var hash = qx.core.Object.toHashCode(obj);
      delete(this.__registry[hash]);
    },


    /**
     * Whether the given object is in the registry.
     *
     * @param obj {Element} Object to check
     */
    has : function(obj) {
      var hash = qx.core.Object.toHashCode(obj);
      return this.__registry[hash] !== undefined;
    }

  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this.disposeFields("__registry");
  }

});