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

************************************************************************ */

/**
 * Common base class for all DOM events.
 */
qx.Class.define("qx.event.type.Dom", {
  extend: qx.event.type.Native,

  statics: {
    /** @type {Integer} The modifier mask for the shift key. */
    SHIFT_MASK: 1,

    /** @type {Integer} The modifier mask for the control key. */
    CTRL_MASK: 2,

    /** @type {Integer} The modifier mask for the alt key. */
    ALT_MASK: 4,

    /** @type {Integer} The modifier mask for the meta key (e.g. apple key on Macs). */
    META_MASK: 8,

    /** @type {Integer} The modifier mask for the CapsLock modifier. */
    CAPSLOCK_MASK: 16,

    /** @type {Integer} The modifier mask for the NumLock modifier. */
    NUMLOCK_MASK: 32,

    /** @type {Integer} The modifier mask for the ScrollLock modifier. */
    SCROLLLOCK_MASK: 64
  },

  members: {
    // overridden
    _cloneNativeEvent(nativeEvent, clone) {
      var clone = super._cloneNativeEvent(nativeEvent, clone);

      clone.shiftKey = nativeEvent.shiftKey;
      clone.ctrlKey = nativeEvent.ctrlKey;
      clone.altKey = nativeEvent.altKey;
      clone.metaKey = nativeEvent.metaKey;

      if (typeof nativeEvent.getModifierState === "function") {
        clone.numLock = nativeEvent.getModifierState("NumLock");
        clone.capsLock = nativeEvent.getModifierState("CapsLock");
        clone.scrollLock = nativeEvent.getModifierState("ScrollLock");
      } else {
        clone.numLock = false;
        clone.capsLock = false;
        clone.scrollLock = false;
      }

      return clone;
    },

    /**
     * Return in a bit map, which modifier keys are pressed. The constants
     * {@link #SHIFT_MASK}, {@link #CTRL_MASK}, {@link #ALT_MASK},
     * {@link #META_MASK} and {@link #CAPSLOCK_MASK} define the bit positions
     * of the corresponding keys.
     *
     * @return {Integer} A bit map with the pressed modifier keys.
     */
    getModifiers() {
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
    },

    /**
     * Return in a bit map, which lock keys are pressed. The constants
     * {@link #CAPSLOCK_MASK}, {@link #NUMLOCK_MASK}, and {@link #SCROLLLOCK_MASK}
     * define the bit positions of the corresponding keys.
     *
     * @return {Integer} A bit map with the locked keys.
     */
    getKeyLockState() {
      var mask = 0;
      var evt = this._native;

      if (evt.capsLock) {
        mask |= qx.event.type.Dom.CAPSLOCK_MASK;
      }
      if (evt.numLock) {
        mask |= qx.event.type.Dom.NUMLOCK_MASK;
      }
      if (evt.scrollLock) {
        mask |= qx.event.type.Dom.SCROLLLOCK_MASK;
      }
      return mask;
    },

    /**
     * Returns whether the ctrl key is pressed.
     *
     * @return {Boolean} whether the ctrl key is pressed.
     */
    isCtrlPressed() {
      return this._native.ctrlKey;
    },

    /**
     * Returns whether the shift key is pressed.
     *
     * @return {Boolean} whether the shift key is pressed.
     */
    isShiftPressed() {
      return this._native.shiftKey;
    },

    /**
     * Returns whether the alt key is pressed.
     *
     * @return {Boolean} whether the alt key is pressed.
     */
    isAltPressed() {
      return this._native.altKey;
    },

    /**
     * Returns whether the meta key is pressed.
     *
     * @return {Boolean} whether the meta key is pressed.
     */
    isMetaPressed() {
      return this._native.metaKey;
    },

    /**
     * Returns whether the caps-lock modifier is active
     *
     * @return {Boolean} whether the CapsLock key is pressed.
     */
    isCapsLocked() {
      return this._native.capsLock;
    },

    /**
     * Returns whether the num-lock modifier is active
     *
     * @return {Boolean} whether the NumLock key is pressed.
     */
    isNumLocked() {
      return this._native.numLock;
    },

    /**
     * Returns whether the scroll-lock modifier is active
     *
     * @return {Boolean} whether the ScrollLock key is pressed.
     */
    isScrollLocked() {
      return this._native.scrollLock;
    },

    /**
     * Returns whether the ctrl key or (on the Mac) the command key is pressed.
     *
     * @return {Boolean} <code>true</code> if the command key is pressed on the Mac
     *           or the ctrl key is pressed on another system.
     */
    isCtrlOrCommandPressed() {
      // Opera seems to use ctrlKey for the cmd key so don't fix that for opera
      // on mac [BUG #5884]
      if (
        qx.core.Environment.get("os.name") == "osx" &&
        qx.core.Environment.get("engine.name") != "opera"
      ) {
        return this._native.metaKey;
      } else {
        return this._native.ctrlKey;
      }
    }
  }
});
