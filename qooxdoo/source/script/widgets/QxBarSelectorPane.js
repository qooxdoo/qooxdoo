function QxBarSelectorPane()
{
  QxWidget.call(this);

  this.setState("bottom");
  this._updatePlacement();
};

QxBarSelectorPane.extend(QxWidget, "QxBarSelectorPane");

QxBarSelectorPane.addProperty({ name : "placeOn", type : String, defaultValue : "bottom" });

proto._modifyPlaceOn = function(propValue, propOldValue, propName, uniqModIds)
{
  this.setState(propValue, uniqModIds);

  this.getParent().setPlaceBarOn(QxBarSelectorFrame.paneMap[propValue], uniqModIds);
  this._updatePlacement();
  
  return true;
};

proto._updatePlacement = function()
{
  var bpa = this.getParent();
  var bel = bpa ? bpa.getBar().getElement() : null;
  
  switch(this.getPlaceOn())
  {
    case "top":
      this.setLeft(0);
      this.setRight(0);

      if (bel) {
        this.setBottom(bel.offsetHeight);
      };
      
      this.setTop(0);
      break;
      
    case "bottom":
      this.setLeft(0);
      this.setRight(0);

      if (bel) {
        this.setTop(bel.offsetHeight);
      };
      
      this.setBottom(0);
      break;
      
    case "left":
      this.setTop(0);
      this.setBottom(0);

      if (bel) {
        this.setRight(bel.offsetWidth);
      };
      
      this.setLeft(0);
      break;
      
    case "right":
      this.setTop(0);
      this.setBottom(0);

      if (bel) {
        this.setLeft(bel.offsetWidth);
      };
      
      this.setRight(0);
      break;
  };
};