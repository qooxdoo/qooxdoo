function QxCommand(vShortcut, vKeyCode, vManager)
{
  QxTarget.call(this);

  if (isValid(vShortcut)) {
    this.setShortcut(vShortcut);
  };
  
  if (isValid(vKeyCode)) {
    this.setKeyCode(vKeyCode);
  };  
  
  this.setManager(isValid(vManager) ? vManager : window.application.getClientWindow().getEventManager());
};

QxCommand.extend(QxTarget, "QxCommand");

QxCommand.addProperty({ name : "checked", type : Boolean, defaultValue : false });
QxCommand.addProperty({ name : "shortcut", type : String });
QxCommand.addProperty({ name : "keyCode", type : Number });
QxCommand.addProperty({ name : "manager", type : Object });

proto.execute = function(vTarget) 
{
  this.dispatchEvent(new QxDataEvent("execute", vTarget));
  return false;
};

proto._shortcutParts = {};

proto._modifyShortcut = function(propValue, propOldValue, propName, uniqModIds)
{
  if (propValue)
  {
    // split string to get each key which must be pressed
    var a = propValue.toLowerCase().split(/[-+\s]+/);
    var al = a.length;

    // build a hash with active keys
    this._shortcutParts = {};

    for (var i=0; i<al; i++) {
      this._shortcutParts[a[i]] = true;
    };
  }
  else
  {
    this._shortcutParts = null;
  };

  return true;
};

proto._modifyManager = function(propValue, propOldValue, propName, uniqModIds)
{
  if (propOldValue) {
    propOldValue.removeCommand(this);
  };
  
  if (propValue) {
    propValue.addCommand(this);
  };
  
  return true;
};






proto._matchesKeyEvent = function(e)
{
  // pre check for configured shortcut or keycode
  if (!(isValid(this.getShortcut()) || isValid(this.getKeyCode()))) {
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
        case "ctrl":
        case "shift":
        case "alt":
        case "control":
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



proto.toString = function()
{
  var vShortcut = this.getShortcut();
  var vKeyCode = this.getKeyCode();
  var vString = "";
  
  if (isValidString(vShortcut))
  {
    vString = vShortcut;
    
    if (isValidNumber(vKeyCode))
    {
      var vTemp = QxKeyEvent.codes[vKeyCode];
      vString += "+" + (vTemp ? vTemp.toFirstUp() : String(vKeyCode));
    };      
  }
  else if (isValidNumber(vKeyCode))
  {
    var vTemp = QxKeyEvent.codes[vKeyCode];
    vString = vTemp ? vTemp.toFirstUp() : String(vKeyCode);
  };
  
  return vString;
};



proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  this._ownerWindow = null;
  return QxTarget.prototype.dispose.call(this);
};