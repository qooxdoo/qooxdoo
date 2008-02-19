/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (swerner)

************************************************************************ */

qx.Bootstrap.define("qx.core.ObjectRegistry",
{
  statics :
  {
    __registry : {},
    __nextHash : 0,

    register : function(obj)
    {
      var hash = obj.$$hash;
      if (hash == null) {
        hash = obj.$$hash = this.__nextHash++;
      }

      if (!obj.dispose) {
        throw new Error("Invalid object: " + obj);
      }

      this.__registry[hash] = obj;
    },

    unregister : function(obj)
    {
      var hash = obj.$$hash;
      if (hash == null) {
        return;
      }

      var registry = this.__registry;
      if (registry[hash]) {
        delete registry[hash];
      }
    },


    /**
     * Returns an unique identifier for the given object. If such an identifier
     * does not yet exist, create it.
     *
     * @type static
     * @param obj {Object} the Object to get the hashcode for
     * @return {Integer} unique identifier for the given object
     */
    toHashCode : function(obj)
    {
      if (obj.$$hash != null) {
        return obj.$$hash;
      }

      return obj.$$hash = this.__nextHash++;
    },


    /**
     * Get a object instance by its hash code as returned by {@link toHashCode}.
     * If the object is already disposed or the hashCode is invalid,
     * <code>null</code> is returned.
     *
     * @param hashCode {Integer} The object's hash code.
     * @return {qx.core.Object|null} The corresponding object or <code>null</code>.
     */
    fromHashCode : function(hash) {
      return this.__registry[hash] || null;
    }
  },

  defer : function(statics)
  {

  }
});
