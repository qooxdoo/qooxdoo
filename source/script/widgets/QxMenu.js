/* ************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (aecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#package(menu)
#post(QxDomDimension)
#post(QxDomLocation)

************************************************************************ */

function QxMenu()
{
  QxPopup.call(this);


  // ************************************************************************
  //   LAYOUT
  // ************************************************************************

  var l = this._layout = new QxMenuLayout;
  this.add(l);


  // ************************************************************************
  //   TIMER
  // ************************************************************************
  this._openTimer = new QxTimer(this.getOpenInterval());
  this._openTimer.addEventListener(QxConst.EVENT_TYPE_INTERVAL, this._onopentimer, this);

  this._closeTimer = new QxTimer(this.getCloseInterval());
  this._closeTimer.addEventListener(QxConst.EVENT_TYPE_INTERVAL, this._onclosetimer, this);


  // ************************************************************************
  //   EVENTS
  // ************************************************************************

  this.addEventListener(QxConst.EVENT_TYPE_MOUSEOVER, this._onmouseover);
  this.addEventListener(QxConst.EVENT_TYPE_MOUSEMOVE, this._onmouseover);
  this.addEventListener(QxConst.EVENT_TYPE_MOUSEOUT, this._onmouseout);

  this.addEventListener(QxConst.EVENT_TYPE_KEYDOWN, this._onkeydown);


  // ************************************************************************
  //   REMAPPING
  // ************************************************************************

  this.remapChildrenHandlingTo(this._layout);
};

QxMenu.extend(QxPopup, "QxMenu");

proto._remappingChildTable = [ "add", "remove", "addAt", "addAtBegin", "addAtEnd", "removeAt", "addBefore", "addAfter", "removeAll", "getFirstChild", "getFirstActiveChild", "getLastChild", "getLastActiveChild" ];



/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

QxMenu.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "menu" });

QxMenu.addProperty({ name : "iconContentGap", type : QxConst.TYPEOF_NUMBER, defaultValue : 4 });
QxMenu.addProperty({ name : "labelShortcutGap", type : QxConst.TYPEOF_NUMBER, defaultValue : 10 });
QxMenu.addProperty({ name : "contentArrowGap", type : QxConst.TYPEOF_NUMBER, defaultValue : 8 });
QxMenu.addProperty({ name : "contentNonIconPadding", type : QxConst.TYPEOF_NUMBER, defaultValue : 20 });
QxMenu.addProperty({ name : "contentNonArrowPadding", type : QxConst.TYPEOF_NUMBER, defaultValue : 8 });

QxMenu.addProperty({ name : "hoverItem", type : QxConst.TYPEOF_OBJECT });
QxMenu.addProperty({ name : "openItem", type : QxConst.TYPEOF_OBJECT });
QxMenu.addProperty({ name : "opener", type : QxConst.TYPEOF_OBJECT });
QxMenu.addProperty({ name : "parentMenu", type : QxConst.TYPEOF_OBJECT });

QxMenu.addProperty({ name : "fastReopen", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });
QxMenu.addProperty({ name : "openInterval", type : QxConst.TYPEOF_NUMBER, defaultValue : 250 });
QxMenu.addProperty({ name : "closeInterval", type : QxConst.TYPEOF_NUMBER, defaultValue : 250 });

QxMenu.addProperty({ name : "subMenuHorizontalOffset", type : QxConst.TYPEOF_NUMBER, defaultValue : -3 });
QxMenu.addProperty({ name : "subMenuVerticalOffset", type : QxConst.TYPEOF_NUMBER, defaultValue : -2 });

QxMenu.addProperty({ name : "indentShortcuts", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true });






/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

proto.getLayout = function() {
  return this._layout;
};







/*
---------------------------------------------------------------------------
  APPEAR/DISAPPEAR
---------------------------------------------------------------------------
*/

proto._beforeAppear = function()
{
  QxCanvasLayout.prototype._beforeAppear.call(this);

  // register to menu manager as active widget
  QxMenuManager.add(this);

  // zIndex handling
  this.bringToFront();

  //setup as global active widget
  this._makeActive();
};

proto._beforeDisappear = function()
{
  QxCanvasLayout.prototype._beforeDisappear.call(this);

  // deregister as opened from QxMenuManager
  QxMenuManager.remove(this);

  // reset global active widget
  this._makeInactive();

  // reset properties on close
  this.setHoverItem(null);
  this.setOpenItem(null);

  // be sure that the opener button gets the correct state
  var vOpener = this.getOpener();
  if (vOpener) {
    vOpener.removeState(QxConst.STATE_PRESSED);
  };
};






