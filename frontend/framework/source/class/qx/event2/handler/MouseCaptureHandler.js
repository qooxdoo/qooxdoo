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
 qx.Class.define("qx.event2.handler.MouseCaptureHandler",
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
  construct : function(manager, documentManager)
  {
    this.base(arguments);

    this._docManager = documentManager;
    this._manager = manager;

    this._captureElement = null;

    var win = manager.getWindow();

    manager.addListener(win, "blur", this.releaseCapture, this);
    manager.addListener(win, "focus", this.releaseCapture, this);
    manager.addListener(win, "scroll", this.releaseCapture, this);
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
    shouldCaptureEvent : function(event) {
      return this._captureElement && this.__captureEvents[event.getType()];
    },


    /**
     * Dispatch the event on the capturing node
     *
     * @param event {qx.event2.type.Event} Event
     */
    doCaptureEvent : function(event)
    {
      var elementData = this._docManager.getElementData(this._captureElement, event.getType());

      if (elementData)
      {
        event.setCurrentTarget(this._captureElement);
        event.setEventPhase(qx.event2.type.Event.AT_TARGET);

        var listeners = elementData.bubbleListeners;

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
      if (this._captureElement != element) {
        this.releaseCapture();
      }

      // TODO: capture event?

      this._captureElement = element;
    },


    /**
     * Stop capturing of mouse events.
     */
    releaseCapture : function()
    {
      if (this._captureElement == null) {
        return;
      }

      // create synthetic losecapture event
      var event = qx.event2.type.Event.getInstance().init({});
      event.setType("losecapture");
      event.setTarget(this._captureElement);

      this._manager.dispatchEvent(event);
      this._captureElement = null;
    }

  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_captureElement", "_docManager");
  }
 });