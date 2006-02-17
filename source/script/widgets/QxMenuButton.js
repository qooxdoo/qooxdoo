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

#package(menu)

************************************************************************ */

function QxMenuButton(vLabel, vIcon, vCommand, vMenu)
{
  QxHorizontalBoxLayout.call(this);


  // ************************************************************************
  //   LAYOUT
  // ************************************************************************
  
  var io = this._iconObject = new QxImage;
  io.setAnonymous(true);

  var lo = this._labelObject = new QxLabel;
  lo.setAnonymous(true);
  lo.setSelectable(false);

  var so = this._shortcutObject = new QxLabel;
  so.setAnonymous(true);
  so.setSelectable(false);

  var ao = this._arrowObject = new QxImage("widgets/arrows/next.gif");
  ao.setAnonymous(true);
  

  // ************************************************************************
  //   INIT
  // ************************************************************************

  this.setLabel(vLabel);
  this.setIcon(vIcon);
  this.setCommand(vCommand);
  this.setMenu(vMenu);


  // ************************************************************************
  //   EVENTS
  // ************************************************************************

  this.addEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onmousedown);
};

QxMenuButton.extend(QxHorizontalBoxLayout, "QxMenuButton");



/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

QxMenuButton.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "menu-button" });

QxMenuButton.addProperty({ name : "icon", type : QxConst.TYPEOF_STRING });
QxMenuButton.addProperty({ name : "label", type : QxConst.TYPEOF_STRING });
QxMenuButton.addProperty({ name : "menu", type : QxConst.TYPEOF_OBJECT });






/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

proto._hasIcon = false;
proto._hasLabel = false;
proto._hasShortcut = false;
proto._hasMenu = false;

proto.hasIcon = function() {
  return this._hasIcon;
};

proto.hasLabel = function() {
  return this._hasLabel;
};

proto.hasShortcut = function() {
  return this._hasShortcut;
};

proto.hasMenu = function() {
  return this._hasMenu;
};

proto.getIconObject = function() {
  return this._iconObject;
};

proto.getLabelObject = function() {
  return this._labelObject;
};

proto.getShortcutObject = function() {
  return this._shortcutObject;
};

proto.getArrowObject = function() {
  return this._arrowObject;
};

proto.getParentMenu = function()
{
  var vParent = this.getParent();
  if (vParent)
  {
    vParent = vParent.getParent();
    
    if (vParent && vParent instanceof QxMenu) {
      return vParent;
    };
  };
  
  return null;
};





/*
---------------------------------------------------------------------------
  INIT LAYOUT IMPL
---------------------------------------------------------------------------
*/

/*!
  This creates an new instance of the layout impl this widget uses
*/
proto._createLayoutImpl = function() {
  return new QxMenuButtonLayoutImpl(this);
};  
  
  
  
  

/*
---------------------------------------------------------------------------
  MODIFIERS
---------------------------------------------------------------------------
*/

proto._modifyEnabled = function(propValue, propOldValue, propData)
{
  if (this._iconObject) {
    this._iconObject.setEnabled(propValue);
  };

  if (this._labelObject) {
    this._labelObject.setEnabled(propValue);
  };
  
  return QxBoxLayout.prototype._modifyEnabled.call(this, propValue, propOldValue, propData);
};

proto._modifyIcon = function(propValue, propOldValue, propData)
{
  this._iconObject.setSource(propValue);
  
  if (QxUtil.isValidString(propValue))
  {
    this._hasIcon = true;
    
    if (QxUtil.isInvalidString(propOldValue)) {
      this.addAtBegin(this._iconObject);
    };
  }
  else
  {
    this._hasIcon = false;
    this.remove(this._iconObject);
  };
  
  return true;
};

proto._modifyLabel = function(propValue, propOldValue, propData)
{
  this._labelObject.setHtml(propValue);
  
  if (QxUtil.isValidString(propValue))
  {
    this._hasLabel = true;
    
    if (QxUtil.isInvalidString(propOldValue)) {
      this.addAt(this._labelObject, this.getFirstChild() == this._iconObject ? 1 : 0);
    };
  }
  else
  {
    this._hasLabel = false;
    this.remove(this._labelObject);
  };
  
  return true;
};

proto._modifyCommand = function(propValue, propOldValue, propData)
{
  var vHtml = propValue ? propValue.getShortcut() : QxConst.CORE_EMPTY;
  
  this._shortcutObject.setHtml(vHtml);
  
  if (QxUtil.isValidString(vHtml))
  {
    this._hasShortcut = true;
    
    var vOldHtml = propOldValue ? propOldValue.getShortcut() : QxConst.CORE_EMPTY;
    
    if (QxUtil.isInvalidString(vOldHtml)) 
    {
      if (this.getLastChild() == this._arrowObject)
      {
        this.addBefore(this._shortcutObject, this._arrowObject);
      }
      else
      {
        this.addAtEnd(this._shortcutObject);
      };
    };
  }
  else
  {
    this._hasShortcut = false;
    this.remove(this._shortcutObject);
  };
  
  return true;
};

proto._modifyMenu = function(propValue, propOldValue, propData)
{
  if (QxUtil.isValidObject(propValue))
  {
    this._hasMenu = true;
    
    if (QxUtil.isInvalidObject(propOldValue)) {
      this.addAtEnd(this._arrowObject);
    };
  }
  else
  {
    this._hasMenu = false;
    this.remove(this._arrowObject);
  };
  
  return true;
};






/*
---------------------------------------------------------------------------
  EVENTS
---------------------------------------------------------------------------
*/

proto._onmousedown = function(e) {
  this.execute();
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
  
  // Dispose children
  if (this._iconObject) 
  {
    this._iconObject.dispose();
    this._iconObject = null;
  };

  if (this._labelObject) 
  {
    this._labelObject.dispose();
    this._labelObject = null;
  };

  if (this._shortcutObject) 
  {
    this._shortcutObject.dispose();
    this._shortcutObject = null;
  };

  if (this._arrowObject) 
  {
    this._arrowObject.dispose();
    this._arrowObject = null;
  };

  // Remove event listeners
  this.removeEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onmousedown);

  return QxCanvasLayout.prototype.dispose.call(this);
};
