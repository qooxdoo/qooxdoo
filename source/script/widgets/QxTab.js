function QxTab(vText, vIcon, vChecked)
{
  QxToolBarRadioButton.call(this, vText, vIcon, vChecked);

  this.setDisableUncheck(true);
  this.addEventListener("keyup", this._onkeyup);
};

QxTab.extend(QxToolBarRadioButton, "QxTab");

QxTab.addProperty({ name : "page", type : Object });

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
  QxToolBarRadioButton.prototype._modifyChecked.call(this, propValue, propOldValue, propName, uniqModIds);

  this.setTabIndex(propValue ? 1 : null, uniqModIds);

  if (this.isCreated()) {
    this.setFocused(propValue, uniqModIds);
  };

  return true;
};

proto._modifyFocused = function(propValue, propOldValue, propName, uniqModIds)
{
  QxToolBarRadioButton.prototype._modifyFocused.call(this, propValue, propOldValue, propName, uniqModIds);

  if (propValue) {
    this.setChecked(propValue, uniqModIds);
  };

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