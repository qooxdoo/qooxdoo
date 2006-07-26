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

   Authors:  //???Olli???
     * Oliver Vogel
       <o dot vogel at muv dot com>

**************************************************************************** */

/* ****************************************************************************

#module(form) //???Olli???
#require(qx.renderer.border.BorderObject)
#require(qx.ui.basic.Terminator)
#require(qx.ui.embed.TextEmbed)

**************************************************************************** */

function QxProgressbar(vMax, vShowPercent)
{
  qx.ui.layout.CanvasLayout.call(this);

  this.setWidth(250);
  this.setHeight(22);
  this.setBorder(qx.renderer.border.BorderObject.presets.inset);
  this.setTabIndex(-1);

  // ***********************************************************************
  //   Progress-Bar itself
  // ***********************************************************************
  this._bar = new qx.ui.basic.Terminator();
  this._bar.set({ left: 0, bottom: 0, top: 0, border : qx.renderer.border.Border.presets.none });
  this._bar.setBackgroundColor("green");
  this.add(this._bar);

  // ***********************************************************************
  //   % - Text
  // ***********************************************************************
  this._percent = new qx.ui.embed.TextEmbed();
  this._percent.set({ left: 0, bottom: 0, top: 0, right: 0 });
  this._percent.setDisplay(false); // to avoid flicking if not used
  this._percent.setColor("white");
  this.add(this._percent);

  // ***********************************************************************
  //   INITIALIZATION
  // ***********************************************************************
  if(qx.util.Validation.isValidNumber(vMax)) {
    this.setMax(vMax);
  }
  if(qx.util.Validation.isValidBoolean(vShowPercent)) {
    this.setShowPercent(vShowPercent);
  }
});


/*
------------------------------------------------------------------------------------
  PROPERTIES
------------------------------------------------------------------------------------
*/

/*!
  The value of the left position
*/
qx.OO.addProperty({ name : "min", type : qx.constant.Type.NUMBER, defaultValue : 0 });

/*!
  The value of the right position
*/
qx.OO.addProperty({ name : "max", type : qx.constant.Type.NUMBER, defaultValue : 100 });

/*!
  The amount to increment on each step.
*/
qx.OO.addProperty({ name : "stepBy", type : qx.constant.Type.NUMBER, defaultValue : 1 });

/*!
  The current position of the progress.
*/
qx.OO.addProperty({ name : "position", type : qx.constant.Type.NUMBER, defaultValue : 0 });

/*!
  Should the % be visible
*/
qx.OO.addProperty({ name : "showPercent", type : qx.constant.Type.BOOLEAN, defaultValue : false });


/*
------------------------------------------------------------------------------------
  PREFERRED DIMENSIONS
------------------------------------------------------------------------------------
*/

qx.Proto._computePreferredInnerWidth = function() { //???Olli???
  return 200;
}

qx.Proto._computePreferredInnerHeight = function() { //???Olli???
  return 20;
}



/*
------------------------------------------------------------------------------------
  GETTER AND SETTER
------------------------------------------------------------------------------------
*/
qx.Proto._checkMin = function(newValue, propData){
  // min must be < max    
  if (newValue < this.getMax()) return newValue;
  return this.getMin();
}
qx.Proto._modifyMin = function(propValue, propOldValue, propData)
{
  // position must be >= min
  if (this.getPosition() < propValue) this.setPosition(propValue);
  // make changes visible
  return this._applyChanges();
}


qx.Proto._checkMax = function(newValue, propData){
  // max must be > min
  if (newValue > this.getMin()) return newValue;
  return this.getMax();
}
qx.Proto._modifyMax = function(propValue, propOldValue, propData)
{
  // position must be <= max
  if (this.getPosition() > propValue) this.setPosition(propValue);
  // make changes visible
  return this._applyChanges();
}


qx.Proto._checkPosition = function(newValue, propData){
  // position must be inside min and max
  if (newValue < this.getMin()) return this.getMin();
  if (newValue > this.getMax()) return this.getMax();
  return newValue;
}
qx.Proto._modifyPosition = function(propValue, propOldValue, propData)
{
  // make changes visible
  return this._applyChanges();
}

qx.Proto._modifyShowPercent = function(propValue, propOldValue, propData)
{
  // show or hide the Text
  this._percent.setDisplay(propValue);
  // ready
  return true;
}



/*
------------------------------------------------------------------------------------
  THE ACTION
------------------------------------------------------------------------------------
*/
qx.Proto.stepIt = function(){
  this.setPosition(this.getPosition() + this.getStepBy());
}


/*
------------------------------------------------------------------------------------
  INTERNAL STUFF
------------------------------------------------------------------------------------
*/
qx.Proto._applyChanges = function(){
  // calc position in %
  var p = this.getPosition() - this.getMin();
  var g = this.getMax() - this.getMin();
  var percent = (p * 100) / g;
  // set width of the bar to show the progress
  this._bar.setWidth(percent + '%');
  // set the text
  this._percent.setText(Math.round(percent) + '%');
  // ready
  return true;
}



/*
------------------------------------------------------------------------------------
  DISPOSER
------------------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  }

  if (this._bar)
  {
    this._bar.dispose();
    this._bar = null;
  }
  
  if (this._percent)
  {
    this._percent.dispose();
    this._percent = null;
  }
  
  return qx.ui.layout.CanvasLayout.prototype.dispose.call(this);
}