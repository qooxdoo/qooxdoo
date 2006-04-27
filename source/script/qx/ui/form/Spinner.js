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

#package(form)
#require(qx.renderer.border.BorderObject)
#require(qx.ui.form.TextField)
#require(qx.ui.basic.Image)
#require(qx.client.Timer)

************************************************************************ */

qx.OO.defineClass("qx.ui.form.Spinner", qx.ui.layout.HorizontalBoxLayout, 
function(vMin, vValue, vMax)
{
  qx.ui.layout.HorizontalBoxLayout.call(this);

  // ************************************************************************
  //   BEHAVIOR
  // ************************************************************************
  this.setTabIndex(-1);

  if (qx.sys.Client.isMshtml()) {
    this.setStyleProperty("fontSize", qx.constant.Core.ZEROPIXEL);
  };


  // ************************************************************************
  //   MANAGER
  // ************************************************************************
  this._manager = new qx.types.Range();


  // ************************************************************************
  //   TEXTFIELD
  // ************************************************************************
  this._textfield = new qx.ui.form.TextField;
  this._textfield.setAppearance("spinner-field");
  this._textfield.setValue(String(this._manager.getValue()));

  this.add(this._textfield);


  // ************************************************************************
  //   BUTTON LAYOUT
  // ************************************************************************
  this._buttonlayout = new qx.ui.layout.VerticalBoxLayout;
  this._buttonlayout.setWidth(qx.constant.Core.AUTO);
  this.add(this._buttonlayout);


  // ************************************************************************
  //   UP-BUTTON
  // ************************************************************************
  this._upbutton = new qx.ui.basic.Image("widgets/arrows/up_small.gif");
  this._upbutton.setAppearance("spinner-button-up");
  this._buttonlayout.add(this._upbutton);


  // ************************************************************************
  //   DOWN-BUTTON
  // ************************************************************************
  this._downbutton = new qx.ui.basic.Image("widgets/arrows/down_small.gif");
  this._downbutton.setAppearance("spinner-button-down");
  this._buttonlayout.add(this._downbutton);


  // ************************************************************************
  //   TIMER
  // ************************************************************************
  this._timer = new qx.client.Timer(this.getInterval());


  // ************************************************************************
  //   EVENTS
  // ************************************************************************
  this.addEventListener(qx.Const.EVENT_TYPE_KEYPRESS, this._onkeypress, this);
  this.addEventListener(qx.Const.EVENT_TYPE_KEYDOWN, this._onkeydown, this);
  this.addEventListener(qx.Const.EVENT_TYPE_KEYUP, this._onkeyup, this);
  this.addEventListener(qx.Const.EVENT_TYPE_MOUSEWHEEL, this._onmousewheel, this);

  this._textfield.addEventListener(qx.Const.EVENT_TYPE_INPUT, this._oninput, this);
  this._textfield.addEventListener(qx.Const.EVENT_TYPE_BLUR, this._onblur, this);
  this._upbutton.addEventListener(qx.Const.EVENT_TYPE_MOUSEDOWN, this._onmousedown, this);
  this._downbutton.addEventListener(qx.Const.EVENT_TYPE_MOUSEDOWN, this._onmousedown, this);
  this._manager.addEventListener(qx.Const.EVENT_TYPE_CHANGE, this._onchange, this);
  this._timer.addEventListener(qx.Const.EVENT_TYPE_INTERVAL, this._oninterval, this);


  // ************************************************************************
  //   INITIALIZATION
  // ************************************************************************

  if(qx.util.Validation.isValidNumber(vMin)) {
    this.setMin(vMin);
  };

  if(qx.util.Validation.isValidNumber(vMax)) {
    this.setMax(vMax);
  };

  if(qx.util.Validation.isValidNumber(vValue)) {
    this.setValue(vValue);
  };
});



/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

qx.OO.changeProperty({ name : "appearance", type : qx.Const.TYPEOF_STRING, defaultValue : "spinner" });

/*!
  The amount to increment on each event (keypress or mousedown).
*/
qx.OO.addProperty({ name : "incrementAmount", type : qx.Const.TYPEOF_NUMBER, defaultValue : 1 });

/*!
  The amount to increment on each event (keypress or mousedown).
*/
qx.OO.addProperty({ name : "wheelIncrementAmount", type : qx.Const.TYPEOF_NUMBER, defaultValue : 1 });

