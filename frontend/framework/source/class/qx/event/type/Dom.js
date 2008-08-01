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
 * Common base class for all DOM events.
 */
qx.Class.define("qx.event.type.Dom",
{
  extend : qx.event.type.Native,



  statics :
  {
    /** {Integer} The modifier mask for the shift key. */
    SHIFT_MASK : 1,

    /** {Integer} The modifier mask for the control key. */
    CTRL_MASK  : 2,

    /** {Integer} The modifier mask for the alt key. */
    ALT_MASK   : 4,

    /** {Integer} The modifier mask for the meta key (e.g. apple key on Macs). */
    META_MASK  : 8
  },


  members :
  {
    /**
     * Return in a bit map, which modifier keys are pressed. The constants
     * {@link #SHIFT_MASK}, {@link #CTRL_MASK}, {@link #ALT_MASK} and
     * {@link #META_MASK} define the bit positions of the corresponding keys.
     *
     * @return {Integer} A bit map with the pressed modifier keys.
     */
    getModifiers : function()
    {
      if (!this.__modifiers)
      {
        var mask = 0;
        var evt = this._native;
        if (evt.shiftKey) {
          mask |= qx.event.type.Dom.SHIFT_MASK;
        }
        if (evt.ctrlKey) {
          mask |= qx.event.type.Dom.CTRL_MASK;
        }
        if (evt.altKey) {
          mask |= qx.event.type.Dom.ALT_MASK;
        }
        if (evt.metaKey) {
          mask |= qx.event.type.Dom.META_MASK;
        }
        return mask;
      }
      return this.__modifiers;
    },


    /**
     * Returns whether the the ctrl key is pressed.
     *
     * @return {Boolean} whether the the ctrl key is pressed.
     */
    isCtrlPressed : function() {
      return this._native.ctrlKey;
    },


    /**
     * Returns whether the the shift key is pressed.
     *
     * @return {Boolean} whether the the shift key is pressed.
     */
    isShiftPressed : function() {
      return this._native.shiftKey;
    },


    /**
     * Returns whether the the alt key is pressed.
     *
     * @return {Boolean} whether the the alt key is pressed.
     */
    isAltPressed : function() {
      return this._native.altKey;
    },


    /**
     * Returns whether the the meta key is pressed.
     *
     * @return {Boolean} whether the the meta key is pressed.
     */
    isMetaPressed : function() {
      return this._native.metaKey;
    },


    /**
     * Returns whether the ctrl key or (on the Mac) the command key is pressed.
     *
     * @return {Boolean} <code>true</code> if the command key is pressed on the Mac
     *           or the ctrl key is pressed on another system.
     */
    isCtrlOrCommandPressed : function()
    {
      if (qx.bom.client.Platform.MAC) {
        return this._native.metaKey;
      } else {
        return this._native.ctrlKey;
      }
    }
  }
});
