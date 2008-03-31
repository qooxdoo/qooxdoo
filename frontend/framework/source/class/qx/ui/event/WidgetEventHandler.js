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

/* ************************************************************************

#require(qx.ui.event.type.Mouse)
#require(qx.ui.event.type.KeySequence)
#require(qx.ui.event.type.KeyInput)
#require(qx.ui.event.type.Event)
#require(qx.ui.event.type.Data)

************************************************************************ */

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
    this.base(arguments);
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
    /** {Map} Event which are dispatched on the container element */
    __containerTarget :
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

      // mouse capture
      capture : 1,
      losecapture : 1
    },


    /** {Map} Event which are dispatched on the content element */
    __contentTarget :
    {

    },


    // interface implementation
    canHandleEvent : function(target, type)
    {
      if (!(target instanceof qx.ui.core.Widget)) {
        return false;
      }

      var ret = !!(this.__containerTarget[type] || this.__contentTarget[type]);
      return ret;
    },


    /**
     * Clone the given event and return a {@link qx.ui.event.type.Event} instance.
     *
     * @param target {Object} the current target
     * @param event {qx.event.type.Event} The event to clone.
     * @return {qx.ui.event.type.Event} The cloned event.
     */
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
     * @param event {qx.event.type.Event} The event object to dispatch.
     */
    _dispatchEvent : function(event)
    {
      // EVENT TARGET
      var domTarget = event.getTarget();
      var widgetTarget = qx.ui.core.Widget.getWidgetByElement(domTarget);
      if (!widgetTarget) {
        return;
      }


      widgetTarget = widgetTarget.getEventTarget();
      if (!widgetTarget) {
        return;
      }


      // EVENT RELATED TARGET
      if (event.getRelatedTarget)
      {
        var domRelatedTarget = event.getRelatedTarget();
        var widgetRelatedTarget = qx.ui.core.Widget.getWidgetByElement(domRelatedTarget);

        if (widgetRelatedTarget)
        {
          widgetRelatedTarget = widgetRelatedTarget.getEventTarget();

          // If target and related target are identical ignore the event
          if (widgetRelatedTarget === widgetTarget) {
            return;
          }
        }
      }


      // PROCESSING EVENT
      var currentTarget = event.getCurrentTarget();

      var currentWidget = qx.ui.core.Widget.getWidgetByElement(currentTarget);
      if (!currentWidget) {
        return;
      }

      currentWidget = currentWidget.getEventTarget();
      if (!currentWidget) {
        return;
      }

      var capture = event.getEventPhase() == qx.event.type.Event.CAPTURING_PHASE;
      var type = event.getType();


      // Ignore all events except "mouseover" and "mouseout" in the disabled state.
      if (!currentWidget.isEnabled() && type !== "mouseover" && type !== "mouseout") {
        return;
      }

      // Load listeners
      var listeners = this.__manager.getListeners(currentWidget, type, capture);
      if (!listeners) {
        return;
      }

      // Create cloned event with correct target and dispatch it on all listeners
      var clone = this._cloneEvent(currentWidget, event);
      for (var i=0, l=listeners.length; i<l; i++)
      {
        var context = listeners[i].context || currentWidget;
        listeners[i].handler.call(context, clone);
      }

      // synchronize propagation property
      if (clone.getPropagationStopped()) {
        event.stopPropagation();
      }

      // Release the event instance to the event pool
      qx.event.Pool.getInstance().poolObject(clone);
    },


    // interface implementation
    // target = widget ;)
    registerEvent : function(target, type, capture)
    {
      // find responsible html element
      var eventTarget = this.__getEventTarget(target, type);
      eventTarget.addListener(type, this._dispatchEvent, this, capture);
    },


    // interface implementation
    // target = widget ;)
    unregisterEvent : function(target, type, capture)
    {
      // find responsible html element
      var eventTarget = this.__getEventTarget(target, type);
      eventTarget.removeListener(type, this._dispatchEvent, this, capture);
    },


    /**
     * Get the {@link qx.html.Element} target, to which the event handler must
     * be connected.
     *
     * @param widgetTarget {qx.ui.core.Widget} The widget event target
     * @param type {String} The event type
     * @return {qx.html.Element} The html element the event must be attached to.
     */
    __getEventTarget : function(widgetTarget, type)
    {
      if (this.__contentTarget[type]) {
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
    this._disposeFields("__manager");
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
