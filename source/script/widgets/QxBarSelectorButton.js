function QxBarSelectorButton(vText, vIcon, vChecked)
{
  QxTab.call(this, vText, vIcon, vChecked);

  this.setIconPosition("top");

};

QxBarSelectorButton.extend(QxTab, "QxBarSelectorButton");

