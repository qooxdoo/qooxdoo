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

/**
 * Mouse event object.
 *
 * the interface of this class is based on the DOM Level 2 mouse event
 * interface: http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-eventgroupings-mouseevents
 */
qx.Class.define("qx.event2.type.MouseEvent",
{
  extend : qx.event2.type.Event,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(domEvent)
  {
    this.base(arguments, domEvent);
  },



  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    C_BUTTON_LEFT : "left",
    C_BUTTON_MIDDLE : "middle",
    C_BUTTON_RIGHT : "right",
    C_BUTTON_NONE : "none",


    /**
     * Initialize a singleton instance with the given browser event object.
     *
     * @type static
     * @param domEvent {Event} DOM event
     * @return {qx.event2.type.MouseEvent} an initialized Event instance
     */
    getInstance : function(domEvent)
    {
      if (this.__instance == undefined) {
        this.__instance = new qx.event2.type.MouseEvent();
      }

      this.__instance.__initEvent(domEvent);
      return this.__instance;
    }

  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    __buttons : qx.core.Variant.select("qx.client",
    {
      "mshtml" : {
        1: "left",
        2: "right",
        4: "middle"
      },

      "default" : {
        0: "left",
        2: "right",
        1: "middle"
      }
    }),


    /**
     * During mouse events caused by the depression or release of a mouse button,
     * this method can be used to check which mouse button changed state.
     *
     * @return {String} One of "left", "right" or "middle"
     */
    getButton : function() {
      switch (this.getType())
      {
        case "click":
        case "dblclick":
          return "left";

        case "contextmenu":
          return "right";

        default:
          return this.__buttons[this._event.button];
      }
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
        return this._event.fromElement;
      },

      "default" : function() {
        return this._event.relatedTarget;
      }
    }),


    /**
     * Get the he horizontal coordinate at which the event occurred relative
     * to the DOM implementation's client area.
     *
     * @return {Integer} The horizontal mouse position in the client area.
     * @signature function()
     */
    getClientX : qx.core.Variant.select("qx.client",
    {
      "mshtml|gecko" : function() {
        return this._event.clientX;
      },

      "default" : function() {
        return this._event.clientX + (document.body && document.body.scrollLeft != null ? document.body.scrollLeft : 0);
      }
    }),


    /**
     * Get the vertical coordinate at which the event occurred relative to the
     * DOM implementation's client area.
     *
     * @return {Integer} The vertical mouse position in the client area.
     * @signature function()
     */
    getClientY : qx.core.Variant.select("qx.client",
    {
      "mshtml|gecko" : function() {
        return this._event.clientY;
      },

      "default" : function() {
        return this._event.clientY + (document.body && document.body.scrollTop != null ? document.body.scrollTop : 0);
      }
    }),


    /**
     * Get the horizontal coordinate at which the event occurred relative to
     * the origin of the screen coordinate system.
     *
     * @return {Integer} The horizontal mouse position on the screen.
     */
    getScreenX : function() {
      return this._event.screenX;
    },


    /**
     * Get the vertical coordinate at which the event occurred relative to
     * the origin of the screen coordinate system.
     *
     * @return {Integer} The vertical mouse position on the screen.
     */
    getScreenY : function() {
      return this._event.screenY;
    }

  }
});
