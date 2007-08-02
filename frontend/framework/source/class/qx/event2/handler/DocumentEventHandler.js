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

************************************************************************ */

/**
 * This class is the default event handler for all bubbling events.
 *
 * @internal
 */
qx.Class.define("qx.event2.handler.DocumentEventHandler",
{
  extend : qx.event2.handler.AbstractEventHandler,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(manager)
  {
    this.base(arguments, manager);
    this.__handleEventWrapper = qx.lang.Function.bind(this.__handleEvent, this);
    this.__documentElement = manager.getWindow().document.documentElement;

    this.__typeListenerCount = {};
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_eventHandler", "__documentElement");
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
      EVENT HANDLER INTERFACE
    ---------------------------------------------------------------------------
    */

    canHandleEvent : function(element, type) {
      return true;
    },


    registerEvent : function(element, type) {
      if (!this.__typeListenerCount[type])
      {
        this.__typeListenerCount[type] = 1;
        this._managedAddNativeListener(this._documentElement, type, this._eventHandler);
      }
      else
      {
        this.__typeListenerCount += 1;
      }
    },


    unregisterEvent : function(element, type)
    {
      if (!this.__typeListenerCount[type]) {
        return;
      }

      this.__typeListenerCount[type] -= 1;
      if (this.__typeListenerCount[type] == 0)
      {
        this._managedRemoveNativeListener(this._documentElement, type, this._eventHandler);
        delete(this.__typeListenerCount[type]);
      }
    },



    /*
    ---------------------------------------------------------------------------
      EVENT-HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Default event handler.
     *
     * @param domEvent {Event} DOM event
     */
    __handleEvent : function(domEvent)
    {
      var event = this._eventPool.getEventInstance("qx.event2.type.Event").init(domEvent);
      this._manager.dispatchEvent(event);
      this._eventPool.release(event);
    }
  },



  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics)
  {
    var manager = qx.event2.Manager;
    manager.registerEventHandler(statics, manager.PRIORITY_LAST);
  }

});
