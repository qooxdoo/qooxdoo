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

#package(menu)
#require(QxRadioManager)

************************************************************************ */

function QxMenuRadioButton(vLabel, vCommand, vChecked) 
{
  QxMenuCheckBox.call(this, vLabel, vCommand, vChecked);
  
  this._iconObject.setAppearance("menu-radio-button-icon");
};

QxMenuRadioButton.extend(QxMenuCheckBox, "QxMenuRadioButton");


/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

QxMenuRadioButton.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "menu-radio-button" });

/*!
  The assigned QxRadioManager which handles the switching between registered buttons
*/
QxMenuRadioButton.addProperty({ name : "manager", type : QxConst.TYPEOF_OBJECT, instance : "QxRadioManager", allowNull : true });






/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyChecked = function(propValue, propOldValue, propData)
{
  var vManager = this.getManager();
  
  if (vManager) 
  {
    if (propValue)
    {
      vManager.setSelected(this);
    }
    else if (vManager.getSelected() == this)
    {
      vManager.setSelected(null);
    };
  };

  return QxMenuCheckBox.prototype._modifyChecked.call(this, propValue, propOldValue, propData);
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
  if (this.getManager()) {
    this.getManager().setName(propValue);
  };

  return true;
};





/*
---------------------------------------------------------------------------
  EXECUTE
---------------------------------------------------------------------------
*/

proto.execute = function()
{
  this.setChecked(true);
  QxMenuButton.prototype.execute.call(this);
};
