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

/*!
  Each instance manage vItems set of radio options: QxRadioButton, QxToolBarRadioButton, ...
*/
function QxRadioManager(vName, vMembers)
{
  // we don't need the manager data structures
  QxTarget.call(this);

  // create item array
  this._items = [];

  // apply name property
  this.setName(QxUtil.isValidString(vName) ? vName : QxRadioManager.AUTO_NAME_PREFIX + this._hashCode);

  if (QxUtil.isValidArray(vMembers)) {
    QxRadioManager.prototype.add.apply(this, vMembers);
  };
};

QxRadioManager.extend(QxManager, "QxRadioManager");

QxRadioManager.AUTO_NAME_PREFIX = "QxRadio-";




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

QxRadioManager.addProperty({ name : "selected" });
QxRadioManager.addProperty({ name : "name", type : QxConst.TYPEOF_STRING });






/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

proto.getItems = function() {
  return this._items;
};

proto.handleItemChecked = function(vItem, vChecked)
{
  if (vChecked)
  {
    this.setSelected(vItem);
  }
  else if (this.getSelected() == vItem)
  {
    this.setSelected(null);
  };
};







/*
---------------------------------------------------------------------------
  REGISTRY
---------------------------------------------------------------------------
*/

proto.add = function()
{
  var vItems = arguments;
  var vLength = vItems.length;

  var vLast = vItems[vLength-1];

  if (!(vLast instanceof QxParent) && !(vLast instanceof QxTerminator)) {
    vLength--;
  };

  var vItem;
  for (var i=0; i<vLength; i++)
  {
    vItem = vItems[i];

    if(this._items.contains(vItem)) {
      return;
    };

    // Push RadioButton to array
    this._items.push(vItem);

    // Inform radio button about new manager
    vItem.setManager(this);

    // Need to update internal value?
    if(vItem.getChecked()) {
      this.setSelected(vItem);
    };

    // Make enabled the same status as the the manager has
    vItem.setEnabled(this.getEnabled());

    // Apply Make name the same
    vItem.setName(this.getName());
  };
};

proto.remove = function(vItem)
{
  // Remove RadioButton from array
  this._items.remove(vItem);

  // Inform radio button about new manager
  vItem.setManager(null);

  // if the radio was checked, set internal selection to null
  if(vItem.getChecked()) {
    this.setSelected(null);
  };
};






/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifySelected = function(propValue, propOldValue, propData)
{
  if (propOldValue && propOldValue.getChecked()) {
    propOldValue.setChecked(false);
  };

  if (propValue && !propValue.getChecked()) {
    propValue.setChecked(true);
  };

  return true;
};

proto._modifyEnabled = function(propValue, propOldValue, propData)
{
  for (var i=0, vItems=this._items, vLength=vItems.length; i<vLength; i++) {
    vItems[i].setEnabled(propValue);
  };

  return true;
};

proto._modifyName = function(propValue, propOldValue, propData)
{
  for (var i=0, vItems=this._items, vLength=vItems.length; i<vLength; i++) {
    vItems[i].setName(propValue);
  };

  return true;
};







/*
---------------------------------------------------------------------------
  SELECTION
---------------------------------------------------------------------------
*/

proto.selectNext = function(vItem)
{
  var vIndex = this._items.indexOf(vItem);

  if(vIndex == -1) {
    return;
  };

  var i = 0;
  var vLength = this._items.length;

  // Find next enabled item
  vIndex = (vIndex + 1) % vLength;
  while(i < vLength && !this._items[vIndex].getEnabled())
  {
    vIndex = (vIndex + 1) % vLength;
    i++;
  };

  this._selectByIndex(vIndex);
};

proto.selectPrevious = function(vItem)
{
  var vIndex = this._items.indexOf(vItem);

  if(vIndex == -1) {
    return;
  };

  var i = 0;
  var vLength = this._items.length;

  // Find previous enabled item
  vIndex = (vIndex - 1 + vLength) % vLength;
  while(i < vLength && !this._items[vIndex].getEnabled())
  {
    vIndex = (vIndex - 1 + vLength) % vLength;
    i++;
  };

  this._selectByIndex(vIndex);
};

proto._selectByIndex = function(vIndex)
{
  if(this._items[vIndex].getEnabled())
  {
    this.setSelected(this._items[vIndex]);
    this._items[vIndex].setFocused(true);
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

  this.forceSelected(null);

  if (this._items)
  {
    for (var i, vItems=this._items, vLength=vItems.length; i<vLength; i++)
    {
      vItems[i].dispose();
      delete vItems[i];
    };

    vItems=null;
    delete this._items;
  };

  return QxTarget.prototype.dispose.call(this);
};
