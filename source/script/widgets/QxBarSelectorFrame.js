function QxBarSelectorFrame()
{
  QxWidget.call(this);

  this._bar = new QxBarSelectorBar;
  this._pane = new QxBarSelectorPane;

  this.add(this._pane, this._bar);
  
  this._bar.addEventListener("resizeVertical", this._pane._applyState, this._pane);
  this._bar.addEventListener("resizeHorizontal", this._pane._applyState, this._pane);
};

QxBarSelectorFrame.extend(QxWidget, "QxBarSelectorFrame");


/*
  -------------------------------------------------------------------------------
    PROPERTIES
  -------------------------------------------------------------------------------
*/

QxBarSelectorFrame.addProperty({ name : "placeBarOn", type : String, defaultValue : "top" });

QxBarSelectorFrame.paneMap = { top : "bottom", right : "left", bottom : "top", left : "right" };




/*
  -------------------------------------------------------------------------------
    MODIFIER
  -------------------------------------------------------------------------------
*/

proto._modifyPlaceBarOn = function(propValue, propOldValue, propName, uniqModIds)
{
  this._bar.setState(propValue, uniqModIds);
  this._pane.setState(QxBarSelectorFrame.paneMap[propValue], uniqModIds);  
  
  return true;
};



/*
  -------------------------------------------------------------------------------
    UTILITY
  -------------------------------------------------------------------------------
*/

proto.getPane = function() {
  return this._pane;
};

proto.getBar = function() {
  return this._bar;
};





/*
  -------------------------------------------------------------------------------
    DISPOSER
  -------------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return true;
  };
  
  if (this._bar)
  {
    this._bar.dispose();
    this._bar = null;
  };
  
  if (this._pane)
  {
    this._pane.dispose();
    this._pane = null;
  };
  
  return QxWidget.prototype.dispose.call(this);
};