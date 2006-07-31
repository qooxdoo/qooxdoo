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
#require(qx.manager.selection.RadioManager)

************************************************************************ */

qx.OO.defineClass("qx.ui.form.RadioButton", qx.ui.form.CheckBox, 
function(vText, vValue, vName, vChecked) {
  qx.ui.form.CheckBox.call(this, vText, vValue, vName, vChecked);
});



/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  The assigned qx.manager.selection.RadioManager which handles the switching between registered buttons
*/
qx.OO.addProperty({ name : "manager", type : qx.constant.Type.OBJECT, instance : "qx.manager.selection.RadioManager", allowNull : true });





/*
---------------------------------------------------------------------------
  ICON HANDLING
---------------------------------------------------------------------------
*/

qx.Proto.INPUT_TYPE = "radio";




/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifyChecked = function(propValue, propOldValue, propData)
{
  if (this._iconObject) {
    this._iconObject.setChecked(propValue);
  }

  var vManager = this.getManager();
  if (vManager) {
    vManager.handleItemChecked(this, propValue);
  }

  return true;
}

qx.Proto._modifyManager = function(propValue, propOldValue, propData)
{
  if (propOldValue) {
    propOldValue.remove(this);
  }

  if (propValue) {
    propValue.add(this);
  }

  return true;
}

qx.Proto._modifyName = function(propValue, propOldValue, propData)
{
  if (this._iconObject) {
    this._iconObject.setName(propValue);
  }

  if (this.getManager()) {
    this.getManager().setName(propValue);
  }

  return true;
}

qx.Proto._modifyValue = function(propValue, propOldValue, propData)
{
  if (this.isCreated() && this._iconObject) {
    this._iconObject.setValue(propValue);
  }

  return true;
}






/*
---------------------------------------------------------------------------
  EVENT-HANDLER
---------------------------------------------------------------------------
*/

qx.Proto._onkeydown = function(e)
{
  switch(e.getKeyCode())
  {
    case qx.event.type.KeyEvent.keys.enter:
      if (!e.getAltKey()) {
        this.setChecked(true);
      }

      break;

    case qx.event.type.KeyEvent.keys.left:
    case qx.event.type.KeyEvent.keys.up:
      qx.event.handler.FocusHandler.mouseFocus = false;
      // we want to have a focus border when using arrows to select
      qx.event.handler.FocusHandler.mouseFocus = false;

      return this.getManager() ? this.getManager().selectPrevious(this) : true;

    case qx.event.type.KeyEvent.keys.right:
    case qx.event.type.KeyEvent.keys.down:
      // we want to have a focus border when using arrows to select
      qx.event.handler.FocusHandler.mouseFocus = false;

      return this.getManager() ? this.getManager().selectNext(this) : true;
  }
}

qx.Proto._onclick = function(e) {
  this.setChecked(true);
}

qx.Proto._onkeyup = function(e)
{
  if(e.getKeyCode() == qx.event.type.KeyEvent.keys.space) {
    this.setChecked(true);
  }
}





/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if(this.getDisposed()) {
    return;
  }

  return qx.ui.form.CheckBox.prototype.dispose.call(this);
}
