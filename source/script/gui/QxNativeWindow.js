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

#package(nativewindow)
#require(QxDomWindow)
#post(QxClientDocument)
#post(QxUtil)
#post(QxTimer)

************************************************************************ */

function QxNativeWindow(vUrl, vName)
{
  QxTarget.call(this);
  

  // ************************************************************************
  //   TIMER
  // ************************************************************************
    
  this._timer = new QxTimer(100);
  this._timer.addEventListener(QxConst.EVENT_TYPE_INTERVAL, this._oninterval, this);
  

  // ************************************************************************
  //   INITIAL PROPERTIES
  // ************************************************************************
  
  if (QxUtil.isValidString(vUrl)) {
    this.setUrl(vUrl);
  };

  if (QxUtil.isValidString(vName)) {
    this.setName(vName);
  };
};

QxNativeWindow.extend(QxTarget, "QxNativeWindow");



/*
---------------------------------------------------------------------------
  DATA
---------------------------------------------------------------------------
*/

QxNativeWindow.PROPERTY_DEPENDENT = "dependent";
QxNativeWindow.PROPERTY_WIDTH = "width";
QxNativeWindow.PROPERTY_HEIGHT = "height";
QxNativeWindow.PROPERTY_LEFT = "left";
QxNativeWindow.PROPERTY_TOP = "top";
QxNativeWindow.PROPERTY_RESIZABLE = "resizable";
QxNativeWindow.PROPERTY_STATUS = "status";
QxNativeWindow.PROPERTY_LOCATION = "location";
QxNativeWindow.PROPERTY_MENUBAR = "menubar";
QxNativeWindow.PROPERTY_TOOLBAR = "toolbar";
QxNativeWindow.PROPERTY_SCROLLBARS = "scrollbars";
QxNativeWindow.PROPERTY_MODAL = "modal";




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  If the window is open or closed
*/
QxNativeWindow.addProperty({ name : "open", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });

/*!
  The outer width of the window.
*/
QxNativeWindow.addProperty({ name : "width", type : QxConst.TYPEOF_NUMBER, defaultValue : 400, impl : "dimension" });

/*!
  The outer height of the window.
*/
QxNativeWindow.addProperty({ name : "height", type : QxConst.TYPEOF_NUMBER, defaultValue : 250, impl : "dimension" });

/*!
  The left screen coordinate of the window.
*/
QxNativeWindow.addProperty({ name : "left", type : QxConst.TYPEOF_NUMBER, defaultValue : 100, impl : "position" });

/*!
  The top screen coordinate of the window.
*/
QxNativeWindow.addProperty({ name : "top", type : QxConst.TYPEOF_NUMBER, defaultValue : 200, impl : "position" });

/*!
  Should be window be modal
*/
QxNativeWindow.addProperty({ name : "modal", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });

/*!
  Should be window be dependent on this application window
*/
QxNativeWindow.addProperty({ name : "dependent", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true });

/*!
  The url
*/
QxNativeWindow.addProperty({ name : "url", type : QxConst.TYPEOF_STRING });

/*!
  The window name
*/
QxNativeWindow.addProperty({ name : "name", type : QxConst.TYPEOF_STRING });

/*!
  The text of the statusbar
*/
QxNativeWindow.addProperty({ name : "status", type : QxConst.TYPEOF_STRING, defaultValue : "Ready" });

/*!
  Should the statusbar be shown
*/
QxNativeWindow.addProperty({ name : "showStatusbar", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });

/*!
  Should the menubar be shown
*/
QxNativeWindow.addProperty({ name : "showMenubar", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });

/*!
  Should the location(bar) be shown
*/
QxNativeWindow.addProperty({ name : "showLocation", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });

/*!
  Should the toolbar be shown
*/
QxNativeWindow.addProperty({ name : "showToolbar", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });

/*!
  If the window is resizeable
*/
QxNativeWindow.addProperty({ name : "resizeable", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true });

/*!
  If the window is able to scroll and has visible scrollbars if needed
*/
QxNativeWindow.addProperty({ name : "allowScrollbars", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true });





/*
---------------------------------------------------------------------------
  PROPERTY GROUPS
---------------------------------------------------------------------------
*/

QxNativeWindow.addPropertyGroup({ name : "location", members : [ "left", "top" ]});
QxNativeWindow.addPropertyGroup({ name : "dimension", members : [ "width", "height" ]});




/*
---------------------------------------------------------------------------
  MODIFIERS
---------------------------------------------------------------------------
*/

