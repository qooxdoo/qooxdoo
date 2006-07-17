/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany
     http://www.1und1.de | http://www.1and1.com
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (ecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#module(nativewindow)
#require(qx.dom.DomWindow)
#use(qx.ui.core.ClientDocument)
#use(qx.util.Validation)
#use(qx.client.Timer)

************************************************************************ */

qx.OO.defineClass("qx.client.NativeWindow", qx.core.Target, 
function(vUrl, vName)
{
  qx.core.Target.call(this);


  // ************************************************************************
  //   TIMER
  // ************************************************************************

  this._timer = new qx.client.Timer(100);
  this._timer.addEventListener(qx.constant.Event.INTERVAL, this._oninterval, this);


  // ************************************************************************
  //   INITIAL PROPERTIES
  // ************************************************************************

  if (qx.util.Validation.isValidString(vUrl)) {
    this.setUrl(vUrl);
  }

  if (qx.util.Validation.isValidString(vName)) {
    this.setName(vName);
  }
});



/*
---------------------------------------------------------------------------
  DATA
---------------------------------------------------------------------------
*/

qx.client.NativeWindow.PROPERTY_DEPENDENT = "dependent";
qx.client.NativeWindow.PROPERTY_WIDTH = "width";
qx.client.NativeWindow.PROPERTY_HEIGHT = "height";
qx.client.NativeWindow.PROPERTY_LEFT = "left";
qx.client.NativeWindow.PROPERTY_TOP = "top";
qx.client.NativeWindow.PROPERTY_RESIZABLE = "resizable";
qx.client.NativeWindow.PROPERTY_STATUS = "status";
qx.client.NativeWindow.PROPERTY_LOCATION = "location";
qx.client.NativeWindow.PROPERTY_MENUBAR = "menubar";
qx.client.NativeWindow.PROPERTY_TOOLBAR = "toolbar";
qx.client.NativeWindow.PROPERTY_SCROLLBARS = "scrollbars";
qx.client.NativeWindow.PROPERTY_MODAL = "modal";




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  If the window is open or closed
*/
qx.OO.addProperty({ name : "open", type : qx.constant.Type.BOOLEAN, defaultValue : false });

/*!
  The outer width of the window.
*/
qx.OO.addProperty({ name : "width", type : qx.constant.Type.NUMBER, defaultValue : 400, impl : "dimension" });

/*!
  The outer height of the window.
*/
qx.OO.addProperty({ name : "height", type : qx.constant.Type.NUMBER, defaultValue : 250, impl : "dimension" });

/*!
  The left screen coordinate of the window.
*/
qx.OO.addProperty({ name : "left", type : qx.constant.Type.NUMBER, defaultValue : 100, impl : "position" });

/*!
  The top screen coordinate of the window.
*/
qx.OO.addProperty({ name : "top", type : qx.constant.Type.NUMBER, defaultValue : 200, impl : "position" });

/*!
  Should be window be modal
*/
qx.OO.addProperty({ name : "modal", type : qx.constant.Type.BOOLEAN, defaultValue : false });

/*!
  Should be window be dependent on this application window
*/
qx.OO.addProperty({ name : "dependent", type : qx.constant.Type.BOOLEAN, defaultValue : true });

/*!
  The url
*/
qx.OO.addProperty({ name : "url", type : qx.constant.Type.STRING });

/*!
  The window name
*/
qx.OO.addProperty({ name : "name", type : qx.constant.Type.STRING });

/*!
  The text of the statusbar
*/
qx.OO.addProperty({ name : "status", type : qx.constant.Type.STRING, defaultValue : "Ready" });

/*!
  Should the statusbar be shown
*/
qx.OO.addProperty({ name : "showStatusbar", type : qx.constant.Type.BOOLEAN, defaultValue : false });

/*!
  Should the menubar be shown
*/
qx.OO.addProperty({ name : "showMenubar", type : qx.constant.Type.BOOLEAN, defaultValue : false });

/*!
  Should the location(bar) be shown
*/
qx.OO.addProperty({ name : "showLocation", type : qx.constant.Type.BOOLEAN, defaultValue : false });

/*!
  Should the toolbar be shown
*/
qx.OO.addProperty({ name : "showToolbar", type : qx.constant.Type.BOOLEAN, defaultValue : false });

/*!
  If the window is resizeable
*/
qx.OO.addProperty({ name : "resizeable", type : qx.constant.Type.BOOLEAN, defaultValue : true });

/*!
  If the window is able to scroll and has visible scrollbars if needed
*/
qx.OO.addProperty({ name : "allowScrollbars", type : qx.constant.Type.BOOLEAN, defaultValue : true });





/*
---------------------------------------------------------------------------
  PROPERTY GROUPS
---------------------------------------------------------------------------
*/

qx.OO.addPropertyGroup({ name : "location", members : [ "left", "top" ]});
qx.OO.addPropertyGroup({ name : "dimension", members : [ "width", "height" ]});




/*
---------------------------------------------------------------------------
  MODIFIERS
---------------------------------------------------------------------------
*/

qx.Proto._modifyPosition = function(propValue, propOldValue, propName)
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
      this.error("Cross-Domain Scripting problem: Could not move window!", ex);
    }
  }

  return true;
}

