function QxBarSelectorPane() 
{
  QxWidget.call(this);
  
  this.setState("bottom");
};

QxBarSelectorPane.extend(QxWidget, "QxBarSelectorPane");





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
  
  if (!vParent || !this.isCreated()) {
    return true;
  };
  
  var vBar = vParent.getBar();
  
  if (!vBar.isCreated()) {
    return true;
  };
  
  var vTop = 0, vRight = 0, vBottom = 0, vLeft = 0;

  switch(this.getState())
  {
    case "top":
      vBottom = vBar.getComputedBoxHeight() - this.getComputedBorderBottom();
      break;      
      
    case "right":
      vLeft = vBar.getComputedBoxWidth() - this.getComputedBorderLeft();
      break;
    
    case "left":
      vRight = vBar.getComputedBoxWidth() - this.getComputedBorderRight();
      break;      

    default:
      vTop = vBar.getComputedBoxHeight() - this.getComputedBorderTop();
  };
  
  this.setTop(vTop);
  this.setRight(vRight);
  this.setBottom(vBottom);
  this.setLeft(vLeft);
  
  return true;
};