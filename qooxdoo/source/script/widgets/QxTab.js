function QxTab(vText, vIcon, vChecked)
{
  QxAtom.call(this, vText, vIcon);

  this.addEventListener("keyup", this._onkeyup);
  
  if (isValid(vChecked)) {
    this.setChecked(vChecked);
  };
  
  this.addEventListener("mousedown", this._onmousedown);  
};

QxTab.extend(QxAtom, "QxTab");

QxTab.addProperty({ name : "page", type : Object });
QxTab.addProperty({ name : "group" });
QxTab.addProperty({ name : "name", type : String });
QxTab.addProperty({ name : "checked", type : Boolean });


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

  this.setState(propValue ? "checked" : null);

  return true;
};





proto._onkeyup = function(e)
{
  var toPrev;

  switch(e.getKeyCode())
  {
    case QxKeyEvent.keys.left:
    case QxKeyEvent.keys.up:
      toPrev = this.getParent().getAlignTabsToLeft();
      break;

    case QxKeyEvent.keys.right:
    case QxKeyEvent.keys.down:
      toPrev = !this.getParent().getAlignTabsToLeft();
      break;

    default:
      return;
  };

  switch(toPrev)
  {
    case true:
      return this.isFirstChild() ? this.getParent().getLastChild().setFocused(true) : this.getPreviousSibling().setFocused(true);

    case false:
      return this.isLastChild() ? this.getParent().getFirstChild().setFocused(true) : this.getNextSibling().setFocused(true);
  };
};






proto._onmousedown = function(e) 
{
  this.setChecked(true);  
};






