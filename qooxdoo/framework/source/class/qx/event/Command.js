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
 * Commands can be used to globally define keyboard shortcuts. They could
 * also be used to assign a execution of a command sequence to multiple
 * widgets. It is possible to use the same Command in a MenuButton and
 * ToolBarButton for example.
 */
qx.Class.define("qx.event.Command",
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
   *    The key must be seperated by a <code>+</code> or <code>-</code> character.
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

    // OSX warning for Alt key combinations
    if (qx.core.Variant.isSet("qx.debug", "on"))
    {
      if (this.__modifier.Alt && this.__key && this.__key.length == 1)
      {
        if ((this.__key >= "A" && this.__key <= "Z") || (this.__key >= "0" && this.__key <= "9")) {
          this.warn("A shortcut containing Alt and a letter or number will not work under OS X!");
        }
      }
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
    }
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
      USER METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Fire the "execute" event on this command.
     *
     * @param vTarget {Object} Object which issued the execute event
     */
    execute : function(vTarget) {
      this.fireDataEvent("execute", vTarget);
    },


    /**
     * Key press event handler.
     *
     * @param event {qx.event.type.KeyEvent} The key event object
     */
    __onKeyPress : function(event)
    {
      if (this.getEnabled() && this.matchesKeyEvent(event))
      {
        this.execute(event.getTarget());
        event.preventDefault();
        event.stopPropagation();
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
        qx.event.Registration.addListener(document.documentElement, "keydown", this.__onKeyPress, this);
      } else {
        qx.event.Registration.removeListener(document.documentElement, "keydown", this.__onKeyPress, this);
      }
    },


    // property apply
    _applyShortcut : function(value, old)
    {
      if (value)
      {
        this.__modifier = {};
        this.__key = null;

        // split string to get each key which must be pressed
        // build a hash with active keys
        var a = value.split(/[-+\s]+/);
        var al = a.length;

        for (var i=0; i<al; i++)
        {
          var identifier = this.__noramlizeKeyIdentifier(a[i]);

          switch(identifier)
          {
            case "Control":
            case "Shift":
            case "Meta":
            case "Alt":
              this.__modifier[identifier] = true;
              break;

            case "Unidentified":
              var msg = "Not a valid key name for a command: " + a[i];
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
     * Checks whether the given key event matches the command's shortcut
     *
     * @param e {qx.event.type.KeySequenceEvent} the key event object
     * @return {Boolean} whether the commands shortcut matches the key event
     */
    matchesKeyEvent : function(e)
    {
      var key = this.__key;

      if (!key)
      {
        // no shortcut defined.
        return ;
      }

      // for check special keys
      if (
        (this.__modifier.Shift && !e.isShiftPressed()) ||
        (this.__modifier.Control && !e.isCtrlPressed()) ||
        (this.__modifier.Meta && !e.isMetaPressed()) ||
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
    __noramlizeKeyIdentifier : function(keyName)
    {
      var KeyHandler = qx.event.handler.Keyboard;
      var keyIdentifier = "Unidentified";

      if (KeyHandler.isValidKeyIdentifier(keyName)) {
        return keyName;
      }

      if (keyName.length == 1 && keyName >= "a" && keyName <= "z") {
        return keyName.toUpperCase();
      }

      keyName = keyName.toLowerCase();
      var keyIdentifier = this.__oldKeyNameToKeyIdentifierMap[keyName] || qx.lang.String.firstUp(keyName);

      if (KeyHandler.isValidKeyIdentifier(keyIdentifier)) {
        return keyIdentifier;
      } else {
        return "Unidentified";
      }
    },




    /*
    ---------------------------------------------------------------------------
      STRING CONVERTION
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the shortcut as string using the currently selected locale
     *
     * @return {String} shortcut
     */
    toString : function()
    {
      var key = this.__key;

      var str = [];

      for (var modifier in this.__modifier) {
        str.push(qx.locale.Key.getKeyName("short", modifier));
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

    this._disposeFields("__modifier", "__key");
  }
});