/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyHoverItem = function(propValue, propOldValue, propData)
{
  if (propOldValue) {
    propOldValue.removeState(QxConst.STATE_OVER);
  };

  if (propValue) {
    propValue.addState(QxConst.STATE_OVER);
  };

  return true;
};

proto._modifyOpenItem = function(propValue, propOldValue, propData)
{
  var vMakeActive = false;

  if (propOldValue)
  {
    var vOldSub = propOldValue.getMenu();

    if (vOldSub)
    {
      vOldSub.setParentMenu(null);
      vOldSub.setOpener(null);
      vOldSub.hide();
    };
  };

  if (propValue)
  {
    var vSub = propValue.getMenu();

    if (vSub)
    {
      vSub.setOpener(propValue);
      vSub.setParentMenu(this);

      var pl = propValue.getElement();
      var el = this.getElement();

      vSub.setTop(QxDom.getComputedPageBoxTop(pl) + this.getSubMenuVerticalOffset());
      vSub.setLeft(QxDom.getComputedPageBoxLeft(el) + QxDom.getComputedBoxWidth(el) + this.getSubMenuHorizontalOffset());

      vSub.show();

      QxWidget.flushGlobalQueues();
    };
  };

  return true;
};








/*
---------------------------------------------------------------------------
  LOCATIONS AND DIMENSIONS OF CHILDRENS CHILDREN:
  CREATE VARIABLES
---------------------------------------------------------------------------
*/

QxMenu.addCachedProperty({ name : "maxIconWidth" });
QxMenu.addCachedProperty({ name : "maxLabelWidth" });
QxMenu.addCachedProperty({ name : "maxLabelWidthIncShortcut" });
QxMenu.addCachedProperty({ name : "maxShortcutWidth" });
QxMenu.addCachedProperty({ name : "maxArrowWidth" });
QxMenu.addCachedProperty({ name : "maxContentWidth" });

QxMenu.addCachedProperty({ name : "iconPosition", defaultValue : 0 });
QxMenu.addCachedProperty({ name : "labelPosition" });
QxMenu.addCachedProperty({ name : "shortcutPosition" });
QxMenu.addCachedProperty({ name : "arrowPosition" });

QxMenu.addCachedProperty({ name : "menuButtonNeededWidth" });






/*
---------------------------------------------------------------------------
  LOCATIONS AND DIMENSIONS OF CHILDRENS CHILDREN:
  MAX WIDTH COMPUTERS
---------------------------------------------------------------------------
*/

proto._computeMaxIconWidth = function()
{
  var ch=this.getLayout().getChildren(), chl=ch.length, chc, m=0;

  for (var i=0; i<chl; i++)
  {
    chc = ch[i];

    if (chc.hasIcon()) {
      m = Math.max(m, chc.getIconObject().getPreferredBoxWidth());
    };
  };

  return m;
};

proto._computeMaxLabelWidth = function()
{
  var ch=this.getLayout().getChildren(), chl=ch.length, chc, m=0;

  for (var i=0; i<chl; i++)
  {
    chc = ch[i];

    if (chc.hasLabel()) {
      m = Math.max(m, chc.getLabelObject().getPreferredBoxWidth());
    };
  };

  return m;
};

proto._computeMaxLabelWidthIncShortcut = function()
{
  var ch=this.getLayout().getChildren(), chl=ch.length, chc, m=0;

  for (var i=0; i<chl; i++)
  {
    chc = ch[i];

    if (chc.hasLabel() && chc.hasShortcut()) {
      m = Math.max(m, chc.getLabelObject().getPreferredBoxWidth());
    };
  };

  return m;
};

proto._computeMaxShortcutWidth = function()
{
  var ch=this.getLayout().getChildren(), chl=ch.length, chc, m=0;

  for (var i=0; i<chl; i++)
  {
    chc = ch[i];

    if (chc.hasShortcut()) {
      m = Math.max(m, chc.getShortcutObject().getPreferredBoxWidth());
    };
  };

  return m;
};

proto._computeMaxArrowWidth = function()
{
  var ch=this.getLayout().getChildren(), chl=ch.length, chc, m=0;

  for (var i=0; i<chl; i++)
  {
    chc = ch[i];

    if (chc.hasMenu()) {
      m = Math.max(m, chc.getArrowObject().getPreferredBoxWidth());
    };
  };

  return m;
};

