function QxToolBarCheckBox(vText, vIcon, vChecked)
{
  QxToolBarButton.call(this, vText, vIcon);

  if (isValid(vChecked)) {
    this.setChecked(vChecked);
  };
};

QxToolBarCheckBox.extend(QxToolBarButton, "QxToolBarCheckBox");

QxToolBarCheckBox.addProperty({ name : "checked", type : Boolean, defaultValue : false });

proto._onmouseup = function(e)
{
  if(e.isNotLeftButton()) {
    return;
  };

  this.setChecked(!this.getChecked());
};

proto._onmouseover = function(e) {
  this.setState(this.getChecked() ? "pressed" : "hover");
};

proto._onmouseout = function(e) {
  this.setState(this.getChecked() ? "checked" : null);
};

proto._modifyChecked = function(propValue, propOldValue, propName, uniqModIds)
{
  switch(this.getState())
  {
    case null:
      this.setState(propValue ? "checked" : null, uniqModIds);
      break;

    case "checked":
      this.setState(propValue ? "pressed" : null, uniqModIds);
      break;

    case "pressed":
      if (!propValue) {
        this.setState("hover");
      };
      break;

    case "hover":
      if (propValue) {
        this.setState("pressed", uniqModIds);
      };
  };

  return true;
};
