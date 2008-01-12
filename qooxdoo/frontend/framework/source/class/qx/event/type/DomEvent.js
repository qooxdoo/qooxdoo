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

/* ************************************************************************

#module(ui_core)

************************************************************************ */

qx.Class.define("qx.event.type.DomEvent",
{
  extend : qx.event.type.Event,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vType, vDomEvent, vDomTarget, vTarget, vOriginalTarget)
  {
    this.base(arguments, vType);

    this.setDomEvent(vDomEvent);
    this.setDomTarget(vDomTarget);

    this.setTarget(vTarget);
    this.setOriginalTarget(vOriginalTarget);
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {

    /** {int} The modifier mask for the shift key. */
    SHIFT_MASK : 1,

    /** {int} The modifier mask for the control key. */
    CTRL_MASK  : 2,

    /** {int} The modifier mask for the alt key. */
    ALT_MASK   : 4,

    /** {int} The modifier mask for the meta key (e.g. apple key on Macs). */
    META_MASK  : 8
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    bubbles :
    {
      _fast        : true,
      defaultValue : true,
      noCompute    : true
    },

    propagationStopped :
    {
      _fast        : true,
      defaultValue : false,
      noCompute    : true
    },

    domEvent :
    {
      _fast       : true,
      setOnlyOnce : true,
      noCompute   : true
    },

    domTarget :
    {
      _fast       : true,
      setOnlyOnce : true,
      noCompute   : true
    },


    /**
     * The modifiers. A mask of the pressed modifier keys. This is an OR-combination of
     * {@link #SHIFT_MASK}, {@link #CTRL_MASK}, {@link #ALT_MASK} and {@link #META_MASK}.
     */
    modifiers :
    {
      _cached      : true,
      defaultValue : null
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * property computer
     *
     * @type member
     * @return {var} TODOC
     */
    _computeModifiers : function()
    {
      var mask = 0;
      var evt = this.getDomEvent();
      if (evt.shiftKey) mask |= qx.event.type.DomEvent.SHIFT_MASK;
      if (evt.ctrlKey) mask |= qx.event.type.DomEvent.CTRL_MASK;
      if (evt.altKey) mask |= qx.event.type.DomEvent.ALT_MASK;
      if (evt.metaKey) mask |= qx.event.type.DomEvent.META_MASK;
      return mask;
    },




    /*
    ---------------------------------------------------------------------------
      SPECIAL KEY SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Returns whether the the ctrl key is pressed.
     *
     * @type member
     * @return {Boolean} whether the the ctrl key is pressed.
     */
    isCtrlPressed : function() {
      return this.getDomEvent().ctrlKey;
    },


    /**
     * Returns whether the the shift key is pressed.
     *
     * @type member
     * @return {Boolean} whether the the shift key is pressed.
     */
    isShiftPressed : function() {
      return this.getDomEvent().shiftKey;
    },


    /**
     * Returns whether the the alt key is pressed.
     *
     * @type member
     * @return {Boolean} whether the the alt key is pressed.
     */
    isAltPressed : function() {
      return this.getDomEvent().altKey;
    },


    /**
     * Returns whether the the meta key is pressed.
     *
     * @type member
     * @return {Boolean} whether the the meta key is pressed.
     */
    isMetaPressed : function() {
      return this.getDomEvent().metaKey;
    },


    /**
     * Returns whether the ctrl key or (on the Mac) the command key is pressed.
     *
     * @type member
     * @return {Boolean} <code>true</code> if the command key is pressed on the Mac
     *           or the ctrl key is pressed on another system.
     */
    isCtrlOrCommandPressed : function()
    {
      if (qx.core.Client.getInstance().runsOnMacintosh()) {
        return this.getDomEvent().metaKey;
      } else {
        return this.getDomEvent().ctrlKey;
      }
    },



    /*
    ---------------------------------------------------------------------------
      PREVENT DEFAULT
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param vValue {var} TODOC
     * @return {var} TODOC
     * @signature function(vValue)
     */
    setDefaultPrevented : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(vValue)
      {
        if (!vValue) {
          return this.error("It is not possible to set preventDefault to false if it was true before!", "setDefaultPrevented");
        }

        this.getDomEvent().returnValue = false;

        this.base(arguments, vValue);
      },

      "default" : function(vValue)
      {
        if (!vValue) {
          return this.error("It is not possible to set preventDefault to false if it was true before!", "setDefaultPrevented");
        }

        this.getDomEvent().preventDefault();
        this.getDomEvent().returnValue = false;

        this.base(arguments, vValue);
      }
    })
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_valueDomEvent", "_valueDomTarget");
  }
});
