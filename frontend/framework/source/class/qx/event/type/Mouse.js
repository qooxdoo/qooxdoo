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
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

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
    init : function(nativeEvent, target, relatedTarget, canBubble, cancelable)
    {
      this.base(arguments, nativeEvent, target, relatedTarget, canBubble, cancelable);

      if (!relatedTarget) {
        this._relatedTarget = qx.bom.Event.getRelatedTarget(nativeEvent);
      }

      return this;
    },


    /** {Map} Contains the button ID to identifier data. */
    __buttons : qx.core.Variant.select("qx.client",
    {
      "mshtml" :
      {
        1 : "left",
        2 : "right",
        4 : "middle"
      },

      "default" :
      {
        0 : "left",
        2 : "right",
        1 : "middle"
      }
    }),


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
     * @return {String} One of "left", "right", "middle" or "none"
     */
    getButton : function()
    {
      switch(this._type)
      {
        case "click":
        case "dblclick":
          return "left";

        case "contextmenu":
          return "right";

        default:
          return this.__buttons[this._native.button] || "none";
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
      return this._native.clientX;
    },


    /**
     * Get the vertical coordinate at which the event occurred relative
     * to the viewport.
     *
     * @return {Integer} The vertical mouse position
     * @signature function()
     */
    getViewportTop : function() {
      return this._native.clientY;
    },


    /**
     * Get the horizontal position at which the event occured relative to the
     * left of the document. This property takes into account any scrolling of
     * the page.
     *
     * @return {Integer} The horizontal mouse position in the document.
     * @signature function()
     */
    getDocumentLeft : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        var win = qx.dom.Node.getWindow(this._native.srcElement);
        return this._native.clientX + qx.bom.Viewport.getScrollLeft(win);
      },

      // opera, webkit and gecko
      "default" : function() {
        return this._native.pageX;
      }
    }),


    /**
     * Get the vertical position at which the event occured relative to the
     * top of the document. This property takes into account any scrolling of
     * the page.
     *
     * @return {Integer} The vertical mouse position in the document.
     * @signature function()
     */
    getDocumentTop : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        var win = qx.dom.Node.getWindow(this._native.srcElement);
        return this._native.clientY + qx.bom.Viewport.getScrollTop(win);
      },

      // opera, webkit and gecko
      "default" : function() {
        return this._native.pageY;
      }
    }),


    /**
     * Get the horizontal coordinate at which the event occurred relative to
     * the origin of the screen coordinate system.
     *
     * Note: This value is usually not very useful unless you want to
     * position a native popup window at this coordiante.
     *
     * @return {Integer} The horizontal mouse position on the screen.
     */
    getScreenLeft : function() {
      return this._native.screenX;
    },


    /**
     * Get the vertical coordinate at which the event occurred relative to
     * the origin of the screen coordinate system.
     *
     * Note: This value is usually not very useful unless you want to
     * position a native popup window at this coordiante.
     *
     * @return {Integer} The vertical mouse position on the screen.
     */
    getScreenTop : function() {
      return this._native.screenY;
    },


    /**
     * Get the amount the wheel has been scrolled
     *
     * @return {Integer} Scroll wheel movement
     */
    getWheelDelta : qx.core.Variant.select("qx.client",
    {
      "default" : function() {
        return -(this._native.wheelDelta / 40);
      },

      "gecko" : function() {
        return this._native.detail;
      }
    })
  }
});
