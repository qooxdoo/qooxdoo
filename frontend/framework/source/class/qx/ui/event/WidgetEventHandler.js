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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/*
#require(qx.ui.event.type.Mouse)
#require(qx.ui.event.type.KeySequence)
#require(qx.ui.event.type.KeyInput)
#require(qx.ui.event.type.Event)
#require(qx.ui.event.type.Data)
*/

/**
 * The WidgetEventHandler connects the widgets to the browser DOM events.
 */
qx.Class.define("qx.ui.event.WidgetEventHandler",
{
  extend : qx.core.Object,
  implement : qx.event.IEventHandler,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.__eventHandler = {};
    this.__manager = qx.event.Registration.getManager();
  },



  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {Integer} Priority of this handler */
    PRIORITY : qx.event.Registration.PRIORITY_FIRST
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /** {Map} Event which are dispatched on the container/content element */
    __eventTarget :
    {
      container :
      {
        // mouse events
        mousemove : 1,
        mouseover : 1,
        mouseout : 1,
        mousedown : 1,
        mouseup : 1,
        click : 1,
        dblclick : 1,
        contextmenu : 1,
        mousewheel : 1,

        // key events
        keyup : 1,
        keydown : 1,
        keypress : 1,
        keyinput : 1,

        // focus events (do bubble)
        focusin : 1,
        focusout : 1,
        beforedeactivate : 1,
        beforeactivate : 1,
        activate : 1,
        deactivate : 1,

        // mouse capture
        capture : 1,
        losecapture : 1
      },

      content :
      {
        // focus, blur events (do not bubble)
        focus : 1,
        blur : 1,

        // all elements
        select : 1,

        // iframe elements
        load : 1
      }
    },


    // interface implementation
    canHandleEvent : function(target, type)
    {
      return (
        target instanceof qx.ui.core.Widget &&
        (this.__eventTarget.container[type] || this.__eventTarget.content[type])
      )
    },


    _cloneEvent : function(target, event)
    {
      // TODO: Optimize this to a name map (dom type => widget type)
      var widgetEventClass = qx.Class.getByName("qx.ui.event.type." + event.basename);
      var clone = qx.event.Pool.getInstance().getObject(widgetEventClass);

      event.clone(clone);
      clone.setBubbles(false);
      clone.setCurrentTarget(target);

      return clone;
    },


    /**
     * Dispatches a DOM event on a widget.
     *
     * @param target {qx.ui.core.Widget} The widget event target
     * @param event {qx.event.type.Event} The event object to dispatch.
     */
    _dispatchEvent : function(target, event)
    {
      if (!target.isEnabled()) {
        return;
      }

      var capture = event.getEventPhase() == qx.event.type.Event.CAPTURING_PHASE;
      var type = event.getType();
      var listeners = this.__manager.getListeners(target, type, capture);

      if (!listeners) {
        return;
      }

      var clone = this._cloneEvent(target, event);

      for (var i=0, l=listeners.length; i<l; i++)
      {
        var context = listeners[i].context || target;
        listeners[i].handler.call(context, clone);
      }

      if (clone.getPropagationStopped()) {
        event.stopPropagation();
      }

      // Release the event instance to the event pool
      qx.event.Pool.getInstance().poolObject(clone);
    },


    // interface implementation
    registerEvent : function(target, type, capture)
    {
      var eventTarget = this.__getEventTarget(target, type);

      var eventHandler = qx.lang.Function.bind(this._dispatchEvent, this, target);
      this.__eventHandler[target.$$hash] = eventHandler;

      eventTarget.addListener(type, eventHandler, this, capture);
    },


    // interface implementation
    unregisterEvent : function(target, type, capture)
    {
      var eventTarget = this.__getEventTarget(target, type);
      var eventHandler = this.__eventHandler[target.$$hash];

      if (eventHandler && eventTarget.hasListeners(type, eventHandler, this, capture))
      {
        eventTarget.removeListener(type, eventHandler, this, capture);
        delete this.__eventHandler[target.$$hash]
      }
    },


    /**
     * Get the {@link qx.html.Element} target, to which the event handler must
     * be connected.
     *
     * @param target {qx.ui.core.Widget} The widget event target
     * @param type {String} The event type
     * @return {qx.html.Element} The html element the event must be attached to.
     */
    __getEventTarget : function(widgetTarget, type)
    {
      if (this.__eventTarget.content[type]) {
        return widgetTarget.getContentElement();
      } else {
        return widgetTarget.getContainerElement();
      }
    }
  },





  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("__eventHandler", "__manager");
  },





  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    qx.event.Registration.addHandler(statics);
  }
});
