function QxMenuSeparator()
{
  QxWidget.call(this);
  
  this._line = new QxWidget();
  this._line.setCssClassName("QxMenuSeparatorLine");
  this._line.setAnonymous(true);
  
  this.add(this._line);
};

QxMenuSeparator.extend(QxWidget, "QxMenuSeparator");

proto.hasMenu = function() {
  return false;
};

proto._modifyState = function() {
  return true;
};