function QxToolBarRadioButton(vText, vIcon, vChecked)
{
  QxToolBarCheckBox.call(this, vText, vIcon, vChecked);
};

QxToolBarRadioButton.extend(QxToolBarCheckBox, "QxToolBarRadioButton");

QxToolBarRadioButton.addProperty({ name : "group" });
QxToolBarRadioButton.addProperty({ name : "name", type : String });
QxToolBarRadioButton.addProperty({ name : "disableUncheck", type : Boolean, defaultValue : false });

proto._modifyChecked = function(propValue, propOldValue, propName, uniqModIds)
{
  QxToolBarCheckBox.prototype._modifyChecked.call(this, propValue, propOldValue, propName, uniqModIds);

  if (this.getGroup()) {
    this.getGroup().setSelected(this, uniqModIds);
  };

  return true;
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

proto._onmouseup = function(e)
{
  if(e.isNotLeftButton()) {
    return;
  };

  this.setChecked(this.getDisableUncheck() || !this.getChecked());
};

