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
 * Shortcuts can be used to globally define keyboard shortcuts.
 */
qx.Class.define("qx.bom.Shortcut",
{
  extend : qx.core.Object,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Create a new instance of Command
   *
   * @param shortcut {String} shortcuts can be composed of optional modifier
   *    keys Control, Alt, Shift, Meta and a non modifier key.
   *    If no non modifier key is specified, the second paramater is evaluated.
   *    The key must be separated by a <code>+</code> or <code>-</code> character.
   *    Examples: Alt+F1, Control+C, Control+Alt+Delete
   */
  construct : function(shortcut)
  {
    this.base(arguments);

    this.__modifier = {};
    this.__key = null;

    if (shortcut != null) {
      this.setShortcut(shortcut);
    }

    this.initEnabled();
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /**
     * Fired when the command is executed. Sets the "data" property of the event to
     * the object that issued the command.
     */
    "execute" : "qx.event.type.Data"
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** whether the command should be respected/enabled */
    enabled :
    {
      init : true,
      check : "Boolean",
      event : "changeEnabled",
      apply : "_applyEnabled"
    },


    /** The command shortcut */
    shortcut :
    {
      check : "String",
      apply : "_applyShortcut",
      nullable : true
    },


    /**
     * Whether the execute event should be fired repeatedly if the user keep
     * the keys pressed.
     */
    autoRepeat :
    {
      check : "Boolean",
      init : false
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __modifier : "",
    __key : "",


    /*
    ---------------------------------------------------------------------------
      USER METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Fire the "execute" event on this shortcut.
     *
     * @param target {Object} Object which issued the execute event
     */
    execute : function(target) {
      this.fireDataEvent("execute", target);
    },


    /**
     * Key down event handler.
     *
     * @param event {qx.event.type.KeySequence} The key event object
     */
    __onKeyDown : function(event)
    {
      if (this.getEnabled() && this.__matchesKeyEvent(event))
      {
        if (!this.isAutoRepeat()) {
          this.execute(event.getTarget());
        }
        event.stop();
      }
    },


    /**
     * Key press event handler.
     *
     * @param event {qx.event.type.KeySequence} The key event object
     */
    __onKeyPress : function(event)
    {
      if (this.getEnabled() && this.__matchesKeyEvent(event))
      {
        if (this.isAutoRepeat()) {
          this.execute(event.getTarget());
        }
        event.stop();
      }
    },



    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */


    // property apply
    _applyEnabled : function(value, old)
    {
      if (value) {
        qx.event.Registration.addListener(document.documentElement, "keydown", this.__onKeyDown, this);
        qx.event.Registration.addListener(document.documentElement, "keypress", this.__onKeyPress, this);
      } else {
        qx.event.Registration.removeListener(document.documentElement, "keydown", this.__onKeyDown, this);
        qx.event.Registration.removeListener(document.documentElement, "keypress", this.__onKeyPress, this);
      }
    },


    // property apply
    _applyShortcut : function(value, old)
    {
      if (value)
      {
        // do not allow whitespaces within shortcuts
        if (value.search(/[\s]+/) != -1)
        {
          var msg = "Whitespaces are not allowed within shortcuts";
          this.error(msg);
          throw new Error(msg);
        }

        this.__modifier = { "Control" : false,
                            "Shift"   : false,
                            "Meta"    : false,
                            "Alt"     : false };
        this.__key = null;

        // To support shortcuts with "+" and "-" as keys it is necessary
        // to split the given value in a different way to determine the
        // several keyIdentifiers
        var index;
        var a = [];
        while (value.length > 0 && index != -1)
        {
          // search for delimiters "+" and "-"
          index = value.search(/[-+]+/);

          // add identifiers - take value if no separator was found or
          // only one char is left (second part of shortcut)
          a.push((value.length == 1 || index == -1) ? value : value.substring(0, index));

          // extract the already detected identifier
          value = value.substring(index + 1);
        }
        var al = a.length;

        for (var i=0; i<al; i++)
        {
          var identifier = this.__normalizeKeyIdentifier(a[i]);

          switch(identifier)
          {
            case "Control":
            case "Shift":
            case "Meta":
            case "Alt":
              this.__modifier[identifier] = true;
              break;

            case "Unidentified":
              var msg = "Not a valid key name for a shortcut: " + a[i];
              this.error(msg);
              throw msg;

            default:
              if (this.__key)
              {
                var msg = "You can only specify one non modifier key!";
                this.error(msg);
                throw msg;
              }

              this.__key = identifier;
          }
        }
      }

      return true;
    },




    /*
    --------------------------------------------------------------------------
      INTERNAL MATCHING LOGIC
    ---------------------------------------------------------------------------
    */

    /**
     * Checks whether the given key event matches the shortcut's shortcut
     *
     * @param e {qx.event.type.KeySequence} the key event object
     * @return {Boolean} whether the shortcuts shortcut matches the key event
     */
    __matchesKeyEvent : function(e)
    {
      var key = this.__key;

      if (!key)
      {
        // no shortcut defined.
        return ;
      }

      // for check special keys
      // and check if a shortcut is a single char and special keys are pressed
      if (
        (!this.__modifier.Shift && e.isShiftPressed()) ||
        (this.__modifier.Shift && !e.isShiftPressed()) ||
        (!this.__modifier.Control && e.isCtrlPressed()) ||
        (this.__modifier.Control && !e.isCtrlPressed()) ||
        (!this.__modifier.Meta && e.isMetaPressed()) ||
        (this.__modifier.Meta && !e.isMetaPressed()) ||
        (!this.__modifier.Alt && e.isAltPressed()) ||
        (this.__modifier.Alt && !e.isAltPressed())
      ) {
        return false;
      }

      if (key == e.getKeyIdentifier()) {
        return true;
      }

      return false;
    },


    /*
    ---------------------------------------------------------------------------
      COMPATIBILITY TO COMMAND
    ---------------------------------------------------------------------------
    */

    /**
     * @lint ignoreReferenceField(__oldKeyNameToKeyIdentifierMap)
     */
    __oldKeyNameToKeyIdentifierMap :
    {
      // all other keys are converted by converting the first letter to uppercase
      esc             : "Escape",
      ctrl            : "Control",
      print           : "PrintScreen",
      del             : "Delete",
      pageup          : "PageUp",
      pagedown        : "PageDown",
      numlock         : "NumLock",
      numpad_0        : "0",
      numpad_1        : "1",
      numpad_2        : "2",
      numpad_3        : "3",
      numpad_4        : "4",
      numpad_5        : "5",
      numpad_6        : "6",
      numpad_7        : "7",
      numpad_8        : "8",
      numpad_9        : "9",
      numpad_divide   : "/",
      numpad_multiply : "*",
      numpad_minus    : "-",
      numpad_plus     : "+"
    },


    /**
     * Checks and normalizes the key identifier.
     *
     * @param keyName {String} name of the key.
     * @return {String} normalized keyIdentifier or "Unidentified" if a conversion was not possible
     */
    __normalizeKeyIdentifier : function(keyName)
    {
      var kbUtil = qx.event.util.Keyboard;
      var keyIdentifier = "Unidentified";

      if (kbUtil.isValidKeyIdentifier(keyName)) {
        return keyName;
      }

      if (keyName.length == 1 && keyName >= "a" && keyName <= "z") {
        return keyName.toUpperCase();
      }

      keyName = keyName.toLowerCase();
      var keyIdentifier = this.__oldKeyNameToKeyIdentifierMap[keyName] || qx.lang.String.firstUp(keyName);

      if (kbUtil.isValidKeyIdentifier(keyIdentifier)) {
        return keyIdentifier;
      } else {
        return "Unidentified";
      }
    },




    /*
    ---------------------------------------------------------------------------
      STRING CONVERSION
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the shortcut as string using the currently selected locale.
     *
     * @return {String} shortcut
     */
    toString : function()
    {
      var key = this.__key;

      var str = [];

      for (var modifier in this.__modifier) {
        // this.__modifier holds a map with shortcut combination keys
        // like "Control", "Alt", "Meta" and "Shift" as keys with
        // Boolean values
        if (this.__modifier[modifier])
        {
          str.push(qx.locale.Key.getKeyName("short", modifier));
        }
      }

      if (key) {
        str.push(qx.locale.Key.getKeyName("short", key));
      }

      return str.join("+");
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    // this will remove the event listener
    this.setEnabled(false);

    this.__modifier = this.__key = null;
  }
});
