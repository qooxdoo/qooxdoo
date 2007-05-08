/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

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

#module(ui_core)

************************************************************************ */

/**
 * Commands can be used to globally define keyboard shortcuts.
 *
 * Each command can be assigned to multiple widgets.
 */
qx.Class.define("qx.client.Command",
{
  extend : qx.core.Target,

  events :
  {
    /**
     * Fired when the command is executed. Sets the "data" property of the event to
     * the object that issued the command.
     */
    "execute" : "qx.event.type.DataEvent"
  },




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
   *    Examples: Alt+F1, Control+C, Control+Alt+Enf
   *
   * @param keyCode {Integer}  Additional key of the command interpreted as a keyCode.
   */
  construct : function(shortcut, keyCode)
  {
    this.base(arguments);

    this.__modifier = {};
    this.__key = null;

    if (shortcut != null) {
      this.setShortcut(shortcut);
    }

    if (keyCode != null)
    {
      this.warn("The use of keyCode in command is deprecated. Use keyIdentifier instead.");
      this.setKeyCode(keyCode);
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

    qx.event.handler.EventHandler.getInstance().addCommand(this);
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
      event : "changeEnabled"
    },


    /** The command shortcut */
    shortcut :
    {
      check : "String",
      apply : "_modifyShortcut",
      nullable : true
    },


    /**
     * Supports old keyCode layer
     * Still there for compatibility with the old key handler/commands
     *
     * @deprecated
     */
    keyCode :
    {
      check : "Number",
      nullable : true
    },


    /** The key identifier */
    keyIdentifier :
    {
      check : "String",
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
     * @type member
     * @param vTarget {Object} Object which issued the execute event
     * @return {Boolean} TODOC
     */
    execute : function(vTarget)
    {
      if (this.hasEventListeners("execute"))
      {
        var event = new qx.event.type.DataEvent("execute", vTarget);
        this.dispatchEvent(event, true);
      }

      return false;
    },




    /*
    ---------------------------------------------------------------------------
      MODIFIER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     * @throws TODOC
     */
    _modifyShortcut : function(propValue, propOldValue, propData)
    {
      if (propValue)
      {
        this.__modifier = {};
        this.__key = null;

        // split string to get each key which must be pressed
        // build a hash with active keys
        var a = propValue.split(/[-+\s]+/);
        var al = a.length;

        for (var i=0; i<al; i++)
        {
          var identifier = this.__oldKeyNameToKeyIdentifier(a[i]);

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
     * @type member
     * @param e {qx.event.type.KeyEvent} the key event object
     * @return {Boolean} whether the commands shortcut matches the key event
     */
    matchesKeyEvent : function(e)
    {
      var key = this.__key || this.getKeyIdentifier();

      if (!key && !this.getKeyCode())
      {
        // no shortcut defined.
        return ;
      }

      // pre-check for check special keys
      // we handle this here to omit to check this later again.
      if ((this.__modifier.Shift && !e.isShiftPressed()) ||
      (this.__modifier.Control && !e.isCtrlPressed()) ||

      //    (this.__modifier.Meta && !e.getMetaKey()) ||
      (this.__modifier.Alt && !e.isAltPressed())) {
        return false;
      }

      if (key)
      {
        if (key == e.getKeyIdentifier()) {
          return true;
        }
      }
      else
      {
        if (this.getKeyCode() == e.getKeyCode()) {
          return true;
        }
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
     * converts an old key name as found in {@link qx.event.type.KeyEvent.keys} to
     * the new keyIdentifier.
     *
     * @type member
     * @param keyName {String} old name of the key.
     * @return {String} corresponding keyIdentifier or "Unidentified" if a conversion was not possible
     */
    __oldKeyNameToKeyIdentifier : function(keyName)
    {
      var keyHandler = qx.event.handler.KeyEventHandler.getInstance();
      var keyIdentifier = "Unidentified";

      if (keyHandler.isValidKeyIdentifier(keyName)) {
        return keyName;
      }

      if (keyName.length == 1 && keyName >= "a" && keyName <= "z") {
        return keyName.toUpperCase();
      }

      keyName = keyName.toLowerCase();

      // check whether its a valid old key name
      if (!qx.event.type.KeyEvent.keys[keyName]) {
        return "Unidentified";
      }

      var keyIdentifier = this.__oldKeyNameToKeyIdentifierMap[keyName];

      if (keyIdentifier) {
        return keyIdentifier;
      } else {
        return qx.lang.String.toFirstUp(keyName);
      }
    },




    /*
    ---------------------------------------------------------------------------
      STRING CONVERTION
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the shortcut as string
     *
     * @type member
     * @return {String} shortcut
     */
    toString : function()
    {
      // var shortcut = this.getShortcut();
      var keyCode = this.getKeyCode();
      var key = this.__key || this.getKeyIdentifier();

      var str = [];

      for (var modifier in this.__modifier) {
        str.push(qx.locale.Key.getKeyName("short", modifier));
      }

      if (key) {
        str.push(qx.locale.Key.getKeyName("short", key));
      }

      /*
      if (shortcut != null) {
        str.push(shortcut);
      }
      */

      if (keyCode != null)
      {
        var vTemp = qx.event.type.KeyEvent.codes[keyCode];
        str.push(vTemp ? qx.lang.String.toFirstUp(vTemp) : String(keyCode));
      }

      return str.join("-");
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    var mgr = qx.event.handler.EventHandler.getInstance();

    if (mgr) {
      mgr.removeCommand(this);
    }

    this._disposeFields("__modifier", "__key");
  }
});
