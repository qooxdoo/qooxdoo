function QxButton(vText, vIcon)
{
  QxAtom.call(this, vText, vIcon);

  this.setTagName("DIV");
  this.setCanSelect(false);
  this.setTabIndex(1);
  this.setBorder(QxBorder.presets.outset);
};

QxButton.extend(QxAtom, "QxButton");