/*!
  The amount to increment on each pageup / pagedown keypress
*/
qx.OO.addProperty({ name : "pageIncrementAmount", type : qx.Const.TYPEOF_NUMBER, defaultValue : 10 });

/*!
  The current value of the interval (this should be used internally only).
*/
qx.OO.addProperty({ name : "interval", type : qx.Const.TYPEOF_NUMBER, defaultValue : 100 });

/*!
  The first interval on event based shrink/growth of the value.
*/
qx.OO.addProperty({ name : "firstInterval", type : qx.Const.TYPEOF_NUMBER, defaultValue : 500 });

/*!
  This configures the minimum value for the timer interval.
*/
qx.OO.addProperty({ name : "minTimer", type : qx.Const.TYPEOF_NUMBER, defaultValue : 20 });

/*!
  Decrease of the timer on each interval (for the next interval) until minTimer reached.
*/
qx.OO.addProperty({ name : "timerDecrease", type : qx.Const.TYPEOF_NUMBER, defaultValue : 2 });

/*!
  If minTimer was reached, how much the amount of each interval should growth (in relation to the previous interval).
*/
qx.OO.addProperty({ name : "amountGrowth", type : qx.Const.TYPEOF_NUMBER, defaultValue : 1.01 });





/*
---------------------------------------------------------------------------
  PREFERRED DIMENSIONS
---------------------------------------------------------------------------
*/

qx.Proto._computePreferredInnerWidth = function() {
  return 50;
};

qx.Proto._computePreferredInnerHeight = function() {
  return 14;
};





/*
---------------------------------------------------------------------------
  KEY EVENT-HANDLING
---------------------------------------------------------------------------
*/

qx.Proto._onkeypress = function(e)
{
  var vCode = e.getKeyCode();

  if (vCode == qx.event.types.KeyEvent.keys.enter && !e.getAltKey())
  {
    this._checkValue(true, false, false);
    this._textfield.selectAll();
  }
  else
  {
    switch (vCode)
    {
      case qx.event.types.KeyEvent.keys.up:
      case qx.event.types.KeyEvent.keys.down:

      case qx.event.types.KeyEvent.keys.left:
      case qx.event.types.KeyEvent.keys.right:

      case qx.event.types.KeyEvent.keys.shift:
      case qx.event.types.KeyEvent.keys.ctrl:
      case qx.event.types.KeyEvent.keys.alt:

      case qx.event.types.KeyEvent.keys.esc:
      case qx.event.types.KeyEvent.keys.del:
      case qx.event.types.KeyEvent.keys.backspace:

      case qx.event.types.KeyEvent.keys.insert:

      case qx.event.types.KeyEvent.keys.home:
      case qx.event.types.KeyEvent.keys.end:

      case qx.event.types.KeyEvent.keys.pageup:
      case qx.event.types.KeyEvent.keys.pagedown:

      case qx.event.types.KeyEvent.keys.numlock:
      case qx.event.types.KeyEvent.keys.tab:
        break;

      default:
        if (vCode >= 48 && vCode <= 57) {
          return;
        };

        e.preventDefault();
    };
  };
};

qx.Proto._onkeydown = function(e)
{
  var vCode = e.getKeyCode();

  if (this._intervalIncrease == null)
  {
    switch(vCode)
    {
      case qx.event.types.KeyEvent.keys.up:
      case qx.event.types.KeyEvent.keys.down:
        this._intervalIncrease = vCode == qx.event.types.KeyEvent.keys.up;
        this._intervalMode = "single";

        this._resetIncrements();
        this._checkValue(true, false, false);

        this._increment();
        this._timer.startWith(this.getFirstInterval());

        break;

      case qx.event.types.KeyEvent.keys.pageup:
      case qx.event.types.KeyEvent.keys.pagedown:
        this._intervalIncrease = vCode == qx.event.types.KeyEvent.keys.pageup;
        this._intervalMode = "page";

        this._resetIncrements();
        this._checkValue(true, false, false);

        this._pageIncrement();
        this._timer.startWith(this.getFirstInterval());

        break;
    };
  };
};

qx.Proto._onkeyup = function(e)
{
  if (this._intervalIncrease != null)
  {
    switch(e.getKeyCode())
    {
      case qx.event.types.KeyEvent.keys.up:
      case qx.event.types.KeyEvent.keys.down:
      case qx.event.types.KeyEvent.keys.pageup:
      case qx.event.types.KeyEvent.keys.pagedown:
        this._timer.stop();

        this._intervalIncrease = null;
        this._intervalMode = null;
    };
  };
};





