function QxSpinner()
{
  QxWidget.call(this);
  
  this.setWidth(60);
  this.setHeight(22);
  this.setBorder(QxBorder.presets.inset);
  this.setTabIndex(-1);  

  // ***********************************************************************
  //   RANGE MANAGER
  // ***********************************************************************  
  this._manager = new QxRangeManager();


  // ***********************************************************************
  //   TEXTFIELD
  // ***********************************************************************  
  this._textfield = new QxTextField();
  this._textfield.set({ left: 0, right: 16, bottom: 0, top: 0, textAlign : "right", text : this._manager.getValue() });
  
  this.add(this._textfield);
  

  // ***********************************************************************
  //   UP-BUTTON
  // ***********************************************************************
  this._upbutton = new QxWidget();
  this._upbutton.set({ top: 0, bottom: "50%", width: 16, right: 0, border: QxBorder.presets.outset, canSelect : false });
  
  this._upbuttonimage = new QxImage(QxSpinner._arrowUpImage, 5, 3);
  this._upbuttonimage.set({ top: 1, left: 3, anonymous : true });
  
  this._upbutton.add(this._upbuttonimage);
  this.add(this._upbutton);


  // ***********************************************************************
  //   DOWN-BUTTON
  // ***********************************************************************
  this._downbutton = new QxWidget();
  this._downbutton.set({ top: "50%", bottom: 0, width: 16, right: 0, border: QxBorder.presets.outset, canSelect : false });
  
  this._downbuttonimage = new QxImage(QxSpinner._arrowDownImage, 5, 3);
  this._downbuttonimage.set({ top: 1, left: 3, anonymous : true });
  
  this._downbutton.add(this._downbuttonimage);
  this.add(this._downbutton);
  
  
  // ***********************************************************************
  //   TIMER
  // ***********************************************************************
  this._timer = new QxTimer(this.getInterval());
  
  
  // ***********************************************************************
  //   EVENTS
  // ***********************************************************************
  this.addEventListener("keypress", this._onkeypress, this);
  this.addEventListener("keydown", this._onkeydown, this);
  this.addEventListener("keyup", this._onkeyup, this);
  this.addEventListener("mousewheel", this._onmousewheel, this);
  
  this._textfield.addEventListener("input", this._oninput, this);
  this._textfield.addEventListener("blur", this._onblur, this);
  this._upbutton.addEventListener("mousedown", this._onmousedown, this);
  this._downbutton.addEventListener("mousedown", this._onmousedown, this);  
  this._manager.addEventListener("change", this._onchange, this);      
  this._timer.addEventListener("interval", this._oninterval, this);
};

QxSpinner.extend(QxWidget, "QxSpinner");



/*
  -------------------------------------------------------------------------------
    PROPERTIES
  -------------------------------------------------------------------------------
*/

/*!
  The amount to increment on each event (keypress or mousedown).
*/ 
QxSpinner.addProperty({ name : "incrementAmount", type : Number, defaultValue : 1 });

/*!
  The amount to increment on each event (keypress or mousedown).
*/ 
QxSpinner.addProperty({ name : "wheelIncrementAmount", type : Number, defaultValue : 1 });

/*!
  The amount to increment on each pageup / pagedown keypress
*/ 
QxSpinner.addProperty({ name : "pageIncrementAmount", type : Number, defaultValue : 10 });

/*!
  The current value of the interval (this should be used internally only).
*/ 
QxSpinner.addProperty({ name : "interval", type : Number, defaultValue : 100 });

/*!
  The first interval on event based shrink/growth of the value.
*/ 
QxSpinner.addProperty({ name : "firstInterval", type : Number, defaultValue : 500 });

/*!
  This configures the minimum value for the timer interval.
*/ 
QxSpinner.addProperty({ name : "minTimer", type : Number, defaultValue : 20 });

/*!
  Decrease of the timer on each interval (for the next interval) until minTimer reached.
*/
QxSpinner.addProperty({ name : "timerDecrease", type : Number, defaultValue : 2 });

/*!
  If minTimer was reached, how much the amount of each interval should growth (in relation to the previous interval).
*/
QxSpinner.addProperty({ name : "amountGrowth", type : Number, defaultValue : 1.01 });




/*
  -------------------------------------------------------------------------------
    CONFIGURATION
  -------------------------------------------------------------------------------
*/

QxSpinner._arrowUpImage = "../../images/core/arrows/up_small.gif";
QxSpinner._arrowDownImage = "../../images/core/arrows/down_small.gif";




