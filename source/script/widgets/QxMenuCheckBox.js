function QxMenuCheckBox(vText, vShortcut)
{
  QxMenuButton.call(this, vText, null, vShortcut);
  
  
  
};

QxMenuCheckBox.extend(QxMenuButton, "QxMenuCheckBox");

QxMenuCheckBox.removeProperty({ name : "icon" });

QxMenuCheckBox.addProperty({ name : "checked", type : Boolean, defaultValue : false });

proto._displayIcon = true;
proto._modifyIcon = null;

proto._hasIcon = function() {
  return true;
};

proto._pureCreateFillIcon = function()
{
  var i = this._iconObject = new QxInputCheckIcon();
  
  i.setType("checkbox");
  i.setAnonymous(true);
  i.setEnabled(this.isEnabled());
  i.setChecked(this.getChecked());
  i.setParent(this);
  
  i._addCssClassName("QxMenuButtonIcon");
};

