function QxInlineWidget()
{
  QxWidget.call(this);
  
  this.setHeight("auto");
  this.setWidth(null);
};

QxInlineWidget.extend(QxWidget, "QxInlineWidget");

QxInlineWidget.addProperty({ name : "inlineNodeId", type : String });

proto._modifyInlineNodeId = function(propValue, propOldValue, propName, uniqModIds)
{
  if (this.isCreated()) {
    throw new Error("You couldn't change this anymore. Widget is already created!");
  };
  
  return true;  
};

proto.renderX = function(hint)
{
  if (hint == "parent-dimensions" || hint == "parent-width") {
    this._renderChildrenX("parent-width");
  };
  
  return QxWidget.prototype.renderX.call(this, hint);
};

proto.renderY = function(hint)
{
  if (hint == "parent-dimensions" || hint == "parent-height") {
    this._renderChildrenY("parent-height");
  };
  
  return QxWidget.prototype.renderY.call(this, hint);
};

