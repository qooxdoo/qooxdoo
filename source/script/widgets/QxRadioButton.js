function QxRadioButton(vText, vValue, vName, vChecked, vGroup)
{
  QxCheckBox.call(this, vText, vValue, vName, vChecked);
  
  if (isValid(vGroup)) {
    this.setGroup(vGroup);
  };
};

QxRadioButton.extend(QxCheckBox, "QxRadioButton");

QxRadioButton.addProperty({ name : "group" });



/*
  -------------------------------------------------------------------------------
    ICON HANDLING
  -------------------------------------------------------------------------------
*/

proto._pureCreateFillIcon = function()
{
  var i = this._iconObject = new QxInputCheckIcon();
  
  i.setType("radio");
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
    this._iconObject.setChecked(propValue, uniqModIds);
  };

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

proto._modifyName = function(propValue, propOldValue, propName, uniqModIds)
{
  if (this.isCreated() && this._iconObject) {
    this._iconObject.setName(propValue, uniqModIds);
  };

  if (this.getGroup()) {
    this.getGroup().setName(propValue, uniqModIds);
  };

  return true;
};

proto._modifyValue = function(propValue, propOldValue, propName, uniqModIds)
{
  if (this.isCreated() && this._iconObject) {
    this._iconObject.setValue(propValue, uniqModIds);
  };

  return true;
};




/*
  -------------------------------------------------------------------------------
    EVENT-HANDLER
  -------------------------------------------------------------------------------
*/

proto._onkeydown = function(e)
{
  switch(e.getKeyCode())
  {
    case QxKeyEvent.keys.enter:
      if (!e.getAltKey()) {
        this.setChecked(this._iconObject ? !this._iconObject.isChecked() : !this.isChecked());
      };
      
      break;
    
    case QxKeyEvent.keys.left:
    case QxKeyEvent.keys.up:
      return this.getGroup() ? this.getGroup().selectPrevious(this) : true;

    case QxKeyEvent.keys.right:
    case QxKeyEvent.keys.down:
      return this.getGroup() ? this.getGroup().selectNext(this) : true;
  };
};

proto._onclick = function(e) {
  this.setChecked(true);
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

  return QxCheckBox.prototype.dispose.call(this);
};

