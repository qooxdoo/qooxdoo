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

 /**
  * Implementation of the Internet Explorer specific event capturing mode for
  * mouse events http://msdn2.microsoft.com/en-us/library/ms536742.aspx.
  *
  * This class is used internally by {@link qx.event2.Manager} to do mouse event
  * capturing.
  */
 qx.Class.define("qx.event2.dispatch.MouseCaptureDispatcher",
 {
  extend : qx.core.Object,



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
    var win = manager.getWindow();

    this.__eventPool = qx.event2.type.EventPool.getInstance();

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
    this._disposeObjects("_eventPool");
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
     * @param event {qx.event2.type.Event} Event
     * @return {Boolean} whether the event should be captured.
     */
    canDispatchEvent : function(event) {
      return this.__captureElement && this.__captureEvents[event.getType()];
    },


    /**
     * Dispatch the event on the capturing node
     *
     * @param event {qx.event2.type.Event} Event
     */
    dispatchEvent : function(event)
    {
      var listeners = this.__manager.registryGetListeners(this.__captureElement, event.getType(), false, false);

      if (listeners)
      {
        event.setCurrentTarget(this.__captureElement);
        event.setEventPhase(qx.event2.type.Event.AT_TARGET);

        for (var i=0; i<listeners.length; i++) {
          var context = listeners[i].context || event.getCurrentTarget();
          listeners[i].handler.call(context, event);
        }
      }

      if (event.getType() == "click")
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

      // TODO: capture event?

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
      var event = this.__eventPool.getEventInstance("qx.event2.type.Event").init({});
      event.setType("losecapture");
      event.setTarget(this.__captureElement);

      this.__manager.dispatchEvent(event);
      this.__captureElement = null;

      this.__eventPool.release(event);
    }

  }

 });