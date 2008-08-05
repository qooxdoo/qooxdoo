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
 * A key event instance contains all data for each occured key event
 */
qx.Class.define("qx.legacy.event.type.KeyEvent",
{
  extend : qx.legacy.event.type.DomEvent,

  /**
   * @param vType {String} event type (keydown, keypress, keyinput, keyup)
   * @param vDomEvent {Element} DOM event object
   * @param vDomTarget {Element} target element of the DOM event
   * @param vTarget
   * @param vOriginalTarget
   * @param vKeyCode {Integer} emulated key code for compatibility with older qoodoo applications
   * @param vCharCode {Integer} char code from the "keypress" event
   * @param vKeyIdentifier {String} the key identifier
   */
  construct : function(vType, vDomEvent, vDomTarget, vTarget, vOriginalTarget, vKeyCode, vCharCode, vKeyIdentifier)
  {
    this.base(arguments, vType, vDomEvent, vDomTarget, vTarget, vOriginalTarget);

    this._keyCode = vKeyCode;
    this.setCharCode(vCharCode);
    this.setKeyIdentifier(vKeyIdentifier);
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Mapping of the old key identifiers to the key codes
     * @deprecated
     */
    keys :
    {
      esc             : 27,
      enter           : 13,
      tab             : 9,
      space           : 32,
      up              : 38,
      down            : 40,
      left            : 37,
      right           : 39,
      shift           : 16,
      ctrl            : 17,
      alt             : 18,
      f1              : 112,
      f2              : 113,
      f3              : 114,
      f4              : 115,
      f5              : 116,
      f6              : 117,
      f7              : 118,
      f8              : 119,
      f9              : 120,
      f10             : 121,
      f11             : 122,
      f12             : 123,
      print           : 124,
      del             : 46,
      backspace       : 8,
      insert          : 45,
      home            : 36,
      end             : 35,
      pageup          : 33,
      pagedown        : 34,
      numlock         : 144,
      numpad_0        : 96,
      numpad_1        : 97,
      numpad_2        : 98,
      numpad_3        : 99,
      numpad_4        : 100,
      numpad_5        : 101,
      numpad_6        : 102,
      numpad_7        : 103,
      numpad_8        : 104,
      numpad_9        : 105,
      numpad_divide   : 111,
      numpad_multiply : 106,
      numpad_minus    : 109,
      numpad_plus     : 107
    },

    /**
     * Mapping of the key codes to the key identifiers
     */
    codes : {}
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Legacy keycode
     * @deprecated Will be removed with qooxdoo 0.7
     */
    getKeyCode : function() {
      this.warn("Deprecated: please use getKeyIdentifier() instead.");
      this.trace();
      return this._keyCode;
    }
  },



  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics, members)
  {
    // create dynamic codes copy
    for (var i in statics.keys) {
      statics.codes[statics.keys[i]] = i;
    }

    qx.legacy.core.Property.addFastProperty({ name : "charCode", defaultValue : null, setOnlyOnce : true, noCompute : true }, members);
    qx.legacy.core.Property.addFastProperty({ name : "keyIdentifier", defaultValue : null, setOnlyOnce : true, noCompute : true }, members);
  }
});
