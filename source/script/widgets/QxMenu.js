function QxMenu()
{
  QxPopup.call(this);

  // Configure dimensions
  this.setWidth("auto");
  this.setHeight(null);

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

QxMenu.addProperty({ name : "iconContentGap", type : Number, defaultValue : 4 });
QxMenu.addProperty({ name : "textShortcutGap", type : Number, defaultValue : 10 });
QxMenu.addProperty({ name : "contentArrowGap", type : Number, defaultValue : 6 });

QxMenu.addProperty({ name : "hoverItem", type : Object });
QxMenu.addProperty({ name : "openItem", type : Object });
QxMenu.addProperty({ name : "opener", type : Object });
QxMenu.addProperty({ name : "parentMenu", type : Object });

QxMenu.addProperty({ name : "fastReopen", type : Boolean, defaultValue : false });
QxMenu.addProperty({ name : "openInterval", type : Number, defaultValue : 250 });
QxMenu.addProperty({ name : "closeInterval", type : Number, defaultValue : 250 });

QxMenu.addProperty({ name : "subMenuHorizontalOffset", type : Number, defaultValue : -4 });
QxMenu.addProperty({ name : "subMenuVerticalOffset", type : Number, defaultValue : -2 });

QxMenu.addProperty({ name : "minIconColumnWidth", type : Number, defaultValue : 16 });
QxMenu.addProperty({ name : "showIconColumnWithoutAnyIcon", type : Boolean, defaultValue : true });




/*
------------------------------------------------------------------------------------
  MANAGER
------------------------------------------------------------------------------------
*/

proto._menuManager = new QxMenuManager();

proto._beforeShow = function(uniqModIds)
{
  QxAtom.prototype._beforeShow.call(this, uniqModIds);
  
  this._menuManager.add(this);
  this.bringToFront();  
};

proto._beforeHide = function(uniqModIds)
{
  QxAtom.prototype._beforeHide.call(this, uniqModIds);
  
  this.sendToBack();
  this._menuManager.remove(this);
};




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
    var vOldSub = propOldValue.getMenu();

    if (vOldSub)
    {
      vOldSub.setParentMenu(null);
      vOldSub.setOpener(null);

      vOldSub.setVisible(false);
    };
  };

  if (propValue)
  {
    var vSub = propValue.getMenu();

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
  
  if (propOldValue)
  {
    var vOpener = this.getOpener();
    if (vOpener) {
      vOpener.setState(null);
    };
  };

  return QxWidget.prototype._modifyVisible.call(this, propValue, propOldValue, propName, uniqModIds);
};




/*
------------------------------------------------------------------------------------
  AUTO-WIDTH IMPLEMENTATION
------------------------------------------------------------------------------------
*/

proto._setChildrenDependWidth = function(vModifiedWidget, vHint)
{
  // Store max values in the following variables
  var vMaxPaddingLeft = 0;
  var vMaxPaddingRight = 0;
  
  var vMaxIconWidth = 0;
  var vMaxTextWidth = 0;
  var vMaxShortcutWidth = 0;
  var vMaxArrowWidth = 0;

  var vMaxTextWidth = 0;
  var vMaxContentWidth = 0;
  
  // Cache gaps
  var vIconContentGap = this.getIconContentGap();
  var vContentArrowGap = this.getContentArrowGap();
  var vTextShortcutGap = this.getTextShortcutGap();  

  // Prepare children loop
  var ch = this.getChildren();
  var chl = ch.length;
  var chc;
  
  for (var i=0; i<chl; i++)
  {
    chc = ch[i];
    
    if (chc instanceof QxMenuButton)
    {
      vMaxPaddingLeft = Math.max(vMaxPaddingLeft, chc.getComputedPaddingLeft());
      vMaxPaddingRight = Math.max(vMaxPaddingRight, chc.getComputedPaddingRight());
  
      vMaxIconWidth = Math.max(vMaxIconWidth, chc.getNeededIconWidth());
      vMaxArrowWidth = Math.max(vMaxArrowWidth, chc.getNeededArrowWidth());    
      
      if (chc.getNeededShortcutWidth() > 0)
      {
        vMaxTextWidth = Math.max(vMaxTextWidth, chc.getNeededTextWidth());
        vMaxShortcutWidth = Math.max(vMaxShortcutWidth, chc.getNeededShortcutWidth());
      }
      else
      {
        vMaxContentWidth = Math.max(vMaxContentWidth, chc.getNeededTextWidth());
      };
    };
  };
  
  // Show icon column
  if (vMaxIconWidth > 0 || this.getShowIconColumnWithoutAnyIcon()) {
    vMaxIconWidth = Math.max(vMaxIconWidth, this.getMinIconColumnWidth());
  };
  

  // Calculate content max value
  vMaxContentWidth = Math.max(vMaxContentWidth, (vMaxTextWidth + vTextShortcutGap + vMaxShortcutWidth));

  // Cache positions for children layout  
  this._childIconPosition = vMaxPaddingLeft;
  
  var vUseIconWidth = vMaxIconWidth > 0 ? (vMaxIconWidth + vIconContentGap) : 0;
  
  this._childTextPosition = this._childIconPosition + vUseIconWidth;
  
  var vUseEndPos = this._childTextPosition + vMaxContentWidth;
  
  this._childShortcutPosition = vUseEndPos - vMaxShortcutWidth;
  this._childArrowPosition = vUseEndPos + vContentArrowGap;
  
  var vUseInnerWidth = vMaxPaddingLeft + vUseEndPos + (vMaxArrowWidth > 0 ? vContentArrowGap + vMaxArrowWidth : 0) + vMaxPaddingRight;

  // Apply new inner width
  this.setInnerWidth(vUseInnerWidth, null, true);
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
    if (t.hasMenu())
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
    if (t.hasMenu()) {
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
  if (t != this && t.hasMenu()) {
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
  if (vHover && vHover.hasMenu()) {
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




/*
------------------------------------------------------------------------------------
  DISPOSER
------------------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };
  
  if (this._openTimer) 
  {
    this._openTimer.dispose();
    this._openTimer = null;  
  };
  
  if (this._closeTimer) 
  {
    this._closeTimer.dispose();
    this._closeTimer = null;  
  };
  
  return QxPopup.prototype.dispose.call(this);  
};