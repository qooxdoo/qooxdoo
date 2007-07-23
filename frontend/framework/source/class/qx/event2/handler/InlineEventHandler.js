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
qx.Class.define("qx.event2.handler.InlineEventHandler",
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
    this.__registeredEvents = [];
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

    registerEvent : function(element, type)
    {
      var toHash = qx.core.Object.toHashCode;

      var elementId = toHash(element);
      var listener = qx.lang.Function.bind(this.__handleEvent, this, elementId);

      qx.event2.Manager.addNativeListener(element, type, listener);

      var id = toHash(element) + type;
      this.__registeredEvents[id] =
      {
        element : element,
        type : type,
        listener : listener
      };
    },


    unregisterEvent : function(element, type)
    {
      var toHash = qx.core.Object.toHashCode;
      var id = toHash(element) + type;

      var eventData = this.__registeredEvents[id];
      qx.event2.Manager.removeNativeListener(element, type, eventData.listener);

      delete(this.__registeredEvents[id]);
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
    __handleEvent : function(elementId, domEvent)
    {
      var event = qx.event2.type.Event.getInstance().init(domEvent);

      var eventData = this.__registeredEvents[elementId + event.getType()];
      var element = eventData ? eventData.element : event.getTarget();
      event.setCurrentTarget(element);

      this._callback.call(this._context, event);
    }

  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("__registeredEvents");
  }

});
