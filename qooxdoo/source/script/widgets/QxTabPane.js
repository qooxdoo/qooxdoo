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

proto._modifyPlaceOnTop = function(propValue, propOldValue, propName, uniqModIds)
{
  this.getParent().setPlaceBarOnTop(!propValue, uniqModIds);
  this._updatePlacement();

  return true;
};

proto._updatePlacement = function()
{
  var vParent = this.getParent();
  if (!vParent) {
    return;
  };
  
  this.debug("UPDATE PLACEMENT");
  
  if (this.getPlaceOnTop())
  {
    this.setBottom(vParent.getBar().getPixelOfHeight() - 2);
    this.setTop(0);
    this.setState("top");
  }
  else
  {
    this.setTop(vParent.getBar().getPixelOfHeight() - 2);
    this.setBottom(0);
    this.setState("bottom");
  };
};

proto._onlayout = function() {
  this._updatePlacement();
};