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
     * @type static
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
     * @type static
     * @param obj {Object} Object which contains the fields
     * @param arr {Array} List of fields (which store objects) to dispose
     * @return {void}
     */
    disposeObjects : function(obj, arr)
    {
      var name;

      for (var i=0, l=arr.length; i<l; i++)
      {
        var name = arr[i]

        if (obj[name] == null || !this.hasOwnProperty(name)) {
          continue;
        }

        obj[name].dispose();
        obj[name] = null;
      }
    },


    /**
     * Disposes all members of the given array and deletes
     * the field which refers to the array afterwards.
     *
     * @type static
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

      // Dispose all content
      for (var i=0, l=data.length; i<l; i++) {
        data[i].dispose();
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
     * @type static
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

      // Dispose all content
      for (var key in data)
      {
        if (data.hasOwnProperty(key)) {
          data[key].dispose();
        }
      }

      // Finally remove field
      obj[field] = null;
    }
  }
});
