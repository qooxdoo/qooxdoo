/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(ui_core)
#require(qx.event.type.KeyEvent)

************************************************************************ */

/**
 * This class provides unified key event handler for Internet Explorer,
 * Firefox, Opera and Safari
 */
qx.OO.defineClass("qx.event.handler.KeyEventHandler", qx.core.Target,
function()
{
  qx.core.Target.call(this);

  var o = this;
  /** internal callback
   * @param e (Element) DomEvent
   */
  this.__onkeypress = function(e) {
    e = window.event || e;
    o.onKeyPress(e);
  }

  /** internal callback
   * @param e (Element) DomEvent
   */
  this.__onkeyupdown = function(e) {
    e = window.event || e;
    o.onKeyUpDown(e);
  }

  this.setCallback(function() {});
});


/**
 * Callback which is called on each key event after the KeyEventHandler has normalized the events
 * We use callbacks instead of events because of performance considerations.
 *
 * Callback Signature: function(vDomEvent, vEventType, vKeyCode, vCharCode, vKeyIdentifier)
 */
qx.OO.addProperty({ name : "callback", type : qx.constant.Type.FUNCTION });



/*
---------------------------------------------------------------------------
  EVENT-MAPPING
---------------------------------------------------------------------------
*/

/**
 * attach the key event handler to the DOM events
 */
qx.Proto.attachEvents = function()
{
  var el = qx.sys.Client.getInstance().isGecko() ? window : document.body;

  qx.dom.DomEventRegistration.addEventListener(el, qx.constant.Event.KEYPRESS, this.__onkeypress);
  qx.dom.DomEventRegistration.addEventListener(el, qx.constant.Event.KEYUP, this.__onkeyupdown);
  qx.dom.DomEventRegistration.addEventListener(el, qx.constant.Event.KEYDOWN, this.__onkeyupdown);
};


/**
 * detach the key event handler from the DOM events
 */
qx.Proto.detachEvents = function()
{
  var el = qx.sys.Client.getInstance().isGecko() ? window : document.body;

  // Unregister dom events
  qx.dom.DomEventRegistration.removeEventListener(el, qx.constant.Event.KEYPRESS, this.__onkeypress);
  qx.dom.DomEventRegistration.removeEventListener(el, qx.constant.Event.KEYUP, this.__onkeyupdown);
  qx.dom.DomEventRegistration.removeEventListener(el, qx.constant.Event.KEYDOWN, this.__onkeyupdown);
};



/*
---------------------------------------------------------------------------
  KEY-MAPS
---------------------------------------------------------------------------
*/

// maps the charcodes of special printable keys to key identifiers
qx.Proto._specialCharCodeMap = {
  8: "Backspace", //    The Backspace (Back) key.
  9: "Tab",       //    The Horizontal Tabulation (Tab) key.
  32: "Space"     //    The Space (Spacebar) key.
};


// maps the keycodes of non printable keys to key identifiers
qx.Proto._keyCodeToIdentifierMap = {
  13: "Enter",     //    The Enter key.
                   //     Note: This key identifier is also used for the
                   //     Return (Macintosh numpad) key.
  16: "Shift",     //    The Shift key.
  17: "Control",   //    The Control (Ctrl) key.
  18: "Alt",       //    The Alt (Menu) key.
  20: "CapsLock",  //    The CapsLock key
  224: "Meta",     //    The Meta key. (Apple Meta and Windows key)

  27: "Escape",    //    The Escape (Esc) key.

  37: "Left",      //    The Left Arrow key.
  38: "Up",        //    The Up Arrow key.
  39: "Right",     //    The Right Arrow key.
  40: "Down",      //    The Down Arrow key.

  33: "PageUp",    //    The Page Up key.
  34: "PageDown",  //    The Page Down (Next) key.

  35: "End",       //    The End key.
  36: "Home",      //    The Home key.
  45: "Insert",    //    The Insert (Ins) key. (Does not fire in Opera/Win)
  46: "Delete",    //        The Delete (Del) Key.

  112: "F1",       //    The F1 key.
  113: "F2",       //    The F2 key.
  114: "F3",       //    The F3 key.
  115: "F4",       //    The F4 key.
  116: "F5",       //    The F5 key.
  117: "F6",       //    The F6 key.
  118: "F7",       //    The F7 key.
  119: "F8",       //    The F8 key.
  120: "F9",       //    The F9 key.
  121: "F10",      //    The F10 key.
  122: "F11",      //    The F11 key.
  123: "F12",      //    The F12 key.

  144: "NumLock",    //    The Num Lock key.
  44: "PrintScreen", //    The Print Screen (PrintScrn, SnapShot) key.
  145: "Scroll",     //     The scroll lock key
  19: "Pause",       //    The pause/break key

  91: "Win",        //    The Windows Logo key
  93: "Apps"        //    The Application key (Windows Context Menu)
};