proto._modifyPosition = function(propValue, propOldValue, propName) 
{
  /*
    http://www.microsoft.com/technet/prodtechnol/winxppro/maintain/sp2brows.mspx
    Changes to Functionality in Microsoft Windows XP Service Pack 2
    Part 5: Enhanced Browsing Security
    URLACTION_FEATURE_WINDOW_RESTRICTIONS
    Allow script-initiated windows without size or position constraints
    Code: 2102
  */  
  
  if (!this.isClosed()) 
  {
    try
    {
      this._window.moveTo(this.getLeft(), this.getTop());
    }
    catch(ex)
    {
      this.error("Cross-Domain Scripting problem: Could not move window!");
    };
  };

  return true;
};

proto._modifyDimension = function(propValue, propOldValue, propName) 
{
  /*
    http://www.microsoft.com/technet/prodtechnol/winxppro/maintain/sp2brows.mspx
    Changes to Functionality in Microsoft Windows XP Service Pack 2
    Part 5: Enhanced Browsing Security
    URLACTION_FEATURE_WINDOW_RESTRICTIONS
    Allow script-initiated windows without size or position constraints
    Code: 2102
  */  
  
  if (!this.isClosed()) 
  {
    try
    {
      this._window.resizeTo(this.getWidth(), this.getHeight());
    }
    catch(ex)
    {
      this.error("Cross-Domain Scripting problem: Could not resize window!");
    };
  };

  return true;
};

proto._modifyName = function(propValue, propOldValue, propName)
{
  if (!this.isClosed()) {
    this._window.name = propValue;
  };

  return true;
};

proto._modifyUrl = function(propValue, propOldValue, propName) 
{
  // String hack needed for old compressor (compile.py)
  if(!this.isClosed()) {
    this._window.location.replace(QxUtil.isValidString(propValue) ? propValue : ("javascript:/" + "/"));
  };

  return true;
};

proto._modifyOpen = function(propValue, propOldValue, propData)
{
  propValue ? this._open() : this._close();
  return true;
}; 






/*
---------------------------------------------------------------------------
  NAME
---------------------------------------------------------------------------
*/

proto.getName = function()
{
  if (!this.isClosed())
  {
    try
    {
      var vName = this._window.name;
    }
    catch(ex)
    {
      return this._valueName;
    };

    if (vName == this._valueName)
    {
      return vName;
    }
    else
    {
      throw new Error("window name and name property are not identical");
    };
  }
  else
  {
    return this._valueName;
  };
};






/*
---------------------------------------------------------------------------
  UTILITY
---------------------------------------------------------------------------
*/

proto.isClosed = function()
{
  var vClosed = true;

  if (this._window) 
  {
    try {
      vClosed = this._window.closed;
    } catch(ex) {};
  };  
  
  return vClosed;
};

proto.open = function() {
  this.setOpen(true);
};

proto.close = function() {
  this.setOpen(false);
};









/*
---------------------------------------------------------------------------
  OPEN METHOD
---------------------------------------------------------------------------
*/

