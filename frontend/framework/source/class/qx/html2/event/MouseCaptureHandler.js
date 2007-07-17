 /**
  * Implementation of the Internet Explorer specific event capturing mode for
  * mouse events http://msdn2.microsoft.com/en-us/library/ms536742.aspx.
  *
  * This class is used internally by {@link qx.html2.Event} to do mouse event
  * capturing.
  */
 qx.Class.define("qx.html2.event.MouseCaptureHandler",
 {

  extend : qx.core.Object,


  /**
   * @param win {Window} DOM window the capture handler will be responsible for.
   */
  construct : function(win)
  {
    this.base(arguments);
    this._captureElement = null;
    qx.html2.Event.addListener(win, "blur", this.releaseCapture, this);
    qx.html2.Event.addListener(win, "focus", this.releaseCapture, this);
    qx.html2.Event.addListener(win, "scroll", this.releaseCapture, this);
  },


  members:
  {

    __captureEvents : {
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
     * @param event {qx.html2.event.Event} Event
     * @return {Boolean} whether the event should be captured.
     */
    shouldCaptureEvent : function(event)
    {
      return (
        this._captureElement &&
        this.__captureEvents[event.getType()]
      )
    },


    /**
     * Dispatch the event on the capturing node
     *
     * @param event {qx.html2.event.Event} Event
     */
    doCaptureEvent : function(event)
    {
      var elementData = qx.html2.Event.getInstance().getDocumentElementData(this._captureElement, event.getType());
      if (elementData)
      {
        event.setCurrentTarget(this._captureElement);
        event.setEventPhase(qx.html2.event.Event.AT_TARGET);

        var listeners = elementData.bubbleListeners;
        for (var i=0; i<listeners.length; i++) {
          listeners[i](event);
        }
      }

      if (event.getType() == "click") {
        event.preventDefault();
        event.stopPropagation();
        this.releaseCapture();
      }
    },


    /**
     * Set the given element as target for event
     */
    setCapture : function(element)
    {
      if (this._captureElement != element) {
        this.releaseCapture();
      }
      this._captureElement = element;
    },


    releaseCapture : function()
    {
      if (this._captureElement == null) {
        return;
      }

      // create synthetic losecapture event
      var event = qx.html2.event.Event.getInstance({});
      event.setType("losecapture");
      event.setTarget(this._captureElement);

      qx.html2.Event.getInstance().dispatchEvent(event);
      this._captureElement = null;
    }

  }
 });