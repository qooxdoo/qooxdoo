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

************************************************************************ */

/**
 * Methods to cleanup fields from maps/objects.
 */
qx.Class.define("qx.util.DisposeUtil",
{
  statics :
  {
    /**
     * Disconnects given fields from instance.
     *
     * @param obj {Object} Object which contains the fields
     * @param arr {Array} List of fields to dispose
     * @return {void}
     */
    disposeFields : function(obj, arr)
    {
      var name;

      for (var i=0, l=arr.length; i<l; i++)
      {
        var name = arr[i]

        if (obj[name] == null || !obj.hasOwnProperty(name)) {
          continue;
        }

        obj[name] = null;
      }
    },


    /**
     * Disconnects and disposes given objects from instance.
     * Only works with qx.core.Object based objects e.g. Widgets.
     *
     * @param obj {Object} Object which contains the fields
     * @param arr {Array} List of fields (which store objects) to dispose
     * @return {void}
     */
    disposeObjects : function(obj, arr)
    {
      var name;
      for (var i=0, l=arr.length; i<l; i++)
      {
        name = arr[i];
        if (obj[name] == null || !obj.hasOwnProperty(name)) {
          continue;
        }

        if (!qx.core.ObjectRegistry.inShutDown)
        {
          if (obj[name].dispose) {
            obj[name].dispose();
          } else {
            throw new Error("Has no disposable object under key: " + name + "!");
          }
        }

        obj[name] = null;
      }
    },


    /**
     * Disposes all members of the given array and deletes
     * the field which refers to the array afterwards.
     *
     * @param obj {Object} Object which contains the field
     * @param field {String} Name of the field which refers to the array
     * @return {void}
     */
    disposeArray : function(obj, field)
    {
      var data = obj[field];
      if (!data) {
        return;
      }

      // Fast path for application shutdown
      if (qx.core.ObjectRegistry.inShutDown)
      {
        obj[field] = null;
        return;
      }

      // Dispose all content
      try
      {
        var entry;
        for (var i=data.length-1; i>=0; i--)
        {
          entry = data[i];
          if (entry) {
            entry.dispose();
          }
        }
      }
      catch(ex) {
        throw new Error("The array field: " + field + " of object: " + obj + " has non disposable entries: " + ex);
      }

      // Reduce array size to zero
      data.length = 0;

      // Finally remove field
      obj[field] = null;
    },


    /**
     * Disposes all members of the given map and deletes
     * the field which refers to the map afterwards.
     *
     * @param obj {Object} Object which contains the field
     * @param field {String} Name of the field which refers to the array
     * @return {void}
     */
    disposeMap : function(obj, field)
    {
      var data = obj[field];
      if (!data) {
        return;
      }

      // Fast path for application shutdown
      if (qx.core.ObjectRegistry.inShutDown)
      {
        obj[field] = null;
        return;
      }

      // Dispose all content
      try
      {
        for (var key in data)
        {
          if (data.hasOwnProperty(key)) {
            data[key].dispose();
          }
        }
      }
      catch(ex) {
        throw new Error("The map field: " + field + " of object: " + obj + " has non disposable entries: " + ex);
      }

      // Finally remove field
      obj[field] = null;
    }
  }
});
