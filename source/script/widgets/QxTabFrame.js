function QxTabFrame(vBarOnBottom)
{
  QxWidget.call(this);

  this._bar = new QxTabBar;
  this._pane = new QxTabPane;

  this.add(this._bar, this._pane);

  this._bar.addEventListener("resizeVertical", this._pane._onlayout, this._pane);

  if (isValid(vBarOnBottom)) {
    this.setBarOnBottom(vBarOnBottom);
  };
};

QxTabFrame.extend(QxWidget, "QxTabFrame");

QxTabFrame.addProperty({ name : "placeBarOnTop", type : Boolean, defaultValue : true });

proto.getPane = function() {
  return this._pane;
};

proto.getBar = function() {
  return this._bar;
};

proto._modifyPlaceBarOnTop = function(propValue, propOldValue, propName, uniqModIds)
{
  this.getBar().setPlaceOnTop(propValue, uniqModIds);
  this.getPane().setPlaceOnTop(!propValue, uniqModIds);

  return true;
};

// Show first TAB
proto._beforeShow = function() {
  this._bar._manager.getSelected().getPage().setVisible(true);
};