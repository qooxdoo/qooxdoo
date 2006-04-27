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

************************************************************************ */

qx.OO.defineClass("qx.ui.form.RepeatButton", qx.ui.form.Button, 
function(vText, vIcon, vIconWidth, vIconHeight, vFlash)
{
  qx.ui.form.Button.call(this, vText, vIcon, vIconWidth, vIconHeight, vFlash);

  this._timer = new qx.client.Timer;
  this._timer.setInterval(this.getInterval());
  this._timer.addEventListener("interval", this._oninterval, this);
});


/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

qx.OO.addProperty({ name : "interval", type : qx.Const.TYPEOF_NUMBER, defaultValue : 100 });
qx.OO.addProperty({ name : "firstInterval", type : qx.Const.TYPEOF_NUMBER, defaultValue : 500 });





/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

qx.Proto._onmousedown = function(e)
{
  if (e.getTarget() != this || !e.isLeftButtonPressed()) {
    return;
  };

  this._executed = false;

  this._timer.setInterval(this.getFirstInterval());
  this._timer.start();

  this.removeState(qx.Const.STATE_ABANDONED);
  this.addState(qx.Const.STATE_PRESSED);
};

qx.Proto._onmouseup = function(e)
{
  this.setCapture(false);

  if (!this.hasState(qx.Const.STATE_ABANDONED))
  {
    this.addState(qx.Const.STATE_OVER);

    if (this.hasState(qx.Const.STATE_PRESSED) && !this._executed) {
      this.execute();
    };
  };

  this._timer.stop();

  this.removeState(qx.Const.STATE_ABANDONED);
  this.removeState(qx.Const.STATE_PRESSED);
};

qx.Proto._oninterval = function(e)
{
  this._timer.stop();
  this._timer.setInterval(this.getInterval());
  this._timer.start();

  this._executed = true;
  this.createDispatchEvent(qx.Const.EVENT_TYPE_EXECUTE);
};






/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
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

  return qx.ui.form.Button.prototype.dispose.call(this);
};
