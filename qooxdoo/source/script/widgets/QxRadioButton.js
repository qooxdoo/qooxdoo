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
#require(QxRadioManager)

************************************************************************ */

function QxRadioButton(vText, vValue, vName, vChecked) {
  QxCheckBox.call(this, vText, vValue, vName, vChecked);
};

QxRadioButton.extend(QxCheckBox, "QxRadioButton");



/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  The assigned QxRadioManager which handles the switching between registered buttons
*/
QxRadioButton.addProperty({ name : "manager", type : QxConst.TYPEOF_OBJECT, instance : "QxRadioManager", allowNull : true });





/*
---------------------------------------------------------------------------
  ICON HANDLING
---------------------------------------------------------------------------
*/

proto.INPUT_TYPE = "radio";




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

  var vManager = this.getManager();
  if (vManager) {
    vManager.handleItemChecked(this, propValue);
  };

  return true;
};

proto._modifyManager = function(propValue, propOldValue, propData)
{
  if (propOldValue) {
    propOldValue.remove(this);
  };

  if (propValue) {
    propValue.add(this);
  };

  return true;
};

proto._modifyName = function(propValue, propOldValue, propData)
{
  if (this._iconObject) {
    this._iconObject.setName(propValue);
  };

  if (this.getManager()) {
    this.getManager().setName(propValue);
  };

  return true;
};

proto._modifyValue = function(propValue, propOldValue, propData)
{
  if (this.isCreated() && this._iconObject) {
    this._iconObject.setValue(propValue);
  };

  return true;
};






/*
---------------------------------------------------------------------------
  EVENT-HANDLER
---------------------------------------------------------------------------
*/

proto._onkeydown = function(e)
{
  switch(e.getKeyCode())
  {
    case QxKeyEvent.keys.enter:
      if (!e.getAltKey()) {
        this.setChecked(true);
      };

      break;

    case QxKeyEvent.keys.left:
    case QxKeyEvent.keys.up:
      QxFocusManager.mouseFocus = false;
      // we want to have a focus border when using arrows to select
      QxFocusManager.mouseFocus = false;

      return this.getManager() ? this.getManager().selectPrevious(this) : true;

    case QxKeyEvent.keys.right:
    case QxKeyEvent.keys.down:
      // we want to have a focus border when using arrows to select
      QxFocusManager.mouseFocus = false;

      return this.getManager() ? this.getManager().selectNext(this) : true;
  };
};

proto._onclick = function(e) {
  this.setChecked(true);
};

proto._onkeyup = function(e)
{
  if(e.getKeyCode() == QxKeyEvent.keys.space) {
    this.setChecked(true);
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

  return QxCheckBox.prototype.dispose.call(this);
};
