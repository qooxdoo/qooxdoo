function QxRadioButtonManager(vName, vMembers)
{
  QxTarget.call(this);
  
  this._items = [];
  this._managerId = this.classname + (++QxRadioButtonManager._managerCount);
  
  if (isValid(vName)) {
    this.setName(vName);
  };
  
  if (isValid(vMembers)) {
    QxRadioButtonManager.prototype.add.apply(this, vMembers);
  };
};

QxRadioButtonManager._managerCount = 0;

QxRadioButtonManager.extend(QxManager, "QxRadioButtonManager");

QxRadioButtonManager.addProperty({ name : "selected", type : Object });
QxRadioButtonManager.addProperty({ name : "name", type : String });

proto.getItems = function() {
  return this._items;
};

proto.add = function()
{
  var a = arguments;
  var l = a.length;
  
  var lastOne = a[l-1];

  if (lastOne instanceof QxWidget)
  {
    var uniqModIds;  
  }
  else
  {
    var uniqModIds = lastOne;
    l--;
  };
  
  var oRadioButton;
  for (var i=0; i<l; i++)
  {
    oRadioButton = a[i];

    if(this._items.contains(oRadioButton)) {
      return;
    };
  
    // Push RadioButton to array
    this._items.push(oRadioButton);
    
    // Inform radio button about new group
    oRadioButton.setGroup(this, uniqModIds);
  
    // Need to update internal value?
    if(oRadioButton.getChecked()) {
      this.setSelected(oRadioButton, uniqModIds);
    };
  
    // Make enabled the same status as the the group has
    oRadioButton.setEnabled(this.getEnabled(), uniqModIds);
  
    // Apply Make name the same     
    oRadioButton.setName(this.getName(), uniqModIds);
  };
};

proto.remove = function(oRadioButton, uniqModIds)
{
  // Remove RadioButton from array
  this._items.remove(oRadioButton);
  
  // Inform radio button about new group
  oRadioButton.setGroup(null, uniqModIds);

  // if the radio was checked, set internal selection to null
  if(oRadioButton.getChecked()) {
    this.setSelected(null);
  };
};

proto._modifySelected = function(propValue, propOldValue, propName, uniqModIds)
{ 
  if (propOldValue && propOldValue.getChecked()) {
    propOldValue.setChecked(false, uniqModIds);
  };
  
  if (propValue && !propValue.getChecked()) {
    propValue.setChecked(true, uniqModIds);
  };
    
  return true;
};

proto._modifyEnabled = function(propValue, propOldValue, propName, uniqModIds)
{
  for (var i=0; i<this._items.length; i++) {
    this._items[i].setEnabled(propValue, uniqModIds);
  };
  
  return true;
};

proto._modifyName = function(propValue, propOldValue, propName, uniqModIds)
{
  for (var i=0; i<this._items.length; i++) {
    this._items[i].setName(propValue, uniqModIds);
  };
  
  return true;  
};

proto.selectNext = function(oRadioButton)
{
  var index = this._items.indexOf(oRadioButton);

  if(index == -1)
    return;

  var i = 0;
  var l = this._items.length;

  // Find next enabled item
  index = (index + 1) % l;
  while(i < l && ! this._items[index].getEnabled())
  {
    index = (index + 1) % l;
    i++;
  };
  
  this._selectByIndex(index);
};

proto.selectPrevious = function(oRadioButton)
{
  var index = this._items.indexOf(oRadioButton);

  if(index == -1)
    return;

  var i = 0;
  var l = this._items.length;
  
  // Find previous enabled item
  index = (index - 1 + l) % l;  
  while(i < l && ! this._items[index].getEnabled())
  {
    index = (index - 1 + l) % l;
    i++;
  };
  
  this._selectByIndex(index);
};

proto._selectByIndex = function(index)
{
  if(this._items[index].getEnabled())
  {
    this.setSelected(this._items[index]);
    this._items[index].setFocused(true);
  };
};

proto.dispose = function()
{
  if (this._disposed) {
    return;
  };
  
  if (this._items)
  {
    for (var i; i<this._items.length; i++)
    {
      this._items[i].dispose();
      delete this._items[i];
    };
  };
  
  delete this._items;
  delete this._managerId;  
  
  return QxTarget.prototype.dispose.call(this);
};