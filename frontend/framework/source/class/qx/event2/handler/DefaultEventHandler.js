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
qx.Class.define("qx.event2.handler.DefaultEventHandler",
{
  extend : qx.event2.handler.AbstractEventHandler,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(eventCallBack, manager)
  {
    this.base(arguments, eventCallBack);
    this._eventHandler = qx.lang.Function.bind(this.__handleEvent, this);
    this._manager = manager;
  },

  members :
  {

    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER INTERFACE
    ---------------------------------------------------------------------------
    */

    canHandleEvent : function(type) {
      return true;
    },


    registerEvent : function(element, type)
    {
      qx.event2.Manager.nativeAddEventListener(
        element,
        type,
        this._eventHandler
      );
    },


    unregisterEvent : function(element, type)
    {
      var documentId = qx.core.Object.toHashCode(element);
      if (!this._manager.__getDocumentHasListeners(documentId)) {
        qx.event2.Manager.nativeRemoveEventListener(
          element,
          type,
          this._eventHandler
        );
      }
    },


    removeAllListenersFromDocument : function(documentElement)
    {
      var documentId = qx.core.Object.toHashCode(documentElement);

      var reg = this._manager.getDocumentRegistry();

      for (var type in reg[documentId])
      {
        qx.event2.Manager.nativeRemoveEventListener(
          documentElement,
          type,
          this._eventHandler
        );
      }
      delete(reg[documentId]);
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
    __handleEvent : function(domEvent) {
      var event = qx.event2.type.Event.getInstance(domEvent);
      this._callback(event);
    }

  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this.disposeFields(
      "__documentEventHandler"
    );
  }
});
