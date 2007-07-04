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

************************************************************************ */

/* ************************************************************************

#module(ui_core)

************************************************************************ */

/** A mouse event instance contains all data for each occured mouse event */
qx.Class.define("qx.event.type.MouseEvent",
{
  extend : qx.event.type.DomEvent,




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
      "mshtml" :   {
        left   : 1,
        right  : 2,
        middle : 4
      },

      "default" : {
        left   : 0,
        right  : 2,
        middle : 1
      }
    }),


    /**
     * TODOC
     *
     * @type static
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
     * @type static
     * @return {var} TODOC
     */
    getScreenX : function() {
      return this._screenX;
    },


    /**
     * TODOC
     *
     * @type static
     * @return {var} TODOC
     */
    getScreenY : function() {
      return this._screenY;
    },


    /**
     * TODOC
     *
     * @type static
     * @return {var} TODOC
     */
    getClientX : function() {
      return this._clientX;
    },


    /**
     * TODOC
     *
     * @type static
     * @return {var} TODOC
     */
    getClientY : function() {
      return this._clientY;
    },


    /**
     * TODOC
     *
     * @type static
     * @return {var} TODOC
     */
    getPageX : function() {
      return this._pageX;
    },


    /**
     * TODOC
     *
     * @type static
     * @return {var} TODOC
     */
    getPageY : function() {
      return this._pageY;
    },


    /**
     * TODOC
     *
     * @type static
     * @return {var} TODOC
     */
    getButton : function() {
      return this._button;
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    button :
    {
      _fast    : true,
      readOnly : true
    },

    wheelDelta :
    {
      _fast    : true,
      readOnly : true
    }
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
     * @type member
     * @return {var} TODOC
     * @signature function()
     */
    getPageX : qx.core.Variant.select("qx.client",
    {
      "mshtml" : qx.lang.Object.select(qx.core.Client.getInstance().isInQuirksMode() ? "quirks" : "standard",
      {
        "quirks" : function() {
          return this.getDomEvent().clientX + document.documentElement.scrollLeft;
        },

        "standard" : function() {
          return this.getDomEvent().clientX + document.body.scrollLeft;
        }
      }),

      "gecko" : function() {
        return this.getDomEvent().pageX;
      },

     "default": function() {
        return this.getDomEvent().clientX;
      }
    }),

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     * @signature function()
     */
    getPageY : qx.core.Variant.select("qx.client",
    {
      "mshtml" : qx.lang.Object.select(qx.core.Client.getInstance().isInQuirksMode() ? "quirks" : "standard",
      {
        "quirks" : function() {
          return this.getDomEvent().clientY + document.documentElement.scrollTop;
        },

        "standard" : function() {
          return this.getDomEvent().clientY + document.body.scrollTop;
        }
      }),

      "gecko" : function() {
        return this.getDomEvent().pageY;
      },

      "default": function() {
        return this.getDomEvent().clientY;
      }
    }),



    /*
    ---------------------------------------------------------------------------
      CLIENT COORDINATES SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * @signature function()
     */
    getClientX : qx.core.Variant.select("qx.client",
    {
      "mshtml|gecko" : function() {
        return this.getDomEvent().clientX;
      },

      "default" : function() {
        return this.getDomEvent().clientX + (document.body && document.body.scrollLeft != null ? document.body.scrollLeft : 0);
      }
    }),

    /**
     * @signature function()
     */
    getClientY : qx.core.Variant.select("qx.client",
    {
      "mshtml|gecko" : function() {
        return this.getDomEvent().clientY;
      },

      "default" : function() {
        return this.getDomEvent().clientY + (document.body && document.body.scrollTop != null ? document.body.scrollTop : 0);
      }
    }),





    /*
    ---------------------------------------------------------------------------
      SCREEN COORDINATES SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getScreenX : function() {
      return this.getDomEvent().screenX;
    },


    /**
     * TODOC
     *
     * @type member
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
     * @type member
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
          return this.getButton() === qx.event.type.MouseEvent.C_BUTTON_LEFT;
        }
      },

     "default": function() {
        return this.getButton() === qx.event.type.MouseEvent.C_BUTTON_LEFT;
      }
    }),

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    isMiddleButtonPressed : function() {
      return this.getButton() === qx.event.type.MouseEvent.C_BUTTON_MIDDLE;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    isRightButtonPressed : function() {
      return this.getButton() === qx.event.type.MouseEvent.C_BUTTON_RIGHT;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    _computeButton : function()
    {
      var e = this.getDomEvent();

      if (e.which != null)
      {
        switch(e.which)
        {
          case 1:
            return qx.event.type.MouseEvent.C_BUTTON_LEFT;

          case 3:
            return qx.event.type.MouseEvent.C_BUTTON_RIGHT;

          case 2:
            return qx.event.type.MouseEvent.C_BUTTON_MIDDLE;

          default:
            return qx.event.type.MouseEvent.C_BUTTON_NONE;
        }
      }
      else
      {
        switch(e.button)
        {
          case 1:
            return qx.event.type.MouseEvent.C_BUTTON_LEFT;

          case 2:
            return qx.event.type.MouseEvent.C_BUTTON_RIGHT;

          case 4:
            return qx.event.type.MouseEvent.C_BUTTON_MIDDLE;

          default:
            return qx.event.type.MouseEvent.C_BUTTON_NONE;
        }
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
     * @type member
     * @return {var} TODOC
     * @signature function()
     */
    _computeWheelDelta : qx.core.Variant.select("qx.client",
    {
      "mshtml|opera" : function() {
        return this.getDomEvent().wheelDelta / 120;
      },

      "default" : function() {
        return -(this.getDomEvent().detail / 3);
      }
    })
  }
});
