function QxButton(vText, vIcon)
{
  QxAtom.call(this, vText, vIcon);

  this.setTagName("DIV");
  this.setCanSelect(false);
  this.setTabIndex(1);
  this.setBorder(QxBorder.presets.outset);

  this.addEventListener("click", this._onclick);
};

QxButton.extend(QxAtom, "QxButton");

proto._onclick = function()
{
  if(this.getEnabled()) {
    this.dispatchEvent(new QxEvent("action"));
  };
};