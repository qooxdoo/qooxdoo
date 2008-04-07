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

/**
 * Connects the widgets to the browser DOM events.
 */
qx.Class.define("qx.ui.core.EventHandler",
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
    /** {Map} Events which are supported */
    __supported :
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
      losecapture : 1,

      // focus events
      focusin : 1,
      focusout : 1,
      focus : 1,
      blur : 1,
      beforeactivate : 1,
      beforedeactivate : 1,
      activate : 1,
      deactivate : 1
    },


    // interface implementation
    canHandleEvent : function(target, type)
    {
      if (!(target instanceof qx.ui.core.Widget)) {
        return false;
      }

      return !!this.__supported[type];
    },


    /**
     * Dispatches a DOM event on a widget.
     *
     * @param event {qx.event.type.Event} The event object to dispatch.
     */
    _dispatchEvent : function(domEvent)
    {
      // EVENT TARGET
      var domTarget = domEvent.getTarget();
      var widgetTarget = qx.ui.core.Widget.getWidgetByElement(domTarget);
      if (!widgetTarget) {
        return;
      }

      widgetTarget = widgetTarget.getEventTarget();
      if (!widgetTarget) {
        return;
      }


      // EVENT RELATED TARGET
      if (domEvent.getRelatedTarget)
      {
        var domRelatedTarget = domEvent.getRelatedTarget();
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


      // EVENT CURRENT TARGET
      var currentTarget = domEvent.getCurrentTarget();

      var currentWidget = qx.ui.core.Widget.getWidgetByElement(currentTarget);
      if (!currentWidget || currentWidget.getAnonymous()) {
        return;
      }

      // Ignore all events except "mouseover" and "mouseout" in the disabled state.
      var type = domEvent.getType();
      if (!(currentWidget.isEnabled() || type === "mouseover" || type === "mouseout")) {
        return;
      }



      // PROCESS LISTENERS

      // Load listeners
      var capture = domEvent.getEventPhase() == qx.event.type.Event.CAPTURING_PHASE;
      var listeners = this.__manager.getListeners(currentWidget, type, capture);
      if (!listeners) {
        return;
      }

      // Create cloned event with correct target
      var widgetEvent = qx.event.Pool.getInstance().getObject(domEvent.constructor);
      domEvent.clone(widgetEvent);

      widgetEvent.setBubbles(false);
      widgetEvent.setTarget(widgetTarget);
      widgetEvent.setRelatedTarget(widgetRelatedTarget||null);
      widgetEvent.setCurrentTarget(widgetTarget);
      widgetEvent.setOriginalTarget(domTarget);

      // Dispatch it on all listeners
      for (var i=0, l=listeners.length; i<l; i++)
      {
        var context = listeners[i].context || currentWidget;
        listeners[i].handler.call(context, widgetEvent);
      }

      // Synchronize propagation property
      if (widgetEvent.getPropagationStopped()) {
        domEvent.stopPropagation();
      }

      // Release the event instance to the event pool
      qx.event.Pool.getInstance().poolObject(widgetEvent);
    },


    // interface implementation
    registerEvent : function(target, type, capture)
    {
      var elem = target.getContainerElement();

      if (type === "focus" || type === "blur") {
        elem = target.getFocusElement();
      }

      elem.addListener(type, this._dispatchEvent, this, capture);
    },


    // interface implementation
    unregisterEvent : function(target, type, capture)
    {
      var elem = target.getContainerElement();

      if (type === "focus" || type === "blur") {
        elem = target.getFocusElement();
      }

      elem.removeListener(type, this._dispatchEvent, this, capture);
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
