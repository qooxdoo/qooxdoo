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

#module(form)
#require(qx.type.Range)
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
}


function QxProgressBar(vDirection, vMin, vMax) {
  qx.ui.layout.CanvasLayout.call(this);

  this.setBorder(qx.renderer.border.BorderObject.presets.inset);
  this.setBackgroundColor("white");

  // ***********************************************************************
  //   RANGE MANAGER
  // ***********************************************************************
  this._manager = new qx.type.Range();

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
  this._manager.addEventListener(qx.OO.C_CHANGE, this._onchange, this);

  // ***********************************************************************
  //   INITIALIZATION
  // ***********************************************************************
  if(qx.util.Validation.isValidString(vDirection)) {
    this.setDirection(vDirection);
  }

  if(qx.util.Validation.isValidNumber(vMin)) {
    this.setMin(vMin);
  }

  if(qx.util.Validation.isValidNumber(vMax)) {
    this.setMax(vMax);
  }
});

/*
------------------------------------------------------------------------------------
  PROPERTIES
------------------------------------------------------------------------------------
*/

/*!
  The direction of growth of the bar.
*/
qx.OO.addProperty({ name : "direction", type : qx.constant.Type.STRING, possibleValues : [ qx.Const.DIRECTION_LEFT, qx.Const.DIRECTION_UP, qx.Const.DIRECTION_RIGHT, qx.Const.DIRECTION_DOWN], defaultValue : qx.Const.DIRECTION_RIGHT });

/*!
  The label object.
*/
qx.OO.addProperty({ name : "label", type : qx.constant.Type.OBJECT, allowNull : true }); //instance : QxFormatField

/*!
  The amount to increment on each call to the function increment.
*/
qx.OO.addProperty({ name : "incrementAmount", type : qx.constant.Type.NUMBER, defaultValue : 1 });

/*!
  An indeterminate progress bar indicating that an operation of unknown duration is occurring.
*/
qx.OO.addProperty({ name : "indeterminate", type : qx.constant.Type.BOOLEAN, defaultValue : false });

/*!
  The current value of the wait (this should be used internally only).
*/
qx.OO.addProperty({ name : "wait", type : qx.constant.Type.NUMBER, defaultValue : 0 });


/*
------------------------------------------------------------------------------------
  OTHER EVENT-HANDLING
------------------------------------------------------------------------------------
*/

qx.Proto._onchange = function(e)
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
      }  
    }

    this.getLabel().setText(Math.round(100 * barSizePercent) + '%');

    qx.ui.core.Widget.flushGlobalQueues();

    this._timer.wait(this.getWait());

    if (this.hasEventListeners(qx.OO.C_CHANGE))
    {
      this.dispatchEvent(new qx.event.type.Event(qx.OO.C_CHANGE));
    }
  }
}

/*
------------------------------------------------------------------------------------
  MAPPING TO RANGE MANAGER
------------------------------------------------------------------------------------
*/

qx.Proto.setValue = function(nValue)
{
  this._manager.setValue(nValue);
}

qx.Proto.getValue = function()
{
  return this._manager.getValue();
}

qx.Proto.resetValue = function()
{
  return this._manager.resetValue();
}

qx.Proto.setMax = function(vMax)
{
  return this._manager.setMax(vMax);
}

qx.Proto.getMax = function()
{
  return this._manager.getMax();
}

qx.Proto.setMin = function(vMin)
{
  return this._manager.setMin(vMin);
}

qx.Proto.getMin = function()
{
  return this._manager.getMin();
}

/*
------------------------------------------------------------------------------------
  UTILITIES
------------------------------------------------------------------------------------
*/

qx.Proto.increment = function()
{
  var value = this.getValue() + this.getIncrementAmount();

  if(value < this.getMax())
  {
    this.setValue(value);
  }
  else
  {
    this.setValue(this.getMax());
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

  if (this._timer)
  {
    this._timer.stop();
    this._timer.dispose();
    this._timer = null;
  }

  if (this._manager)
  {
    this._manager.removeEventListener(qx.OO.C_CHANGE, this._onchange, this);
    this._manager.dispose();
    this._manager = null;
  }

  if (this._bar)
  {
    this._bar.dispose();
    this._bar = null;
  }

  return qx.ui.layout.CanvasLayout.prototype.dispose.call(this);
}