function QxTextArea(sText)
{
  QxTextField.call(this, sText);

  this.setOverflow("auto");
  this.removeHtmlProperty("type");
  this.setHeight(50);
  this.setTagName("TEXTAREA");
  this.setCanSelect(true);
};

QxTextArea.extend(QxTextField, "QxTextArea");

QxTextArea.addProperty({ name : "wrap", type : Boolean });

proto._modifyWrap = function(propValue, propOldValue, propName, uniqModIds)
{
  return (new QxClient).isMshtml() ? this.setHtmlProperty("wrap", propValue ? "soft" : "off") : this.setStyleProperty("whiteSpace", propValue ? "normal" : "nowrap");
};
