function QxToolBarButton(vText, vIcon, vIconWidth, vIconHeight)
{
  QxAtom.call(this, vText, vIcon, vIconWidth, vIconHeight);
  
  this.setHeight(null);
  
  this.setTop(0);
  this.setBottom(0);
  
  this.addEventListener("mouseover", this._onmouseover);
  this.addEventListener("mouseout", this._onmouseout);
  this.addEventListener("mousedown", this._onmousedown);
  this.addEventListener("mouseup", this._onmouseup);
};

QxToolBarButton.extend(QxAtom, "QxToolBarButton");

proto._modifyEnabled = function(propValue, propOldValue, propName, uniqModIds)
{
  QxAtom.prototype._modifyEnabled.call(this, propValue, propOldValue, propName, uniqModIds);

  this.setState(null, uniqModIds);
  return true;
};

proto._onmouseover = function(e) {
  this.setState("hover");
};

proto._onmouseout = function(e) {
  this.setState(null);
};

proto._onmousedown = function(e)
{
  if(e.isNotLeftButton()) {
    return;
  };

  this.setState("pressed");
};

proto._onmouseup = function(e)
{
  if(e.isNotLeftButton()) {
    return;
  };

  this.setState("hover");
};