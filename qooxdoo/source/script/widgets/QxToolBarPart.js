function QxToolBarPart() 
{
  QxWidget.call(this);

  this.setTop(0);
  this.setBottom(0);
  //this.setHeight("auto");
  
  this._handle = new QxToolBarPartHandle;
  this.add(this._handle);
};

QxToolBarPart.extend(QxWidget, "QxToolBarPart");

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  QxWidget.prototype.dispose.call(this);

  if (this._handle) 
  {
    this._handle.dispose();
    this._handle = null;
  };

  return true;
};
