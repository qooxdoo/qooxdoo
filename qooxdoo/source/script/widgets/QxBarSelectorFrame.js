function QxBarSelectorFrame()
{
  QxWidget.call(this);

  this._bar = new QxBarSelectorBar;
  this._pane = new QxBarSelectorPane;

  this.add(this._bar, this._pane);

  this._bar.addEventListener("resizeHorizontal", this._pane._updatePlacement, this._pane);
  this._bar.addEventListener("resizeVertical", this._pane._updatePlacement, this._pane);
};

QxBarSelectorFrame.extend(QxWidget, "QxBarSelectorFrame");

QxBarSelectorFrame.addProperty({ name : "placeBarOn", type : String, defaultValue : "top" });

proto.getPane = function() {
  return this._pane;
};

proto.getBar = function() {
  return this._bar;
};

QxBarSelectorFrame.paneMap = { top : "bottom", right : "left", bottom : "top", left : "right" };

proto._modifyPlaceBarOn = function(propValue, propOldValue, propName, uniqModIds)
{
  this.getPane().setPlaceOn(QxBarSelectorFrame.paneMap[propValue], uniqModIds);
  this.getBar().setPlaceOn(propValue, uniqModIds);

  return true;
};