// maps the keycodes of the numpad keys to the right charcodes
qx.Proto._numpadToCharCode = {
  96: "0".charCodeAt(0),
  97: "1".charCodeAt(0),
  98: "2".charCodeAt(0),
  99: "3".charCodeAt(0),
  100: "4".charCodeAt(0),
  101: "5".charCodeAt(0),
  102: "6".charCodeAt(0),
  103: "7".charCodeAt(0),
  104: "8".charCodeAt(0),
  105: "9".charCodeAt(0),

  106: "*".charCodeAt(0),
  107: "+".charCodeAt(0),
  109: "-".charCodeAt(0),
  110: ",".charCodeAt(0),
  111: "/".charCodeAt(0)
};



/*
---------------------------------------------------------------------------
  HELPER-METHODS
---------------------------------------------------------------------------
*/

/**
 * Checks wether the keyCode represents a non printable key
 *
 * @param keyCode (string)
 * @return (boolean)
 */
qx.Proto._isNonPrintableKeyCode = function(keyCode)
{
  return this._keyCodeToIdentifierMap[keyCode] ? true : false;
};


/**
 * Check wether the keycode can be reliably detected in keyup/keydown events
 *
 * @param keyCode (string)
 * @return (boolean)
 */
qx.Proto._isIdentifiableKeyCode = function(keyCode) {};
qx.Class._get_isIdentifiableKeyCode = function()
{

  var C_A = "A".charCodeAt(0);
  var C_Z = "Z".charCodeAt(0);
  var C_0 = "0".charCodeAt(0);
  var C_9 = "9".charCodeAt(0);

  return function(keyCode)
  {
    if (keyCode >= C_A && keyCode <= C_Z) { return true; } // A-Z
    if (keyCode >= C_0 && keyCode <= C_9) { return true; } // 0-9
    if (this._specialCharCodeMap[keyCode]) { return true; } // Enter, Space, Tab, Backspace
    if (this._numpadToCharCode[keyCode]) {return true; }
    if (this._isNonPrintableKeyCode(keyCode)) { return true; } // non printable keys

    return false;
  }
};
qx.Proto._isIdentifiableKeyCode = qx.Class._get_isIdentifiableKeyCode();


/**
 * converts a keyboard code to the corresponding identifier
 *
 * @param keyCode (int)
 * @return (string) key identifier
 */
qx.Proto._keyCodeToIdentifier = function(keyCode)
{
  if (this._isIdentifiableKeyCode(keyCode))
  {
    var numPadKeyCode = this._numpadToCharCode[keyCode];
    if (numPadKeyCode)
    {
      return String.fromCharCode(numPadKeyCode);
    }
    else
    {
      return (
        this._keyCodeToIdentifierMap[keyCode] ||
        this._specialCharCodeMap[keyCode] ||
        String.fromCharCode(keyCode)
      );
    }
  }
  else
  {
    return "Unidentified";
  }
};


/**
 * converts a character code to the corresponding identifier
 *
 * @param charCode (string)
 * @return (string) key identifier
 */
qx.Proto._charCodeToIdentifier = function(charCode)
{
  return this._specialCharCodeMap[charCode] || String.fromCharCode(charCode).toUpperCase();
};


/**
 * converts a key identifier back to a keycode
 *
 * @param keyIdentifier (string)
 * @return (int) keyboard code
 */
qx.Proto._identifierToKeyCode = function(keyIdentifier)
{
  // construct invers of keyCodeToIdentifierMap
  if (!this._identifierToKeyCodeMap)
  {
    this._identifierToKeyCodeMap = {};
    for (var key in this._keyCodeToIdentifierMap) {
      this._identifierToKeyCodeMap[this._keyCodeToIdentifierMap[key]] = parseInt(key);
    }
  }

  return this._identifierToKeyCodeMap[keyIdentifier] || keyIdentifier.charCodeAt(0);
};



/*
---------------------------------------------------------------------------
  IDEALIZED-KEY-HANDLER
---------------------------------------------------------------------------
*/

