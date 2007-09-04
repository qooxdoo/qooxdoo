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
 * This class is the default event handler for all bubbling events.
 *
 * @internal
 */
qx.Class.define("qx.event.handler.DocumentEventHandler",
{
  extend : qx.event.handler.AbstractEventHandler,



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

  destruct : function()
  {
    this._disposeFields(
      "_eventHandler",
      "__documentElement",
      "__typeListenerCount"
    );
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

    // TODO: This is bad idea IMHO
    // We should not come with a default or the default must be the inline listener
    // to default to the document is ugly because this does not work out well
    // for most event types (which do not bubble etc.)
    canHandleEvent : function(target, type) {
      return true;
    },


    registerEvent : function(element, type)
    {
      if (!this.__typeListenerCount[type])
      {
        this.__typeListenerCount[type] = 1;
        this._managedAddNativeListener(this.__documentElement, type, this.__handleEventWrapper);
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
        this._managedRemoveNativeListener(this.__documentElement, type, this.__handleEventWrapper);
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
      var event = this._eventPool.getEventInstance("qx.event.type.Event").init(domEvent);

      this._manager.dispatchEvent(event);
      this._eventPool.poolEvent(event);
    }
  },



  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics)
  {
    //var manager = qx.event.Manager;
    //manager.registerEventHandler(statics, manager.PRIORITY_LAST);
  }
});
