/* ****************************************************************************

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
     * Kent Olsson (kols)
       <kent dot olsson at chello dot se>

**************************************************************************** */

/* ****************************************************************************

#module(splashscreen)

**************************************************************************** */

function QxSplashScreen(vComponent, vShowProgressBar)
{
  qx.ui.popup.Popup.call(this);

//  this.setWidth(qx.constant.Core.AUTO);
//  this.setHeight(qx.constant.Core.AUTO);

  this.setBackgroundColor("threedface");
  this.setColor("windowtext");
  this.setBorder(qx.renderer.border.BorderObject.presets.outset);
  this.setPadding(1);

//  if (this._initialLayoutDone && this.getVisibility() && this._isDisplayed)
//  {
//this.error("Make modal!!!");
//    this.getTopLevelWidget().block(this); //Make modal
//  }

  // ***********************************************************************
  //   LAYOUT
  // ***********************************************************************
  var l = this._layout = new qx.ui.layout.VerticalBoxLayout();

//  l.setWidth(null);
//  l.setHeight(null);
//  l.setEdge(0);
  this.add(l);


  // ***********************************************************************
  //   Components
  // ***********************************************************************
  this._component = vComponent;
  vComponent.setFocused(false);

  l.add(vComponent);

  if(qx.util.Validation.isValidBoolean(vShowProgressBar)) {
    this.setShowProgressBar(vShowProgressBar);
  }

  // ***********************************************************************
  //   EVENTS
  // ***********************************************************************
  vComponent.addEventListener(qx.constant.Event.MOUSEDOWN, this._onwindowmousedown, this);
  this.addEventListener(qx.constant.Event.KEYDOWN, this._onkeydown, this);
});

QxSplashScreen.MIN_VALUE = 1;
QxSplashScreen.MAX_VALUE = 100;

/*
------------------------------------------------------------------------------------
  PROPERTIES
------------------------------------------------------------------------------------
*/

/*!
  Should the user have the ability to close the splashscreen by clicking on it or Escape.
*/
qx.OO.addProperty({ name : "allowClose", type : qx.constant.Type.BOOLEAN, defaultValue : true });

/*!
  Should the user have a status bar shown.
*/
qx.OO.addProperty({ name : "showProgressBar", type : qx.constant.Type.BOOLEAN, defaultValue : false });

/*!
  Time to show splash screen.
*/
qx.OO.addProperty({ name : "showTime", type : qx.constant.Type.NUMBER, defaultValue : 0 });

/*!
  Center the splash screen on open.
*/
qx.OO.addProperty({ name : "centered", type : qx.constant.Type.BOOLEAN, defaultValue : true });


/*
------------------------------------------------------------------------------------
  MODIFIERS
------------------------------------------------------------------------------------
*/

qx.Proto._modifyShowProgressBar = function(propValue, propOldValue, propData)
{
  if (propValue)
  {
    var progressPB = this._progressBar = new QxProgressBar(qx.Const.DIRECTION_RIGHT, QxSplashScreen.MIN_VALUE, QxSplashScreen.MAX_VALUE);
    progressPB.setHeight(20);
    this._layout.addAtEnd(progressPB);
  }
  else
  {
    this._layout.remove(this._progressBar);
  }

  return true;
}

qx.Proto._modifyShowTime = function(propValue, propOldValue, propData)
{
  if (propValue)
  {
    this._timer = new qx.client.Timer(this.getShowTime()/QxSplashScreen.MAX_VALUE);
    this._timer.addEventListener(qx.constant.Event.INTERVAL, this._oninterval, this);
  }
  else
  {
    this._timer.stop();
    this._timer.removeEventListener(qx.constant.Event.INTERVAL, this._oninterval, this);
    this._timer.dispose();
    this._timer = null;
  }

  return true;
}

/*
------------------------------------------------------------------------------------
  EVENTS
------------------------------------------------------------------------------------
*/

qx.Proto._oninterval = function(e)
{
  if(this.getShowProgressBar() && this._progressBar.getValue() < QxSplashScreen.MAX_VALUE)
  {
    this._progressBar.setValue(this._progressBar.getValue() + 1);
  }
  else
  {
    this._timer.stop();
    this.close();
  }
}

qx.Proto._onwindowmousedown = function(e)
{
  if(this.getAllowClose()) {
    this.close();
  }
}

qx.Proto._onkeydown = function(e) {
  if(e.getKeyCode() == qx.event.type.KeyEvent.keys.esc)
  {
    this.close();
  }
}

/*
------------------------------------------------------------------------------------
  UTILITIES
------------------------------------------------------------------------------------
*/

qx.Proto.open = function()
{
  if (this.getCentered()) {
    QxUtil.centerToBrowser(this);
  }

  this.show();

  if(this.getShowTime())
  {
    this._timer.start();
  }
}

qx.Proto.close = function() {
  this.hide();
}

qx.Proto.setProgressBarValue = function(vValue)
{
  if(this.getShowProgressBar() && !this.getShowTime())
  {
    this._progressBar.setValue(vValue);
  }
  else
  {
    this.error("Can not manually increase the progress bar or a timer controlled splash screen.");
  }
}

/*
------------------------------------------------------------------------------------
  DISPOSER
------------------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return true;
  }

  if (this._layout)
  {
    this._layout.dispose();
    this._layout = null;
  }

  if (this._component)
  {
    this._component.dispose();
    this._component = null;
  }

  if (this._progressBar)
  {
    this._progressBar.dispose();
    this._progressBar = null;
  }

  if (this._timer)
  {
    this._timer.stop();
    this._timer.removeEventListener(qx.constant.Event.INTERVAL, this._oninterval, this);
    this._timer.dispose();
    this._timer = null;
  }

  return qx.ui.popup.Popup.prototype.dispose.call(this);
}