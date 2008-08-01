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

************************************************************************ */

/** A mouse event instance contains all data for each occured mouse event */
qx.Class.define("qx.legacy.event.type.MouseEvent",
{
  extend : qx.legacy.event.type.DomEvent,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vType, vDomEvent, vDomTarget, vTarget, vOriginalTarget, vRelatedTarget)
  {
    this.base(arguments, vType, vDomEvent, vDomTarget, vTarget, vOriginalTarget);

    if (vRelatedTarget) {
      this.setRelatedTarget(vRelatedTarget);
    }
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

    _screenX : 0,
    _screenY : 0,
    _clientX : 0,
    _clientY : 0,
    _pageX : 0,
    _pageY : 0,
    _button : null,

    buttons : qx.core.Variant.select("qx.client",
    {
      "mshtml" :
      {
        left   : 1,
        right  : 2,
        middle : 4
      },

      "default" :
      {
        left   : 0,
        right  : 2,
        middle : 1
      }
    }),


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    storeEventState : function(e)
    {
      this._screenX = e.getScreenX();
      this._screenY = e.getScreenY();
      this._clientX = e.getClientX();
      this._clientY = e.getClientY();
      this._pageX = e.getPageX();
      this._pageY = e.getPageY();
      this._button = e.getButton();
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getScreenX : function() {
      return this._screenX;
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getScreenY : function() {
      return this._screenY;
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getClientX : function() {
      return this._clientX;
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getClientY : function() {
      return this._clientY;
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getPageX : function() {
      return this._pageX;
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getPageY : function() {
      return this._pageY;
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getButton : function() {
      return this._button;
    }
  },





  defer : function(statics, members)
  {
    qx.legacy.core.Property.addFastProperty({ name : "button", readOnly : true }, members);
    qx.legacy.core.Property.addFastProperty({ name : "wheelDelta", readOnly : true }, members);
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      PAGE COORDINATES SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @return {var} TODOC
     * @signature function()
     */
    getPageX : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function() {
        return this.getDomEvent().clientX + qx.bom.Viewport.getScrollLeft(window);
      },

      "default" : function() {
        return this.getDomEvent().pageX;
      }
    }),

    /**
     * TODOC
     *
     * @return {var} TODOC
     * @signature function()
     */
    getPageY : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function() {
        return this.getDomEvent().clientY + qx.bom.Viewport.getScrollTop(window);
      },

      "default" : function() {
        return this.getDomEvent().pageY;
      }
    }),



    /*
    ---------------------------------------------------------------------------
      CLIENT COORDINATES SUPPORT
    ---------------------------------------------------------------------------
    */

    getClientX : function() {
      return this.getDomEvent().clientX;
    },

    getClientY : function() {
      return this.getDomEvent().clientY;
    },



    /*
    ---------------------------------------------------------------------------
      SCREEN COORDINATES SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getScreenX : function() {
      return this.getDomEvent().screenX;
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getScreenY : function() {
      return this.getDomEvent().screenY;
    },




    /*
    ---------------------------------------------------------------------------
      BUTTON SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @return {var} TODOC
     * @signature function()
     */
    isLeftButtonPressed : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        // IE does not set e.button in click events
        if (this.getType() == "click") {
          return true;
        } else {
          return this.getButton() === qx.legacy.event.type.MouseEvent.C_BUTTON_LEFT;
        }
      },

     "default": function() {
        return this.getButton() === qx.legacy.event.type.MouseEvent.C_BUTTON_LEFT;
      }
    }),

    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    isMiddleButtonPressed : function() {
      return this.getButton() === qx.legacy.event.type.MouseEvent.C_BUTTON_MIDDLE;
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    isRightButtonPressed : function() {
      return this.getButton() === qx.legacy.event.type.MouseEvent.C_BUTTON_RIGHT;
    },


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


    /**
     * During mouse events caused by the depression or release of a mouse button,
     * this method can be used to check which mouse button changed state.
     *
     * @return {String} One of "left", "right", "middle" or "none"
     */
    getButton : function()
    {
      switch(this.getDomEvent().type)
      {
        case "click":
        case "dblclick":
          return "left";

        case "contextmenu":
          return "right";

        default:
          return this.__buttons[this.getDomEvent().button] || "none";
      }
    },



    /*
    ---------------------------------------------------------------------------
      WHEEL SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @return {var} TODOC
     * @signature function()
     */
    _computeWheelDelta : qx.core.Variant.select("qx.client",
    {
      "default" : function() {
        return this.getDomEvent().wheelDelta / 120;
      },

      "gecko" : function() {
        return -(this.getDomEvent().detail / 3);
      }
    })
  }
});
