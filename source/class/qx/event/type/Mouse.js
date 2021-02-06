/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * Mouse event object.
 *
 * the interface of this class is based on the DOM Level 2 mouse event
 * interface: http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-eventgroupings-mouseevents
 */
qx.Class.define("qx.event.type.Mouse",
{
  extend : qx.event.type.Dom,




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    _cloneNativeEvent : function(nativeEvent, clone)
    {
      var clone = this.base(arguments, nativeEvent, clone);
      // Fix for #9619 pointermove/mousemove events return wrong result in isLeftPressed()
      // button only valid in button events. Undefined otherwise.
      // see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
      switch(nativeEvent.type) {
        case "mousemove":
        case "mouseenter":
        case "mouseleave":
        case "mouseover":
        case "mouseout":
          clone.button = -1;
          break;
        default:
          clone.button = nativeEvent.button;
          break;
      }
      clone.buttons = nativeEvent.buttons;
      clone.clientX = Math.round(nativeEvent.clientX);
      clone.clientY = Math.round(nativeEvent.clientY);
      clone.pageX = nativeEvent.pageX ? Math.round(nativeEvent.pageX) : undefined;
      clone.pageY = nativeEvent.pageY ? Math.round(nativeEvent.pageY) : undefined;
      clone.screenX = Math.round(nativeEvent.screenX);
      clone.screenY = Math.round(nativeEvent.screenY);
      clone.wheelDelta = nativeEvent.wheelDelta;
      clone.wheelDeltaX = nativeEvent.wheelDeltaX;
      clone.wheelDeltaY = nativeEvent.wheelDeltaY;
      clone.delta = nativeEvent.delta;
      clone.deltaX = nativeEvent.deltaX;
      clone.deltaY = nativeEvent.deltaY;
      clone.deltaZ = nativeEvent.deltaZ;
      clone.detail = nativeEvent.detail;
      clone.axis = nativeEvent.axis;
      clone.wheelX = nativeEvent.wheelX;
      clone.wheelY = nativeEvent.wheelY;
      clone.HORIZONTAL_AXIS = nativeEvent.HORIZONTAL_AXIS;
      clone.srcElement = nativeEvent.srcElement;
      clone.target = nativeEvent.target;

      return clone;
    },


    /**
     * @type {Map} Contains the button ID to identifier data.
     *
     * @lint ignoreReferenceField(__buttonsDom2EventModel)
     */
    __buttonsDom2EventModel :
    {
      0 : "left",
      2 : "right",
      1 : "middle"
    },


    /**
     * @type {Map} Contains the button ID to identifier data.
     *
     * @lint ignoreReferenceField(__buttonsDom3EventModel)
     */
    __buttonsDom3EventModel :
    {
      0 : "none",
      1 : "left",
      2 : "right",
      4 : "middle"
    },


    /**
     * @type {Map} Contains the button ID to identifier data.
     *
     * @lint ignoreReferenceField(__buttonsMshtmlEventModel)
     */
    __buttonsMshtmlEventModel :
    {
      1 : "left",
      2 : "right",
      4 : "middle"
    },


    // overridden
    stop : function() {
      this.stopPropagation();
    },


    /**
     * During mouse events caused by the depression or release of a mouse button,
     * this method can be used to check which mouse button changed state.
     *
     * Only internet explorer can compute the button during mouse move events. For
     * all other browsers the button only contains sensible data during
     * "click" events like "click", "dblclick", "mousedown", "mouseup" or "contextmenu".
     *
     * But still, browsers act different on click:
     * <pre>
     * <- = left mouse button
     * -> = right mouse button
     * ^  = middle mouse button
     *
     * Browser | click, dblclick | contextmenu
     * ---------------------------------------
     * Firefox | <- ^ ->         | ->
     * Chrome  | <- ^            | ->
     * Safari  | <- ^            | ->
     * IE      | <- (^ is <-)    | ->
     * Opera   | <-              | -> (twice)
     * </pre>
     *
     * @return {String} One of "left", "right", "middle" or "none"
     */
    getButton : function()
    {
      switch(this._type)
      {
        case "contextmenu":
          return "right";

        case "click":
          // IE does not support buttons on click --> assume left button
          if (qx.core.Environment.get("browser.name") === "ie" &&
          qx.core.Environment.get("browser.documentmode") < 9)
          {
            return "left";
          }

        default:
          if (!(qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") <= 8)) {
            // if the button value is -1, we should use the DOM level 3 .buttons attribute
            // the value -1 is only set for pointer events: http://msdn.microsoft.com/en-us/library/ie/ff974877(v=vs.85).aspx
            if (this._native.button === -1) {
              return this.__buttonsDom3EventModel[this._native.buttons] || "none";
            }
            return this.__buttonsDom2EventModel[this._native.button] || "none";
          } else {
            return this.__buttonsMshtmlEventModel[this._native.button] || "none";
          }
      }
    },


    /**
     * Whether the left button is pressed
     *
     * @return {Boolean} true when the left button is pressed
     */
    isLeftPressed : function() {
      return this.getButton() === "left";
    },


    /**
     * Whether the middle button is pressed
     *
     * @return {Boolean} true when the middle button is pressed
     */
    isMiddlePressed : function() {
      return this.getButton() === "middle";
    },


    /**
     * Whether the right button is pressed
     *
     * @return {Boolean} true when the right button is pressed
     */
    isRightPressed : function() {
      return this.getButton() === "right";
    },


    /**
     * Get a secondary event target related to an UI event. This attribute is
     * used with the mouseover event to indicate the event target which the
     * pointing device exited and with the mouseout event to indicate the
     * event target which the pointing device entered.
     *
     * @return {Element} The secondary event target.
     * @signature function()
     */
    getRelatedTarget : function() {
      return this._relatedTarget;
    },


    /**
     * Get the he horizontal coordinate at which the event occurred relative
     * to the viewport.
     *
     * @return {Integer} The horizontal mouse position
     */
    getViewportLeft : function() {
      return Math.round(this._native.clientX);
    },


    /**
     * Get the vertical coordinate at which the event occurred relative
     * to the viewport.
     *
     * @return {Integer} The vertical mouse position
     * @signature function()
     */
    getViewportTop : function() {
      return Math.round(this._native.clientY);
    },


    /**
     * Get the horizontal position at which the event occurred relative to the
     * left of the document. This property takes into account any scrolling of
     * the page.
     *
     * @return {Integer} The horizontal mouse position in the document.
     */
    getDocumentLeft : function()
    {
      if (this._native.pageX !== undefined) {
        return Math.round(this._native.pageX);
      } else if (this._native.srcElement) {
        var win = qx.dom.Node.getWindow(this._native.srcElement);
        return Math.round(this._native.clientX) + qx.bom.Viewport.getScrollLeft(win);
      } else {
        return Math.round(this._native.clientX) + qx.bom.Viewport.getScrollLeft(window);
      }
    },


    /**
     * Get the vertical position at which the event occurred relative to the
     * top of the document. This property takes into account any scrolling of
     * the page.
     *
     * @return {Integer} The vertical mouse position in the document.
     */
    getDocumentTop : function()
    {
      if (this._native.pageY !== undefined) {
        return Math.round(this._native.pageY);
      } else if (this._native.srcElement) {
        var win = qx.dom.Node.getWindow(this._native.srcElement);
        return Math.round(this._native.clientY) + qx.bom.Viewport.getScrollTop(win);
      } else {
        return Math.round(this._native.clientY) + qx.bom.Viewport.getScrollTop(window);
      }
    },


    /**
     * Get the horizontal coordinate at which the event occurred relative to
     * the origin of the screen coordinate system.
     *
     * Note: This value is usually not very useful unless you want to
     * position a native popup window at this coordinate.
     *
     * @return {Integer} The horizontal mouse position on the screen.
     */
    getScreenLeft : function() {
      return Math.round(this._native.screenX);
    },


    /**
     * Get the vertical coordinate at which the event occurred relative to
     * the origin of the screen coordinate system.
     *
     * Note: This value is usually not very useful unless you want to
     * position a native popup window at this coordinate.
     *
     * @return {Integer} The vertical mouse position on the screen.
     */
    getScreenTop : function() {
      return Math.round(this._native.screenY);
    }
  }
});
