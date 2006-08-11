/* ****************************************************************************

   qooxdoo - the new era of web development

   Version:
     $Id$

   Copyright:
     (C) 2004-2005 by Schlund + Partner AG, Germany
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

#module(form)
#require(qx.client.Timer)

**************************************************************************** */

function QxScroller(vShiftX, vShiftY, vInterval) {
  qx.ui.layout.CanvasLayout.call(this);

  this.setAppearance("scroller");

  // ***********************************************************************
  //   TIMER
  // ***********************************************************************
  this._timer = new qx.client.Timer();

  // ***********************************************************************
  //   EVENTS
  // ***********************************************************************
  this._timer.addEventListener(qx.constant.Event.INTERVAL, this._oninterval, this);

  // ***********************************************************************
  //   SCROLL PANE
  // ***********************************************************************

  var sp = this._scrollpane = new qx.ui.layout.CanvasLayout();
  sp.setHeight(qx.constant.Core.AUTO);
  sp.setWidth(qx.constant.Core.AUTO);

  qx.ui.core.Parent.prototype.add.call(this, sp)

  // ***********************************************************************
  //   INITIALIZATION
  // ***********************************************************************

  if(qx.util.Validation.isValidNumber(vShiftX)) {
    this.setShiftX(vShiftX);
  }

  if(qx.util.Validation.isValidNumber(vShiftY)) {
    this.setShiftY(vShiftY);
  }

  if(qx.util.Validation.isValidNumber(vInterval)) {
    this._timer.setInterval(vInterval);
  }

  this._firstTime = true;
});


/*
------------------------------------------------------------------------------------
  PROPERTIES
------------------------------------------------------------------------------------
*/

/*!
  The number of pixels shift in x direction.
*/
qx.OO.addProperty({ name : "shiftX", type : qx.constant.Type.NUMBER, defaultValue : -1 });

/*!
  The number of pixels shift in y direction.
*/
qx.OO.addProperty({ name : "shiftY", type : qx.constant.Type.NUMBER, defaultValue : 0 });

/*!
  Loop the widgets when finished.
*/
qx.OO.addProperty({ name : "loop", type : qx.constant.Type.BOOLEAN, defaultValue : true });


/*
------------------------------------------------------------------------------------
  MODIFIERS
------------------------------------------------------------------------------------
*/

qx.Proto._modifyInterval = function(propValue, propOldValue, propData)
{
  this.stop();
  this._timer.startWith(propValue);

  return true;
}

/*
------------------------------------------------------------------------------------
  OTHER EVENT-HANDLING
------------------------------------------------------------------------------------
*/

qx.Proto._oninterval = function(e)
{
  this.scroll();
}


/*
------------------------------------------------------------------------------------
  UTILITY
------------------------------------------------------------------------------------
*/

qx.Proto.add = function(widget) {
  this._scrollpane.add(widget);
}

qx.Proto.getInterval = function()
{
  return this._timer.getInterval();
}

qx.Proto.setInterval = function(vInterval)
{
  this._timer.setInterval(vInterval);
}

qx.Proto.init = function() {
  var shiftX = this.getShiftX();
  var shiftY = this.getShiftY();

  if(shiftX < 0) {
    this._scrollpane.setLeft(this.getWidth());
  }
  else {//if(shiftX > 0) {
    this._scrollpane.setLeft(-this._scrollpane._computeBoxWidth());
  }
//  else {
//    this._scrollpane.setLeft(0);
//  }

  if(shiftY < 0) {
    this._scrollpane.setTop(this.getHeight());
  }
  else {//if(shiftY > 0) {
this.error(this._scrollpane._computeBoxHeight());
    this._scrollpane.setTop(-this._scrollpane._computeBoxHeight());
  }
//  else {
//    this._scrollpane.setTop(0);
//  }
}

qx.Proto.start = function()
{
  if(this._firstTime == true) {
    this.init();
    this._firstTime = false;
  }

  this._timer.start();
}

qx.Proto.stop = function()
{
  this._timer.stop();
}

qx.Proto.reset = function() {
  this._firstTime = true;

  this.init();
}

qx.Proto.scroll = function() 
{
  this.stop();

  this._scrollpane.setLeft(this._scrollpane.getLeft() + this.getShiftX());
  this._scrollpane.setTop(this._scrollpane.getTop() + this.getShiftY());

  qx.ui.core.Widget.flushGlobalQueues();

  this.start();
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

  if(this._scrollpane) {
    this._scrollpane.dispose();
    this._scrollpane = null;
  }

  if (this._timer)
  {
    this._timer.stop();
    this._timer.removeEventListener(qx.constant.Event.INTERVAL, this._oninterval, this);
    this._timer.dispose();
    this._timer = null;
  }

  delete this._firstTime;

  return qx.ui.layout.CanvasLayout.prototype.dispose.call(this);
}
