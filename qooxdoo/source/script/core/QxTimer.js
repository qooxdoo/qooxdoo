/* ********************************************************************
   Class: QxTimer
******************************************************************** */

function QxTimer(interval)
{
  QxTarget.call(this);

  if (isValid(interval)) {
    this.setInterval(interval);
  };

  (new QxTimerManager).add(this);

  // Object wrapper to timer event
  var o = this;
  this.__ontimer = function() { o._ontimer(); };

  this.setEnabled(false);
};

QxTimer.extend(QxTarget, "QxTimer");

QxTimer.addProperty({ name : "interval", type : Number, defaultValue : 1000 });

proto._intervalHandle = null;

proto.start = function()
{
  if(this.getEnabled()) {
    this.stop();
  };

  this.setEnabled(true);

  // Setup new interval
  this._intervalHandle = window.setInterval(this.__ontimer, this.getInterval());
};

proto.stop = function()
{
  this.setEnabled(false);

  // Clear interval
  window.clearInterval(this._intervalHandle);
  this._intervalHandle=null;
};

/* Object implementation for timer event */
proto._ontimer=function()
{
  if(this.getEnabled() && this.hasEventListeners("timer")) {
    this.dispatchEvent(new QxEvent("timer"), true);
  };
};

proto.dispose = function()
{
  if(this._disposed) {
    return;
  };

  // Stop interval
  this.stop();

  // Clear object wrapper function
  this.__ontimer = null;

  // Call QxTarget to do the other dispose work
  return QxTarget.prototype.dispose.call(this);
};
