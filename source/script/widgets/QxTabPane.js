function QxTabPane()
{
  QxWidget.call(this);

  this.setLeft(0);
  this.setRight(0);

  this._updatePlacement();

  this.setBorder(QxBorder.presets.outset);
};

QxTabPane.extend(QxWidget, "QxTabPane");

QxTabPane.addProperty({ name : "placeOnTop", type : Boolean, defaultValue : false });

proto.borderSize = 2;

proto._modifyPlaceOnTop = function(propValue, propOldValue, propName, uniqModIds)
{
  this.getParent().setPlaceBarOnTop(!propValue, uniqModIds);
  this._updatePlacement();

  return true;
};

proto._updatePlacement = function()
{
  this.debug("UPDATE PLACEMENT");
  
  if (this.getPlaceOnTop())
  {
    this.setBottom(this._lastBarHeight);
    this.setTop(0);
    this.setState("top");
  }
  else
  {
    this.setTop(this._lastBarHeight);
    this.setBottom(0);
    this.setState("bottom");
  };
};

proto._lastBarHeight = null;

proto._onlayout = function()
{
  this._lastBarHeight = this.getParent().getBar().getPixelOfHeight() - this.borderSize;
  
  this.debug("BAR-HEIGHT: " + this._lastBarHeight);
  
  this._updatePlacement();
};