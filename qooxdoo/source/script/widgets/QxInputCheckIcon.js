function QxInputCheckIcon()
{
  QxWidget.call(this);

  this.setTagName("INPUT");
  this.setCanSelect(false);
  this.setTabIndex(-1);
};

QxInputCheckIcon.extend(QxWidget, "QxInputCheckIcon");

QxInputCheckIcon.addProperty({ name : "name", type : String, impl : "apply" });
QxInputCheckIcon.addProperty({ name : "value", impl : "apply" });
QxInputCheckIcon.addProperty({ name : "type", impl : "apply" });
QxInputCheckIcon.addProperty({ name : "checked", type : Boolean, defaultValue : false, impl : "apply", getAlias : "isChecked" });

proto._modifyApply = function(propValue, propOldValue, propName, uniqModIds) {
  return this.setHtmlProperty(propName, propValue);
};

proto.isLoaded = proto.getLoaded = function() {
  return true;
};

proto.getPreferredWidth = function() {
  return 13;
};

proto.getPreferredHeight = function() {
  return 13;
};
