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

************************************************************************ */

/* ************************************************************************

#module(guicore)

************************************************************************ */

/*!
  This contains a command with shortcut.

  Each command could be accigned to multiple widgets.
*/
qx.OO.defineClass("qx.client.Command", qx.core.Target,
function(vShortcut, vKeyCode, vManager)
{
  qx.core.Target.call(this);

  this._shortcutParts = {};

  if (qx.util.Validation.isValid(vShortcut)) {
    this.setShortcut(vShortcut);
  }

  if (qx.util.Validation.isValid(vKeyCode)) {
    this.setKeyCode(vKeyCode);
  }

  this.setManager(qx.util.Validation.isValid(vManager) ? vManager : qx.core.Init.getComponent().getClientWindow().getEventManager());
});

qx.OO.addProperty({ name : "checked", type : qx.constant.Type.BOOLEAN, defaultValue : false });
qx.OO.addProperty({ name : "shortcut", type : qx.constant.Type.STRING });
qx.OO.addProperty({ name : "keyCode", type : qx.constant.Type.NUMBER });
qx.OO.addProperty({ name : "manager", type : qx.constant.Type.OBJECT, instance : "qx.event.handler.EventHandler" });

qx.Class.C_KEY_CTRL = "ctrl";
qx.Class.C_KEY_SHIFT = "shift";
qx.Class.C_KEY_ALT = "alt";
qx.Class.C_KEY_CONTROL = "control";



/*
---------------------------------------------------------------------------
  USER METHODS
---------------------------------------------------------------------------
*/

qx.Proto.execute = function(vTarget)
{
  if (this.hasEventListeners(qx.constant.Event.EXECUTE)) {
    this.dispatchEvent(new qx.event.type.DataEvent(qx.constant.Event.EXECUTE, vTarget), true);
  }

  return false;
}







/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifyShortcut = function(propValue, propOldValue, propData)
{
  if (propValue)
  {
    // split string to get each key which must be pressed
    // build a hash with active keys
    this._shortcutParts = {};

    var a = propValue.toLowerCase().split(/[-+\s]+/);
    var al = a.length;

    for (var i=0; i<al; i++) {
      this._shortcutParts[a[i]] = true;
    }
  }
  else
  {
    this._shortcutParts = {};
  }

  return true;
}

qx.Proto._modifyManager = function(propValue, propOldValue, propData)
{
  if (propOldValue) {
    propOldValue.removeCommand(this);
  }

  if (propValue) {
    propValue.addCommand(this);
  }

  return true;
}







/*
---------------------------------------------------------------------------
  INTERNAL MATCHING LOGIC
---------------------------------------------------------------------------
*/

qx.Proto._matchesKeyEvent = function(e)
{
  // pre check if parts are configured
  if (typeof this._shortcutParts !== qx.constant.Type.OBJECT && this._shortcutParts !== null) {
    return false;
  }

  // pre check for configured shortcut or keycode
  if (!(qx.util.Validation.isValid(this.getShortcut()) || qx.util.Validation.isValid(this.getKeyCode()))) {
    return false;
  }

  // pre-check for check special keys
  // we handle this here to omit to check this later again.
  if ((this._shortcutParts.shift && !e.getShiftKey()) || (this._shortcutParts.ctrl && !e.getCtrlKey()) || (this._shortcutParts.alt && !e.getAltKey())) {
    return false;
  }

  var vEventCode = e.getKeyCode();
  var vSelfCode = this.getKeyCode();


  /* ------------------------------------------
    #1 : Check if keycode defined is the same
         as the one from the event.

         For example this match something
         like: Esc, Space, ...

         any integer number which represents
         a valid key code
  ------------------------------------------ */

  // Check for key code
  switch(vSelfCode)
  {
    case null:
      break;

    case vEventCode:
      return true;
  }


  /* ------------------------------------------
    #2 : Check if char from event key match
         any of the parts in the defined
         shortcut.

         Good for ranges which match the
         following: a-zA-Z0-9

         For example this match something
         like: Ctrl+Alt+G
  ------------------------------------------ */

  // build string from code to test matching
  var c = String.fromCharCode(vEventCode).toLowerCase();

  // if keycode string is in shortcuts
  if (this._shortcutParts[c]) {
    return true;
  }


  /* ------------------------------------------
    #3 : If no keycode is defined, look if
         any of the keys in our parts hash
         match the pressed event key.

         For example this match something
         like: Ctrl+Alt+Entf
  ------------------------------------------ */

  // If no keycode is defined
  if (vSelfCode == null)
  {
    for (var vPart in this._shortcutParts)
    {
      switch(vPart)
      {
        case qx.client.Command.C_KEY_CTRL:
        case qx.client.Command.C_KEY_SHIFT:
        case qx.client.Command.C_KEY_ALT:
        case qx.client.Command.C_KEY_CONTROL:
          break;

        default:
          if (vEventCode == qx.event.type.KeyEvent.keys[vPart]) {
            return true;
          }
      }
    }
  }

  return false;
}






/*
---------------------------------------------------------------------------
  STRING CONVERTION
---------------------------------------------------------------------------
*/

qx.Proto.toString = function()
{
  var vShortcut = this.getShortcut();
  var vKeyCode = this.getKeyCode();
  var vString = qx.constant.Core.EMPTY;

  if (qx.util.Validation.isValidString(vShortcut))
  {
    vString = vShortcut;

    if (qx.util.Validation.isValidNumber(vKeyCode))
    {
      var vTemp = qx.event.type.KeyEvent.codes[vKeyCode];
      vString += qx.constant.Core.PLUS + (vTemp ? qx.lang.String.toFirstUp(vTemp) : String(vKeyCode));
    }
  }
  else if (qx.util.Validation.isValidNumber(vKeyCode))
  {
    var vTemp = qx.event.type.KeyEvent.codes[vKeyCode];
    vString = vTemp ? qx.lang.String.toFirstUp(vTemp) : String(vKeyCode);
  }

  return vString;
}





/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  }

  this._shortcutParts = null;

  var vManager = this.getManager();
  if (vManager) {
    vManager.removeCommand(this);
  }

  return qx.core.Target.prototype.dispose.call(this);
}
