/* ****************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Authors:  //???Olli???
     * Oliver Vogel
       <o dot vogel at muv dot com>

**************************************************************************** */

/* ****************************************************************************

#package(form) //???Olli???
#require(QxBorderObject)
#require(QxTerminator)
#require(QxText)

**************************************************************************** */

function QxProgressbar(vMax, vShowPercent)
{
  QxCanvasLayout.call(this);

  this.setWidth(250);
  this.setHeight(22);
  this.setBorder(QxBorderObject.presets.inset);
  this.setTabIndex(-1);

  // ***********************************************************************
  //   Progress-Bar itself
  // ***********************************************************************
  this._bar = new QxTerminator();
  this._bar.set({ left: 0, bottom: 0, top: 0, border : QxBorder.presets.none });
  this._bar.setBackgroundColor("green");
  this.add(this._bar);

  // ***********************************************************************
  //   % - Text
  // ***********************************************************************
  this._percent = new QxText();
  this._percent.set({ left: 0, bottom: 0, top: 0, right: 0 });
  this._percent.setDisplay(false); // to avoid flicking if not used
  this._percent.setColor("white");
  this.add(this._percent);

  // ***********************************************************************
  //   INITIALIZATION
  // ***********************************************************************
  if(qx.util.validator.isValidNumber(vMax)) {
    this.setMax(vMax);
  };
  if(qx.util.validator.isValidBoolean(vShowPercent)) {
    this.setShowPercent(vShowPercent);
  };
};

QxProgressbar.extend(QxCanvasLayout, "QxProgressbar");


/*
------------------------------------------------------------------------------------
  PROPERTIES
------------------------------------------------------------------------------------
*/

/*!
  The value of the left position
*/
QxProgressbar.addProperty({ name : "min", type : QxConst.TYPEOF_NUMBER, defaultValue : 0 });

/*!
  The value of the right position
*/
QxProgressbar.addProperty({ name : "max", type : QxConst.TYPEOF_NUMBER, defaultValue : 100 });

/*!
  The amount to increment on each step.
*/
QxProgressbar.addProperty({ name : "stepBy", type : QxConst.TYPEOF_NUMBER, defaultValue : 1 });

/*!
  The current position of the progress.
*/
QxProgressbar.addProperty({ name : "position", type : QxConst.TYPEOF_NUMBER, defaultValue : 0 });

/*!
  Should the % be visible
*/
QxProgressbar.addProperty({ name : "showPercent", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });


/*
------------------------------------------------------------------------------------
  PREFERRED DIMENSIONS
------------------------------------------------------------------------------------
*/

proto._computePreferredInnerWidth = function() { //???Olli???
  return 200;
};

proto._computePreferredInnerHeight = function() { //???Olli???
  return 20;
};



/*
------------------------------------------------------------------------------------
  GETTER AND SETTER
------------------------------------------------------------------------------------
*/
proto._checkMin = function(newValue, propData){
  // min must be < max    
  if (newValue < this.getMax()) return newValue;
  return this.getMin();
};
proto._modifyMin = function(propValue, propOldValue, propData)
{
  // position must be >= min
  if (this.getPosition() < propValue) this.setPosition(propValue);
  // make changes visible
  return this._applyChanges();
}


proto._checkMax = function(newValue, propData){
  // max must be > min
  if (newValue > this.getMin()) return newValue;
  return this.getMax();
};
proto._modifyMax = function(propValue, propOldValue, propData)
{
  // position must be <= max
  if (this.getPosition() > propValue) this.setPosition(propValue);
  // make changes visible
  return this._applyChanges();
}


proto._checkPosition = function(newValue, propData){
  // position must be inside min and max
  if (newValue < this.getMin()) return this.getMin();
  if (newValue > this.getMax()) return this.getMax();
  return newValue;
};
proto._modifyPosition = function(propValue, propOldValue, propData)
{
  // make changes visible
  return this._applyChanges();
};

proto._modifyShowPercent = function(propValue, propOldValue, propData)
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
proto.stepIt = function(){
  this.setPosition(this.getPosition() + this.getStepBy());
}


/*
------------------------------------------------------------------------------------
  INTERNAL STUFF
------------------------------------------------------------------------------------
*/
proto._applyChanges = function(){
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

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  if (this._bar)
  {
    this._bar.dispose();
    this._bar = null;
  };
  
  if (this._percent)
  {
    this._percent.dispose();
    this._percent = null;
  };
  
  return QxCanvasLayout.prototype.dispose.call(this);
};