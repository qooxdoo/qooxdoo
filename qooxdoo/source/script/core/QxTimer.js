/* ********************************************************************
   Class: QxTimer
******************************************************************** */

/*!
  Global timer support. Simplifies javascript intervals for objects.
*/
function QxTimer(vInterval)
{
  QxTarget.call(this);

  this.setEnabled(false);

  if (isValidNumber(vInterval)) {
    this.setInterval(vInterval);
  };

  (new QxTimerManager).add(this);

  // Object wrapper to timer event
  var o = this;
  this.__oninterval = function() { o._oninterval(); };
};

QxTimer.extend(QxTarget, "QxTimer");

QxTimer.addProperty({ name : "interval", type : Number, defaultValue : 1000 });

proto._intervalHandle = null;



/*
------------------------------------------------------------------------------------
  MODIFIER
------------------------------------------------------------------------------------
*/

proto._modifyEnabled = function(propValue, propOldValue, propName, uniqModIds)
{
  if (propOldValue)
  {
    window.clearInterval(this._intervalHandle);
    this._intervalHandle = null;
  }
  else if (propValue)
  {
    this._intervalHandle = window.setInterval(this.__oninterval, this.getInterval());
  };

  return QxTarget.prototype._modifyEnabled.call(this, propValue, propOldValue, propName, uniqModIds);
};




/*
------------------------------------------------------------------------------------
  USER-ACCESS
------------------------------------------------------------------------------------
*/

proto.start = function() {
  this.setEnabled(true);
};

proto.startWith = function(vInterval)
{
  this.setInterval(vInterval);
  this.start();
};

proto.stop = function() {
  this.setEnabled(false);
};

proto.restart = function()
{
  this.stop();
  this.start();
};

proto.restartwith = function(vInterval)
{
  this.stop();
  this.startWith(vInterval);
};




/*
------------------------------------------------------------------------------------
  EVENT-MAPPER
------------------------------------------------------------------------------------
*/

proto._oninterval=function()
{
  if(this.getEnabled() && this.hasEventListeners("interval")) {
    this.dispatchEvent(new QxEvent("interval"), true);
  };
};





/*
------------------------------------------------------------------------------------
  DISPOSER
------------------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if(this.getDisposed()) {
    return;
  };

  // Stop interval
  this.stop();

  // Clear object wrapper function
  this.__oninterval = null;

  // Clear handle
  if (this._intervalHandler)
  {
    window.clearInterval(this._intervalHandle);
    this._intervalHandler = null;
  };

  // Call QxTarget to do the other dispose work
  return QxTarget.prototype.dispose.call(this);
};
