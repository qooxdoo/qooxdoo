function QxMenu()
{
  QxPopup.call(this);

  this.setWidth("auto");
  this.setHeight(null);
  this.setAutoHide(false);

  this.setBorder(QxBorder.presets.outset);

  this.addEventListener("mouseover", this._onmouseover);
  this.addEventListener("mouseout", this._onmouseout);
};

QxMenu.extend(QxPopup, "QxMenu");

QxMenu.addProperty({ name : "iconTextGap", type : Number, defaultValue : 6 });
QxMenu.addProperty({ name : "textHintGap", type : Number, defaultValue : 6 });
QxMenu.addProperty({ name : "hintArrowGap", type : Number, defaultValue : 6 });

proto._opener = null;

proto.renderChildrenDependWidth = function(vModifiedWidget, vHint)
{
  var ch = this.getChildren();
  var chl = ch.length;
  var chc;

  this.debug("Render depend width: " + vModifiedWidget + ", " + vHint);

  var vMaxPaddingLeft = 0;
  var vMaxPaddingRight = 0;

  var vMaxIcon = 0;
  var vMaxText = 0;
  var vMaxHint = 0;
  var vMaxArrow = 0;

  for (var i=0; i<chl; i++)
  {
    chc = ch[i];

    this.debug("Read from: " + chc + " icon=" + chc._calculatedIconWidth + ", text=" + chc._calculatedTextWidth + ", hint=" + chc._calculatedHintWidth + ", arrow=" + chc._calculatedArrowWidth);

    vMaxPaddingLeft = Math.max(vMaxPaddingLeft, chc.getComputedPaddingLeft());
    vMaxPaddingRight = Math.max(vMaxPaddingRight, chc.getComputedPaddingRight());

    vMaxIcon = Math.max(vMaxIcon, chc._calculatedIconWidth);
    vMaxText = Math.max(vMaxText, chc._calculatedTextWidth);
    vMaxHint = Math.max(vMaxHint, chc._calculatedHintWidth);
    vMaxArrow = Math.max(vMaxArrow, chc._calculatedArrowWidth);
  };

  this.debug("Max-Values: icon=" + vMaxIcon + ", text=" + vMaxText + ", hint=" + vMaxHint + ", arrow=" + vMaxArrow);

  this._maxIcon = vMaxIcon;
  this._maxText = vMaxText;
  this._maxHint = vMaxHint;
  this._maxArrow = vMaxArrow;



  var newInnerWidth = vMaxPaddingLeft + vMaxPaddingRight;

  if (vMaxIcon > 0)
  {
    newInnerWidth += vMaxIcon;
  };

  if (vMaxText > 0)
  {
    if (vMaxIcon > 0)
    {
      newInnerWidth += this.getIconTextGap();
    };

    newInnerWidth += vMaxText;
  };

  if (vMaxHint > 0)
  {
    if (vMaxText > 0)
    {
      newInnerWidth += this.getTextHintGap();
    }

    newInnerWidth += vMaxHint;
  };

  if (vMaxArrow > 0)
  {
    if (vMaxHint > 0)
    {
      newInnerWidth += this.getHintArrowGap();
    };

    newInnerWidth += vMaxArrow;
  };


  this.setInnerWidth(newInnerWidth, null, true);





};

proto._renderChildrenX = function(childrenHint, applyHint) {
  return QxWidget.prototype._renderChildrenX.call(this, childrenHint, applyHint);
};




proto._onmouseover = function(e)
{
  var t = e.getTarget();

  if (this._opener) {
    this._opener._stopOutTimer();
    this._opener.setState("open");
  };

  if (t != this && t._onmouseover) {
    t._onmouseover(e);
  };


};

proto._onmouseout = function(e)
{
  var t = e.getTarget();

  if (t != this && t._onmouseout) {
    t._onmouseout(e);
  };

};