/**
 * Key handler for an idealized browser.
 * Runs after the browser specific key handlers have normalized the key events.
 *
 * @param keyCode (string) keyboard code
 * @param charCode (string) character code
 * @param eventType (string) type of the event (keydown, keypress, keyup)
 * @param domEvent (Element) DomEvent
 */
qx.Proto._idealKeyHandler = function (keyCode, charCode, eventType, domEvent)
{
  if (!keyCode && !charCode) return;

  var keyIdentifier;
  if (keyCode) // convert keyCode
  {
    keyIdentifier = this._keyCodeToIdentifier(keyCode);
    if (keyIdentifier == "Unidentified") return;
    this.getCallback()(domEvent, eventType, keyCode, charCode, keyIdentifier);
  }
  else // convert charCode
  {
    var textInput = String.fromCharCode(charCode);
    keyIdentifier = this._charCodeToIdentifier(charCode);
    this.getCallback()(domEvent, "keypress", keyCode, charCode, keyIdentifier);
    this.getCallback()(domEvent, "keyinput", keyCode, charCode, keyIdentifier);
  }
};



/*
---------------------------------------------------------------------------
  BROWSER-SPECIFIC-KEY-HANDLER
---------------------------------------------------------------------------
*/

/**
 * key handler for Gecko
 *
 * @param domEvent (Element) DomEvent
 */
qx.Proto._geckoKeyHandler = function(domEvent)
{
  var geckoFixKeyCode = {
    12: this._identifierToKeyCode("NumLock")
  };
  var keyCode = geckoFixKeyCode[domEvent.keyCode] || domEvent.keyCode;
	var charCode = domEvent.charCode;
	
	// FF repeats under windows keydown events like IE
	if (qx.sys.Client.getInstance().runsOnWindows()) {
	  // Ignore the down in such sequences dp dp dp
    if (!this._last_updown) {
      this._last_updown = {};
    }
		var keyHash = keyCode ? this._keyCodeToIdentifier(keyCode) : this._charCodeToIdentifier(charCode)
		if (!(this._last_updown[keyHash] == "keypress" && domEvent.type == "keydown")) {
      this._idealKeyHandler(keyCode, charCode, domEvent.type, domEvent);
    }
	  // Store last type
    this.debug(keyHash + " " + domEvent.type + " " + this._last_updown[keyHash]);
		this._last_updown[keyHash] = domEvent.type;
  } else {	// all other OSes
    this._idealKeyHandler(keyCode, charCode, domEvent.type, domEvent);
  } 
}


/**
 * keyup/keydown handler for Internet Explorer
 *
 * @param domEvent (Element) DomEvent
 */
qx.Proto._mshtmlKeyUpDownHandler = function(domEvent)
{
  var keyCode = domEvent.keyCode;
  var charcode = 0;
  var type = domEvent.type;

  if (!this._last_updown) {
    this._last_updown = {};
  }

  // Ignore the down in such sequences dp dp dp
  if (!(this._last_updown[keyCode] == "keydown" && type == "keydown")) {
    this._idealKeyHandler(keyCode, charcode, type, domEvent);
  }
	// Store last type
  this._last_updown[keyCode] = type;

  // On non print-able character be sure to add a keypress event
  if (this._isNonPrintablekeyCode(keyCode) && type == "keydown") {
    this._idealKeyHandler(keyCode, charcode, "keypress", domEvent);
  }

  // Tab only fires keydown and then switches to the native toolbar.
  // Sequence detection does not work here.
  if (keyCode == 9) {
    type = null;
  }


}


/**
 * keypress handler for Internet Explorer
 *
 * @param domEvent (Element) DomEvent
 */
qx.Proto._mshtmlKeyPressHandler = function(domEvent)
{
  var ieCharCodeToKeyCode = {
    13: 13,
    27: 27
  };
  var keyCode = 0;
  var charCode = domEvent.keyCode;
  if (ieCharCodeToKeyCode[domEvent.keyCode])
  {
    keyCode = ieCharCodeToKeyCode[domEvent.keyCode];
    charCode = 0;
  }

  this._idealKeyHandler(keyCode, charCode, domEvent.type, domEvent);
}


/**
 * key handler for Safari/Webkit
 * @param domEvent (Element) DomEvent
 */
