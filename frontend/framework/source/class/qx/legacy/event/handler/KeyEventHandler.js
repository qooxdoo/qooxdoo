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
 * This class provides unified key event handler for Internet Explorer,
 * Firefox, Opera and Safari
 */
qx.Class.define("qx.legacy.event.handler.KeyEventHandler",
{
  type : "singleton",
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._lastUpDownType = {};

    // DOM event wrapper
    this.__onKeyPress = qx.lang.Function.bind(this._onKeyPress, this);
    this.__onkeyupdown = qx.lang.Function.bind(this._onkeyupdown, this);
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
      EVENT-MAPPING
    ---------------------------------------------------------------------------
    */

    /**
     * attach the key event handler to the DOM events
     *
     * @return {void}
     * @signature function()
     */
    _attachEvents : function()
    {
      var el = qx.core.Variant.isSet("qx.client", "gecko") ? window : document.body;

      qx.legacy.html.EventRegistration.addListener(el, "keypress", this.__onKeyPress);
      qx.legacy.html.EventRegistration.addListener(el, "keyup", this.__onkeyupdown);
      qx.legacy.html.EventRegistration.addListener(el, "keydown", this.__onkeyupdown);
    },


    /**
     * detach the key event handler from the DOM events
     *
     * @return {void}
     * @signature function()
     */
    _detachEvents : function()
    {
      var el = qx.core.Variant.isSet("qx.client", "gecko") ? window : document.body;

      // Unregister dom events
      qx.legacy.html.EventRegistration.removeListener(el, "keypress", this.__onKeyPress);
      qx.legacy.html.EventRegistration.removeListener(el, "keyup", this.__onkeyupdown);
      qx.legacy.html.EventRegistration.removeListener(el, "keydown", this.__onkeyupdown);
    },



    /*
    ---------------------------------------------------------------------------
      EVENT-HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Low level handler for "keyup" and "keydown" events
     *
     * @param domEvent {Event} DOM event object
     * @signature function(domEvent)
     */
    _onkeyupdown : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(domEvent)
      {
        domEvent = window.event || domEvent;

        var keyCode = domEvent.keyCode;
        var charCode = 0;
        var type = domEvent.type;

        // Ignore the down in such sequences dp dp dp
        if (!(this._lastUpDownType[keyCode] == "keydown" && type == "keydown")) {
          this._idealKeyHandler(keyCode, charCode, type, domEvent);
        }

        // On non print-able character be sure to add a keypress event
        if (type == "keydown") {
          if (this._isNonPrintableKeyCode(keyCode) ||
            keyCode == 8 ||  // backspace
            keyCode == 9     // tab
          ) {
            this._idealKeyHandler(keyCode, charCode, "keypress", domEvent);
          }
        }

        // Store last type
        this._lastUpDownType[keyCode] = type;
      },

      "gecko" : function(domEvent)
      {
        var keyCode = this._keyCodeFix[domEvent.keyCode] || domEvent.keyCode;
        var charCode = domEvent.charCode;
        var type = domEvent.type;

        // FF repeats under windows keydown events like IE
        if (qx.legacy.core.Client.getInstance().runsOnWindows())
        {
          var keyIdentifier = keyCode ? this._keyCodeToIdentifier(keyCode) : this._charCodeToIdentifier(charCode);

          if (!(this._lastUpDownType[keyIdentifier] == "keypress" && type == "keydown")) {
            this._idealKeyHandler(keyCode, charCode, type, domEvent);
          }

          // Store last type
          this._lastUpDownType[keyIdentifier] = type;
        }

        // all other OSes
        else
        {
          this._idealKeyHandler(keyCode, charCode, type, domEvent);
        }
      },

      "webkit" : function(domEvent)
      {
        var charCode = 0;
        var type = domEvent.type;

        // starting with Safari 3.1 (verion 525.13) Apple switched the key
        // handling to match the IE behaviour.
        if (qx.bom.client.Engine.VERSION < 525.13 )
        {
          var keyCode = 0;

          // prevent Safari from sending key signals twice
          // This bug is fixed in recent Webkit builds so we need a revision check
          // see http://trac.mochikit.com/ticket/182 for details
          if (qx.legacy.core.Client.getInstance().getVersion() < 420)
          {
            if (!this._lastCharCodeForType) {
              this._lastCharCodeForType = {};
            }

            var isSafariSpecialKey = this._lastCharCodeForType[type] > 63000;

            if (isSafariSpecialKey)
            {
              this._lastCharCodeForType[type] = null;
              return;
            }

            this._lastCharCodeForType[type] = domEvent.charCode;
          }

          if (type == "keyup" || type == "keydown") {
            keyCode = this._charCode2KeyCode[domEvent.charCode] || domEvent.keyCode;
          }
          else
          {
            if (this._charCode2KeyCode[domEvent.charCode]) {
              keyCode = this._charCode2KeyCode[domEvent.charCode];
            } else {
              charCode = domEvent.charCode;
            }
          }

          this._idealKeyHandler(keyCode, charCode, type, domEvent);
        }
        else
        {
          var keyCode = domEvent.keyCode;

          // Ignore the down in such sequences dp dp dp
          if (!(this._lastUpDownType[keyCode] == "keydown" && type == "keydown")) {
            this._idealKeyHandler(keyCode, charCode, type, domEvent);
          }

          // On non print-able character be sure to add a keypress event
          if (type == "keydown")
          {
            // non-printable, backspace or tab
            if (this._isNonPrintableKeyCode(keyCode) || keyCode == 8 || keyCode == 9) {
              this._idealKeyHandler(keyCode, charCode, "keypress", domEvent);
            }
          }

          // Store last type
          this._lastUpDownType[keyCode] = type;
        }
      },

      "opera" : function(domEvent) {
        this._idealKeyHandler(domEvent.keyCode, 0, domEvent.type, domEvent);
      },

      "default" : function() {
        throw new Error("Unsupported browser for key event handler!");
      }
    }),


    /**
     * Low level key press handler
     *
     * @param domEvent {Event} DOM event object
     * @signature function(domEvent)
     */
    _onKeyPress : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(domEvent)
      {
        var domEvent = window.event || domEvent;

        if (this._charCode2KeyCode[domEvent.keyCode]) {
          this._idealKeyHandler(this._charCode2KeyCode[domEvent.keyCode], 0, domEvent.type, domEvent);
        } else {
          this._idealKeyHandler(0, domEvent.keyCode, domEvent.type, domEvent);
        }
      },

      "gecko" : function(domEvent)
      {
        var keyCode = this._keyCodeFix[domEvent.keyCode] || domEvent.keyCode;
        var charCode = domEvent.charCode;
        var type = domEvent.type;

        // FF repeats under windows keydown events like IE
        if (qx.legacy.core.Client.getInstance().runsOnWindows())
        {
          var keyIdentifier = keyCode ? this._keyCodeToIdentifier(keyCode) : this._charCodeToIdentifier(charCode);

          if (!(this._lastUpDownType[keyIdentifier] == "keypress" && type == "keydown")) {
            this._idealKeyHandler(keyCode, charCode, type, domEvent);
          }

          // Store last type
          this._lastUpDownType[keyIdentifier] = type;
        }

        // all other OSes
        else
        {
          this._idealKeyHandler(keyCode, charCode, type, domEvent);
        }
      },

      "webkit" : function(domEvent)
      {
        // starting with Safari 3.1 (verion 525.13) Apple switched the key
        // handling to match the IE behaviour.
        if (qx.bom.client.Engine.VERSION < 525.13 )
        {
          var keyCode = 0;
          var charCode = 0;
          var type = domEvent.type;

          // prevent Safari from sending key signals twice
          // This bug is fixed in recent Webkit builds so we need a revision check
          // see http://trac.mochikit.com/ticket/182 for details
          if (qx.legacy.core.Client.getInstance().getVersion() < 420)
          {
            if (!this._lastCharCodeForType) {
              this._lastCharCodeForType = {};
            }

            var isSafariSpecialKey = this._lastCharCodeForType[type] > 63000;

            if (isSafariSpecialKey)
            {
              this._lastCharCodeForType[type] = null;
              return;
            }

            this._lastCharCodeForType[type] = domEvent.charCode;
          }

          if (type == "keyup" || type == "keydown") {
            keyCode = this._charCode2KeyCode[domEvent.charCode] || domEvent.keyCode;
          }
          else
          {
            if (this._charCode2KeyCode[domEvent.charCode]) {
              keyCode = this._charCode2KeyCode[domEvent.charCode];
            } else {
              charCode = domEvent.charCode;
            }
          }

          this._idealKeyHandler(keyCode, charCode, type, domEvent);
        }
        else
        {
          if (this._charCode2KeyCode[domEvent.keyCode]) {
            this._idealKeyHandler(this._charCode2KeyCode[domEvent.keyCode], 0, domEvent.type, domEvent);
          } else {
            this._idealKeyHandler(0, domEvent.keyCode, domEvent.type, domEvent);
          }
        }
      },

      "opera" : function(domEvent)
      {
        if (this._keyCodeToIdentifierMap[domEvent.keyCode]) {
          this._idealKeyHandler(domEvent.keyCode, 0, domEvent.type, domEvent);
        } else {
          this._idealKeyHandler(0, domEvent.keyCode, domEvent.type, domEvent);
        }
      },

      "default" : function() {
        throw new Error("Unsupported browser for key event handler!");
      }
    }),





    /*
    ---------------------------------------------------------------------------
      KEY-MAPS
    ---------------------------------------------------------------------------
    */

    /** maps the charcodes of special printable keys to key identifiers */
    _specialCharCodeMap :
    {
      8  : "Backspace", // The Backspace (Back) key.
      9  : "Tab", // The Horizontal Tabulation (Tab) key.

      //   Note: This key identifier is also used for the
      //   Return (Macintosh numpad) key.
      13  : "Enter", // The Enter key.

      27  : "Escape", // The Escape (Esc) key.
      32 : "Space" // The Space (Spacebar) key.

    },

    /** maps the keycodes of non printable keys to key identifiers */
    _keyCodeToIdentifierMap :
    {
      16  : "Shift", // The Shift key.
      17  : "Control", // The Control (Ctrl) key.
      18  : "Alt", // The Alt (Menu) key.
      20  : "CapsLock", // The CapsLock key
      224 : "Meta", // The Meta key. (Apple Meta and Windows key)
      37  : "Left", // The Left Arrow key.
      38  : "Up", // The Up Arrow key.
      39  : "Right", // The Right Arrow key.
      40  : "Down", // The Down Arrow key.
      33  : "PageUp", // The Page Up key.
      34  : "PageDown", // The Page Down (Next) key.
      35  : "End", // The End key.
      36  : "Home", // The Home key.
      45  : "Insert", // The Insert (Ins) key. (Does not fire in Opera/Win)
      46  : "Delete", // The Delete (Del) Key.
      112 : "F1", // The F1 key.
      113 : "F2", // The F2 key.
      114 : "F3", // The F3 key.
      115 : "F4", // The F4 key.
      116 : "F5", // The F5 key.
      117 : "F6", // The F6 key.
      118 : "F7", // The F7 key.
      119 : "F8", // The F8 key.
      120 : "F9", // The F9 key.
      121 : "F10", // The F10 key.
      122 : "F11", // The F11 key.
      123 : "F12", // The F12 key.
      144 : "NumLock", // The Num Lock key.
      44  : "PrintScreen", // The Print Screen (PrintScrn, SnapShot) key.
      145 : "Scroll", // The scroll lock key
      19  : "Pause", // The pause/break key
      91  : "Win", // The Windows Logo key
      93  : "Apps" // The Application key (Windows Context Menu)
    },

    /** maps the keycodes of the numpad keys to the right charcodes */
    _numpadToCharCode :
    {
      96  : "0".charCodeAt(0),
      97  : "1".charCodeAt(0),
      98  : "2".charCodeAt(0),
      99  : "3".charCodeAt(0),
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




    /*
    ---------------------------------------------------------------------------
      HELPER-METHODS
    ---------------------------------------------------------------------------
    */

    _charCodeA : "A".charCodeAt(0),
    _charCodeZ : "Z".charCodeAt(0),
    _charCode0 : "0".charCodeAt(0),
    _charCode9 : "9".charCodeAt(0),


    /**
     * Checks whether the keyCode represents a non printable key
     *
     * @param keyCode {String} key code to check.
     * @return {Boolean} Wether the keyCode represents a non printable key.
     */
    _isNonPrintableKeyCode : function(keyCode) {
      return this._keyCodeToIdentifierMap[keyCode] ? true : false;
    },


    /**
     * Check whether the keycode can be reliably detected in keyup/keydown events
     *
     * @param keyCode {String} key code to check.
     * @return {Boolean} Wether the keycode can be reliably detected in keyup/keydown events.
     */
    _isIdentifiableKeyCode : function(keyCode)
    {
      // A-Z
      if (keyCode >= this._charCodeA && keyCode <= this._charCodeZ) {
        return true;
      }

      // 0-9
      if (keyCode >= this._charCode0 && keyCode <= this._charCode9) {
        return true;
      }

      // Enter, Space, Tab, Backspace
      if (this._specialCharCodeMap[keyCode]) {
        return true;
      }

      // Numpad
      if (this._numpadToCharCode[keyCode]) {
        return true;
      }

      // non printable keys
      if (this._isNonPrintableKeyCode(keyCode)) {
        return true;
      }

      return false;
    },


    /**
     * Checks whether a given string is a valid keyIdentifier
     *
     * @param keyIdentifier {String} The key identifier.
     * @return {Boolean} whether the given string is a valid keyIdentifier
     */
    isValidKeyIdentifier : function(keyIdentifier)
    {
      if (this._identifierToKeyCodeMap[keyIdentifier]) {
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
          return true;

        default:
          return false;
      }
    },


    /**
     * converts a keyboard code to the corresponding identifier
     *
     * @param keyCode {Integer} key code
     * @return {String} key identifier
     */
    _keyCodeToIdentifier : function(keyCode)
    {
      if (this._isIdentifiableKeyCode(keyCode))
      {
        var numPadKeyCode = this._numpadToCharCode[keyCode];

        if (numPadKeyCode) {
          return String.fromCharCode(numPadKeyCode);
        }

        return (this._keyCodeToIdentifierMap[keyCode] || this._specialCharCodeMap[keyCode] || String.fromCharCode(keyCode));
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
    _charCodeToIdentifier : function(charCode) {
      return this._specialCharCodeMap[charCode] || String.fromCharCode(charCode).toUpperCase();
    },


    /**
     * converts a key identifier back to a keycode
     *
     * @param keyIdentifier {String} The key identifier to convert
     * @return {Integer} keyboard code
     */
    _identifierToKeyCode : function(keyIdentifier) {
      return this._identifierToKeyCodeMap[keyIdentifier] || keyIdentifier.charCodeAt(0);
    },




    /*
    ---------------------------------------------------------------------------
      IDEALIZED-KEY-HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Key handler for an idealized browser.
     * Runs after the browser specific key handlers have normalized the key events.
     *
     * @param keyCode {String} keyboard code
     * @param charCode {String} character code
     * @param eventType {String} type of the event (keydown, keypress, keyup)
     * @param domEvent {Element} DomEvent
     * @return {void}
     */
    _idealKeyHandler : function(keyCode, charCode, eventType, domEvent)
    {
      if (!keyCode && !charCode) {
        return;
      }

      var keyIdentifier;

      // Use: keyCode
      if (keyCode)
      {
        keyIdentifier = this._keyCodeToIdentifier(keyCode);
        qx.legacy.event.handler.EventHandler.getInstance()._onkeyevent_post(domEvent, eventType, keyCode, charCode, keyIdentifier);
      }

      // Use: charCode
      else
      {
        keyIdentifier = this._charCodeToIdentifier(charCode);
        qx.legacy.event.handler.EventHandler.getInstance()._onkeyevent_post(domEvent, "keypress", keyCode, charCode, keyIdentifier);
        qx.legacy.event.handler.EventHandler.getInstance()._onkeyevent_post(domEvent, "keyinput", keyCode, charCode, keyIdentifier);
      }
    }
  },



  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics, members, properties)
  {
    // construct invers of keyCodeToIdentifierMap
    if (!members._identifierToKeyCodeMap)
    {
      members._identifierToKeyCodeMap = {};

      for (var key in members._keyCodeToIdentifierMap) {
        members._identifierToKeyCodeMap[members._keyCodeToIdentifierMap[key]] = parseInt(key);
      }

      for (var key in members._specialCharCodeMap) {
        members._identifierToKeyCodeMap[members._specialCharCodeMap[key]] = parseInt(key);
      }
    }

    if (qx.core.Variant.isSet("qx.client", "mshtml")) {
      members._charCode2KeyCode = { 13 : 13, 27 : 27 };
    }
    else if (qx.core.Variant.isSet("qx.client", "gecko"))
    {
      members._keyCodeFix = {
        12 : members._identifierToKeyCode("NumLock")
      };
    }
    else if (qx.core.Variant.isSet("qx.client", "webkit"))
    {
      // starting with Safari 3.1 (verion 525.13) Apple switched the key
      // handling to match the IE behaviour.
      if (qx.bom.client.Engine.VERSION < 525.13 )
      {
        members._charCode2KeyCode =
        {
          // Safari/Webkit Mappings
          63289 : members._identifierToKeyCode("NumLock"),
          63276 : members._identifierToKeyCode("PageUp"),
          63277 : members._identifierToKeyCode("PageDown"),
          63275 : members._identifierToKeyCode("End"),
          63273 : members._identifierToKeyCode("Home"),
          63234 : members._identifierToKeyCode("Left"),
          63232 : members._identifierToKeyCode("Up"),
          63235 : members._identifierToKeyCode("Right"),
          63233 : members._identifierToKeyCode("Down"),
          63272 : members._identifierToKeyCode("Delete"),
          63302 : members._identifierToKeyCode("Insert"),
          63236 : members._identifierToKeyCode("F1"),
          63237 : members._identifierToKeyCode("F2"),
          63238 : members._identifierToKeyCode("F3"),
          63239 : members._identifierToKeyCode("F4"),
          63240 : members._identifierToKeyCode("F5"),
          63241 : members._identifierToKeyCode("F6"),
          63242 : members._identifierToKeyCode("F7"),
          63243 : members._identifierToKeyCode("F8"),
          63244 : members._identifierToKeyCode("F9"),
          63245 : members._identifierToKeyCode("F10"),
          63246 : members._identifierToKeyCode("F11"),
          63247 : members._identifierToKeyCode("F12"),
          63248 : members._identifierToKeyCode("PrintScreen"),
          3     : members._identifierToKeyCode("Enter"),
          12    : members._identifierToKeyCode("NumLock"),
          13    : members._identifierToKeyCode("Enter")
        };
      }
      else
      {
        members._charCode2KeyCode =
        {
          13 : 13,
          27 : 27
        };
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._detachEvents();
    this._disposeFields("_lastUpDownType");
  }
});