/*
  -------------------------------------------------------------------------------
    PREFERRED DIMENSIONS
  -------------------------------------------------------------------------------
*/

proto.getPreferredHeight = function() {
  return 22;
};

proto.getPreferredWidth = function() {
  return 60;
};





/*
  -------------------------------------------------------------------------------
    KEY EVENT-HANDLING
  -------------------------------------------------------------------------------
*/

proto._onkeypress = function(e)
{
  var vCode = e.getKeyCode();

  if (vCode == QxKeyEvent.keys.enter && !e.getAltKey())
  {
    this._checkValue(true, false, false);
    this._textfield.selectAll();
  }
  else
  {
    switch (vCode)
    {
      case QxKeyEvent.keys.up:
      case QxKeyEvent.keys.down:
      
      case QxKeyEvent.keys.left:
      case QxKeyEvent.keys.right:
      
      case QxKeyEvent.keys.shift:
      case QxKeyEvent.keys.ctrl:
      case QxKeyEvent.keys.alt:
      
      case QxKeyEvent.keys.esc:
      case QxKeyEvent.keys.del:
      case QxKeyEvent.keys.backspace:
      
      case QxKeyEvent.keys.insert:
      
      case QxKeyEvent.keys.home:
      case QxKeyEvent.keys.end:
      
      case QxKeyEvent.keys.pageup:
      case QxKeyEvent.keys.pagedown:
      
      case QxKeyEvent.keys.numlock:
      case QxKeyEvent.keys.tab:
        break;
        
      default:
        if (vCode >= 48 && vCode <= 57) {
          return;
        };
        
        e.preventDefault();
    };
  };
};

proto._onkeydown = function(e)
{
  var vCode = e.getKeyCode();

  if (this._intervalIncrease == null)
  {
    switch(vCode)
    {
      case QxKeyEvent.keys.up:
      case QxKeyEvent.keys.down:
        this._intervalIncrease = vCode == QxKeyEvent.keys.up;
        this._intervalMode = "single";
        
        this._resetIncrements();
        this._checkValue(true, false, false);

        this._increment();
        this._timer.startWith(this.getFirstInterval());

        break;

      case QxKeyEvent.keys.pageup:
      case QxKeyEvent.keys.pagedown:
        this._intervalIncrease = vCode == QxKeyEvent.keys.pageup;
        this._intervalMode = "page";

        this._resetIncrements();
        this._checkValue(true, false, false);

        this._pageIncrement();
        this._timer.startWith(this.getFirstInterval());
        
        break;
    };
  };
};

proto._onkeyup = function(e)
{
  if (this._intervalIncrease != null)
  {
    switch(e.getKeyCode())
    {
      case QxKeyEvent.keys.up:
      case QxKeyEvent.keys.down:
      case QxKeyEvent.keys.pageup:
      case QxKeyEvent.keys.pagedown:
        this._timer.stop();
        
        this._intervalIncrease = null;
        this._intervalMode = null;
    };
  };
};





/*
  -------------------------------------------------------------------------------
    MOUSE EVENT-HANDLING
  -------------------------------------------------------------------------------
*/

proto._onmousedown = function(e)
{
  if (e.isNotLeftButton()) {
    return;
  };

  this._checkValue(true);
  
  var vButton = e.getCurrentTarget();
  
  vButton.setBorder(QxBorder.presets.inset);
  
  vButton.addEventListener("mouseup", this._onmouseup, this);
  vButton.addEventListener("mouseout", this._onmouseup, this);
  
  this._intervalIncrease = vButton == this._upbutton;
  this._resetIncrements();
  this._increment();
  
  this._textfield.selectAll();
  
  this._timer.setInterval(this.getFirstInterval());
  this._timer.start();
};

proto._onmouseup = function(e)
{
  var vButton = e.getCurrentTarget();
  
  vButton.setBorder(QxBorder.presets.outset);
  
  vButton.removeEventListener("mouseup", this._onmouseup, this);
  vButton.removeEventListener("mouseout", this._onmouseup, this);
  
  this._textfield.selectAll();
  this._textfield.setFocused(true);
  
  this._timer.stop();
  this._intervalIncrease = null;
};

proto._onmousewheel = function(e)
{
  this._manager.setValue(this._manager.getValue() + this.getWheelIncrementAmount() * e.getWheelDelta());
  this._textfield.selectAll();
};




