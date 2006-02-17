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

function QxRepeatButton(vText, vIcon, vIconWidth, vIconHeight, vFlash)
{
  QxButton.call(this, vText, vIcon, vIconWidth, vIconHeight, vFlash);

  this._timer = new QxTimer;
  this._timer.setInterval(this.getInterval());
  this._timer.addEventListener("interval", this._oninterval, this);
};

QxRepeatButton.extend(QxButton, "QxRepeatButton");


/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

QxRepeatButton.addProperty({ name : "interval", type : QxConst.TYPEOF_NUMBER, defaultValue : 100 });
QxRepeatButton.addProperty({ name : "firstInterval", type : QxConst.TYPEOF_NUMBER, defaultValue : 500 });





/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

proto._onmousedown = function(e)
{
  if (e.getTarget() != this || !e.isLeftButtonPressed()) {
    return;
  };

  this._executed = false;

  this._timer.setInterval(this.getFirstInterval());
  this._timer.start();

  this.removeState(QxConst.STATE_ABANDONED);
  this.addState(QxConst.STATE_PRESSED);
};

proto._onmouseup = function(e)
{
  this.setCapture(false);

  if (!this.hasState(QxConst.STATE_ABANDONED))
  {
    this.addState(QxConst.STATE_OVER);

    if (this.hasState(QxConst.STATE_PRESSED) && !this._executed) {
      this.execute();
    };
  };

  this._timer.stop();

  this.removeState(QxConst.STATE_ABANDONED);
  this.removeState(QxConst.STATE_PRESSED);  
};

proto._oninterval = function(e)
{
  this._timer.stop();
  this._timer.setInterval(this.getInterval());
  this._timer.start();

  this._executed = true;
  this.createDispatchEvent(QxConst.EVENT_TYPE_EXECUTE);
};






/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
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

  return QxButton.prototype.dispose.call(this);
};
