function QxMenuSeparator()
{
  QxWidget.call(this);
  
  this._line = new QxWidget();
  this._line.setCssClassName("QxMenuSeparatorLine");
  this._line.setAnonymous(true);
  
  this.add(this._line);
  
  // needed to stop the event, and keep the menu showing
  this.addEventListener("mousedown", this._onmousedown);
};

QxMenuSeparator.extend(QxWidget, "QxMenuSeparator");

proto.hasMenu = function() {
  return false;
};

proto._modifyState = function() {
  return true;
};

proto._onmousedown = function(e) {
  e.stopPropagation();
};