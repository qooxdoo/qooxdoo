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

  construct : function(eventCallBack, manager)
  {
    this.base(arguments, eventCallBack, manager);
    this.__handleEventWrapper = qx.lang.Function.bind(this.__handleEvent, this);
    this.__documentElement = manager.getWindow().document.documentElement;
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
      this._managedAddNativeListener(this.__documentElement, type, this.__handleEventWrapper);
    },

    unregisterEvent : function(element, type) {
      this._managedRemoveNativeListener(this.__documentElement, type, this.__handleEventWrapper);
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
      this._callback.call(this._context, event);
      this._eventPool.release(event);
    }
  }
});
