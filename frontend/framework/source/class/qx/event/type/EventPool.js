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

/* ************************************************************************

#module(event2)

************************************************************************ */

/**
 * Central instance pool for event objects. All event objects dispatched by the
 * event loader are pooled using this class.
 *
 * TODO: Wrong location. Better move this one level up to "qx.event.Pool"
 */
qx.Class.define("qx.event.type.EventPool",
{
  extend : qx.core.Object,
  type : "singleton",



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);
    
    this._pool = new qx.util.ObjectPool();
    this._pool.setPoolSize(5);
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("_pool");
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * This method finds and returns an instance of a requested type in the pool,
     * if there is one.  Note that the pool determines which instance (if any) to
     * return to the client.  The client cannot get a specific instance from the
     * pool.
     *
     * @param classname {String} The name of the Object type to return.
     * @return {Object} An instance of the requested type
     */
    getEventInstance : function(classname)
    {
      var event = this._pool.getObjectOfType(classname);
      if (!event) 
      {
        var clazz = qx.Class.getByName(classname);
        event = new clazz;
      }
      
      return event;
    },


    /**
     * This method places an Event in the pool.  Note that
     * once an instance has been pooled, there is no means to get that exact
     * instance back. The instance may be discarded for garbage collection if
     * the pool of its type is already full.
     *
     * It is assumed that no other references exist to this Object, and that it will
     * not be used at all while it is pooled.
     *
     * @param event {qx.bom.type.Event} An Event instance to pool.
     */
    poolEvent : function(event) {
      this._pool.poolObject(event);
    }
  }
});