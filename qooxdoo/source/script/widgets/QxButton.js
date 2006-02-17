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

function QxButton(vText, vIcon, vIconWidth, vIconHeight, vFlash)
{
  // ************************************************************************
  //   INIT
  // ************************************************************************
  QxAtom.call(this, vText, vIcon, vIconWidth, vIconHeight, vFlash);
  
  // Make focusable
  this.setTabIndex(1);


  // ************************************************************************
  //   MOUSE EVENTS
  // ************************************************************************
  this.addEventListener(QxConst.EVENT_TYPE_MOUSEOVER, this._onmouseover);
  this.addEventListener(QxConst.EVENT_TYPE_MOUSEOUT, this._onmouseout);
  this.addEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onmousedown);
  this.addEventListener(QxConst.EVENT_TYPE_MOUSEUP, this._onmouseup);


  // ************************************************************************
  //   KEY EVENTS
  // ************************************************************************
  this.addEventListener(QxConst.EVENT_TYPE_KEYDOWN, this._onkeydown);
  this.addEventListener(QxConst.EVENT_TYPE_KEYUP, this._onkeyup);
};

QxButton.extend(QxAtom, "QxButton");

QxButton.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "button" });






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

  if (this.hasState(QxConst.STATE_ABANDONED)) 
  {
    this.removeState(QxConst.STATE_ABANDONED);
    this.addState(QxConst.STATE_PRESSED);
  };

  this.addState(QxConst.STATE_OVER);
};

proto._onmouseout = function(e)
{
  if (e.getTarget() != this) {
    return;
  };

  this.removeState(QxConst.STATE_OVER);

  if (this.hasState(QxConst.STATE_PRESSED))
  {
    // Activate capturing if the button get a mouseout while
    // the button is pressed.
    this.setCapture(true);

    this.removeState(QxConst.STATE_PRESSED);
    this.addState(QxConst.STATE_ABANDONED);
  };
};

proto._onmousedown = function(e)
{
  if (e.getTarget() != this || !e.isLeftButtonPressed()) {
    return;
  };

  this.removeState(QxConst.STATE_ABANDONED);
  this.addState(QxConst.STATE_PRESSED);
};

proto._onmouseup = function(e)
{
  this.setCapture(false);

  if (!this.hasState(QxConst.STATE_ABANDONED))
  {
    this.addState(QxConst.STATE_OVER);

    if (this.hasState(QxConst.STATE_PRESSED)) {
      this.execute();
    };
  };

  this.removeState(QxConst.STATE_ABANDONED);
  this.removeState(QxConst.STATE_PRESSED); 
};

proto._onkeydown = function(e)
{
  switch(e.getKeyCode())
  {
    case QxKeyEvent.keys.enter:
    case QxKeyEvent.keys.space:
      this.removeState(QxConst.STATE_ABANDONED);
      this.addState(QxConst.STATE_PRESSED);
  };
};

proto._onkeyup = function(e)
{
  switch(e.getKeyCode())
  {
    case QxKeyEvent.keys.enter:
    case QxKeyEvent.keys.space:
      if (this.hasState(QxConst.STATE_PRESSED))
      {
        this.removeState(QxConst.STATE_ABANDONED);
        this.removeState(QxConst.STATE_PRESSED);
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
  this.removeEventListener(QxConst.EVENT_TYPE_MOUSEOVER, this._onmouseover, this);
  this.removeEventListener(QxConst.EVENT_TYPE_MOUSEOUT, this._onmouseout, this);
  this.removeEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onmousedown, this);
  this.removeEventListener(QxConst.EVENT_TYPE_MOUSEUP, this._onmouseup, this);


  // ************************************************************************
  //   KEY EVENTS
  // ************************************************************************
  this.removeEventListener(QxConst.EVENT_TYPE_KEYDOWN, this._onkeydown, this);
  this.removeEventListener(QxConst.EVENT_TYPE_KEYUP, this._onkeyup, this);


  // ************************************************************************
  //   SUPER CLASS
  // ************************************************************************
  return QxAtom.prototype.dispose.call(this);
};