/*
---------------------------------------------------------------------------
  MOUSE EVENT-HANDLING
---------------------------------------------------------------------------
*/

qx.Proto._onmousedown = function(e)
{
  if (!e.isLeftButtonPressed()) {
    return;
  };

  this._checkValue(true);

  var vButton = e.getCurrentTarget();

  vButton.addState(qx.Const.STATE_PRESSED);

  vButton.addEventListener(qx.Const.EVENT_TYPE_MOUSEUP, this._onmouseup, this);
  vButton.addEventListener(qx.Const.EVENT_TYPE_MOUSEOUT, this._onmouseup, this);

  this._intervalIncrease = vButton == this._upbutton;
  this._resetIncrements();
  this._increment();

  this._textfield.selectAll();

  this._timer.setInterval(this.getFirstInterval());
  this._timer.start();
};

qx.Proto._onmouseup = function(e)
{
  var vButton = e.getCurrentTarget();

  vButton.removeState(qx.Const.STATE_PRESSED);

  vButton.removeEventListener(qx.Const.EVENT_TYPE_MOUSEUP, this._onmouseup, this);
  vButton.removeEventListener(qx.Const.EVENT_TYPE_MOUSEOUT, this._onmouseup, this);

  this._textfield.selectAll();
  this._textfield.setFocused(true);

  this._timer.stop();
  this._intervalIncrease = null;
};

qx.Proto._onmousewheel = function(e)
{
  this._manager.setValue(this._manager.getValue() + this.getWheelIncrementAmount() * e.getWheelDelta());
  this._textfield.selectAll();
};




/*
---------------------------------------------------------------------------
  OTHER EVENT-HANDLING
---------------------------------------------------------------------------
*/

qx.Proto._oninput = function(e) {
  this._checkValue(true, true);
};

qx.Proto._onchange = function(e)
{
  var vValue = this._manager.getValue();

  this._textfield.setValue(String(vValue));

  if (vValue == this.getMin())
  {
    this._downbutton.removeState(qx.Const.STATE_PRESSED);
    this._downbutton.setEnabled(false);
    this._timer.stop();
  }
  else
  {
    this._downbutton.setEnabled(true);
  };

  if (vValue == this.getMax())
  {
    this._upbutton.removeState(qx.Const.STATE_PRESSED);
    this._upbutton.setEnabled(false);
    this._timer.stop();
  }
  else
  {
    this._upbutton.setEnabled(true);
  };

  if (this.hasEventListeners(qx.Const.EVENT_TYPE_CHANGE)) {
    this.dispatchEvent(new qx.event.types.Event(qx.Const.EVENT_TYPE_CHANGE), true);
  };
};

qx.Proto._onblur = function(e) {
  this._checkValue(false);
};






/*
---------------------------------------------------------------------------
  MAPPING TO RANGE MANAGER
---------------------------------------------------------------------------
*/

qx.Proto.setValue = function(nValue) {
  this._manager.setValue(nValue);
};

qx.Proto.getValue = function() {
  this._checkValue(true);
  return this._manager.getValue();
};

qx.Proto.resetValue = function() {
  return this._manager.resetValue();
};

qx.Proto.setMax = function(vMax) {
  return this._manager.setMax(vMax);
};

qx.Proto.getMax = function() {
  return this._manager.getMax();
};

qx.Proto.setMin = function(vMin) {
  return this._manager.setMin(vMin);
};

qx.Proto.getMin = function() {
  return this._manager.getMin();
};









/*
---------------------------------------------------------------------------
  INTERVAL HANDLING
---------------------------------------------------------------------------
*/

qx.Proto._intervalIncrease = null;

qx.Proto._oninterval = function(e)
{
  this._timer.stop();
  this.setInterval(Math.max(this.getMinTimer(), this.getInterval()-this.getTimerDecrease()));

  if (this._intervalMode == "page")
  {
    this._pageIncrement();
  }
  else
  {
    if (this.getInterval() == this.getMinTimer()) {
      this.setIncrementAmount(this.getAmountGrowth() * this.getIncrementAmount());
    };

    this._increment();
  };

  switch(this._intervalIncrease)
  {
    case true:
      if (this.getValue() == this.getMax()) {
        return;
      };

    case false:
      if (this.getValue() == this.getMin()) {
        return;
      };
  };

  this._timer.restartWith(this.getInterval());
};





