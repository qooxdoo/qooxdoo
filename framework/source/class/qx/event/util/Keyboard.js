/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Utilities for working with character codes and key identifiers
 */
qx.Bootstrap.define("qx.event.util.Keyboard", {

  statics :
  {
    /*
    ---------------------------------------------------------------------------
      KEY MAPS
    ---------------------------------------------------------------------------
    */

    /**
     * @type {Map} maps the charcodes of special printable keys to key identifiers
     *
     * @lint ignoreReferenceField(specialCharCodeMap)
     */
    specialCharCodeMap :
    {
      8  : "Backspace",   // The Backspace (Back) key.
      9  : "Tab",         // The Horizontal Tabulation (Tab) key.

      //   Note: This key identifier is also used for the
      //   Return (Macintosh numpad) key.
      13 : "Enter",       // The Enter key.
      27 : "Escape",      // The Escape (Esc) key.
      32 : "Space"        // The Space (Spacebar) key.
    },

    /**
     * @type {Map} maps the keycodes of the numpad keys to the right charcodes
     *
     * @lint ignoreReferenceField(numpadToCharCode)
     */
    numpadToCharCode :
    {
       96 : "0".charCodeAt(0),
       97 : "1".charCodeAt(0),
       98 : "2".charCodeAt(0),
       99 : "3".charCodeAt(0),
      100 : "4".charCodeAt(0),
      101 : "5".charCodeAt(0),
      102 : "6".charCodeAt(0),
      103 : "7".charCodeAt(0),
      104 : "8".charCodeAt(0),
      105 : "9".charCodeAt(0),
      106 : "*".charCodeAt(0),
      107 : "+".charCodeAt(0),
      109 : "-".charCodeAt(0),
      110 : ",".charCodeAt(0),
      111 : "/".charCodeAt(0)
    },

    /**
     * @type {Map} maps the keycodes of non printable keys to key identifiers
     *
     * @lint ignoreReferenceField(keyCodeToIdentifierMap)
     */
    keyCodeToIdentifierMap :
    {
       16 : "Shift",        // The Shift key.
       17 : "Control",      // The Control (Ctrl) key.
       18 : "Alt",          // The Alt (Menu) key.
       20 : "CapsLock",     // The CapsLock key
      224 : "Meta",         // The Meta key. (Apple Meta and Windows key)

       37 : "Left",         // The Left Arrow key.
       38 : "Up",           // The Up Arrow key.
       39 : "Right",        // The Right Arrow key.
       40 : "Down",         // The Down Arrow key.

       33 : "PageUp",       // The Page Up key.
       34 : "PageDown",     // The Page Down (Next) key.

       35 : "End",          // The End key.
       36 : "Home",         // The Home key.

       45 : "Insert",       // The Insert (Ins) key. (Does not fire in Opera/Win)
       46 : "Delete",       // The Delete (Del) Key.

      112 : "F1",           // The F1 key.
      113 : "F2",           // The F2 key.
      114 : "F3",           // The F3 key.
      115 : "F4",           // The F4 key.
      116 : "F5",           // The F5 key.
      117 : "F6",           // The F6 key.
      118 : "F7",           // The F7 key.
      119 : "F8",           // The F8 key.
      120 : "F9",           // The F9 key.
      121 : "F10",          // The F10 key.
      122 : "F11",          // The F11 key.
      123 : "F12",          // The F12 key.

      144 : "NumLock",      // The Num Lock key.
       44 : "PrintScreen",  // The Print Screen (PrintScrn, SnapShot) key.
      145 : "Scroll",       // The scroll lock key
       19 : "Pause",        // The pause/break key
       // The left Windows Logo key or left cmd key
       91 : qx.core.Environment.get("os.name") == "osx" ? "cmd" : "Win",
       92 : "Win",          // The right Windows Logo key or left cmd key
       // The Application key (Windows Context Menu) or right cmd key
       93 : qx.core.Environment.get("os.name") == "osx" ? "cmd" : "Apps"
    },


    /** char code for capital A */
    charCodeA : "A".charCodeAt(0),
    /** char code for capital Z */
    charCodeZ : "Z".charCodeAt(0),
    /** char code for 0 */
    charCode0 : "0".charCodeAt(0),
    /** char code for 9 */
    charCode9 : "9".charCodeAt(0),

    /**
     * converts a keyboard code to the corresponding identifier
     *
     * @param keyCode {Integer} key code
     * @return {String} key identifier
     */
    keyCodeToIdentifier : function(keyCode)
    {
      if (this.isIdentifiableKeyCode(keyCode))
      {
        var numPadKeyCode = this.numpadToCharCode[keyCode];

        if (numPadKeyCode) {
          return String.fromCharCode(numPadKeyCode);
        }

        return (this.keyCodeToIdentifierMap[keyCode] || this.specialCharCodeMap[keyCode] || String.fromCharCode(keyCode));
      }
      else
      {
        return "Unidentified";
      }
    },


    /**
     * converts a character code to the corresponding identifier
     *
     * @param charCode {String} character code
     * @return {String} key identifier
     */
    charCodeToIdentifier : function(charCode) {
      return this.specialCharCodeMap[charCode] || String.fromCharCode(charCode).toUpperCase();
    },


    /**
     * Check whether the keycode can be reliably detected in keyup/keydown events
     *
     * @param keyCode {String} key code to check.
     * @return {Boolean} Whether the keycode can be reliably detected in keyup/keydown events.
     */
    isIdentifiableKeyCode : function(keyCode)
    {
      if (keyCode >= this.charCodeA && keyCode <= this.charCodeZ) {
        return true;
      }

      // 0-9
      if (keyCode >= this.charCode0 && keyCode <= this.charCode9) {
        return true;
      }

      // Enter, Space, Tab, Backspace
      if (this.specialCharCodeMap[keyCode]) {
        return true;
      }

      // Numpad
      if (this.numpadToCharCode[keyCode]) {
        return true;
      }

      // non printable keys
      if (this.isNonPrintableKeyCode(keyCode)) {
        return true;
      }

      return false;
    },


    /**
     * Checks whether the keyCode represents a non printable key
     *
     * @param keyCode {String} key code to check.
     * @return {Boolean} Whether the keyCode represents a non printable key.
     */
    isNonPrintableKeyCode : function(keyCode) {
      return this.keyCodeToIdentifierMap[keyCode] ? true : false;
    },


    /**
     * Checks whether a given string is a valid keyIdentifier
     *
     * @param keyIdentifier {String} The key identifier.
     * @return {Boolean} whether the given string is a valid keyIdentifier
     */
    isValidKeyIdentifier : function(keyIdentifier)
    {
      if (this.identifierToKeyCodeMap[keyIdentifier]) {
        return true;
      }

      if (keyIdentifier.length != 1) {
        return false;
      }

      if (keyIdentifier >= "0" && keyIdentifier <= "9") {
        return true;
      }

      if (keyIdentifier >= "A" && keyIdentifier <= "Z") {
        return true;
      }

      switch(keyIdentifier)
      {
        case "+":
        case "-":
        case "*":
        case "/":
        case ",":
          return true;

        default:
          return false;
      }
    },


    /**
     * Checks whether a given string is a printable keyIdentifier.
     *
     * @param keyIdentifier {String} The key identifier.
     * @return {Boolean} whether the given string is a printable keyIdentifier.
     */
    isPrintableKeyIdentifier : function(keyIdentifier)
    {
      if (keyIdentifier === "Space") {
        return true;
      } else {
        return this.identifierToKeyCodeMap[keyIdentifier] ? false : true;
      }
    }
  },

  defer : function(statics)
  {
    // construct inverse of keyCodeToIdentifierMap
    if (!statics.identifierToKeyCodeMap)
    {
      statics.identifierToKeyCodeMap = {};

      for (var key in statics.keyCodeToIdentifierMap) {
        statics.identifierToKeyCodeMap[statics.keyCodeToIdentifierMap[key]] = parseInt(key, 10);
      }

      for (var key in statics.specialCharCodeMap) {
        statics.identifierToKeyCodeMap[statics.specialCharCodeMap[key]] = parseInt(key, 10);
      }
    }
  }
});
