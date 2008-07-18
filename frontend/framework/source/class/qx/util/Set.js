/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * A set is a collection of unordered objects, which are identified using
 * the object's hash code returned by {@link qx.core.ObjectRegistry#toHashCode}.
 *
 * Each object is only added once to the set.
 */
qx.Class.define("qx.util.Set",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // {Map} Internal storage of objects
    this.__objects = {};
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      USER API
    ---------------------------------------------------------------------------
    */

    /**
     * Add an object node
     *
     * @param obj {Element} Object to add
     * @return {Integer} Hash code of the object
     */
    add : function(obj)
    {
      // Check if already disposed
      var reg = this.__objects;
      if (!reg) {
        return;
      }

      var hash = qx.core.ObjectRegistry.toHashCode(obj);
      reg[hash] = obj;
      return hash;
    },


    /**
     * Remove the object from the registry
     *
     * @param obj {Object} Object to remove
     */
    remove : function(obj)
    {
      // Check if already disposed
      var reg = this.__objects;
      if (!reg) {
        return;
      }

      var hash = qx.core.ObjectRegistry.toHashCode(obj);
      delete reg[hash];
    },


    /**
     * Whether the given object is in the registry.
     *
     * @param obj {Object} Object to check
     */
    has : function(obj)
    {
      // Check if already disposed
      var reg = this.__objects;
      if (!reg) {
        return false;
      }

      var hash = qx.core.ObjectRegistry.toHashCode(obj);
      return reg[hash] !== undefined;
    },


    /**
     * TODOC
     *
     * @type member
     * @param obj {var} TODOC
     * @return {var} TODOC
     */
    get : function(obj)
    {
      // Check if already disposed
      var reg = this.__objects;
      if (!reg) {
        return null;
      }

      var hash = qx.core.ObjectRegistry.toHashCode(obj);
      return reg[hash];
    },


    /**
     * Get an object by its qooxdoo hash value. The object must be added
     * before using {@link #add}.
     *
     * @param hash {Integer} qooxdoo hash value of the object
     * @return {Object|undefined} The registered object or undefined if the
     *   object is not registered.
     */
    fromHashCode : function(hash)
    {
      // Check if already disposed
      var reg = this.__objects;
      if (!reg) {
        return null;
      }

      return reg[hash];
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getAll : function()
    {
      // Check if already disposed
      var reg = this.__objects;
      if (!reg) {
        return null;
      }

      return qx.lang.Object.getValues(reg);
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeMap("__objects");
  }
});
