function QxTabPane()
{
  QxWidget.call(this);

  this.setState("bottom");

  this.setLeft(0);
  this.setRight(0);
  
  this.setBorder(QxBorder.presets.outset);
};

QxTabPane.extend(QxWidget, "QxTabPane");




/*
  -------------------------------------------------------------------------------
    MODIFIER
  -------------------------------------------------------------------------------
*/

proto._modifyElement = function(propValue, propOldValue, propName, uniqModIds) 
{
  QxWidget.prototype._modifyElement.call(this, propValue, propOldValue, propName, uniqModIds);  
  return this._applyState();
};

proto._modifyState = function(propValue, propOldValue, propName, uniqModIds) 
{
  QxWidget.prototype._modifyState.call(this, propValue, propOldValue, propName, uniqModIds);
  return this._applyState();
};





/*
  -------------------------------------------------------------------------------
    LAYOUTER
  -------------------------------------------------------------------------------
*/

proto._applyState = function()
{
  var vParent = this.getParent();
  
  if (!vParent || !this.isCreated() || !vParent.getBar().isCreated()) {
    return true;
  };
  
  var vBarHeight = vParent.getBar().getPixelOfHeight();

  switch(this.getState())
  {
    case "top":
      this.setBottom(vBarHeight - this.getComputedBorderBottom());
      this.setTop(0);
      break;      

    default:
      this.setTop(vBarHeight - this.getComputedBorderTop());
      this.setBottom(0);
  };
  
  return true;
};