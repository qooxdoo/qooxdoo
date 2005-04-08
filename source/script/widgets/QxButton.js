function QxButton(vText, vIcon)
{
  QxAtom.call(this, vText, vIcon);

  this.setCanSelect(false);
  this.setTabIndex(1);
  this.setBorder(QxBorder.presets.outset);
  
  this.addEventListener("mouseover", this._onmouseover, this);
  this.addEventListener("mouseout", this._onmouseout, this);
  this.addEventListener("mousedown", this._onmousedown, this);
  this.addEventListener("mouseup", this._onmouseup, this);  
};

QxButton.extend(QxAtom, "QxButton");



proto._onmouseover = function(e)
{
  if (e.getActiveTarget() != this) {
    return;
  };

  this.setState(this._pressed ? "pressed" : "hover");
  e.stopPropagation();  
};

proto._onmouseout = function(e)
{
  if (e.getActiveTarget() != this) {
    return;
  };

  this.setState(null);
  e.stopPropagation();  
};

proto._onmousedown = function(e)
{
  this._pressed = true;

  this.setCapture(true);  
  this.setState("pressed");
};

proto._onmouseup = function(e)
{
  delete this._pressed;
  
  this.setCapture(false);
  this.setState(null);
  
  e.stopPropagation();  
};





proto._modifyState = function(propValue, propOldValue, propName, uniqModIds)
{
  switch(propValue)
  {
    case "pressed":
      this.setBorder(QxBorder.presets.inset);
      break;
    
    case "hover":
      break;
    
    default:
      this.setBorder(QxBorder.presets.outset);
  };
  
  return QxAtom.prototype._modifyState.call(this, propValue, propOldValue, propName, uniqModIds);
};





proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };
  
  this.removeEventListener("mouseover", this._onmouseover, this);
  this.removeEventListener("mouseout", this._onmouseout, this);
  this.removeEventListener("mousedown", this._onmousedown, this);
  this.removeEventListener("mouseup", this._onmouseup, this);  
  
  return QxAtom.prototype.dispose.call(this);
};