proto._open = function()
{ 
  var vConf = [];
  
  
  /*
  ------------------------------------------------------------------------------
    PRE CONFIGURE WINDOW
  ------------------------------------------------------------------------------
  */

  if (QxUtil.isValidNumber(this.getWidth())) 
  {
    vConf.push(QxNativeWindow.PROPERTY_WIDTH);
    vConf.push(QxConst.CORE_EQUAL);
    vConf.push(this.getWidth());
    vConf.push(QxConst.CORE_COMMA);
  };

  if (QxUtil.isValidNumber(this.getHeight())) 
  {
    vConf.push(QxNativeWindow.PROPERTY_HEIGHT);
    vConf.push(QxConst.CORE_EQUAL);
    vConf.push(this.getHeight());
    vConf.push(QxConst.CORE_COMMA);
  };

  if (QxUtil.isValidNumber(this.getLeft())) 
  {
    vConf.push(QxNativeWindow.PROPERTY_LEFT);
    vConf.push(QxConst.CORE_EQUAL);
    vConf.push(this.getLeft());
    vConf.push(QxConst.CORE_COMMA);
  };

  if (QxUtil.isValidNumber(this.getTop())) 
  {
    vConf.push(QxNativeWindow.PROPERTY_TOP);
    vConf.push(QxConst.CORE_EQUAL);
    vConf.push(this.getTop());
    vConf.push(QxConst.CORE_COMMA);
  };


  
  vConf.push(QxNativeWindow.PROPERTY_DEPENDENT);
  vConf.push(QxConst.CORE_EQUAL);
  vConf.push(this.getDependent() ? QxConst.CORE_YES : QxConst.CORE_NO);
  vConf.push(QxConst.CORE_COMMA);  

  vConf.push(QxNativeWindow.PROPERTY_RESIZABLE);
  vConf.push(QxConst.CORE_EQUAL);
  vConf.push(this.getResizeable() ? QxConst.CORE_YES : QxConst.CORE_NO);
  vConf.push(QxConst.CORE_COMMA);
  
  vConf.push(QxNativeWindow.PROPERTY_STATUS);
  vConf.push(QxConst.CORE_EQUAL);
  vConf.push(this.getShowStatusbar() ? QxConst.CORE_YES : QxConst.CORE_NO);
  vConf.push(QxConst.CORE_COMMA);
  
  vConf.push(QxNativeWindow.PROPERTY_LOCATION);
  vConf.push(QxConst.CORE_EQUAL);
  vConf.push(this.getShowLocation() ? QxConst.CORE_YES : QxConst.CORE_NO);
  vConf.push(QxConst.CORE_COMMA);
  
  vConf.push(QxNativeWindow.PROPERTY_MENUBAR);
  vConf.push(QxConst.CORE_EQUAL);
  vConf.push(this.getShowMenubar() ? QxConst.CORE_YES : QxConst.CORE_NO);
  vConf.push(QxConst.CORE_COMMA);
  
  vConf.push(QxNativeWindow.PROPERTY_TOOLBAR);
  vConf.push(QxConst.CORE_EQUAL);
  vConf.push(this.getShowToolbar() ? QxConst.CORE_YES : QxConst.CORE_NO);
  vConf.push(QxConst.CORE_COMMA);
  
  vConf.push(QxNativeWindow.PROPERTY_SCROLLBARS);
  vConf.push(QxConst.CORE_EQUAL);
  vConf.push(this.getAllowScrollbars() ? QxConst.CORE_YES : QxConst.CORE_NO);
  vConf.push(QxConst.CORE_COMMA);
  
  vConf.push(QxNativeWindow.PROPERTY_MODAL);
  vConf.push(QxConst.CORE_EQUAL);
  vConf.push(this.getModal() ? QxConst.CORE_YES : QxConst.CORE_NO);
  vConf.push(QxConst.CORE_COMMA);
  
  




  /*
  ------------------------------------------------------------------------------
    OPEN WINDOW
  ------------------------------------------------------------------------------
  */

  if (QxUtil.isInvalidString(this.getName())) {
    this.setName(this.classname + this.toHashCode());
  };

  this._window = window.open(this.getUrl(), this.getName(), vConf.join(QxConst.CORE_EMPTY));

  if (this.isClosed())
  {
    this.error("Window could not be opened. It seems, there is a popup blocker active!", "_open");
  }
  else
  {
    // start timer for close detection
    this._timer.start();    
    
    // block original document
    if (this.getModal()) 
    {
      var vClientWindow = window.application.getClientWindow();
      
      if (vClientWindow) {
        vClientWindow.getClientDocument().block(this);
      };
    };    
  };
};

proto._close = function()
{
  if (!this._window) {
    return;
  };
  
  // stop timer for close detection
  this._timer.stop();
  
  // release window again
  if (this.getModal()) 
  {
    var vClientWindow = window.application.getClientWindow();
    
    if (vClientWindow) {
      vClientWindow.getClientDocument().release(this);
    };
  };   

  // finally close window
  if (!this.isClosed()) {
    this._window.close();
  };  
};






/*
---------------------------------------------------------------------------
  CENTER SUPPORT
---------------------------------------------------------------------------
*/

proto.centerToScreen = function() {
  return this._centerHelper((screen.width - this.getWidth()) / 2, (screen.height - this.getHeight()) / 2);
};

proto.centerToScreenArea = function() {
  return this._centerHelper((screen.availWidth - this.getWidth()) / 2, (screen.availHeight - this.getHeight()) / 2);
};

proto.centerToOpener = function() {
  return this._centerHelper(((QxDom.getWindowInnerWidth(window) - this.getWidth()) / 2) + QxDom.getComputedScreenBoxLeft(window.document.body), ((QxDom.getWindowInnerHeight(window) - this.getHeight()) / 2) + QxDom.getComputedScreenBoxTop(window.document.body));
};

proto._centerHelper = function(l, t)
{
  // set new values
  this.setLeft(l);
  this.setTop(t);

  // focus window if opened
  if (!this.isClosed()) {
    this.focus();
  };
};






/*
---------------------------------------------------------------------------
  FOCUS HANDLING
---------------------------------------------------------------------------
*/

proto.focus = function()
{
  if (!this.isClosed()) {
    this._window.focus();
  };
};

proto.blur = function()
{
  if (!this.isClosed()) {
    this._window.blur();
  };
};







/*
---------------------------------------------------------------------------
  EVENT HANDLING
---------------------------------------------------------------------------
*/

proto._oninterval = function(e)
{
  if (this.isClosed()) {
    this.setOpen(false);
  };
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

  if (this.getDependent()) {
    this.close();
  };

  if (this._timer)
  {
    this._timer.stop();
    this._timer = null;
  };
      
  this._window = null;
  
  return QxTarget.prototype.dispose.call(this);
};
