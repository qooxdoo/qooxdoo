function QxListItem(vText, vIcon, vValue)
{
  QxAtom.call(this, vText, vIcon);

  if (isValid(vValue)) {
    this.setValue(vValue);
  };
  
  this.setWidth(null);
  this.setLeft(0);
  this.setRight(0);

  this.setCanSelect(false);
};

QxListItem.extend(QxAtom, "QxListItem");

QxListItem.addProperty({ name : "value", type : String });

proto.matchesString = function(vText) {
  return vText != "" && this.getText().toLowerCase().indexOf(vText.toLowerCase()) == 0;
};

proto.matchesStringExact = function(vText) {
  return vText != "" && this.getText().toLowerCase() == String(vText).toLowerCase();
};