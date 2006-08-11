/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************


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

qx.OO.addProperty({ name : "interval", type : qx.constant.Type.NUMBER, defaultValue : 100 });
qx.OO.addProperty({ name : "firstInterval", type : qx.constant.Type.NUMBER, defaultValue : 500 });





/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

qx.Proto._onmousedown = function(e)
{
  if (e.getTarget() != this || !e.isLeftButtonPressed()) {
    return;
  }

  this._executed = false;

  this._timer.setInterval(this.getFirstInterval());
  this._timer.start();

  this.removeState(qx.ui.form.Button.STATE_ABANDONED);
  this.addState(qx.ui.form.Button.STATE_PRESSED);
}

qx.Proto._onmouseup = function(e)
{
  this.setCapture(false);

  if (!this.hasState(qx.ui.form.Button.STATE_ABANDONED))
  {
    this.addState(qx.ui.core.Widget.STATE_OVER);

    if (this.hasState(qx.ui.form.Button.STATE_PRESSED) && !this._executed) {
      this.execute();
    }
  }

  this._timer.stop();

  this.removeState(qx.ui.form.Button.STATE_ABANDONED);
  this.removeState(qx.ui.form.Button.STATE_PRESSED);
}

qx.Proto._oninterval = function(e)
{
  this._timer.stop();
  this._timer.setInterval(this.getInterval());
  this._timer.start();

  this._executed = true;
  this.createDispatchEvent(qx.constant.Event.EXECUTE);
}






/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
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

  return qx.ui.form.Button.prototype.dispose.call(this);
}
