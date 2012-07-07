
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

/* ************************************************************************

#require(qx.event.handler.UserAction)

************************************************************************ */

/**
 * This class provides unified key event handler for Internet Explorer,
 * Firefox, Opera and Safari.
 */
qx.Class.define("qx.event.handler.Keyboard",
{
  extend : qx.core.Object,
  implement : qx.event.IEventHandler,





  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Create a new instance
   *
   * @param manager {qx.event.Manager} Event manager for the window to use
   */
  construct : function(manager)
  {
    this.base(arguments);

    // Define shorthands
    this.__manager = manager;
    this.__window = manager.getWindow();

    // Gecko ignores key events when not explicitly clicked in the document.
    if ((qx.core.Environment.get("engine.name") == "gecko")) {
      this.__root = this.__window;
    } else {
      this.__root = this.__window.document.documentElement;
    }

    // Internal sequence cache
    this.__lastUpDownType = {};

    // Initialize observer
    this._initKeyObserver();
  },





  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {Integer} Priority of this handler */
    PRIORITY : qx.event.Registration.PRIORITY_NORMAL,


    /** {Map} Supported event types */
    SUPPORTED_TYPES :
    {
      keyup : 1,
      keydown : 1,
      keypress : 1,
      keyinput : 1
    },


    /** {Integer} Which target check to use */
    TARGET_CHECK : qx.event.IEventHandler.TARGET_DOMNODE,


    /** {Integer} Whether the method "canHandleEvent" must be called */
    IGNORE_CAN_HANDLE : true,


    /**
     * Checks whether a given string is a valid keyIdentifier
     *
     * @param keyIdentifier {String} The key identifier.
     * @return {Boolean} whether the given string is a valid keyIdentifier
     * @deprecated since 2.0
     */
    isValidKeyIdentifier : function(keyIdentifier)
    {
      qx.log.Logger.deprecatedMethodWarning(arguments.callee,
        "Use qx.event.util.Keyboard.isValidKeyIdentifier instead.");
      return qx.event.util.Keyboard.isValidKeyIdentifier(keyIdentifier);
    },


    /**
     * Checks whether a given string is a printable keyIdentifier.
     *
     * @param keyIdentifier {String} The key identifier.
     * @return {Boolean} whether the given string is a printable keyIdentifier.
     * @deprecated since 2.0
     */
    isPrintableKeyIdentifier : function(keyIdentifier)
    {
      qx.log.Logger.deprecatedMethodWarning(arguments.callee,
        "Use qx.event.util.Keyboard.isPrintableKeyIdentifier instead.");
      return qx.event.util.Keyboard.isPrintableKeyIdentifier(keyIdentifier);
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    __onKeyUpDownWrapper  : null,
    __manager : null,
    __window : null,
    __root : null,
    __lastUpDownType : null,
    __lastKeyCode : null,
    __inputListeners : null,
    __onKeyPressWrapper : null,


    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER INTERFACE
    ---------------------------------------------------------------------------
    */

    // interface implementation
    canHandleEvent : function(target, type) {},


    // interface implementation
    registerEvent : function(target, type, capture) {
      // Nothing needs to be done here
    },


    // interface implementation
    unregisterEvent : function(target, type, capture) {
      // Nothing needs to be done here
    },




    /*
    ---------------------------------------------------------------------------
      HELPER
    ---------------------------------------------------------------------------
    */


    /**
     * Fire a key input event with the given parameters
     *
     * @param domEvent {Event} DOM event
     * @param charCode {Integer} character code
     */
    _fireInputEvent : function(domEvent, charCode)
    {
      var target = this.__getEventTarget();

      // Only fire when target is defined and visible
      if (target && target.offsetWidth != 0)
      {
        var event = qx.event.Registration.createEvent("keyinput", qx.event.type.KeyInput, [domEvent, target, charCode]);
        this.__manager.dispatchEvent(target, event);
      }

      // Fire user action event
      // Needs to check if still alive first
      if (this.__window) {
        qx.event.Registration.fireEvent(this.__window, "useraction", qx.event.type.Data, ["keyinput"]);
      }
    },


    /**
     * Fire a key up/down/press event with the given parameters
     *
     * @param domEvent {Event} DOM event
     * @param type {String} type og the event
     * @param keyIdentifier {String} key identifier
     */
    _fireSequenceEvent : function(domEvent, type, keyIdentifier)
    {
      var target = this.__getEventTarget();
      var keyCode = domEvent.keyCode;

      // Fire key event
      var event = qx.event.Registration.createEvent(type, qx.event.type.KeySequence, [domEvent, target, keyIdentifier]);
      this.__manager.dispatchEvent(target, event);

      // IE and Safari suppress a "keypress" event if the "keydown" event's
      // default action was prevented. In this case we emulate the "keypress"
      if (
        qx.core.Environment.get("engine.name") == "mshtml" ||
        qx.core.Environment.get("engine.name") == "webkit"
      )
      {
        if (type == "keydown" && event.getDefaultPrevented())
        {
          // some key press events are already emulated. Ignore these events.
          if (!qx.event.util.Keyboard.isNonPrintableKeyCode(keyCode) && !this._emulateKeyPress[keyCode]) {
            this._fireSequenceEvent(domEvent, "keypress", keyIdentifier);
          }
        }
      }

      // Fire user action event
      // Needs to check if still alive first
      if (this.__window) {
        qx.event.Registration.fireEvent(this.__window, "useraction", qx.event.type.Data, [type]);
      }
    },


    /**
     * Get the target element for mouse events
     *
     * @return {Element} the event target element
     */
    __getEventTarget : function()
    {
      var focusHandler = this.__manager.getHandler(qx.event.handler.Focus);
      var target = focusHandler.getActive();

      // Fallback to focused element when active is null or invisible
      if (!target || target.offsetWidth == 0) {
        target = focusHandler.getFocus();
      }

      // Fallback to body when focused is null or invisible
      if (!target || target.offsetWidth == 0) {
        target = this.__manager.getWindow().document.body;
      }

      return target;
    },




    /*
    ---------------------------------------------------------------------------
      OBSERVER INIT/STOP
    ---------------------------------------------------------------------------
    */

    /**
     * Initializes the native key event listeners.
     *
     * @signature function()
     * @return {void}
     */
    _initKeyObserver : function()
    {
      this.__onKeyUpDownWrapper = qx.lang.Function.listener(this.__onKeyUpDown, this);
      this.__onKeyPressWrapper = qx.lang.Function.listener(this.__onKeyPress, this);

      var Event = qx.bom.Event;

      Event.addNativeListener(this.__root, "keyup", this.__onKeyUpDownWrapper);
      Event.addNativeListener(this.__root, "keydown", this.__onKeyUpDownWrapper);
      Event.addNativeListener(this.__root, "keypress", this.__onKeyPressWrapper);
    },


    /**
     * Stops the native key event listeners.
     *
     * @signature function()
     * @return {void}
     */
    _stopKeyObserver : function()
    {
      var Event = qx.bom.Event;

      Event.removeNativeListener(this.__root, "keyup", this.__onKeyUpDownWrapper);
      Event.removeNativeListener(this.__root, "keydown", this.__onKeyUpDownWrapper);
      Event.removeNativeListener(this.__root, "keypress", this.__onKeyPressWrapper);

      for (var key in (this.__inputListeners || {}))
      {
        var listener = this.__inputListeners[key];
        Event.removeNativeListener(listener.target, "keypress", listener.callback);
      }
      delete(this.__inputListeners);
    },





    /*
    ---------------------------------------------------------------------------
      NATIVE EVENT OBSERVERS
    ---------------------------------------------------------------------------
    */

    /**
     * Low level handler for "keyup" and "keydown" events
     *
     * @internal
     * @signature function(domEvent)
     * @param domEvent {Event} DOM event object
     */
    __onKeyUpDown : qx.event.GlobalError.observeMethod(qx.core.Environment.select("engine.name",
    {
      "mshtml" : function(domEvent)
      {
        domEvent = window.event || domEvent;

        var keyCode = domEvent.keyCode;
        var charCode = 0;
        var type = domEvent.type;

        // Ignore the down in such sequences dp dp dp
        if (!(this.__lastUpDownType[keyCode] == "keydown" && type == "keydown")) {
          this._idealKeyHandler(keyCode, charCode, type, domEvent);
        }

        // On non print-able character be sure to add a keypress event
        if (type == "keydown")
        {
          // non-printable, backspace or tab
          if (qx.event.util.Keyboard.isNonPrintableKeyCode(keyCode) || this._emulateKeyPress[keyCode]) {
            this._idealKeyHandler(keyCode, charCode, "keypress", domEvent);
          }
        }

        // Store last type
        this.__lastUpDownType[keyCode] = type;
      },

      "gecko" : function(domEvent)
      {
        var charCode = 0;
        var keyCode = domEvent.keyCode;
        var type = domEvent.type;
        var kbUtil = qx.event.util.Keyboard;

        // FF repeats under windows keydown events like IE
        if (qx.core.Environment.get("os.name") == "win")
        {
          var keyIdentifier = keyCode ? kbUtil.keyCodeToIdentifier(keyCode) : kbUtil.charCodeToIdentifier(charCode);

          if (!(this.__lastUpDownType[keyIdentifier] == "keydown" && type == "keydown")) {
            this._idealKeyHandler(keyCode, charCode, type, domEvent);
          }

          // Store last type
          this.__lastUpDownType[keyIdentifier] = type;
        }

        // all other OSes
        else
        {
          this._idealKeyHandler(keyCode, charCode, type, domEvent);
        }

        this.__firefoxInputFix(domEvent.target, type, keyCode);
      },

      "webkit" : function(domEvent)
      {
        var keyCode = 0;
        var charCode = 0;
        var type = domEvent.type;

        // starting with Safari 3.1 (version 525.13) Apple switched the key
        // handling to match the IE behaviour.
        if (parseFloat(qx.core.Environment.get("engine.version")) < 525.13)
        {
          if (type == "keyup" || type == "keydown")
          {
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
          keyCode = domEvent.keyCode;

          this._idealKeyHandler(keyCode, charCode, type, domEvent);

          // On non print-able character be sure to add a keypress event
          if (type == "keydown")
          {
            // non-printable, backspace or tab
            if (qx.event.util.Keyboard.isNonPrintableKeyCode(keyCode) || this._emulateKeyPress[keyCode]) {
              this._idealKeyHandler(keyCode, charCode, "keypress", domEvent);
            }
          }

          // Store last type
          this.__lastUpDownType[keyCode] = type;
        }

      },

      "opera" : function(domEvent)
      {
        this.__lastKeyCode = domEvent.keyCode;
        this._idealKeyHandler(domEvent.keyCode, 0, domEvent.type, domEvent);
      }
    })),


    /**
     * some keys like "up", "down", "pageup", "pagedown" do not bubble a
     * "keypress" event in Firefox. To work around this bug we attach keypress
     * listeners directly to the input events.
     *
     * https://bugzilla.mozilla.org/show_bug.cgi?id=467513
     *
     * @signature function(target, type, keyCode)
     * @param target {Element} The event target
     * @param type {String} The event type
     * @param keyCode {Integer} the key code
     */
    __firefoxInputFix : qx.core.Environment.select("engine.name",
    {
      "gecko" : function(target, type, keyCode)
      {
        if (
          type === "keydown" &&
          (keyCode == 33 || keyCode == 34 || keyCode == 38 || keyCode == 40) &&
          target.type == "text" &&
          target.tagName.toLowerCase() === "input" &&
          target.getAttribute("autoComplete") !== "off"
        )
        {
          if (!this.__inputListeners) {
            this.__inputListeners = {};
          }
          var hash = qx.core.ObjectRegistry.toHashCode(target);
          if (this.__inputListeners[hash]) {
            return;
          }
          var self = this;
          this.__inputListeners[hash] = {
            target: target,
            callback : function(domEvent)
            {
              qx.bom.Event.stopPropagation(domEvent);
              self.__onKeyPress(domEvent);
            }
          };
          var listener = qx.event.GlobalError.observeMethod(this.__inputListeners[hash].callback);
          qx.bom.Event.addNativeListener(target, "keypress", listener);
        }
      },

      "default" : null
    }),


    /**
     * Low level key press handler
     *
     * @signature function(domEvent)
     * @param domEvent {Event} DOM event object
     */
    __onKeyPress : qx.event.GlobalError.observeMethod(qx.core.Environment.select("engine.name",
    {
      "mshtml" : function(domEvent)
      {
        domEvent = window.event || domEvent;

        if (this._charCode2KeyCode[domEvent.keyCode]) {
          this._idealKeyHandler(this._charCode2KeyCode[domEvent.keyCode], 0, domEvent.type, domEvent);
        } else {
          this._idealKeyHandler(0, domEvent.keyCode, domEvent.type, domEvent);
        }
      },

      "gecko" : function(domEvent)
      {
        var charCode = domEvent.charCode;
        var type = domEvent.type;

        this._idealKeyHandler(domEvent.keyCode, charCode, type, domEvent);
      },

      "webkit" : function(domEvent)
      {
        // starting with Safari 3.1 (version 525.13) Apple switched the key
        // handling to match the IE behaviour.
        if (parseFloat(qx.core.Environment.get("engine.version")) < 525.13)
        {
          var keyCode = 0;
          var charCode = 0;
          var type = domEvent.type;

          if (type == "keyup" || type == "keydown")
          {
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
        var keyCode = domEvent.keyCode;
        var type = domEvent.type;

        // Some keys are identified differently for key up/down and keypress
        // (e.g. "v" gets identified as "F7").
        // So we store the last key up/down keycode and compare it to the
        // current keycode.
        // See http://bugzilla.qooxdoo.org/show_bug.cgi?id=603
        if(keyCode != this.__lastKeyCode)
        {
          this._idealKeyHandler(0, this.__lastKeyCode, type, domEvent);
        }
        else
        {
          if (qx.event.util.Keyboard.keyCodeToIdentifierMap[domEvent.keyCode]) {
            this._idealKeyHandler(domEvent.keyCode, 0, domEvent.type, domEvent);
          } else {
            this._idealKeyHandler(0, domEvent.keyCode, domEvent.type, domEvent);
          }
        }

      }
    })),





    /*
    ---------------------------------------------------------------------------
      IDEAL KEY HANDLER
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
      var keyIdentifier;

      // Use: keyCode
      if (keyCode || (!keyCode && !charCode))
      {
        keyIdentifier = qx.event.util.Keyboard.keyCodeToIdentifier(keyCode);

        this._fireSequenceEvent(domEvent, eventType, keyIdentifier);
      }

      // Use: charCode
      else
      {
        keyIdentifier = qx.event.util.Keyboard.charCodeToIdentifier(charCode);

        this._fireSequenceEvent(domEvent, "keypress", keyIdentifier);
        this._fireInputEvent(domEvent, charCode);
      }
    },






    /*
    ---------------------------------------------------------------------------
      KEY MAPS
    ---------------------------------------------------------------------------
    */


    /**
     * {Map} maps the charcodes of special keys for key press emulation
     *
     * @lint ignoreReferenceField(_emulateKeyPress)
     */
    _emulateKeyPress : qx.core.Environment.select("engine.name",
    {
      "mshtml" : {
        8: true,
        9: true
      },

      "webkit" : {
        8: true,
        9: true,
        27: true
      },

      "default" : {}
    }),




    /*
    ---------------------------------------------------------------------------
      HELPER METHODS
    ---------------------------------------------------------------------------
    */


    /**
     * Checks whether the keyCode represents a non printable key
     *
     * @param keyCode {String} key code to check.
     * @return {Boolean} Whether the keyCode represents a non printable key.
     * @deprecated since 2.0
     */
    _isNonPrintableKeyCode : function(keyCode) {
      qx.log.Logger.deprecatedMethodWarning(arguments.callee,
        "Use qx.event.util.Keyboard.isNonPrintableKeyCode instead.");
      return qx.event.util.Keyboard.isNonPrintableKeyCode(keyCode);
    },


    /**
     * Check whether the keycode can be reliably detected in keyup/keydown events
     *
     * @param keyCode {String} key code to check.
     * @return {Boolean} Whether the keycode can be reliably detected in keyup/keydown events.
     * @deprecated since 2.0
     */
    _isIdentifiableKeyCode : function(keyCode)
    {
      qx.log.Logger.deprecatedMethodWarning(arguments.callee,
        "Use qx.event.util.Keyboard.isIdentifiableKeyCode instead.");
      return qx.event.util.Keyboard.isIdentifiableKeyCode(keyCode);
    },


    /**
     * converts a keyboard code to the corresponding identifier
     *
     * @param keyCode {Integer} key code
     * @return {String} key identifier
     * @deprecated since 2.0
     */
    _keyCodeToIdentifier : function(keyCode)
    {
      qx.log.Logger.deprecatedMethodWarning(arguments.callee,
        "Use qx.event.util.Keyboard.keyCodeToIdentifier instead.");
      return qx.event.util.Keyboard.keyCodeToIdentifier(keyCode);
    },


    /**
     * converts a character code to the corresponding identifier
     *
     * @param charCode {String} character code
     * @return {String} key identifier
     * @deprecated since 2.0
     */
    _charCodeToIdentifier : function(charCode) {
      qx.log.Logger.deprecatedMethodWarning(arguments.callee,
        "Use qx.event.util.Keyboard.charCodeToIdentifier instead.");
      return qx.event.util.Keyboard.charCodeToIdentifier(charCode);
    },


    /**
     * converts a key identifier back to a keycode
     *
     * @param keyIdentifier {String} The key identifier to convert
     * @return {Integer} keyboard code
     */
    _identifierToKeyCode : function(keyIdentifier) {
      return qx.event.util.Keyboard.identifierToKeyCodeMap[keyIdentifier] || keyIdentifier.charCodeAt(0);
    }
  },






  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._stopKeyObserver();
    this.__lastKeyCode = this.__manager = this.__window = this.__root = this.__lastUpDownType = null;
  },





  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics, members)
  {
    // register at the event handler
    qx.event.Registration.addHandler(statics);

    if ((qx.core.Environment.get("engine.name") == "mshtml"))
    {
      members._charCode2KeyCode =
      {
        13 : 13,
        27 : 27
      };
    }
    else if ((qx.core.Environment.get("engine.name") == "webkit"))
    {
      // starting with Safari 3.1 (version 525.13) Apple switched the key
      // handling to match the IE behaviour.
      if (parseFloat(qx.core.Environment.get("engine.version")) < 525.13 )
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
  }
});
