/* ************************************************************************

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
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (ecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#module(form)

************************************************************************ */

qx.OO.defineClass("qx.ui.form.Button", qx.ui.basic.Atom,
function(vText, vIcon, vIconWidth, vIconHeight, vFlash)
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
  this.addEventListener(qx.constant.Event.MOUSEOVER, this._onmouseover);
  this.addEventListener(qx.constant.Event.MOUSEOUT, this._onmouseout);
  this.addEventListener(qx.constant.Event.MOUSEDOWN, this._onmousedown);
  this.addEventListener(qx.constant.Event.MOUSEUP, this._onmouseup);


  // ************************************************************************
  //   KEY EVENTS
  // ************************************************************************
  this.addEventListener(qx.constant.Event.KEYDOWN, this._onkeydown);
  this.addEventListener(qx.constant.Event.KEYUP, this._onkeyup);
});

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "button" });

qx.Class.STATE_CHECKED = "checked";
qx.Class.STATE_PRESSED = "pressed";
qx.Class.STATE_ABANDONED = "abandoned";




/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

qx.Proto._onmouseover = function(e)
{
  if (e.getTarget() != this) {
    return;
  }

  if (this.hasState(qx.ui.form.Button.STATE_ABANDONED))
  {
    this.removeState(qx.ui.form.Button.STATE_ABANDONED);
    this.addState(qx.ui.form.Button.STATE_PRESSED);
  }

  this.addState(qx.ui.core.Widget.STATE_OVER);
}

qx.Proto._onmouseout = function(e)
{
  if (e.getTarget() != this) {
    return;
  }

  this.removeState(qx.ui.core.Widget.STATE_OVER);

  if (this.hasState(qx.ui.form.Button.STATE_PRESSED))
  {
    // Activate capturing if the button get a mouseout while
    // the button is pressed.
    this.setCapture(true);

    this.removeState(qx.ui.form.Button.STATE_PRESSED);
    this.addState(qx.ui.form.Button.STATE_ABANDONED);
  }
}

qx.Proto._onmousedown = function(e)
{
  if (e.getTarget() != this || !e.isLeftButtonPressed()) {
    return;
  }

  this.removeState(qx.ui.form.Button.STATE_ABANDONED);
  this.addState(qx.ui.form.Button.STATE_PRESSED);
}

qx.Proto._onmouseup = function(e)
{
  this.setCapture(false);

  if (!this.hasState(qx.ui.form.Button.STATE_ABANDONED))
  {
    this.addState(qx.ui.core.Widget.STATE_OVER);

    if (this.hasState(qx.ui.form.Button.STATE_PRESSED)) {
      this.execute();
    }
  }

  this.removeState(qx.ui.form.Button.STATE_ABANDONED);
  this.removeState(qx.ui.form.Button.STATE_PRESSED);
}

qx.Proto._onkeydown = function(e)
{
  switch(e.getKeyCode())
  {
    case qx.event.type.KeyEvent.keys.enter:
    case qx.event.type.KeyEvent.keys.space:
      this.removeState(qx.ui.form.Button.STATE_ABANDONED);
      this.addState(qx.ui.form.Button.STATE_PRESSED);
  }
}

qx.Proto._onkeyup = function(e)
{
  switch(e.getKeyCode())
  {
    case qx.event.type.KeyEvent.keys.enter:
    case qx.event.type.KeyEvent.keys.space:
      if (this.hasState(qx.ui.form.Button.STATE_PRESSED))
      {
        this.removeState(qx.ui.form.Button.STATE_ABANDONED);
        this.removeState(qx.ui.form.Button.STATE_PRESSED);
        this.execute();
      }
  }
}








/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  }

  // ************************************************************************
  //   MOUSE EVENTS
  // ************************************************************************
  this.removeEventListener(qx.constant.Event.MOUSEOVER, this._onmouseover, this);
  this.removeEventListener(qx.constant.Event.MOUSEOUT, this._onmouseout, this);
  this.removeEventListener(qx.constant.Event.MOUSEDOWN, this._onmousedown, this);
  this.removeEventListener(qx.constant.Event.MOUSEUP, this._onmouseup, this);


  // ************************************************************************
  //   KEY EVENTS
  // ************************************************************************
  this.removeEventListener(qx.constant.Event.KEYDOWN, this._onkeydown, this);
  this.removeEventListener(qx.constant.Event.KEYUP, this._onkeyup, this);


  // ************************************************************************
  //   SUPER CLASS
  // ************************************************************************
  return qx.ui.basic.Atom.prototype.dispose.call(this);
}
