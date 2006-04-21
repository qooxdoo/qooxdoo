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

qx.ui.form.Button = function(vText, vIcon, vIconWidth, vIconHeight, vFlash)
{
  // ************************************************************************
  //   INIT
  // ************************************************************************
  qx.ui.basic.Atom.call(this, vText, vIcon, vIconWidth, vIconHeight, vFlash);

  // Make focusable
  this.setTabIndex(1);


  // ************************************************************************
  //   MOUSE EVENTS
  // ************************************************************************
  this.addEventListener(qx.Const.EVENT_TYPE_MOUSEOVER, this._onmouseover);
  this.addEventListener(qx.Const.EVENT_TYPE_MOUSEOUT, this._onmouseout);
  this.addEventListener(qx.Const.EVENT_TYPE_MOUSEDOWN, this._onmousedown);
  this.addEventListener(qx.Const.EVENT_TYPE_MOUSEUP, this._onmouseup);


  // ************************************************************************
  //   KEY EVENTS
  // ************************************************************************
  this.addEventListener(qx.Const.EVENT_TYPE_KEYDOWN, this._onkeydown);
  this.addEventListener(qx.Const.EVENT_TYPE_KEYUP, this._onkeyup);
};

qx.ui.form.Button.extend(qx.ui.basic.Atom, "qx.ui.form.Button");

qx.ui.form.Button.changeProperty({ name : "appearance", type : qx.Const.TYPEOF_STRING, defaultValue : "button" });






/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

proto._onmouseover = function(e)
{
  if (e.getTarget() != this) {
    return;
  };

  if (this.hasState(qx.Const.STATE_ABANDONED))
  {
    this.removeState(qx.Const.STATE_ABANDONED);
    this.addState(qx.Const.STATE_PRESSED);
  };

  this.addState(qx.Const.STATE_OVER);
};

proto._onmouseout = function(e)
{
  if (e.getTarget() != this) {
    return;
  };

  this.removeState(qx.Const.STATE_OVER);

  if (this.hasState(qx.Const.STATE_PRESSED))
  {
    // Activate capturing if the button get a mouseout while
    // the button is pressed.
    this.setCapture(true);

    this.removeState(qx.Const.STATE_PRESSED);
    this.addState(qx.Const.STATE_ABANDONED);
  };
};

proto._onmousedown = function(e)
{
  if (e.getTarget() != this || !e.isLeftButtonPressed()) {
    return;
  };

  this.removeState(qx.Const.STATE_ABANDONED);
  this.addState(qx.Const.STATE_PRESSED);
};

proto._onmouseup = function(e)
{
  this.setCapture(false);

  if (!this.hasState(qx.Const.STATE_ABANDONED))
  {
    this.addState(qx.Const.STATE_OVER);

    if (this.hasState(qx.Const.STATE_PRESSED)) {
      this.execute();
    };
  };

  this.removeState(qx.Const.STATE_ABANDONED);
  this.removeState(qx.Const.STATE_PRESSED);
};

proto._onkeydown = function(e)
{
  switch(e.getKeyCode())
  {
    case qx.event.types.KeyEvent.keys.enter:
    case qx.event.types.KeyEvent.keys.space:
      this.removeState(qx.Const.STATE_ABANDONED);
      this.addState(qx.Const.STATE_PRESSED);
  };
};

proto._onkeyup = function(e)
{
  switch(e.getKeyCode())
  {
    case qx.event.types.KeyEvent.keys.enter:
    case qx.event.types.KeyEvent.keys.space:
      if (this.hasState(qx.Const.STATE_PRESSED))
      {
        this.removeState(qx.Const.STATE_ABANDONED);
        this.removeState(qx.Const.STATE_PRESSED);
        this.execute();
      };
  };
};








/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  // ************************************************************************
  //   MOUSE EVENTS
  // ************************************************************************
  this.removeEventListener(qx.Const.EVENT_TYPE_MOUSEOVER, this._onmouseover, this);
  this.removeEventListener(qx.Const.EVENT_TYPE_MOUSEOUT, this._onmouseout, this);
  this.removeEventListener(qx.Const.EVENT_TYPE_MOUSEDOWN, this._onmousedown, this);
  this.removeEventListener(qx.Const.EVENT_TYPE_MOUSEUP, this._onmouseup, this);


  // ************************************************************************
  //   KEY EVENTS
  // ************************************************************************
  this.removeEventListener(qx.Const.EVENT_TYPE_KEYDOWN, this._onkeydown, this);
  this.removeEventListener(qx.Const.EVENT_TYPE_KEYUP, this._onkeyup, this);


  // ************************************************************************
  //   SUPER CLASS
  // ************************************************************************
  return qx.ui.basic.Atom.prototype.dispose.call(this);
};
