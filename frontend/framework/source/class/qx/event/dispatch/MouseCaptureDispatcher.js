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
 * Implementation of the Internet Explorer specific event capturing mode for
 * mouse events http://msdn2.microsoft.com/en-us/library/ms536742.aspx.
 *
 * This class is used internally by {@link qx.event.Manager} to do mouse event
 * capturing.
 */
qx.Class.define("qx.event.dispatch.MouseCaptureDispatcher",
{
  extend : qx.core.Object,
  implement : qx.event.dispatch.IEventDispatcher,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param win {Window} DOM window the capture handler will be responsible for.
   */
  construct : function(manager)
  {
    this.base(arguments);

    this.__manager = manager;
    this.__captureElement = null;
    this.__eventPool = qx.event.type.EventPool.getInstance();

    var win = manager.getWindow();
    manager.addListener(win, "blur", this.releaseCapture, this);
    manager.addListener(win, "focus", this.releaseCapture, this);
    manager.addListener(win, "scroll", this.releaseCapture, this);
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeFields("__captureElement", "__manager");
    this._disposeObjects("__eventPool");
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members:
  {
    __captureEvents :
    {
      "mouseup": 1,
      "mousedown": 1,
      "click": 1,
      "dblclick": 1,
      "mousemove": 1,
      "mouseout": 1,
      "mouseover": 1
    },


    /**
     * Whether the event should be captured.
     *
     * @param event {qx.event.type.Event} Event
     * @param type {String} the event type
     * @return {Boolean} whether the event should be captured.
     */
    canDispatchEvent : function(event, type) {
      return this.__captureElement && this.__captureEvents[type];
    },


    /**
     * Dispatch the event on the capturing node
     *
     * @param event {qx.event.type.Event} Event
     * @param type {String} the event type
     */
    dispatchEvent : function(event, type)
    {
      var listeners = this.__manager.registryGetListeners(this.__captureElement, type, false, false);

      if (listeners)
      {
        event.setCurrentTarget(this.__captureElement);
        event.setEventPhase(qx.event.type.Event.AT_TARGET);

        for (var i=0; i<listeners.length; i++) {
          var context = listeners[i].context || event.getCurrentTarget();
          listeners[i].handler.call(context, event);
        }
      }

      // TODO: What should this do? Why? Documentation missing.
      if (type == "click")
      {
        event.preventDefault();
        event.stopPropagation();

        this.releaseCapture();
      }
    },


    /**
     * Set the given element as target for event
     *
     * @param element {Element} The element which should capture the mouse evnets.
     */
    setCapture : function(element)
    {
      if (this.__captureElement != element) {
        this.releaseCapture();
      }

      // TODO: capture event? name? "gotcapture"?

      this.__captureElement = element;
    },


    /**
     * Stop capturing of mouse events.
     */
    releaseCapture : function()
    {
      if (this.__captureElement == null) {
        return;
      }

      // create synthetic losecapture event
      // TODO: Create custom events should work a lot simpler!!!
      // What's abot qx.event.Manager.createEvent() and qx.event.Manager.createAndDispatchEvent()
      var event = this.__eventPool.getEventInstance("qx.event.type.Event").init({});
      event.setType("losecapture");
      event.setTarget(this.__captureElement);

      this.__manager.dispatchEvent(event);
      this.__captureElement = null;

      // TODO: What's about a event function like
      // event.freeze() or event.pool(); 
      // Looks better IMHO
      this.__eventPool.poolEvent(event);
    }
  },



  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics)
  {
    var manager = qx.event.Manager;
    manager.registerEventDispatcher(statics, manager.PRIORITY_FIRST);
  }
});