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
#require(qx.ui.form.InputCheckSymbol)

************************************************************************ */

qx.ui.form.CheckBox = function(vText, vValue, vName, vChecked)
{
  qx.ui.basic.Atom.call(this, vText);

  this.setTabIndex(1);
  this.setPadding(2, 3);

  this._createIcon();

  if (qx.util.Validation.isValidString(vValue)) {
    this.setValue(vValue);
  };

  if (qx.util.Validation.isValidString(vName)) {
    this.setName(vName);
  };

  if (qx.util.Validation.isValidBoolean(vChecked)) {
    this.setChecked(vChecked);
  };

  this.addEventListener(QxConst.EVENT_TYPE_CLICK, this._onclick);
  this.addEventListener(QxConst.EVENT_TYPE_KEYDOWN, this._onkeydown);
  this.addEventListener(QxConst.EVENT_TYPE_KEYUP, this._onkeyup);
};

qx.ui.form.CheckBox.extend(qx.ui.basic.Atom, "qx.ui.form.CheckBox");

/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

qx.ui.form.CheckBox.removeProperty({ name : "icon" });

/*!
  The HTML name of the form element used by the widget
*/
qx.ui.form.CheckBox.addProperty({ name : "name", type : QxConst.TYPEOF_STRING });

/*!
  The HTML value of the form element used by the widget
*/
qx.ui.form.CheckBox.addProperty({ name : "value", type : QxConst.TYPEOF_STRING });

/*!
  If the widget is checked
*/
qx.ui.form.CheckBox.addProperty({ name : "checked", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false, getAlias : "isChecked" });





/*
---------------------------------------------------------------------------
  ICON HANDLING
---------------------------------------------------------------------------
*/

proto.INPUT_TYPE = "checkbox";

proto._createIcon = function()
{
  var i = this._iconObject = new qx.ui.form.InputCheckSymbol;

  i.setType(this.INPUT_TYPE);
  i.setChecked(this.isChecked());
  i.setEnabled(this.isEnabled());
  i.setAnonymous(true);

  this.addAtBegin(i);
};





/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyChecked = function(propValue, propOldValue, propData)
{
  if (this._iconObject) {
    this._iconObject.setChecked(propValue);
  };

  return true;
};





/*
---------------------------------------------------------------------------
  HANDLER
---------------------------------------------------------------------------
*/

proto._handleIcon = function()
{
  switch(this.getShow())
  {
    case qx.ui.basic.Atom.SHOW_ICON:
    case qx.ui.basic.Atom.SHOW_BOTH:
      this._iconIsVisible = true;
      break;

    default:
      this._iconIsVisible = false;
  };

  if (this._iconIsVisible)
  {
    this._iconObject ? this._iconObject.setDisplay(true) : this._createIcon();
  }
  else if (this._iconObject)
  {
    this._iconObject.setDisplay(false);
  };
};




/*
---------------------------------------------------------------------------
  EVENT-HANDLER
---------------------------------------------------------------------------
*/

proto._onclick = function(e) {
  this.toggleChecked();
};

proto._onkeydown = function(e)
{
  if(e.getKeyCode() == qx.event.types.KeyEvent.keys.enter && !e.getAltKey()) {
    this.toggleChecked();
  };
};

proto._onkeyup = function(e)
{
  if(e.getKeyCode() == qx.event.types.KeyEvent.keys.space) {
    this.toggleChecked();
  };
};





/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if(this.getDisposed()) {
    return;
  };

  this.removeEventListener(QxConst.EVENT_TYPE_CLICK, this._onclick);
  this.removeEventListener(QxConst.EVENT_TYPE_KEYDOWN, this._onkeydown);
  this.removeEventListener(QxConst.EVENT_TYPE_KEYUP, this._onkeyup);

  return qx.ui.basic.Atom.prototype.dispose.call(this);
};
