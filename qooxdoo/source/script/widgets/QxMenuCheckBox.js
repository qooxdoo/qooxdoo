/*!
  A checkbox for the menu system.
*/
function QxMenuCheckBox(vText, vShortcut, vChecked)
{
  QxMenuButton.call(this, vText, null, vShortcut);
  
  this.setIcon(this._source);
  
  if (isValid(vChecked)) {
    this.setChecked(vChecked);
  };
};

QxMenuCheckBox.extend(QxMenuButton, "QxMenuCheckBox");

QxMenuCheckBox.addProperty({ name : "name", type : String });
QxMenuCheckBox.addProperty({ name : "value", type : String });
QxMenuCheckBox.addProperty({ name : "checked", type : Boolean, defaultValue : false, getAlias : "isChecked" });


/*
------------------------------------------------------------------------------------
  ICON HANDLING
------------------------------------------------------------------------------------
*/

proto._source = "../../images/core/checkbox.gif";

proto._pureCreateFillIcon = function()
{
  QxMenuButton.prototype._pureCreateFillIcon.call(this);  
  this._iconObject.setVisible(this.getChecked());
};



/*
------------------------------------------------------------------------------------
  MODIFIERS
------------------------------------------------------------------------------------
*/

proto._modifyChecked = function(propValue, propOldValue, propName, uniqModIds)
{
  if (this._iconObject) {
    this._iconObject.setVisible(propValue);
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
  this.setChecked(!this.getChecked());  
  QxMenuButton.prototype._onmousedown.call(this, e);
};