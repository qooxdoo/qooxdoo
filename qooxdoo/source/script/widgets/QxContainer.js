function QxContainer(vHtml)
{
  QxTerminator.call(this);

  if (isValid(vHtml)) {
    this.setHtml(vHtml);
  };
};

QxContainer.extend(QxTerminator, "QxContainer");

QxContainer.addProperty({ name : "html", type : String });

proto._modifyElement = function(propValue, propOldValue, propName, uniqModIds)
{
  QxWidget.prototype._modifyElement.call(this, propValue, propOldValue, propName, uniqModIds);

  if (propValue)
  {
    return this._applyHtml();
  }
  else if (propOldValue)
  {
    propOldValue.innerHTML = "";
  };

  return true;
};

proto._modifyHtml = function(propValue, propOldValue, propName, uniqModIds) {
  return this._applyHtml();
};

proto._applyHtml = function()
{
  if (!this.isCreated()) {
    return true;
  };

  var vHtml = this.getHtml();

  if (isValid(vHtml))
  {
    this.getElement().innerHTML = vHtml;

    this._invalidatePreferred("load");
    this._outerChanged("load");
  }
  else
  {
    this.getElement().innerHTML = "";

    this._invalidatePreferred("unload");
    this._outerChanged("unload");
  };

  return true;
};
