function QxMenu()
{
  QxPopup.call(this);

  // Disable popup auto hide
  this.setAutoHide(false);

  // Configure dimensions
  this.setWidth("auto");
  this.setHeight(null);

  // Configure style
  this.setBorder(QxBorder.presets.outset);

  // Add timers
  this._openTimer = new QxTimer(this.getOpenInterval());
  this._openTimer.addEventListener("timer", this._onopentimer, this);

  this._closeTimer = new QxTimer(this.getCloseInterval());
  this._closeTimer.addEventListener("timer", this._onclosetimer, this);

  // Add event listeners
  this.addEventListener("mouseover", this._onmouseover);
  this.addEventListener("mouseout", this._onmouseout);
};

QxMenu.extend(QxPopup, "QxMenu");





/*
------------------------------------------------------------------------------------
  PROPERTIES
------------------------------------------------------------------------------------
*/

QxMenu.addProperty({ name : "iconTextGap", type : Number, defaultValue : 6 });
QxMenu.addProperty({ name : "textHintGap", type : Number, defaultValue : 6 });
QxMenu.addProperty({ name : "hintArrowGap", type : Number, defaultValue : 6 });

QxMenu.addProperty({ name : "hoverItem", type : Object });
QxMenu.addProperty({ name : "openItem", type : Object });
QxMenu.addProperty({ name : "opener", type : Object });
QxMenu.addProperty({ name : "parentMenu", type : Object });

QxMenu.addProperty({ name : "fastReopen", type : Boolean, defaultValue : false });
QxMenu.addProperty({ name : "openInterval", type : Number, defaultValue : 250 });
QxMenu.addProperty({ name : "closeInterval", type : Number, defaultValue : 250 });

QxMenu.addProperty({ name : "subMenuHorizontalOffset", type : Number, defaultValue : -6 });
QxMenu.addProperty({ name : "subMenuVerticalOffset", type : Number, defaultValue : -2 });






/*
------------------------------------------------------------------------------------
  MODIFIER
------------------------------------------------------------------------------------
*/

proto._modifyHoverItem = function(propValue, propOldValue, propName, uniqModIds)
{
  if (propOldValue)
  {
    propOldValue.setState(null);
  };

  if (propValue)
  {
    propValue.setState("hover");
  };


  return true;
};

proto._modifyOpenItem = function(propValue, propOldValue, propName, uniqModIds)
{
  if (propOldValue)
  {
    var vOldSub = propOldValue.getSubMenu();

    if (vOldSub)
    {
      vOldSub.setParentMenu(null);
      vOldSub.setOpener(null);

      vOldSub.setVisible(false);
    };
  };

  if (propValue)
  {
    var vSub = propValue.getSubMenu();

    if (vSub)
    {
      vSub.setOpener(propValue);
      vSub.setParentMenu(this);

      vSub.setTop(propValue.getComputedPageBoxTop() + this.getSubMenuVerticalOffset());
      vSub.setLeft(this.getComputedPageBoxLeft() + this.getComputedBoxWidth() + this.getSubMenuHorizontalOffset());

      vSub.setVisible(true);
    };
  };

  return true;
};

proto._modifyVisible = function(propValue, propOldValue, propName, uniqModIds)
{
  this.setHoverItem(null);
  this.setOpenItem(null);

  return QxWidget.prototype._modifyVisible.call(this, propValue, propOldValue, propName, uniqModIds);
};




/*
------------------------------------------------------------------------------------
  AUTO-WIDTH IMPLEMENTATION
------------------------------------------------------------------------------------
*/

