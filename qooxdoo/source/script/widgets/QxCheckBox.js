function QxCheckBox(vText, vValue, vName, vChecked)
{
  QxAtom.call(this, vText);

  this.setTabIndex(1);

  if (isValid(vValue)) {
    this.setValue(vValue);
  };

  if (isValid(vName)) {
    this.setName(vName);
  };

  if (isValid(vChecked)) {
    this.setChecked(vChecked);
  };  
  
  this.addEventListener("click", this._onclick);
  this.addEventListener("keydown", this._onkeydown);
  this.addEventListener("keyup", this._onkeyup);  
};

QxCheckBox.extend(QxAtom, "QxCheckBox");

/*
  -------------------------------------------------------------------------------
    MODIFIER
  -------------------------------------------------------------------------------
*/

QxCheckBox.removeProperty({ name : "icon" });

QxCheckBox.addProperty({ name : "name", type : String });
QxCheckBox.addProperty({ name : "value", type : String });
QxCheckBox.addProperty({ name : "checked", type : Boolean, defaultValue : false, getAlias : "isChecked" });


/*
  -------------------------------------------------------------------------------
    ICON HANDLING
  -------------------------------------------------------------------------------
*/

proto._displayIcon = true;
proto._modifyIcon = null;

proto._hasIcon = function() {
  return true;
};

proto._pureCreateFillIcon = function()
{
  var i = this._iconObject = new QxInputCheckIcon();
  
  i.setType("checkbox");
  i.setChecked(this.isChecked());
  i.setEnabled(this.isEnabled());
  i.setAnonymous(true);
  i.setParent(this);  
};





/*
  -------------------------------------------------------------------------------
    MODIFIER
  -------------------------------------------------------------------------------
*/

proto._modifyChecked = function(propValue, propOldValue, propName, uniqModIds)
{
  if (this._iconObject) {
    this._iconObject.setChecked(propValue);
  };
  
  return true;
};

/*!
Fix Internet Explorer behaviour to prohibit checked state for non visible input fields.
*/
if ((new QxClient).isMshtml())
{
  proto._modifyVisible = function(propValue, propOldValue, propName, uniqModIds)
  {
    QxWidget.prototype._modifyVisible.call(this, propValue, propOldValue, propName, uniqModIds);
    
    if (this._iconObject && propValue) {
      this._iconObject.getElement().checked = this.getChecked();
    };
    
    return true;
  };
};



/*
  -------------------------------------------------------------------------------
    EVENT-HANDLER
  -------------------------------------------------------------------------------
*/

proto._onclick = function(e)
{
  var t = e.getDomTarget();
  this.setChecked(t.tagName == "input" ? t.checked : !this.isChecked());
};

proto._onkeydown = function(e)
{
  if(e.getKeyCode() == QxKeyEvent.keys.enter && !e.getAltKey()) {
    this.setChecked(this._iconObject ? !this._iconObject.isChecked() : !this.isChecked());
  };
};

proto._onkeyup = function(e)
{
  if(e.getKeyCode() == QxKeyEvent.keys.space) {
    this.setChecked(this._iconObject ? !this._iconObject.isChecked() : !this.isChecked());
  };  
}; 



/*
  -------------------------------------------------------------------------------
    DISPOSER
  -------------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if(this.getDisposed()) {
    return;
  };

  this.removeEventListener("click", this._onclick);
  this.removeEventListener("keydown", this._onkeydown);
  this.removeEventListener("keyup", this._onkeyup);

  return QxAtom.prototype.dispose.call(this);
};
