function QxMenuRadioButton(vText, vShortcut, vChecked)
{
  QxMenuCheckBox.call(this, vText, vShortcut, vChecked);
  
  
};

QxMenuRadioButton.extend(QxMenuCheckBox, "QxMenuRadioButton");

QxMenuRadioButton.addProperty({ name : "group" });

/*
------------------------------------------------------------------------------------
  ICON HANDLING
------------------------------------------------------------------------------------
*/

proto._source = "../../images/core/radiobutton.gif";




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
  EVENTS
------------------------------------------------------------------------------------
*/

proto._onmousedown = function(e)
{
  this.setChecked(true);  
  QxMenuButton.prototype._onmousedown.call(this, e);
};