proto._computeMaxContentWidth = function()
{
  var vSum;

  var lw = this.getMaxLabelWidth();
  var sw = this.getMaxShortcutWidth();

  if (this.getIndentShortcuts())
  {
    var vTemp = sw+this.getMaxLabelWidthIncShortcut();

    if (sw > 0) {
      vTemp += this.getLabelShortcutGap();
    };

    vSum = Math.max(lw, vTemp);
  }
  else
  {
    vSum = lw + sw;

    if (lw > 0 && sw > 0) {
      vSum += this.getLabelShortcutGap();
    };
  };

  return vSum;
};







/*
---------------------------------------------------------------------------
  LOCATIONS AND DIMENSIONS OF CHILDRENS CHILDREN:
  POSITION COMPUTERS
---------------------------------------------------------------------------
*/

proto._computeIconPosition = function() {
  return 0;
};

proto._computeLabelPosition = function()
{
  var v = this.getMaxIconWidth();
  return v > 0 ? v + this.getIconContentGap() : this.getContentNonIconPadding();
};

proto._computeShortcutPosition = function() {
  return this.getLabelPosition() + this.getMaxContentWidth() - this.getMaxShortcutWidth();
};

proto._computeArrowPosition = function()
{
  var v = this.getMaxContentWidth();
  return this.getLabelPosition() + (v > 0 ? v + this.getContentArrowGap() : v);
};







/*
---------------------------------------------------------------------------
  LOCATIONS AND DIMENSIONS OF CHILDRENS CHILDREN:
  INVALIDATION OF CACHE
---------------------------------------------------------------------------
*/

proto._invalidateMaxIconWidth = function()
{
  this._cachedMaxIconWidth = null;

  this._invalidateLabelPosition();
  this._invalidateMenuButtonNeededWidth();
};

proto._invalidateMaxLabelWidth = function()
{
  this._cachedMaxLabelWidth = null;

  this._invalidateShortcutPosition();
  this._invalidateMaxLabelWidthIncShortcut();
  this._invalidateMaxContentWidth();
  this._invalidateMenuButtonNeededWidth();
};

proto._invalidateMaxShortcutWidth = function()
{
  this._cachedMaxShortcutWidth = null;

  this._invalidateArrowPosition();
  this._invalidateMaxContentWidth();
  this._invalidateMenuButtonNeededWidth();
};

proto._invalidateMaxLabelWidth = function()
{
  this._cachedMaxArrowWidth = null;
  this._invalidateMenuButtonNeededWidth();
};

proto._invalidateLabelPosition = function()
{
  this._cachedLabelPosition = null;
  this._invalidateShortcutPosition();
};

proto._invalidateShortcutPosition = function()
{
  this._cachedShortcutPosition = null;
  this._invalidateArrowPosition();
};






/*
---------------------------------------------------------------------------
  LOCATIONS AND DIMENSIONS OF CHILDRENS CHILDREN:
  NEEDED WIDTH COMPUTERS
---------------------------------------------------------------------------
*/

proto._computeMenuButtonNeededWidth = function()
{
  var vSum = 0;

  var vMaxIcon = this.getMaxIconWidth();
  var vMaxContent = this.getMaxContentWidth();
  var vMaxArrow = this.getMaxArrowWidth();

  if (vMaxIcon > 0)
  {
    vSum += vMaxIcon;
  }
  else
  {
    vSum += this.getContentNonIconPadding();
  };

  if (vMaxContent > 0)
  {
    if (vMaxIcon > 0) {
      vSum += this.getIconContentGap();
    };

    vSum += vMaxContent;
  };

  if (vMaxArrow > 0)
  {
    if (vMaxIcon > 0 || vMaxContent > 0) {
      vSum += this.getContentArrowGap();
    };

    vSum += vMaxArrow;
  }
  else
  {
    vSum += this.getContentNonArrowPadding();
  };

  return vSum;
};








/*
---------------------------------------------------------------------------
  EVENT-HANDLING
---------------------------------------------------------------------------
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

  var t = e.getTarget();

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
  var t = e.getTarget();
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

/*!
  Wraps key events to target functions
*/
proto._onkeydown = function(e)
{
  switch(e.getKeyCode())
  {
    case QxKeyEvent.keys.up:
      this._onkeydown_up(e);
      break;

    case QxKeyEvent.keys.down:
      this._onkeydown_down(e);
      break;

    case QxKeyEvent.keys.left:
      this._onkeydown_left(e);
      break;

    case QxKeyEvent.keys.right:
      this._onkeydown_right(e);
      break;

    case QxKeyEvent.keys.enter:
      this._onkeydown_enter(e);
      break;

    default:
      return;
  };

  // Stop all matching events
  e.preventDefault();
};

