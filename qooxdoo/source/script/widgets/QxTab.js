function QxTab(vText, vIcon, vChecked)
{
  QxAtom.call(this, vText, vIcon);

  if (isValid(vChecked)) {
    this.setChecked(vChecked);
  };
  
  this.setTabIndex(1);
  
  this.addEventListener("mousedown", this._onmousedown);  
  this.addEventListener("keyup", this._onkeyup);
};

QxTab.extend(QxAtom, "QxTab");




/*
------------------------------------------------------------------------------------
  PROPERTIES
------------------------------------------------------------------------------------
*/

QxTab.addProperty({ name : "page", type : Object });
QxTab.addProperty({ name : "group" });
QxTab.addProperty({ name : "name", type : String });
QxTab.addProperty({ name : "checked", type : Boolean });





/*
------------------------------------------------------------------------------------
  MODIFIER
------------------------------------------------------------------------------------
*/

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

proto._modifyParent = function(propValue, propOldValue, propName, uniqModIds)
{
  QxToolBarRadioButton.prototype._modifyParent.call(this, propValue, propOldValue, propName, uniqModIds);

  if (propOldValue) {
    propOldValue.getManager().remove(this);
  };

  if (propValue) {
    propValue.getManager().add(this);
  };

  return true;
};

proto._modifyPage = function(propValue, propOldValue, propName, uniqModIds)
{
  if (propOldValue) {
    propOldValue.setTab(null, uniqModIds);
  };

  if (propValue) {
    propValue.setTab(this, uniqModIds);
  };

  return true;
};

proto._modifyChecked = function(propValue, propOldValue, propName, uniqModIds)
{
  if (this.getGroup()) {
    this.getGroup().setSelected(this, uniqModIds);
  };
  
  var vPage = this.getPage();
  if (vPage) {
    vPage.setVisible(propValue);
  };

  this.setState(propValue ? "checked" : null, uniqModIds); 
  return true;
};

proto._visualizeFocus = function() {};
proto._visualizeBlur = function() {};




/*
------------------------------------------------------------------------------------
  EVENT HANDLER
------------------------------------------------------------------------------------
*/

proto._onkeyup = function(e)
{
  var vPrevious;

  switch(e.getKeyCode())
  {
    case QxKeyEvent.keys.left:
    case QxKeyEvent.keys.up:
      vPrevious = this.getParent().getAlignTabsToLeft();
      break;

    case QxKeyEvent.keys.right:
    case QxKeyEvent.keys.down:
      vPrevious = !this.getParent().getAlignTabsToLeft();
      break;

    default:
      return;
  };

  var vChild = vPrevious ? this.isFirstChild() ? this.getParent().getLastChild() : this.getPreviousSibling() : this.isLastChild() ? this.getParent().getFirstChild() : this.getNextSibling();
  
  vChild.setFocused(true);
  vChild.setChecked(true);
};

proto._onmousedown = function(e) 
{
  this.setFocused(true);
  this.setChecked(true);  
};