function QxTabFrame()
{
  QxWidget.call(this);

  this._bar = new QxTabBar;
  this._pane = new QxTabPane;

  this.add(this._bar, this._pane);

  this._bar.addEventListener("resizeVertical", this._pane._applyState, this._pane);
};

QxTabFrame.extend(QxWidget, "QxTabFrame");


/*
  -------------------------------------------------------------------------------
    PROPERTIES
  -------------------------------------------------------------------------------
*/

QxTabFrame.addProperty({ name : "placeBarOnTop", type : Boolean, defaultValue : true });





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
    MODIFIER
  -------------------------------------------------------------------------------
*/

proto._modifyPlaceBarOnTop = function(propValue, propOldValue, propName, uniqModIds)
{
  this._bar.setPlaceOnTop(propValue, uniqModIds);
  this._pane.setState(propValue ? "bottom" : "top", uniqModIds);

  return true;
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
    this._bar.removeEventListener("resizeVertical", this._pane._applyState, this._pane);
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