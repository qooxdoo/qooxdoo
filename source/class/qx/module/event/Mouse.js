/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * Normalization for native mouse events. For cross-device applications that
 * support both mouse and touchscreen interaction, consider using
 * <a href="#Pointer">Pointer</a> and/or Gesture events (e.g. <a href="Tap"></a>).
 *
 * @require(qx.module.Environment)
 * @require(qx.module.Event)
 *
 * @group (Event_Normalization)
 */
qx.Bootstrap.define("qx.module.event.Mouse", {
  statics :
  {
    /**
     * List of event types to be normalized
     */
    TYPES : ["click", "dblclick", "mousedown", "mouseup", "mouseover", "mousemove",
      "mouseout"],


    /**
     * List qx.module.event.Mouse methods to be attached to native mouse event
     * objects
     * @internal
     */
    BIND_METHODS : ["getButton", "getViewportLeft", "getViewportTop",
      "getDocumentLeft", "getDocumentTop", "getScreenLeft", "getScreenTop"],


    /**
     * Standard mouse button mapping
     */
    BUTTONS_DOM2 : {
      0 : "left",
      2 : "right",
      1 : "middle"
    },


    /**
     * Legacy Internet Explorer mouse button mapping
     */
    BUTTONS_MSHTML : {
      1 : "left",
      2 : "right",
      4 : "middle"
    },


    /**
     * Returns the identifier of the mouse button that change state when the
     * event was triggered
     *
     * @return {String} One of <code>left</code>, <code>right</code> or
     * <code>middle</code>
     */
    getButton : function()
    {
      switch(this.type)
      {
        case "contextmenu":
          return "right";

        case "click":
          // IE does not support buttons on click --> assume left button
          if (qxWeb.env.get("browser.name") === "ie" &&
            qxWeb.env.get("browser.documentmode") < 9)
          {
            return "left";
          }

        default:
          if (this.target !== undefined) {
            return qx.module.event.Mouse.BUTTONS_DOM2[this.button] || "none";
          } else {
            return qx.module.event.Mouse.BUTTONS_MSHTML[this.button] || "none";
          }
      }
    },


    /**
     * Get the horizontal coordinate at which the event occurred relative
     * to the viewport.
     *
     * @return {Number} The horizontal mouse position
     */
    getViewportLeft : function() {
      return this.clientX;
    },


    /**
     * Get the vertical coordinate at which the event occurred relative
     * to the viewport.
     *
     * @return {Number} The vertical mouse position
     * @signature function()
     */
    getViewportTop : function() {
      return this.clientY;
    },


    /**
     * Get the horizontal position at which the event occurred relative to the
     * left of the document. This property takes into account any scrolling of
     * the page.
     *
     * @return {Number} The horizontal mouse position in the document.
     */
    getDocumentLeft : function()
    {
      if (this.pageX !== undefined) {
        return this.pageX;
      } else {
        var win = qx.dom.Node.getWindow(this.srcElement);
        return this.clientX + qx.bom.Viewport.getScrollLeft(win);
      }
    },


    /**
     * Get the vertical position at which the event occurred relative to the
     * top of the document. This property takes into account any scrolling of
     * the page.
     *
     * @return {Number} The vertical mouse position in the document.
     */
    getDocumentTop : function()
    {
      if (this.pageY !== undefined) {
        return this.pageY;
      } else {
        var win = qx.dom.Node.getWindow(this.srcElement);
        return this.clientY + qx.bom.Viewport.getScrollTop(win);
      }
    },


    /**
     * Get the horizontal coordinate at which the event occurred relative to
     * the origin of the screen coordinate system.
     *
     * Note: This value is usually not very useful unless you want to
     * position a native popup window at this coordinate.
     *
     * @return {Number} The horizontal mouse position on the screen.
     */
    getScreenLeft : function() {
      return this.screenX;
    },


    /**
     * Get the vertical coordinate at which the event occurred relative to
     * the origin of the screen coordinate system.
     *
     * Note: This value is usually not very useful unless you want to
     * position a native popup window at this coordinate.
     *
     * @return {Number} The vertical mouse position on the screen.
     */
    getScreenTop : function() {
      return this.screenY;
    },


    /**
     * Manipulates the native event object, adding methods if they're not
     * already present
     *
     * @param event {Event} Native event object
     * @param element {Element} DOM element the listener was attached to
     * @return {Event} Normalized event object
     * @internal
     */
    normalize : function(event, element)
    {
      if (!event) {
        return event;
      }
      var bindMethods = qx.module.event.Mouse.BIND_METHODS;
      for (var i=0, l=bindMethods.length; i<l; i++) {
        if (typeof event[bindMethods[i]] != "function") {
          event[bindMethods[i]] = qx.module.event.Mouse[bindMethods[i]].bind(event);
        }
      }

      return event;
    }
  },

  defer : function(statics) {
    qxWeb.$registerEventNormalization(qx.module.event.Mouse.TYPES, statics.normalize);
  }
});
