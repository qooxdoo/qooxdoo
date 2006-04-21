/* ****************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
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
#require(qx.types.Range)
#require(qx.ui.basic.Atom)
#require(qx.client.Timer)

**************************************************************************** */

qx.Const.DIRECTION_UP = "upward";
qx.Const.DIRECTION_RIGHT = "rightward";
qx.Const.DIRECTION_DOWN = "downward";
qx.Const.DIRECTION_LEFT = "leftward";

qx.client.Timer.prototype.wait = function(vMilliseconds)
{
  var vExitTime = (new Date).valueOf() + vMilliseconds;
  var vCurrentTime;

  do { 
    vCurrentTime = (new Date).valueOf();
  } while(vExitTime > vCurrentTime);
};


function QxProgressBar(vDirection, vMin, vMax) {
  qx.ui.layout.CanvasLayout.call(this);

  this.setBorder(qx.renderer.border.BorderObject.presets.inset);
  this.setBackgroundColor("white");

  // ***********************************************************************
  //   RANGE MANAGER
  // ***********************************************************************
  this._manager = new qx.types.Range();

  // ***********************************************************************
  //   BAR
  // ***********************************************************************
  var barA = this._bar = new qx.ui.basic.Atom();
  barA.setBackgroundColor("red");

  this.add(barA);

  // ***********************************************************************
  //   TEXT - removed later, to be replaced with QxFormattedText
  // ***********************************************************************
  var label = new qx.ui.embed.TextEmbed();
  label.setVerticalAlign("middle");
  label.setHorizontalAlign("center");
  label.setColor("white");

  this.add(label);

  this.setLabel(label);

  // ***********************************************************************
  //   TIMER
  // ***********************************************************************
  this._timer = new qx.client.Timer();

  // ***********************************************************************
  //   EVENTS
  // ***********************************************************************
  this._manager.addEventListener(qx.Const.INTERNAL_CHANGE, this._onchange, this);

  // ***********************************************************************
  //   INITIALIZATION
  // ***********************************************************************
  if(qx.util.Validation.isValidString(vDirection)) {
    this.setDirection(vDirection);
  };

  if(qx.util.Validation.isValidNumber(vMin)) {
    this.setMin(vMin);
  };

  if(qx.util.Validation.isValidNumber(vMax)) {
    this.setMax(vMax);
  };
};

QxProgressBar.extend(qx.ui.layout.CanvasLayout, "QxProgressBar");

/*
------------------------------------------------------------------------------------
  PROPERTIES
------------------------------------------------------------------------------------
*/

/*!
  The direction of growth of the bar.
*/
QxProgressBar.addProperty({ name : "direction", type : qx.Const.TYPEOF_STRING, possibleValues : [ qx.Const.DIRECTION_LEFT, qx.Const.DIRECTION_UP, qx.Const.DIRECTION_RIGHT, qx.Const.DIRECTION_DOWN], defaultValue : qx.Const.DIRECTION_RIGHT });

/*!
  The label object.
*/
QxProgressBar.addProperty({ name : "label", type : qx.Const.TYPEOF_OBJECT, allowNull : true }); //instance : QxFormatField

/*!
  The amount to increment on each call to the function increment.
*/
QxProgressBar.addProperty({ name : "incrementAmount", type : qx.Const.TYPEOF_NUMBER, defaultValue : 1 });

/*!
  An indeterminate progress bar indicating that an operation of unknown duration is occurring.
*/
QxProgressBar.addProperty({ name : "indeterminate", type : qx.Const.TYPEOF_BOOLEAN, defaultValue : false });

/*!
  The current value of the wait (this should be used internally only).
*/
QxProgressBar.addProperty({ name : "wait", type : qx.Const.TYPEOF_NUMBER, defaultValue : 0 });


/*
------------------------------------------------------------------------------------
  OTHER EVENT-HANDLING
------------------------------------------------------------------------------------
*/

proto._onchange = function(e)
{
  if(this.getParent())
  {
    if(this.getIndeterminate())
    {
    }
    else 
    {
      var barSizePercent = this.getValue()/this.getMax();
      var barSize;

      switch(this.getDirection())
      {
        case qx.Const.DIRECTION_LEFT :
          barSize = Math.floor(barSizePercent * this.getInnerWidth());
          this._bar.setHeight(this.getInnerHeight());
          this._bar.setLeft(this.getInnerWidth() - barSize);
          this._bar.setWidth(barSize);
          break;

        case qx.Const.DIRECTION_RIGHT :
          barSize = Math.floor(barSizePercent * this.getInnerWidth());
          this._bar.setHeight(this.getInnerHeight());
          this._bar.setWidth(barSize);
          break;

        case qx.Const.DIRECTION_UP :
          barSize = Math.floor(barSizePercent * this.getInnerHeight());
          this._bar.setHeight(barSize);
          this._bar.setTop(this.getInnerHeight() - barSize);
          this._bar.setWidth(this.getInnerWidth());
          break;

        case qx.Const.DIRECTION_DOWN :
          barSize = Math.floor(barSizePercent * this.getInnerHeight());
          this._bar.setHeight(barSize);
          this._bar.setWidth(this.getInnerWidth());
          break;
      };  
    };

    this.getLabel().setText(Math.round(100 * barSizePercent) + '%');

    qx.ui.core.Widget.flushGlobalQueues();

    this._timer.wait(this.getWait());

    if (this.hasEventListeners(qx.Const.INTERNAL_CHANGE))
    {
      this.dispatchEvent(new qx.event.types.Event(qx.Const.INTERNAL_CHANGE));
    };
  };
};

/*
------------------------------------------------------------------------------------
  MAPPING TO RANGE MANAGER
------------------------------------------------------------------------------------
*/

proto.setValue = function(nValue)
{
  this._manager.setValue(nValue);
};

proto.getValue = function()
{
  return this._manager.getValue();
};

proto.resetValue = function()
{
  return this._manager.resetValue();
};

proto.setMax = function(vMax)
{
  return this._manager.setMax(vMax);
};

proto.getMax = function()
{
  return this._manager.getMax();
};

proto.setMin = function(vMin)
{
  return this._manager.setMin(vMin);
};

proto.getMin = function()
{
  return this._manager.getMin();
};

/*
------------------------------------------------------------------------------------
  UTILITIES
------------------------------------------------------------------------------------
*/

proto.increment = function()
{
  var value = this.getValue() + this.getIncrementAmount();

  if(value < this.getMax())
  {
    this.setValue(value);
  }
  else
  {
    this.setValue(this.getMax());
  };
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

  if (this._timer)
  {
    this._timer.stop();
    this._timer.dispose();
    this._timer = null;
  };

  if (this._manager)
  {
    this._manager.removeEventListener(qx.Const.INTERNAL_CHANGE, this._onchange, this);
    this._manager.dispose();
    this._manager = null;
  };

  if (this._bar)
  {
    this._bar.dispose();
    this._bar = null;
  };

  return qx.ui.layout.CanvasLayout.prototype.dispose.call(this);
};