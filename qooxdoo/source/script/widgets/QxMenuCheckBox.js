/*!
  A checkbox for the menu system.
*/
function QxMenuCheckBox(vText, vCommand, vChecked)
{
  QxMenuButton.call(this, vText, this._source, vCommand);
   
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
  EXECUTE
------------------------------------------------------------------------------------
*/

proto.execute = function()
{
  this.setChecked(!this.getChecked());  
  QxMenuButton.prototype.execute.call(this);
};