/*
  -------------------------------------------------------------------------------
    OTHER EVENT-HANDLING
  -------------------------------------------------------------------------------
*/

proto._oninput = function(e) {
  this._checkValue(true, true);
};

proto._onchange = function(e)
{
  var vValue = this._manager.getValue();
  
  this._textfield.setText(vValue);
  
  if (vValue == this.getMin()) 
  {
    this._downbutton.setBorder(QxBorder.presets.outset);
    this._downbutton.setEnabled(false);
    this._downbuttonimage.setEnabled(false);
    this._timer.stop();
  }
  else
  {
    this._downbutton.setEnabled(true);
    this._downbuttonimage.setEnabled(true);
  };
  
  if (vValue == this.getMax()) 
  {
    this._upbutton.setBorder(QxBorder.presets.outset);
    this._upbutton.setEnabled(false);
    this._upbuttonimage.setEnabled(false);
    this._timer.stop();
  }
  else
  {
    this._upbutton.setEnabled(true);
    this._upbuttonimage.setEnabled(true);
  };
  
  if (this.hasEventListeners("change")) {
    this.dispatchEvent(new QxEvent("change"));
  };
};

proto._onblur = function(e) {
  this._checkValue(false);
};






/*
  -------------------------------------------------------------------------------
    MAPPING TO RANGE MANAGER
  -------------------------------------------------------------------------------
*/

proto.setValue = function(nValue) {
  this._manager.setValue(nValue);
};

proto.getValue = function() {
  this._checkValue(true);
  return this._manager.getValue();
};

proto.resetValue = function() {
  return this._manager.resetValue();
};

proto.setMax = function(vMax) {
  return this._manager.setMax(vMax);
};

proto.getMax = function() {
  return this._manager.getMax();
};

proto.setMin = function(vMin) {
  return this._manager.setMin(vMin);
};

proto.getMin = function() {
  return this._manager.getMin();
};









/*
  -------------------------------------------------------------------------------
    INTERVAL HANDLING
  -------------------------------------------------------------------------------
*/

proto._intervalIncrease = null;

proto._oninterval = function(e)
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
  -------------------------------------------------------------------------------
    UTILITY
  -------------------------------------------------------------------------------
*/

proto._checkValue = function(acceptEmpty, acceptEdit)
{
  var el = this._textfield.getElement();  
  
  if (!el) {
    return;
  };
  
  if (el.value == "")
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
      while(val.charAt(0) == "0") {
        val = val.substr(1, val.length);
      };
      
      var f1 = parseInt(val) || 0;
      
      if (f1 != el.value) {
        el.value = f1;
        return;      
      };
    };
    
    // fix for negative integer handling  
    if (val == "-" && acceptEmpty && this.getMin() < 0) 
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
    if (acceptEmpty && val == "")
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

proto._increment = function() {
  this._manager.setValue(this._manager.getValue() + ((this._intervalIncrease ? 1 : - 1) * this.getIncrementAmount()));
};

proto._pageIncrement = function() {
  this._manager.setValue(this._manager.getValue() + ((this._intervalIncrease ? 1 : - 1) * this.getPageIncrementAmount()));
};

proto._resetIncrements = function() {
  this.resetIncrementAmount();
  this.resetInterval();
};





/*
  -------------------------------------------------------------------------------
    DISPOSER
  -------------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };
  
  this.removeEventListener("keypress", this._onkeypress, this);
  this.removeEventListener("keydown", this._onkeydown, this);
  this.removeEventListener("keyup", this._onkeyup, this);
  
  if (this._textfield)
  {
    this._textfield.removeEventListener("blur", this._onblur, this);
    this._textfield.dispose();
    this._textfield = null;
  };
  
  if (this._upbutton)
  {
    this._upbutton.removeEventListener("mousedown", this._onmousedown, this);
    this._upbutton.dispose();
    this._upbutton = null;
  };
  
  if (this._downbutton)
  {
    this._downbutton.removeEventListener("mousedown", this._onmousedown, this);  
    this._downbutton.dispose();
    this._downbutton = null;
  };  
  
  if (this._timer)
  {
    this._timer.removeEventListener("interval", this._oninterval, this);
    this._timer.stop();
    this._timer.dispose();
    this._timer = null;
  };
  
  if (this._manager)
  {
    this._manager.removeEventListener("change", this._onchange, this);      
    this._manager.dispose();
    this._manager = null;
  };
  
  return QxWidget.prototype.dispose.call(this); 
};