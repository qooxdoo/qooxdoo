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
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * Central instance pool for event objects. All event objects dispatched by the
 * event loader are pooled using this class.
 */
qx.Class.define("qx.event.Pool",
{
  extend : qx.util.ObjectPool,
  type : "singleton",



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    this.base(arguments, 30);
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /** {Map} Contains information about legacy events which should not be pooled */
    __filter :
    {
      "qx.legacy.event.type.DragEvent" : 1,
      "qx.legacy.event.type.MouseEvent" : 1,
      "qx.legacy.event.type.KeyEvent" : 1
    },


    /**
     * This method places an Object in a pool of Objects of its type. Note that
     * once an instance has been pooled, there is no means to get that exact
     * instance back. The instance may be discarded for garbage collection if
     * the pool of its type is already full.
     *
     * It is assumed that no other references exist to this Object, and that it will
     * not be used at all while it is pooled.
     *
     * @param obj {Object} An Object instance to pool.
     */
    poolObject : function(obj)
    {
      // Filter legacy events
      if (this.__filter[obj.classname]) {
        return;
      }

      this.base(arguments, obj);
    }
  }
});