qx.Proto._modifyDimension = function(propValue, propOldValue, propName)
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
      this.error("Cross-Domain Scripting problem: Could not resize window!", ex);
    }
  }

  return true;
}

qx.Proto._modifyName = function(propValue, propOldValue, propName)
{
  if (!this.isClosed()) {
    this._window.name = propValue;
  }

  return true;
}

qx.Proto._modifyUrl = function(propValue, propOldValue, propName)
{
  // String hack needed for old compressor (compile.py)
  if(!this.isClosed()) {
    this._window.location.replace(qx.util.Validation.isValidString(propValue) ? propValue : ("javascript:/" + "/"));
  }

  return true;
}

qx.Proto._modifyOpen = function(propValue, propOldValue, propData)
{
  propValue ? this._open() : this._close();
  return true;
}






/*
---------------------------------------------------------------------------
  NAME
---------------------------------------------------------------------------
*/

qx.Proto.getName = function()
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
    }

    if (vName == this._valueName)
    {
      return vName;
    }
    else
    {
      throw new Error("window name and name property are not identical");
    }
  }
  else
  {
    return this._valueName;
  }
}






/*
---------------------------------------------------------------------------
  UTILITY
---------------------------------------------------------------------------
*/

qx.Proto.isClosed = function()
{
  var vClosed = true;

  if (this._window)
  {
    try {
      vClosed = this._window.closed;
    } catch(ex) {}
  }

  return vClosed;
}

qx.Proto.open = function() {
  this.setOpen(true);
}

qx.Proto.close = function() {
  this.setOpen(false);
}









/*
---------------------------------------------------------------------------
  OPEN METHOD
---------------------------------------------------------------------------
*/

qx.Proto._open = function()
{
  var vConf = [];


  /*
  ------------------------------------------------------------------------------
    PRE CONFIGURE WINDOW
  ------------------------------------------------------------------------------
  */

  if (qx.util.Validation.isValidNumber(this.getWidth()))
  {
    vConf.push(qx.client.NativeWindow.PROPERTY_WIDTH);
    vConf.push(qx.constant.Core.EQUAL);
    vConf.push(this.getWidth());
    vConf.push(qx.constant.Core.COMMA);
  }

  if (qx.util.Validation.isValidNumber(this.getHeight()))
  {
    vConf.push(qx.client.NativeWindow.PROPERTY_HEIGHT);
    vConf.push(qx.constant.Core.EQUAL);
    vConf.push(this.getHeight());
    vConf.push(qx.constant.Core.COMMA);
  }

  if (qx.util.Validation.isValidNumber(this.getLeft()))
  {
    vConf.push(qx.client.NativeWindow.PROPERTY_LEFT);
    vConf.push(qx.constant.Core.EQUAL);
    vConf.push(this.getLeft());
    vConf.push(qx.constant.Core.COMMA);
  }

  if (qx.util.Validation.isValidNumber(this.getTop()))
  {
    vConf.push(qx.client.NativeWindow.PROPERTY_TOP);
    vConf.push(qx.constant.Core.EQUAL);
    vConf.push(this.getTop());
    vConf.push(qx.constant.Core.COMMA);
  }



  vConf.push(qx.client.NativeWindow.PROPERTY_DEPENDENT);
  vConf.push(qx.constant.Core.EQUAL);
  vConf.push(this.getDependent() ? qx.constant.Core.YES : qx.constant.Core.NO);
  vConf.push(qx.constant.Core.COMMA);

  vConf.push(qx.client.NativeWindow.PROPERTY_RESIZABLE);
  vConf.push(qx.constant.Core.EQUAL);
  vConf.push(this.getResizeable() ? qx.constant.Core.YES : qx.constant.Core.NO);
  vConf.push(qx.constant.Core.COMMA);

  vConf.push(qx.client.NativeWindow.PROPERTY_STATUS);
  vConf.push(qx.constant.Core.EQUAL);
  vConf.push(this.getShowStatusbar() ? qx.constant.Core.YES : qx.constant.Core.NO);
  vConf.push(qx.constant.Core.COMMA);

  vConf.push(qx.client.NativeWindow.PROPERTY_LOCATION);
  vConf.push(qx.constant.Core.EQUAL);
  vConf.push(this.getShowLocation() ? qx.constant.Core.YES : qx.constant.Core.NO);
  vConf.push(qx.constant.Core.COMMA);

  vConf.push(qx.client.NativeWindow.PROPERTY_MENUBAR);
  vConf.push(qx.constant.Core.EQUAL);
  vConf.push(this.getShowMenubar() ? qx.constant.Core.YES : qx.constant.Core.NO);
  vConf.push(qx.constant.Core.COMMA);

  vConf.push(qx.client.NativeWindow.PROPERTY_TOOLBAR);
  vConf.push(qx.constant.Core.EQUAL);
  vConf.push(this.getShowToolbar() ? qx.constant.Core.YES : qx.constant.Core.NO);
  vConf.push(qx.constant.Core.COMMA);

  vConf.push(qx.client.NativeWindow.PROPERTY_SCROLLBARS);
  vConf.push(qx.constant.Core.EQUAL);
  vConf.push(this.getAllowScrollbars() ? qx.constant.Core.YES : qx.constant.Core.NO);
  vConf.push(qx.constant.Core.COMMA);

  vConf.push(qx.client.NativeWindow.PROPERTY_MODAL);
  vConf.push(qx.constant.Core.EQUAL);
  vConf.push(this.getModal() ? qx.constant.Core.YES : qx.constant.Core.NO);
  vConf.push(qx.constant.Core.COMMA);






  /*
  ------------------------------------------------------------------------------
    OPEN WINDOW
  ------------------------------------------------------------------------------
  */

  if (qx.util.Validation.isInvalidString(this.getName())) {
    this.setName(this.classname + this.toHashCode());
  }

  this._window = window.open(this.getUrl(), this.getName(), vConf.join(qx.constant.Core.EMPTY));

  if (this.isClosed())
  {
    this.error("Window could not be opened. It seems, there is a popup blocker active!");
  }
  else
  {
    // start timer for close detection
    this._timer.start();

    // block original document
    if (this.getModal())
    {
      var vClientWindow = qx.core.Init.getComponent().getClientWindow();

      if (vClientWindow) {
        vClientWindow.getClientDocument().block(this);
      }
    }
  }
}

