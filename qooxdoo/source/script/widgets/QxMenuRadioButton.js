function QxMenuRadioButton(vText, vCommand, vChecked)
{
  QxMenuCheckBox.call(this, vText, vCommand, vChecked);
  
  
};

QxMenuRadioButton.extend(QxMenuCheckBox, "QxMenuRadioButton");

QxMenuRadioButton.addProperty({ name : "group" });

/*
------------------------------------------------------------------------------------
  ICON HANDLING
------------------------------------------------------------------------------------
*/

proto._source = "widgets/menu/radiobutton.gif";




/*
------------------------------------------------------------------------------------
  MODIFIER
------------------------------------------------------------------------------------
*/

proto._modifyChecked = function(propValue, propOldValue, propName, uniqModIds)
{
  if (this.getGroup()) {
    this.getGroup().setSelected(this, uniqModIds);
  };
  
  return QxMenuCheckBox.prototype._modifyChecked.call(this, propValue, propOldValue, propName, uniqModIds);
};

proto._modifyGroup = function(propValue, propOldValue, propName, uniqModIds)
{
  if (propOldValue) {
    propOldValue.remove(this, uniqModIds);
  };

  if (propValue) {
    propValue.add(this, uniqModIds);
  };

  return true;
};

proto._modifyName = function(propValue, propOldValue, propName, uniqModIds)
{
  if (this.getGroup()) {
    this.getGroup().setName(propValue, uniqModIds);
  };

  return true;
};





/*
------------------------------------------------------------------------------------
  EXECUTE
------------------------------------------------------------------------------------
*/

proto.execute = function()
{
  this.setChecked(true);  
  QxMenuButton.prototype.execute.call(this);
};