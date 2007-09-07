/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(event2)

************************************************************************ */

/**
 * Mouse event object.
 *
 * the interface of this class is based on the DOM Level 2 mouse event
 * interface: http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-eventgroupings-mouseevents
 */
qx.Class.define("qx.event.type.MouseEvent",
{
  extend : qx.event.type.DomEvent,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __buttons : qx.core.Variant.select("qx.client",
    {
      "mshtml" :
      {
        1: "left",
        2: "right",
        4: "middle"
      },

      "default" :
      {
        0: "left",
        2: "right",
        1: "middle"
      }
    }),


    /**
     * During mouse events caused by the depression or release of a mouse button,
     * this method can be used to check which mouse button changed state.
     *
     * @return {String} One of "left", "right", "middle" or "none"
     */
    getButton : function()
    {
      switch (this.getType())
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
    isLeftButtonPressed : function() {
      return this.getButton() === "left";
    },


    /**
     * Whether the middle button is pressed
     *
     * @return {Boolean} true when the middle button is pressed
     */
    isMiddleButtonPressed : function() {
      return this.getButton() === "middle";
    },


    /**
     * Whether the right button is pressed
     *
     * @return {Boolean} true when the right button is pressed
     */
    isRightButtonPressed : function() {
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
    getRelatedTarget : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function() {
        return this._native.fromElement;
      },

      "default" : function() {
        return this._native.relatedTarget;
      }
    }),


    /**
     * Get the he horizontal coordinate at which the event occurred relative
     * to the viewport.
     *
     * @return {Integer} The horizontal mouse position
     * @signature function()
     */
    getViewportLeft : qx.core.Variant.select("qx.client",
    {
      "mshtml|gecko" : function() {
        return this._native.clientX;
      },

      "default" : function()
      {
        var win = qx.dom.Node.getWindow(this.getTarget());
        return this._native.clientX + qx.bom.Viewport.getScrollLeft(win);
      }
    }),


    /**
     * Get the vertical coordinate at which the event occurred relative
     * to the viewport.
     *
     * @return {Integer} The vertical mouse position
     * @signature function()
     */
    getViewportTop : qx.core.Variant.select("qx.client",
    {
      "mshtml|gecko" : function() {
        return this._native.clientY;
      },

      "default" : function()
      {
        var win = qx.dom.Node.getWindow(this.getTarget());
        return this._native.clientY + qx.bom.Viewport.getScrollTop(win);
      }
    }),


    /**
     * Get the horizontal position at which the event occured relative to the
     * left of the document.
     *
     * @type member
     * @return {Integer} The horizontal mouse position in the document.
     * @signature function()
     */
    getDocumentLeft : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        var doc = qx.dom.Node.getDocument(this.getTarget());
        return this._native.clientX + qx.bom.Viewport.getScrollLeft(doc);
      },

      "gecko" : function() {
        return this._native.pageX;
      },

      "default": function() {
        return this._native.clientX;
      }
    }),


    /**
     * Get the vertical position at which the event occured relative to the
     * top of the document.
     *
     * @type member
     * @return {Integer} The vertical mouse position in the document.
     * @signature function()
     */
    getDocumentTop : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        var doc = qx.dom.Node.getDocument(this.getTarget());
        return this._native.clientY + qx.bom.Viewport.getScrollTop(doc);
      },

      "gecko" : function() {
        return this._native.pageY;
      },

      "default": function() {
        return this._native.clientY;
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
        return this._native.wheelDelta / 120;
      },

      "gecko" : function() {
        return -(this._native.detail / 3);
      }
    })
  }
});