qx.Proto._close = function()
{
  if (!this._window) {
    return;
  }

  // stop timer for close detection
  this._timer.stop();

  // release window again
  if (this.getModal())
  {
    var vClientWindow = qx.core.Init.getComponent().getClientWindow();

    if (vClientWindow) {
      vClientWindow.getClientDocument().release(this);
    }
  }

  // finally close window
  if (!this.isClosed()) {
    this._window.close();
  }
}






/*
---------------------------------------------------------------------------
  CENTER SUPPORT
---------------------------------------------------------------------------
*/

qx.Proto.centerToScreen = function() {
  return this._centerHelper((screen.width - this.getWidth()) / 2, (screen.height - this.getHeight()) / 2);
}

qx.Proto.centerToScreenArea = function() {
  return this._centerHelper((screen.availWidth - this.getWidth()) / 2, (screen.availHeight - this.getHeight()) / 2);
}

qx.Proto.centerToOpener = function() {
  return this._centerHelper(((qx.dom.DomWindow.getInnerWidth(window) - this.getWidth()) / 2) + qx.dom.DomLocation.getScreenBoxLeft(window.document.body), ((qx.dom.DomWindow.getInnerHeight(window) - this.getHeight()) / 2) + qx.dom.DomLocation.getScreenBoxTop(window.document.body));
}

qx.Proto._centerHelper = function(l, t)
{
  // set new values
  this.setLeft(l);
  this.setTop(t);

  // focus window if opened
  if (!this.isClosed()) {
    this.focus();
  }
}






/*
---------------------------------------------------------------------------
  FOCUS HANDLING
---------------------------------------------------------------------------
*/

qx.Proto.focus = function()
{
  if (!this.isClosed()) {
    this._window.focus();
  }
}

qx.Proto.blur = function()
{
  if (!this.isClosed()) {
    this._window.blur();
  }
}







/*
---------------------------------------------------------------------------
  EVENT HANDLING
---------------------------------------------------------------------------
*/

qx.Proto._oninterval = function(e)
{
  if (this.isClosed()) {
    this.setOpen(false);
  }
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

  if (this.getDependent()) {
    this.close();
  }

  if (this._timer)
  {
    this._timer.stop();
    this._timer = null;
  }

  this._window = null;

  return qx.core.Target.prototype.dispose.call(this);
}