/*
---------------------------------------------------------------------------
  UTILITY
---------------------------------------------------------------------------
*/

qx.Proto._checkValue = function(acceptEmpty, acceptEdit)
{
  var el = this._textfield.getElement();

  if (!el) {
    return;
  };

  if (el.value == qx.constant.Core.EMPTY)
  {
    if (!acceptEmpty)
    {
      el.value = this.resetValue();
      this._textfield.selectAll();

      return;
    };
  }
  else
  {
    // cache working variable
    var val = el.value;

    // fix leading '0'
    if (val.length > 1)
    {
      while(val.charAt(0) == qx.constant.Core.ZERO) {
        val = val.substr(1, val.length);
      };

      var f1 = parseInt(val) || 0;

      if (f1 != el.value) {
        el.value = f1;
        return;
      };
    };

    // fix for negative integer handling
    if (val == qx.constant.Core.MINUS && acceptEmpty && this.getMin() < 0)
    {
      if (el.value != val) {
        el.value = val;
      };

      return;
    };

    // parse the string
    val = parseInt(val);

    // main check routine
    var doFix = true;
    var fixedVal = this._manager._checkValue(val);

    if (isNaN(fixedVal)) {
      fixedVal = this._manager.getValue();
    };

    // handle empty string
    if (acceptEmpty && val == qx.constant.Core.EMPTY)
    {
      doFix = false;
    }
    else if (!isNaN(val))
    {
      // check for editmode in keypress events
      if (acceptEdit)
      {
        // fix min/max values
        if (val > fixedVal && !(val > 0 && fixedVal <= 0) && String(val).length < String(fixedVal).length)
        {
          doFix = false;
        }
        else if (val < fixedVal && !(val < 0 && fixedVal >= 0) && String(val).length < String(fixedVal).length)
        {
          doFix = false;
        };
      };
    };

    // apply value fix
    if (doFix && el.value != fixedVal) {
      el.value = fixedVal;
    };

    // inform manager
    if (!acceptEdit) {
      this._manager.setValue(fixedVal);
    };
  };
};

qx.Proto._increment = function() {
  this._manager.setValue(this._manager.getValue() + ((this._intervalIncrease ? 1 : - 1) * this.getIncrementAmount()));
};

qx.Proto._pageIncrement = function() {
  this._manager.setValue(this._manager.getValue() + ((this._intervalIncrease ? 1 : - 1) * this.getPageIncrementAmount()));
};

qx.Proto._resetIncrements = function()
{
  this.resetIncrementAmount();
  this.resetInterval();
};





/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  this.removeEventListener(qx.Const.EVENT_TYPE_KEYPRESS, this._onkeypress, this);
  this.removeEventListener(qx.Const.EVENT_TYPE_KEYDOWN, this._onkeydown, this);
  this.removeEventListener(qx.Const.EVENT_TYPE_KEYUP, this._onkeyup, this);
  this.removeEventListener(qx.Const.EVENT_TYPE_MOUSEWHEEL, this._onmousewheel, this);

  if (this._textfield)
  {
    this._textfield.removeEventListener(qx.Const.EVENT_TYPE_BLUR, this._onblur, this);
    this._textfield.removeEventListener(qx.Const.EVENT_TYPE_INPUT, this._oninput, this);
    this._textfield.dispose();
    this._textfield = null;
  };

  if (this._buttonlayout)
  {
    this._buttonlayout.dispose();
    this._buttonlayout = null;
  };

  if (this._upbutton)
  {
    this._upbutton.removeEventListener(qx.Const.EVENT_TYPE_MOUSEDOWN, this._onmousedown, this);
    this._upbutton.dispose();
    this._upbutton = null;
  };

  if (this._downbutton)
  {
    this._downbutton.removeEventListener(qx.Const.EVENT_TYPE_MOUSEDOWN, this._onmousedown, this);
    this._downbutton.dispose();
    this._downbutton = null;
  };

  if (this._timer)
  {
    this._timer.removeEventListener(qx.Const.EVENT_TYPE_INTERVAL, this._oninterval, this);
    this._timer.stop();
    this._timer.dispose();
    this._timer = null;
  };

  if (this._manager)
  {
    this._manager.removeEventListener(qx.Const.EVENT_TYPE_CHANGE, this._onchange, this);
    this._manager.dispose();
    this._manager = null;
  };

  return qx.ui.layout.HorizontalBoxLayout.prototype.dispose.call(this);
};