function QxTabBar()
{
  QxToolBar.call(this);

  this.setLeft(0);
  this.setRight(0);

  this._updatePlacement();
  this._updateAlignment();

  this._manager = new QxRadioButtonManager();
  this._manager.addEventListener("changeSelected", this._updatePage);
};

QxTabBar.extend(QxToolBar, "QxTabBar");

QxTabBar.addProperty({ name : "placeOnTop", type : Boolean, defaultValue : true });
QxTabBar.addProperty({ name : "alignTabsToLeft", type : Boolean, defaultValue : true });

proto._updatePage = function(e)
{
  var oldTab = e.getOldValue();
  var newTab = e.getNewValue();

  if (oldTab && oldTab.getPage()) {
    oldTab.getPage().setVisible(false);
  };

  if (newTab && newTab.getPage()) {
    newTab.getPage().setVisible(true);
  };
};

proto.getManager = function() {
  return this._manager;
};

proto._modifyPlaceOnTop = function(propValue, propOldValue, propName, uniqModIds)
{
  this.getParent().setPlaceBarOnTop(propValue, uniqModIds);
  this._updatePlacement();

  return true;
};

proto._updatePlacement = function()
{
  if (this.getPlaceOnTop())
  {
    this.setBottom(null);
    this.setTop(0);
  }
  else
  {
    this.setTop(null);
    this.setBottom(0);
  };

  this._updateState();
};

proto._modifyAlignTabsToLeft = function(propValue, propOldValue, propName, uniqModIds)
{
  this._updateAlignment();
  return true;
};

proto._updateAlignment = function() {
  this._updateState();
};

proto._updateState = function() {
  this.setState((this.getPlaceOnTop() ? "top" : "bottom") + (this.getAlignTabsToLeft() ? "Left" : "Right"));
};

/*
proto._calculateChildrenDependHeight = function(vModifiedWidget, vHint) {
  return this._calculateChildrenDependHelper(vModifiedWidget, vHint, "_dependHeightCache", "top", "height", "bottom") + 3;
};
*/
