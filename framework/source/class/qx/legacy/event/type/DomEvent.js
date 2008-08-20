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

qx.Class.define("qx.legacy.event.type.DomEvent",
{
  extend : qx.event.type.Event,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vType, vDomEvent, vDomTarget, vTarget, vOriginalTarget)
  {
    this.base(arguments);
    this.init(true, true);

    this.setType(vType);
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
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * property computer
     *
     * @return {var} TODOC
     */
    _computeModifiers : function()
    {
      var mask = 0;
      var evt = this.getDomEvent();
      if (evt.shiftKey) mask |= qx.legacy.event.type.DomEvent.SHIFT_MASK;
      if (evt.ctrlKey) mask |= qx.legacy.event.type.DomEvent.CTRL_MASK;
      if (evt.altKey) mask |= qx.legacy.event.type.DomEvent.ALT_MASK;
      if (evt.metaKey) mask |= qx.legacy.event.type.DomEvent.META_MASK;
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
     * @return {Boolean} whether the the ctrl key is pressed.
     */
    isCtrlPressed : function() {
      return this.getDomEvent().ctrlKey;
    },


    /**
     * Returns whether the the shift key is pressed.
     *
     * @return {Boolean} whether the the shift key is pressed.
     */
    isShiftPressed : function() {
      return this.getDomEvent().shiftKey;
    },


    /**
     * Returns whether the the alt key is pressed.
     *
     * @return {Boolean} whether the the alt key is pressed.
     */
    isAltPressed : function() {
      return this.getDomEvent().altKey;
    },


    /**
     * Returns whether the the meta key is pressed.
     *
     * @return {Boolean} whether the the meta key is pressed.
     */
    isMetaPressed : function() {
      return this.getDomEvent().metaKey;
    },


    /**
     * Returns whether the ctrl key or (on the Mac) the command key is pressed.
     *
     * @return {Boolean} <code>true</code> if the command key is pressed on the Mac
     *           or the ctrl key is pressed on another system.
     */
    isCtrlOrCommandPressed : function()
    {
      if (qx.legacy.core.Client.getInstance().runsOnMacintosh()) {
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
      },

      "default" : function(vValue)
      {
        if (!vValue) {
          return this.error("It is not possible to set preventDefault to false if it was true before!", "setDefaultPrevented");
        }

        this.getDomEvent().preventDefault();
        this.getDomEvent().returnValue = false;
      }
    }),


    preventDefault : function() {
      this.setDefaultPrevented(true);
    }
  },



  defer : function(statics, members)
  {
    qx.legacy.core.Property.addCachedProperty({ name : "modifiers", defaultValue : null }, members);
    qx.legacy.core.Property.addFastProperty({ name : "bubbles", defaultValue : true, noCompute : true }, members);
    qx.legacy.core.Property.addFastProperty({ name : "domEvent", defaultValue : null, noCompute : true, setOnlyOnce : true }, members);
    qx.legacy.core.Property.addFastProperty({ name : "domTarget", defaultValue : null, noCompute : true, setOnlyOnce : true }, members);
    qx.legacy.core.Property.addFastProperty({ name : "originalTarget", defaultValue : null, setOnlyOnce : true }, members);
    qx.legacy.core.Property.addFastProperty({ name : "relatedTarget", defaultValue : null, setOnlyOnce : true }, members);
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_valueDomEvent", "_valueDomTarget", "_valueOriginalTarget", "_valueRelatedTarget");
  }
});
