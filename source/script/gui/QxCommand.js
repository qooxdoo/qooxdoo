/* ************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (aecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#package(guicore)

************************************************************************ */

/*!
  This contains a command with shortcut.

  Each command could be accigned to multiple widgets.
*/
function QxCommand(vShortcut, vKeyCode, vManager)
{
  QxTarget.call(this);

  this._shortcutParts = {};

  if (QxUtil.isValid(vShortcut)) {
    this.setShortcut(vShortcut);
  };

  if (QxUtil.isValid(vKeyCode)) {
    this.setKeyCode(vKeyCode);
  };

  this.setManager(QxUtil.isValid(vManager) ? vManager : window.application.getClientWindow().getEventManager());
};

QxCommand.extend(QxTarget, "QxCommand");

QxCommand.addProperty({ name : "checked", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });
QxCommand.addProperty({ name : "shortcut", type : QxConst.TYPEOF_STRING });
QxCommand.addProperty({ name : "keyCode", type : QxConst.TYPEOF_NUMBER });
QxCommand.addProperty({ name : "manager", type : QxConst.TYPEOF_OBJECT, instance : "QxEventManager" });





/*
---------------------------------------------------------------------------
  USER METHODS
---------------------------------------------------------------------------
*/

proto.execute = function(vTarget)
{
  if (this.hasEventListeners(QxConst.EVENT_TYPE_EXECUTE)) {
    this.dispatchEvent(new QxDataEvent(QxConst.EVENT_TYPE_EXECUTE, vTarget), true);
  };

  return false;
};







/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyShortcut = function(propValue, propOldValue, propData)
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
    };
  }
  else
  {
    this._shortcutParts = {};
  };

  return true;
};

proto._modifyManager = function(propValue, propOldValue, propData)
{
  if (propOldValue) {
    propOldValue.removeCommand(this);
  };

  if (propValue) {
    propValue.addCommand(this);
  };

  return true;
};







/*
---------------------------------------------------------------------------
  INTERNAL MATCHING LOGIC
---------------------------------------------------------------------------
*/

proto._matchesKeyEvent = function(e)
{
  // pre check if parts are configured
  if (typeof this._shortcutParts !== QxConst.TYPEOF_OBJECT && this._shortcutParts !== null) {
    return false;
  };

  // pre check for configured shortcut or keycode
  if (!(QxUtil.isValid(this.getShortcut()) || QxUtil.isValid(this.getKeyCode()))) {
    return false;
  };

  // pre-check for check special keys
  // we handle this here to omit to check this later again.
  if ((this._shortcutParts.shift && !e.getShiftKey()) || (this._shortcutParts.ctrl && !e.getCtrlKey()) || (this._shortcutParts.alt && !e.getAltKey())) {
    return false;
  };

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
  };


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
  };


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
        case QxConst.KEY_CTRL:
        case QxConst.KEY_SHIFT:
        case QxConst.KEY_ALT:
        case QxConst.KEY_CONTROL:
          break;

        default:
          if (vEventCode == QxKeyEvent.keys[vPart]) {
            return true;
          };
      };
    };
  };

  return false;
};






/*
---------------------------------------------------------------------------
  STRING CONVERTION
---------------------------------------------------------------------------
*/

proto.toString = function()
{
  var vShortcut = this.getShortcut();
  var vKeyCode = this.getKeyCode();
  var vString = QxConst.CORE_EMPTY;

  if (QxUtil.isValidString(vShortcut))
  {
    vString = vShortcut;

    if (QxUtil.isValidNumber(vKeyCode))
    {
      var vTemp = QxKeyEvent.codes[vKeyCode];
      vString += QxConst.CORE_PLUS + (vTemp ? vTemp.toFirstUp() : String(vKeyCode));
    };
  }
  else if (QxUtil.isValidNumber(vKeyCode))
  {
    var vTemp = QxKeyEvent.codes[vKeyCode];
    vString = vTemp ? vTemp.toFirstUp() : String(vKeyCode);
  };

  return vString;
};





/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  this._shortcutParts = null;

  var vManager = this.getManager();
  if (vManager) {
    vManager.removeCommand(this);
  };

  return QxTarget.prototype.dispose.call(this);
};
