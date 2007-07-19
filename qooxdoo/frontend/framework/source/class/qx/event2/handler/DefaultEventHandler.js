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
    this.base(arguments, eventCallBack, manager);

    this._eventHandler = qx.lang.Function.bind(this.__handleEvent, this);
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

    canHandleEvent : function(type) {
      return true;
    },

    registerEvent : function(element, type) {
      qx.event2.Manager.addNativeListener(element, type, this._eventHandler);
    },

    unregisterEvent : function(element, type)
    {
      var documentId = qx.core.Object.toHashCode(element);
      if (!this._manager.getHasListeners(documentId)) {
        qx.event2.Manager.removeNativeListener(element, type, this._eventHandler);
      }
    },

    removeAllListenersFromDocument : function(documentElement)
    {
      var documentId = qx.core.Object.toHashCode(documentElement);
      var reg = this._manager.getRegistry();

      for (var type in reg[documentId]) {
        qx.event2.Manager.removeNativeListener(documentElement, type, this._eventHandler);
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
    __handleEvent : function(domEvent)
    {
      var event = qx.event2.type.Event.getInstance().init(domEvent);
      this._callback.call(this._manager, event);
    },



    /*
    ---------------------------------------------------------------------------
      HELPER METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Check whether event listeners are registered at the document element
     * for the given type.
     *
     * @param documentId {Integer} qooxdoo hash value of the document to check
     * @param type {String} The type to check
     * @return {Boolean} Whether event listeners are registered at the document
     *     element for the given type.
     */
    __getDocumentHasListeners : function(documentId, type)
    {
      var reg = this._manager.getRegistry();
      return qx.lang.Object.isEmpty(reg[documentId][type]);
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_eventHandler");
  }

});