proto._setChildrenDependWidth = function(vModifiedWidget, vHint)
{
  var ch = this.getChildren();
  var chl = ch.length;
  var chc;

  // this.debug("Render depend width: " + vModifiedWidget + ", " + vHint);

  var vMaxPaddingLeft = 0;
  var vMaxPaddingRight = 0;

  var vMaxIcon = 0;
  var vMaxText = 0;
  var vMaxHint = 0;
  var vMaxArrow = 0;

  for (var i=0; i<chl; i++)
  {
    chc = ch[i];

    // this.debug("Read from: " + chc + " icon=" + chc._calculatedIconWidth + ", text=" + chc._calculatedTextWidth + ", hint=" + chc._calculatedHintWidth + ", arrow=" + chc._calculatedArrowWidth);

    vMaxPaddingLeft = Math.max(vMaxPaddingLeft, chc.getComputedPaddingLeft());
    vMaxPaddingRight = Math.max(vMaxPaddingRight, chc.getComputedPaddingRight());

    vMaxIcon = Math.max(vMaxIcon, chc._calculatedIconWidth);
    vMaxText = Math.max(vMaxText, chc._calculatedTextWidth);
    vMaxHint = Math.max(vMaxHint, chc._calculatedHintWidth);
    vMaxArrow = Math.max(vMaxArrow, chc._calculatedArrowWidth);
  };

  // this.debug("Max-Values: icon=" + vMaxIcon + ", text=" + vMaxText + ", hint=" + vMaxHint + ", arrow=" + vMaxArrow);

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


  this.setInnerWidth(newInnerWidth+4, null, true);





};








/*
------------------------------------------------------------------------------------
  EVENT-HANDLING
------------------------------------------------------------------------------------
*/

proto._onmouseover = function(e)
{
  /* ------------------------------
    HANDLE PARENT MENU
  ------------------------------ */

  // look if we have a parent menu
  // if so we need to stop the close event started there
  var vParent = this.getParentMenu();

  if (vParent)
  {
    // stop the close event
    vParent._closeTimer.stop();

    // look if we have a opener, too (normally this should be)
    var vOpener = this.getOpener();

    // then setup it to look hovered
    if (vOpener) {
      vParent.setHoverItem(vOpener);
    };
  };



  /* ------------------------------
    HANDLING FOR HOVERING MYSELF
  ------------------------------ */

  var t = e.getManagerTarget();

  if (t == this)
  {
    this._openTimer.stop();
    this._closeTimer.start();

    this.setHoverItem(null);

    return;
  };





  /* ------------------------------
    HANDLING FOR HOVERING ITEMS
  ------------------------------ */

  var vOpen = this.getOpenItem();

  // if we have a open item
  if (vOpen)
  {
    this.setHoverItem(t);
    this._openTimer.stop();

    // if the new one has also a sub menu
    if (t.hasSubMenu())
    {
      // check if we should use fast reopen (this will open the menu instantly)
      if (this.getFastReopen())
      {
        this.setOpenItem(t);
        this._closeTimer.stop();
      }

      // otherwise we use the default timer interval
      else
      {
        this._openTimer.start();
      };
    }

    // otherwise start the close timer for the old menu
    else
    {
      this._closeTimer.start();
    };
  }

  // otherwise handle the mouseover and restart the timer
  else
  {
    this.setHoverItem(t);

    // stop timer for the last open request
    this._openTimer.stop();

    // and restart it if the new one has a menu, too
    if (t.hasSubMenu()) {
      this._openTimer.start();
    };
  };
};

proto._onmouseout = function(e)
{
  // stop the open timer (for any previous open requests)
  this._openTimer.stop();

  // start the close timer to hide a menu if needed
  var t = e.getManagerTarget();
  if (t != this && t.hasSubMenu()) {
    this._closeTimer.start();
  };

  // reset the current hover item
  this.setHoverItem(null);
};

proto._onopentimer = function(e)
{
  // stop the open timer (we need only the first interval)
  this._openTimer.stop();

  // if we have a item which is currently hovered, open it
  var vHover = this.getHoverItem();
  if (vHover && vHover.hasSubMenu()) {
    this.setOpenItem(vHover);
  };
};

proto._onclosetimer = function(e)
{
  // stop the close timer (we need only the first interval)
  this._closeTimer.stop();

  // reset the current opened item
  this.setOpenItem(null);
};
