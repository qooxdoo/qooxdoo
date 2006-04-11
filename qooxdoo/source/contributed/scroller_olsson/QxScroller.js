/* ****************************************************************************

   qooxdoo - the new era of web interface development

   Version:
     $Id$

   Copyright:
     (C) 2004-2005 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Authors:
     * Kent Olsson (kols)
       <kent dot olsson at chello dot se>

**************************************************************************** */

/* ****************************************************************************

#package(form)
#require(qx.client.Timer)

**************************************************************************** */

function QxScroller(vShiftX, vShiftY, vInterval) {
  QxCanvasLayout.call(this);

  this.setAppearance("scroller");

  // ***********************************************************************
  //   TIMER
  // ***********************************************************************
  this._timer = new qx.client.Timer();

  // ***********************************************************************
  //   EVENTS
  // ***********************************************************************
  this._timer.addEventListener(QxConst.EVENT_TYPE_INTERVAL, this._oninterval, this);

  // ***********************************************************************
  //   SCROLL PANE
  // ***********************************************************************

  var sp = this._scrollpane = new QxCanvasLayout();
  sp.setHeight(QxConst.CORE_AUTO);
  sp.setWidth(QxConst.CORE_AUTO);

  qx.ui.core.Parent.prototype.add.call(this, sp)

  // ***********************************************************************
  //   INITIALIZATION
  // ***********************************************************************

  if(qx.util.validator.isValidNumber(vShiftX)) {
    this.setShiftX(vShiftX);
  };

  if(qx.util.validator.isValidNumber(vShiftY)) {
    this.setShiftY(vShiftY);
  };

  if(qx.util.validator.isValidNumber(vInterval)) {
    this._timer.setInterval(vInterval);
  };

  this._firstTime = true;
};

QxScroller.extend(QxCanvasLayout, "QxScroller");


/*
------------------------------------------------------------------------------------
  PROPERTIES
------------------------------------------------------------------------------------
*/

/*!
  The number of pixels shift in x direction.
*/
QxScroller.addProperty({ name : "shiftX", type : QxConst.TYPEOF_NUMBER, defaultValue : -1 });

/*!
  The number of pixels shift in y direction.
*/
QxScroller.addProperty({ name : "shiftY", type : QxConst.TYPEOF_NUMBER, defaultValue : 0 });

/*!
  Loop the widgets when finished.
*/
QxScroller.addProperty({ name : "loop", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true });


/*
------------------------------------------------------------------------------------
  MODIFIERS
------------------------------------------------------------------------------------
*/

proto._modifyInterval = function(propValue, propOldValue, propData)
{
  this.stop();
  this._timer.startWith(propValue);

  return true;
};

/*
------------------------------------------------------------------------------------
  OTHER EVENT-HANDLING
------------------------------------------------------------------------------------
*/

proto._oninterval = function(e)
{
  this.scroll();
};


/*
------------------------------------------------------------------------------------
  UTILITY
------------------------------------------------------------------------------------
*/

proto.add = function(widget) {
  this._scrollpane.add(widget);
};

proto.getInterval = function()
{
  return this._timer.getInterval();
};

proto.setInterval = function(vInterval)
{
  this._timer.setInterval(vInterval);
};

proto.init = function() {
  var shiftX = this.getShiftX();
  var shiftY = this.getShiftY();

  if(shiftX < 0) {
    this._scrollpane.setLeft(this.getWidth());
  }
  else {//if(shiftX > 0) {
    this._scrollpane.setLeft(-this._scrollpane._computeBoxWidth());
  };
//  else {
//    this._scrollpane.setLeft(0);
//  };

  if(shiftY < 0) {
    this._scrollpane.setTop(this.getHeight());
  }
  else {//if(shiftY > 0) {
this.error(this._scrollpane._computeBoxHeight());
    this._scrollpane.setTop(-this._scrollpane._computeBoxHeight());
  };
//  else {
//    this._scrollpane.setTop(0);
//  };
};

proto.start = function()
{
  if(this._firstTime == true) {
    this.init();
    this._firstTime = false;
  };

  this._timer.start();
};

proto.stop = function()
{
  this._timer.stop();
};

proto.reset = function() {
  this._firstTime = true;

  this.init();
};

proto.scroll = function() 
{
  this.stop();

  this._scrollpane.setLeft(this._scrollpane.getLeft() + this.getShiftX());
  this._scrollpane.setTop(this._scrollpane.getTop() + this.getShiftY());

  qx.ui.core.Widget.flushGlobalQueues();

  this.start();
};

/*
------------------------------------------------------------------------------------
  DISPOSER
------------------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return true;
  };

  if(this._scrollpane) {
    this._scrollpane.dispose();
    this._scrollpane = null;
  };

  if (this._timer)
  {
    this._timer.stop();
    this._timer.removeEventListener(QxConst.EVENT_TYPE_INTERVAL, this._oninterval, this);
    this._timer.dispose();
    this._timer = null;
  };

  delete this._firstTime;

  return QxCanvasLayout.prototype.dispose.call(this);
};