qx.Proto._webkitKeyHandler = function(domEvent)
{
  var keyCode = 0;
  var charCode = 0;
  var e = domEvent;


  // prevent Safari from sending key signals twice
  // This bug is fixed in recent Webkit builds so we need a revision check
  // see http://trac.mochikit.com/ticket/182 for details
  if (qx.sys.Client.getInstance().getVersion() < 420) {
    if (!this._lastCharCodeForType) {
      this._lastCharCodeForType = {};
    }
    var isSafariSpecialKey = this._lastCharCodeForType[e.type] > 63000;
    if (isSafariSpecialKey) {
      this._lastCharCodeForType[e.type] = null;
      return;
    }
    this._lastCharCodeForType[e.type] = e.charCode;
  }

  var specialKeys = this._webkit_specialKeyMap;
  if (e.type == "keyup" || e.type == "keydown") {
    keyCode = specialKeys[e.charCode] || e.keyCode;
  } else {
    if (specialKeys[e.charCode]) {
      keyCode = specialKeys[e.charCode];
    } else {
      charCode = e.charCode;
    }
  }
  this._idealKeyHandler(keyCode, charCode, e.type, e);
}


qx.Proto._webkit_specialKeyMap = {
  // Safari Mappings
  63289: qx.Proto._identifierToKeyCode("NumLock"),
  63276: qx.Proto._identifierToKeyCode("PageUp"),
  63277: qx.Proto._identifierToKeyCode("PageDown"),
  63275: qx.Proto._identifierToKeyCode("End"),
  63273: qx.Proto._identifierToKeyCode("Home"),
  63234: qx.Proto._identifierToKeyCode("Left"),
  63232: qx.Proto._identifierToKeyCode("Up"),
  63235: qx.Proto._identifierToKeyCode("Right"),
  63233: qx.Proto._identifierToKeyCode("Down"),
  63272: qx.Proto._identifierToKeyCode("Delete"),
  63302: qx.Proto._identifierToKeyCode("Insert"),
  63236: qx.Proto._identifierToKeyCode("F1"),
  63237: qx.Proto._identifierToKeyCode("F2"),
  63238: qx.Proto._identifierToKeyCode("F3"),
  63239: qx.Proto._identifierToKeyCode("F4"),
  63240: qx.Proto._identifierToKeyCode("F5"),
  63241: qx.Proto._identifierToKeyCode("F6"),
  63242: qx.Proto._identifierToKeyCode("F7"),
  63243: qx.Proto._identifierToKeyCode("F8"),
  63244: qx.Proto._identifierToKeyCode("F9"),
  63245: qx.Proto._identifierToKeyCode("F10"),
  63246: qx.Proto._identifierToKeyCode("F11"),
  63247: qx.Proto._identifierToKeyCode("F12"),
  63248: qx.Proto._identifierToKeyCode("PrintScreen"),

  3: qx.Proto._identifierToKeyCode("Enter"),
  13: qx.Proto._identifierToKeyCode("Enter"),
  12: qx.Proto._identifierToKeyCode("NumLock")
};



/*
---------------------------------------------------------------------------
  BROWSER-SWITCH
---------------------------------------------------------------------------
*/

// choose correct key handler
if (qx.sys.Client.getInstance().isMshtml())
{
  qx.Proto.onKeyUpDown = qx.Proto._mshtmlKeyUpDownHandler;
  qx.Proto.onKeyPress = qx.Proto._mshtmlKeyPressHandler;
}
else if (qx.sys.Client.getInstance().isGecko())
{
  qx.Proto.onKeyUpDown = qx.Proto._geckoKeyHandler;
  qx.Proto.onKeyPress = qx.Proto._geckoKeyHandler;
}
else if (qx.sys.Client.getInstance().isWebkit())
{
  qx.Proto.onKeyUpDown = qx.Proto._webkitKeyHandler;
  qx.Proto.onKeyPress = qx.Proto._webkitKeyHandler;
}
else if (qx.sys.Client.getInstance().isOpera())
{
  qx.Proto.onKeyUpDown = qx.Proto._mshtmlKeyUpDownHandler;
  qx.Proto.onKeyPress = qx.Proto._mshtmlKeyPressHandler;
}
else
{
  qx.Proto.onKeyUpDown = qx.Proto._idealKeyHandler;
  qx.Proto.onKeyPress = qx.Proto._idealKeyHandler;
}



/*
---------------------------------------------------------------------------
  DISPOSE
---------------------------------------------------------------------------
*/

/**
 * Destructor
 */
qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  }

  // Detach keyboard events
  this.detachEvents();
};



/*
---------------------------------------------------------------------------
  DEFER SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

/**
 * Singleton Instance Getter
 */
qx.Class.getInstance = qx.util.Return.returnInstance;