proto._onkeydown_up = function(e)
{
  var vHover = this.getHoverItem();
  var vPrev = vHover ? vHover.isFirstChild() ? this.getLastActiveChild() : vHover.getPreviousActiveSibling([QxMenuSeparator]) : this.getLastActiveChild();

  this.setHoverItem(vPrev);
};

proto._onkeydown_down = function(e)
{
  var vHover = this.getHoverItem();
  var vNext = vHover ? vHover.isLastChild() ? this.getFirstActiveChild() : vHover.getNextActiveSibling([QxMenuSeparator]) : this.getFirstActiveChild();

  this.setHoverItem(vNext);
};

proto._onkeydown_left = function(e)
{
  var vOpener = this.getOpener();

  // Jump to the "parent" QxMenu
  if (vOpener instanceof QxMenuButton)
  {
    var vOpenerParent = this.getOpener().getParentMenu();

    vOpenerParent.setOpenItem(null);
    vOpenerParent.setHoverItem(vOpener);

    vOpenerParent._makeActive();
  }

  // Jump to the previous ToolBarMenuButton
  else if (vOpener instanceof QxToolBarMenuButton)
  {
    var vToolBar = vOpener.getParentToolBar();

    // change active widget to new button
    this.getFocusRoot().setActiveChild(vToolBar);

    // execute toolbars keydown implementation
    vToolBar._onkeydown(e);
  };
};

proto._onkeydown_right = function(e)
{
  var vHover = this.getHoverItem();

  if (vHover)
  {
    var vMenu = vHover.getMenu();

    if (vMenu)
    {
      this.setOpenItem(vHover);

      // mark first item in new submenu
      vMenu.setHoverItem(vMenu.getFirstActiveChild());

      return;
    };
  }
  else if (!this.getOpenItem())
  {
    var vFirst = this.getLayout().getFirstActiveChild();

    if (vFirst) {
      vFirst.hasMenu() ? this.setOpenItem(vFirst) : this.setHoverItem(vFirst);
    };
  };

  // Jump to the next ToolBarMenuButton
  var vOpener = this.getOpener();

  if (vOpener instanceof QxToolBarMenuButton)
  {
    var vToolBar = vOpener.getParentToolBar();

    // change active widget to new button
    this.getFocusRoot().setActiveChild(vToolBar);

    // execute toolbars keydown implementation
    vToolBar._onkeydown(e);
  }
  else if (vOpener instanceof QxMenuButton && vHover)
  {
    // search for menubar if existing
    // menu -> button -> menu -> button -> menu -> menubarbutton -> menubar

    var vOpenerParent = vOpener.getParentMenu();

    while (vOpenerParent && vOpenerParent instanceof QxMenu)
    {
      vOpener = vOpenerParent.getOpener();

      if (vOpener instanceof QxMenuButton)
      {
        vOpenerParent = vOpener.getParentMenu();
      }
      else
      {
        if (vOpener) {
          vOpenerParent = vOpener.getParent();
        };

        break;
      };
    };

    if (vOpenerParent instanceof QxToolBarPart) {
      vOpenerParent = vOpenerParent.getParent();
    };

    if (vOpenerParent instanceof QxToolBar)
    {
      // jump to next menubarbutton
      this.getFocusRoot().setActiveChild(vOpenerParent);
      vOpenerParent._onkeydown(e);
    };
  };
};

proto._onkeydown_enter = function(e)
{
  var vHover = this.getHoverItem();
  if (vHover) {
    vHover.execute();
  };

  QxMenuManager.update();
};






/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  if (this._layout)
  {
    this._layout.dispose();
    this._layout = null;
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

  // Remove event listeners
  this.removeEventListener(QxConst.EVENT_TYPE_MOUSEOVER, this._onmouseover);
  this.removeEventListener(QxConst.EVENT_TYPE_MOUSEMOVE, this._onmouseover);
  this.removeEventListener(QxConst.EVENT_TYPE_MOUSEOUT, this._onmouseout);

  this.removeEventListener(QxConst.EVENT_TYPE_KEYDOWN, this._onkeydown);

  return QxPopup.prototype.dispose.call(this);
};
