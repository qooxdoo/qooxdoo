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

#package(window)
#post(QxDomDimension)
#post(QxDomLocation)
#post(QxTerminator)
#post(QxVerticalBoxLayout)
#post(QxHorizontalBoxLayout)
#post(QxCanvasLayout)
#post(QxImage)
#post(QxLabel)
#post(QxHorizontalSpacer)
#post(QxButton)
#post(QxWindowManager)
#post(QxWidget)
#post(QxUtil)
#post(QxCompare)

************************************************************************ */

function QxWindow(vCaption, vIcon, vWindowManager)
{
  QxPopup.call(this);

  // ************************************************************************
  //   FUNCTIONAL STYLE
  // ************************************************************************

  this.setMinWidth(QxConst.CORE_AUTO);
  this.setMinHeight(QxConst.CORE_AUTO);
  this.setAutoHide(false);



  // ************************************************************************
  //   MANAGER
  // ************************************************************************

  // Init Focus Manager
  this.activateFocusRoot();

  // Init Window Manager
  this.setWindowManager(vWindowManager || QxWindow.getDefaultWindowManager());



  // ************************************************************************
  //   RESIZE AND MOVE FRAME
  // ************************************************************************

  var f = this._frame = new QxTerminator;
  f.setAppearance("window-resize-frame");


  // ************************************************************************
  //   LAYOUT
  // ************************************************************************

  var l = this._layout = new QxVerticalBoxLayout;
  l.setEdge(0);
  this.add(l);


  // ************************************************************************
  //   CAPTIONBAR
  // ************************************************************************

  var cb = this._captionBar = new QxHorizontalBoxLayout;
  cb.setAppearance("window-captionbar");
  l.add(cb);


  // ************************************************************************
  //   CAPTIONICON
  // ************************************************************************

  if (QxUtil.isValidString(vIcon))
  {
    var ci = this._captionIcon = new QxImage(vIcon);
    ci.setAppearance("window-captionbar-icon");
    cb.add(ci);
  };


  // ************************************************************************
  //   CAPTIONTITLE
  // ************************************************************************

  var ct = this._captionTitle = new QxLabel(vCaption);
  ct.setAppearance("window-captionbar-title");
  ct.setSelectable(false);
  cb.add(ct);


  // ************************************************************************
  //   CAPTIONFLEX
  // ************************************************************************

  var cf = this._captionFlex = new QxHorizontalSpacer;
  cb.add(cf);


  // ************************************************************************
  //   CAPTIONBUTTONS: MINIMIZE
  // ************************************************************************

  var bm = this._minimizeButton = new QxButton(null, "widgets/window/minimize.gif");

  bm.setAppearance("window-captionbar-minimize-button");
  bm.setTabIndex(-1);

  bm.addEventListener(QxConst.EVENT_TYPE_CLICK, this._onminimizebuttonclick, this);
  bm.addEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onbuttonmousedown, this);

  cb.add(bm);


  // ************************************************************************
  //   CAPTIONBUTTONS: RESTORE
  // ************************************************************************

  var br = this._restoreButton = new QxButton(null, "widgets/window/restore.gif");

  br.setAppearance("window-captionbar-restore-button");
  br.setTabIndex(-1);

  br.addEventListener(QxConst.EVENT_TYPE_CLICK, this._onrestorebuttonclick, this);
  br.addEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onbuttonmousedown, this);

  // don't add initially
  // cb.add(br);


  // ************************************************************************
  //   CAPTIONBUTTONS: MAXIMIZE
  // ************************************************************************

  var bx = this._maximizeButton = new QxButton(null, "widgets/window/maximize.gif");

  bx.setAppearance("window-captionbar-maximize-button");
  bx.setTabIndex(-1);

  bx.addEventListener(QxConst.EVENT_TYPE_CLICK, this._onmaximizebuttonclick, this);
  bx.addEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onbuttonmousedown, this);

  cb.add(bx);


  // ************************************************************************
  //   CAPTIONBUTTONS: CLOSE
  // ************************************************************************

  var bc = this._closeButton = new QxButton(null, "widgets/window/close.gif");

  bc.setAppearance("window-captionbar-close-button");
  bc.setTabIndex(-1);

  bc.addEventListener(QxConst.EVENT_TYPE_CLICK, this._onclosebuttonclick, this);
  bc.addEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onbuttonmousedown, this);

  cb.add(bc);


  // ************************************************************************
  //   PANE
  // ************************************************************************

  var p = this._pane = new QxCanvasLayout;
  p.setHeight(QxConst.CORE_FLEX);
  p.setOverflow(QxConst.OVERFLOW_VALUE_HIDDEN);
  l.add(p);


  // ************************************************************************
  //   STATUSBAR
  // ************************************************************************

  var sb = this._statusBar = new QxHorizontalBoxLayout;
  sb.setAppearance("window-statusbar");


  // ************************************************************************
  //   STATUSTEXT
  // ************************************************************************

  var st = this._statusText = new QxLabel("Ready");
  st.setAppearance("window-statusbar-text");
  st.setSelectable(false);
  sb.add(st);


  // ************************************************************************
  //   INIT
  // ************************************************************************

  this.setCaption(vCaption);
  this.setIcon(vIcon);


  // ************************************************************************
  //   EVENTS: WINDOW
  // ************************************************************************

  this.addEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onwindowmousedown, this);
  this.addEventListener(QxConst.EVENT_TYPE_MOUSEUP, this._onwindowmouseup, this);
  this.addEventListener(QxConst.EVENT_TYPE_MOUSEMOVE, this._onwindowmousemove, this);


  // ************************************************************************
  //   EVENTS: CAPTIONBAR
  // ************************************************************************

  cb.addEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._oncaptionmousedown, this);
  cb.addEventListener(QxConst.EVENT_TYPE_MOUSEUP, this._oncaptionmouseup, this);
  cb.addEventListener(QxConst.EVENT_TYPE_MOUSEMOVE, this._oncaptionmousemove, this);
  cb.addEventListener(QxConst.EVENT_TYPE_DBLCLICK, this._oncaptiondblblick, this);


  // ************************************************************************
  //   REMAPPING
  // ************************************************************************
  this.remapChildrenHandlingTo(this._pane);
};

QxWindow.extend(QxPopup, "QxWindow");



/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  Appearance of the widget
*/
QxWindow.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "window" });

/*!
  The windowManager to use for.
*/
QxWindow.addProperty({ name : "windowManager", type : QxConst.TYPEOF_OBJECT });

/*!
  If the window is active, only one window in a single QxWindowManager could
  have set this to true at the same time.
*/
QxWindow.addProperty({ name : "active", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });

/*!
  Should be window be modal (this disable minimize and maximize buttons)
*/
QxWindow.addProperty({ name : "modal", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });

/*!
  Should be window be modal (this disable minimize and maximize buttons)
*/
QxWindow.addProperty({ name : "mode", type : QxConst.TYPEOF_STRING, defaultValue : null, possibleValues : [ "minimized", "maximized" ], allowNull : true });

/*!
  The opener (button) of the window
*/
QxWindow.addProperty({ name : "opener", type : QxConst.TYPEOF_OBJECT });

/*!
  The text of the caption
*/
QxWindow.addProperty({ name : "caption", type : QxConst.TYPEOF_STRING });

/*!
  The icon of the caption
*/
QxWindow.addProperty({ name : "icon", type : QxConst.TYPEOF_STRING });

/*!
  The text of the statusbar
*/
QxWindow.addProperty({ name : "status", type : QxConst.TYPEOF_STRING, defaultValue : "Ready" });

/*!
  Should the close button be shown
*/
QxWindow.addProperty({ name : "showClose", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true });

/*!
  Should the maximize button be shown
*/
QxWindow.addProperty({ name : "showMaximize", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true });

/*!
  Should the minimize button be shown
*/
QxWindow.addProperty({ name : "showMinimize", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true });

/*!
  Should the statusbar be shown
*/
QxWindow.addProperty({ name : "showStatusbar", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });

/*!
  Should the user have the ability to close the window
*/
QxWindow.addProperty({ name : "allowClose", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true });

/*!
  Should the user have the ability to maximize the window
*/
QxWindow.addProperty({ name : "allowMaximize", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true });

/*!
  Should the user have the ability to minimize the window
*/
QxWindow.addProperty({ name : "allowMinimize", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true });

/*!
  If the text (in the captionbar) should be visible
*/
QxWindow.addProperty({ name : "showCaption", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true });

/*!
  If the icon (in the captionbar) should be visible
*/
QxWindow.addProperty({ name : "showIcon", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true });

/*!
  If the window is resizeable
*/
QxWindow.addProperty({ name : "resizeable", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true });

/*!
  If the window is moveable
*/
QxWindow.addProperty({ name : "moveable", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true });

/*!
  The resize method to use
*/
QxWindow.addProperty({ name : "resizeMethod", type : QxConst.TYPEOF_STRING, defaultValue : "frame", possibleValues : [ "opaque", "lazyopaque", "frame", "translucent" ] });

/*!
  The move method to use
*/
QxWindow.addProperty({ name : "moveMethod", type : QxConst.TYPEOF_STRING, defaultValue : "opaque", possibleValues : [ "opaque", "frame", "translucent" ] });




/*
---------------------------------------------------------------------------
  MANAGER HANDLING
---------------------------------------------------------------------------
*/

QxWindow.getDefaultWindowManager = function()
{
  if (!QxWindow._defaultWindowManager) {
    QxWindow._defaultWindowManager = new QxWindowManager;
  };

  return QxWindow._defaultWindowManager;
};





/*
---------------------------------------------------------------------------
  STRINGS
---------------------------------------------------------------------------
*/

QxWindow.MODE_OPAQUE = "opaque";
QxWindow.MODE_LAZYOPAQUE = "lazyopaque";
QxWindow.MODE_FRAME = "frame";
QxWindow.MODE_TRANSLUCENT = "translucent";

QxWindow.MODE_MINIMIZED = "minimized";
QxWindow.MODE_MAXIMIZED = "maximized";




/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

proto.getPane = function() {
  return this._pane;
};

proto.getCaptionBar = function() {
  return this._captionBar;
};

proto.getStatusBar = function() {
  return this._statusBar;
};

proto.close = function() {
  this.hide();
};

proto.open = function(vOpener)
{
  if (QxUtil.isValid(vOpener)) {
    this.setOpener(vOpener);
  };

  if (this.getCentered()) {
    this.centerToBrowser();
  };

  this.show();
};

proto.focus = function() {
  this.setActive(true);
};

proto.blur = function() {
  this.setActive(false);
};

proto.maximize = function() {
  this.setMode(QxWindow.MODE_MAXIMIZED);
};

proto.minimize = function() {
  this.setMode(QxWindow.MODE_MINIMIZED);
};

proto.restore = function() {
  this.setMode(null);
};








/*
---------------------------------------------------------------------------
  APPEAR/DISAPPEAR
---------------------------------------------------------------------------
*/

proto._beforeAppear = function()
{
  QxCanvasLayout.prototype._beforeAppear.call(this);

  QxPopupManager.update();

  this.getWindowManager().add(this);
  this._makeActive();
};

proto._beforeDisappear = function()
{
  QxCanvasLayout.prototype._beforeDisappear.call(this);

  // Be sure to disable any capturing inside invisible parts
  // Is this to much overhead?
  // Are there any other working solutions?
  var vWidget = this.getTopLevelWidget().getEventManager().getCaptureWidget();
  if (vWidget && this.contains(vWidget)) {
    vWidget.setCapture(false);
  };

  this.getWindowManager().remove(this);
  this._makeInactive();
};





/*
---------------------------------------------------------------------------
  ZIndex Positioning
---------------------------------------------------------------------------
*/

proto._minZIndex = 1e5;

proto._sendTo = function()
{
  var vAll = QxUtil.convertObjectValuesToArray(this.getWindowManager().getAll()).sort(QxCompare.byZIndex);
  var vLength = vAll.length;
  var vIndex = this._minZIndex;

  for (var i=0; i<vLength; i++) {
    vAll[i].setZIndex(vIndex++);
  };
};






/*
---------------------------------------------------------------------------
  MODIFIERS
---------------------------------------------------------------------------
*/

proto._modifyActive = function(propValue, propOldValue, propData)
{
  if (propOldValue)
  {
    if (this.getFocused()) {
      this.setFocused(false);
    };

    if (this.getWindowManager().getActiveWindow() == this) {
      this.getWindowManager().setActiveWindow(null);
    };

    this.removeState(QxConst.STATE_ACTIVE);
    this._captionBar.removeState(QxConst.STATE_ACTIVE);
  }
  else
  {
    // Switch focus
    // Also do this if gets inactive as this moved the focus outline
    // away from any focused child.
    if (!this.getFocusedChild()) {
      this.setFocused(true);
    };

    this.getWindowManager().setActiveWindow(this);
    this.bringToFront();

    this.addState(QxConst.STATE_ACTIVE);
    this._captionBar.addState(QxConst.STATE_ACTIVE);
  };

  return true;
};

proto._modifyModal = function(propValue, propOldValue, propData)
{
  // Inform blocker
  if (this._initialLayoutDone && this.getVisibility() && this.getDisplay())
  {
    var vTop = this.getTopLevelWidget();
    propValue ? vTop.block(this) : vTop.release(this);
  };

  // Disallow minimize and close for modal dialogs
  this._closeButtonManager();
  this._minimizeButtonManager();

  return true;
};

proto._modifyAllowClose = function(propValue, propOldValue, propData) {
  return this._closeButtonManager();
};

proto._modifyAllowMaximize = function(propValue, propOldValue, propData) {
  return this._maximizeButtonManager();
};

proto._modifyAllowMinimize = function(propValue, propOldValue, propData) {
  return this._minimizeButtonManager();
};

proto._modifyMode = function(propValue, propOldValue, propData)
{
  switch(propValue)
  {
    case QxWindow.MODE_MINIMIZED:
      this._minimize();
      break;

    case QxWindow.MODE_MAXIMIZED:
      this._maximize();
      break;

    default:
      switch(propOldValue)
      {
        case QxWindow.MODE_MAXIMIZED:
          this._restoreFromMaximized();
          break;

        case QxWindow.MODE_MINIMIZED:
          this._restoreFromMinimized();
          break;
      };
  };

  return true;
};

proto._modifyShowCaption = function(propValue, propOldValue, propData)
{
  if (propValue)
  {
    this._captionBar.addAt(this._captionTitle, this.getShowIcon() ? 1 : 0);
  }
  else
  {
    this._captionBar.remove(this._captionTitle);
  };

  return true;
};

proto._modifyShowIcon = function(propValue, propOldValue, propData)
{
  if (propValue)
  {
    this._captionBar.addAtBegin(this._captionIcon);
  }
  else
  {
    this._captionBar.remove(this._captionIcon);
  };

  return true;
};

proto._modifyShowStatusbar = function(propValue, propOldValue, propData)
{
  if (propValue)
  {
    this._layout.addAtEnd(this._statusBar);
  }
  else
  {
    this._layout.remove(this._statusBar);
  };

  return true;
};

proto._modifyShowClose = function(propValue, propOldValue, propData)
{
  if (propValue)
  {
    this._captionBar.addAtEnd(this._closeButton);
  }
  else
  {
    this._captionBar.remove(this._closeButton);
  };

  return true;
};

proto._modifyShowMaximize = function(propValue, propOldValue, propData)
{
  if (propValue)
  {
    var t = this.getMode() == QxConst.STATE_MAXIMIZED ? this._restoreButton : this._maximizeButton;

    if (this.getShowMinimize())
    {
      this._captionBar.addAfter(t, this._minimizeButton);
    }
    else
    {
      this._captionBar.addAfter(t, this._captionFlex);
    };
  }
  else
  {
    this._captionBar.remove(this._maximizeButton);
    this._captionBar.remove(this._restoreButton);
  };

  return true;
};

proto._modifyShowMinimize = function(propValue, propOldValue, propData)
{
  if (propValue)
  {
    this._captionBar.addAfter(this._minimizeButton, this._captionFlex);
  }
  else
  {
    this._captionBar.remove(this._minimizeButton);
  };

  return true;
};

proto._minimizeButtonManager = function()
{
  this._minimizeButton.setEnabled(this.getAllowMinimize() && !this.getModal());

  return true;
};

proto._closeButtonManager = function()
{
  this._closeButton.setEnabled(this.getAllowClose() && !this.getModal());

  return true;
};

proto._maximizeButtonManager = function()
{
  var b = this.getAllowMaximize() && this.getResizeable() && this._computedMaxWidthTypeNull && this._computedMaxHeightTypeNull;

  this._maximizeButton.setEnabled(b);
  this._restoreButton.setEnabled(b);

  return true;
};

proto._modifyStatus = function(propValue, propOldValue, propData)
{
  this._statusText.setHtml(propValue);

  return true;
};

proto._modifyMaxWidth = function(propValue, propOldValue, propData) {
  return this._maximizeButtonManager();
};

proto._modifyMaxHeight = function(propValue, propOldValue, propData) {
  return this._maximizeButtonManager();
};

proto._modifyResizeable = function(propValue, propOldValue, propData) {
  return this._maximizeButtonManager();
};

proto._modifyCaption = function(propValue, propOldValue, propData)
{
  this._captionTitle.setHtml(propValue);
  return true;
};





/*
---------------------------------------------------------------------------
  STATE LAYOUT IMPLEMENTATION
---------------------------------------------------------------------------
*/

proto._minimize = function()
{
  this.blur();
  this.hide();
};

proto._restoreFromMaximized = function()
{
  // restore previous dimension and location
  this.setLeft(this._previousLeft ? this._previousLeft : null);
  this.setWidth(this._previousWidth ? this._previousWidth : null);
  this.setRight(this._previousRight ? this._previousRight : null);

  this.setTop(this._previousTop ? this._previousTop : null);
  this.setHeight(this._previousHeight ? this._previousHeight : null);
  this.setBottom(this._previousBottom ? this._previousBottom : null);

  // update state
  this.removeState(QxConst.STATE_MAXIMIZED);

  // toggle button
  if (this.getShowMaximize())
  {
    var cb = this._captionBar;
    var v = cb.indexOf(this._restoreButton);

    cb.remove(this._restoreButton);
    cb.addAt(this._maximizeButton, v);
  };

  // finally focus the window
  this.focus();
};

proto._restoreFromMinimized = function()
{
  this.show();
  this.focus();
};

proto._maximize = function()
{
  // store current dimension and location
  this._previousLeft = this.getLeft();
  this._previousWidth = this.getWidth();
  this._previousRight = this.getRight();
  this._previousTop = this.getTop();
  this._previousHeight = this.getHeight();
  this._previousBottom = this.getBottom();

  // setup new dimension and location
  this.setWidth(null);
  this.setLeft(0);
  this.setRight(0);
  this.setHeight(null);
  this.setTop(0);
  this.setBottom(0);

  // update state
  this.addState(QxConst.STATE_MAXIMIZED);

  // toggle button
  if (this.getShowMaximize())
  {
    var cb = this._captionBar;
    var v = cb.indexOf(this._maximizeButton);

    cb.remove(this._maximizeButton);
    cb.addAt(this._restoreButton, v);
  };

  // finally focus the window
  this.focus();
};







/*
---------------------------------------------------------------------------
  EVENTS: WINDOW
---------------------------------------------------------------------------
*/

proto._onwindowmousedown = function(e)
{
  this.focus();

  if (this._resizeNorth || this._resizeSouth || this._resizeWest || this._resizeEast)
  {
    // enable capturing
    this.setCapture(true);

    // activate global cursor
    this.getTopLevelWidget().setGlobalCursor(this.getCursor());

    // caching element
    var el = this.getElement();

    // measuring and caching of values for resize session
    var pa = this.getParent();
    var pl = pa.getElement();

    var l = QxDom.getComputedPageAreaLeft(pl);
    var t = QxDom.getComputedPageAreaTop(pl);
    var r = QxDom.getComputedPageAreaRight(pl);
    var b = QxDom.getComputedPageAreaBottom(pl);

    // handle frame and translucently
    switch(this.getResizeMethod())
    {
      case QxWindow.MODE_TRANSLUCENT:
        this.setOpacity(0.5);
        break;

      case QxWindow.MODE_FRAME:
        var f = this._frame;

        if (f.getParent() != this.getParent())
        {
          f.setParent(this.getParent());
          QxWidget.flushGlobalQueues();
        };

        f._applyRuntimeLeft(QxDom.getComputedPageBoxLeft(el) - l);
        f._applyRuntimeTop(QxDom.getComputedPageBoxTop(el) - t);

        f._applyRuntimeWidth(QxDom.getComputedBoxWidth(el));
        f._applyRuntimeHeight(QxDom.getComputedBoxHeight(el));

        f.setZIndex(this.getZIndex() + 1);

        break;
    };

    // create resize session
    var s = this._resizeSession = {};

    if (this._resizeWest)
    {
      s.boxWidth = QxDom.getComputedBoxWidth(el);
      s.boxRight = QxDom.getComputedPageBoxRight(el);
    };

    if (this._resizeWest || this._resizeEast)
    {
      s.boxLeft = QxDom.getComputedPageBoxLeft(el);

      s.parentAreaOffsetLeft = l;
      s.parentAreaOffsetRight = r;

      s.minWidth = this.getMinWidthValue();
      s.maxWidth = this.getMaxWidthValue();
    };

    if (this._resizeNorth)
    {
      s.boxHeight = QxDom.getComputedBoxHeight(el);
      s.boxBottom = QxDom.getComputedPageBoxBottom(el);
    };

    if (this._resizeNorth || this._resizeSouth)
    {
      s.boxTop = QxDom.getComputedPageBoxTop(el);

      s.parentAreaOffsetTop = t;
      s.parentAreaOffsetBottom = b;

      s.minHeight = this.getMinHeightValue();
      s.maxHeight = this.getMaxHeightValue();
    };
  }
  else
  {
    // cleanup resize session
    delete this._resizeSession;
  };
};

proto._onwindowmouseup = function(e)
{
  var s = this._resizeSession;

  if (s)
  {
    // disable capturing
    this.setCapture(false);

    // deactivate global cursor
    this.getTopLevelWidget().setGlobalCursor(null);

    // sync sizes to frame
    switch(this.getResizeMethod())
    {
      case QxWindow.MODE_FRAME:
        var o = this._frame;
        if (!(o && o.getParent())) {
          break;
        };
        // no break here

      case QxWindow.MODE_LAZYOPAQUE:
        if (QxUtil.isValidNumber(s.lastLeft)) {
          this.setLeft(s.lastLeft);
        };

        if (QxUtil.isValidNumber(s.lastTop)) {
          this.setTop(s.lastTop);
        };

        if (QxUtil.isValidNumber(s.lastWidth)) {
          this.setWidth(s.lastWidth);
        };

        if (QxUtil.isValidNumber(s.lastHeight)) {
          this.setHeight(s.lastHeight);
        };

        if (this.getResizeMethod() == QxWindow.MODE_FRAME) {
          this._frame.setParent(null);
        };
        break;

      case QxWindow.MODE_TRANSLUCENT:
        this.setOpacity(null);
        break;
    };

    // cleanup session
    delete this._resizeNorth;
    delete this._resizeEast;
    delete this._resizeSouth;
    delete this._resizeWest;

    delete this._resizeSession;
  };
};

proto._near = function(p, e) {
  return e > (p - 5) && e < (p + 5);
};

proto._onwindowmousemove = function(e)
{
  if (!this.getResizeable() || this.getMode() != null) {
    return;
  };

  var s = this._resizeSession;

  if (s)
  {
    if (this._resizeWest)
    {
      s.lastWidth = (s.boxWidth + s.boxLeft - Math.max(e.getPageX(), s.parentAreaOffsetLeft)).limit(s.minWidth, s.maxWidth);
      s.lastLeft = s.boxRight - s.lastWidth - s.parentAreaOffsetLeft;
    }
    else if (this._resizeEast)
    {
      s.lastWidth = (Math.min(e.getPageX(), s.parentAreaOffsetRight) - s.boxLeft).limit(s.minWidth, s.maxWidth);
    };

    if (this._resizeNorth)
    {
      s.lastHeight = (s.boxHeight + s.boxTop - Math.max(e.getPageY(), s.parentAreaOffsetTop)).limit(s.minHeight, s.maxHeight);
      s.lastTop = s.boxBottom - s.lastHeight - s.parentAreaOffsetTop;
    }
    else if (this._resizeSouth)
    {
      s.lastHeight = (Math.min(e.getPageY(), s.parentAreaOffsetBottom) - s.boxTop).limit(s.minHeight, s.maxHeight);
    };

    switch(this.getResizeMethod())
    {
      case QxWindow.MODE_OPAQUE:
      case QxWindow.MODE_TRANSLUCENT:
        if (this._resizeWest || this._resizeEast)
        {
          this.setWidth(s.lastWidth);

          if (this._resizeWest) {
            this.setLeft(s.lastLeft);
          };
        };

        if (this._resizeNorth || this._resizeSouth)
        {
          this.setHeight(s.lastHeight);

          if (this._resizeNorth) {
            this.setTop(s.lastTop);
          };
        };

        break;

      default:
        var o = this.getResizeMethod() == QxWindow.MODE_FRAME ? this._frame : this;

        if (this._resizeWest || this._resizeEast)
        {
          o._applyRuntimeWidth(s.lastWidth);

          if (this._resizeWest) {
            o._applyRuntimeLeft(s.lastLeft);
          };
        };

        if (this._resizeNorth || this._resizeSouth)
        {
          o._applyRuntimeHeight(s.lastHeight);

          if (this._resizeNorth) {
            o._applyRuntimeTop(s.lastTop);
          };
        };
    };
  }
  else
  {
    var resizeMode = QxConst.CORE_EMPTY;
    var el = this.getElement();

    this._resizeNorth = this._resizeSouth = this._resizeWest = this._resizeEast = false;

    if (this._near(QxDom.getComputedPageBoxTop(el), e.getPageY()))
    {
      resizeMode = "n";
      this._resizeNorth = true;
    }
    else if (this._near(QxDom.getComputedPageBoxBottom(el), e.getPageY()))
    {
      resizeMode = "s";
      this._resizeSouth = true;
    };

    if (this._near(QxDom.getComputedPageBoxLeft(el), e.getPageX()))
    {
      resizeMode += "w";
      this._resizeWest = true;
    }
    else if (this._near(QxDom.getComputedPageBoxRight(el), e.getPageX()))
    {
      resizeMode += "e";
      this._resizeEast = true;
    };

    if (this._resizeNorth || this._resizeSouth || this._resizeWest || this._resizeEast)
    {
      this.setCursor(resizeMode + "-resize");
    }
    else
    {
      this.setCursor(null);
    };
  };

  e.preventDefault();
};







/*
---------------------------------------------------------------------------
  EVENTS: BUTTONS
---------------------------------------------------------------------------
*/

proto._onbuttonmousedown = function(e) {
  e.stopPropagation();
};

proto._onminimizebuttonclick = function(e)
{
  this.minimize();

  // we need to be sure that the button gets the right states after clicking
  // because the button will move and does not get the mouseup event anymore
  this._minimizeButton.removeState(QxConst.STATE_PRESSED);
  this._minimizeButton.removeState(QxConst.STATE_ABANDONED);
  this._minimizeButton.removeState(QxConst.STATE_OVER);

  e.stopPropagation();
};

proto._onrestorebuttonclick = function(e)
{
  this.restore();

  // we need to be sure that the button gets the right states after clicking
  // because the button will move and does not get the mouseup event anymore
  this._restoreButton.removeState(QxConst.STATE_PRESSED);
  this._restoreButton.removeState(QxConst.STATE_ABANDONED);
  this._restoreButton.removeState(QxConst.STATE_OVER);

  e.stopPropagation();
};

proto._onmaximizebuttonclick = function(e)
{
  this.maximize();

  // we need to be sure that the button gets the right states after clicking
  // because the button will move and does not get the mouseup event anymore
  this._maximizeButton.removeState(QxConst.STATE_PRESSED);
  this._maximizeButton.removeState(QxConst.STATE_ABANDONED);
  this._maximizeButton.removeState(QxConst.STATE_OVER);

  e.stopPropagation();
};

proto._onclosebuttonclick = function(e)
{
  this.close();

  // we need to be sure that the button gets the right states after clicking
  // because the button will move and does not get the mouseup event anymore
  this._closeButton.removeState(QxConst.STATE_PRESSED);
  this._closeButton.removeState(QxConst.STATE_ABANDONED);
  this._closeButton.removeState(QxConst.STATE_OVER);

  e.stopPropagation();
};







/*
---------------------------------------------------------------------------
  EVENTS: CAPTIONBAR
---------------------------------------------------------------------------
*/

proto._oncaptionmousedown = function(e)
{
  if (!e.isLeftButtonPressed() || !this.getMoveable() || this.getMode() != null) {
    return;
  };

  // enable capturing
  this._captionBar.setCapture(true);

  // element cache
  var el = this.getElement();

  // measuring and caching of values for drag session
  var pa = this.getParent();
  var pl = pa.getElement();

  var l = QxDom.getComputedPageAreaLeft(pl);
  var t = QxDom.getComputedPageAreaTop(pl);
  var r = QxDom.getComputedPageAreaRight(pl);
  var b = QxDom.getComputedPageAreaBottom(pl);

  this._dragSession =
  {
    offsetX : e.getPageX() - QxDom.getComputedPageBoxLeft(el) + l,
    offsetY : e.getPageY() - QxDom.getComputedPageBoxTop(el) + t,

    parentAvailableAreaLeft : l + 5,
    parentAvailableAreaTop : t + 5,
    parentAvailableAreaRight : r - 5,
    parentAvailableAreaBottom : b - 5
  };

  // handle frame and translucently
  switch(this.getMoveMethod())
  {
    case QxWindow.MODE_TRANSLUCENT:
      this.setOpacity(0.5);
      break;

    case QxWindow.MODE_FRAME:
      var f = this._frame;

      if (f.getParent() != this.getParent())
      {
        f.setParent(this.getParent());
        QxWidget.flushGlobalQueues();
      };

      f._applyRuntimeLeft(QxDom.getComputedPageBoxLeft(el) - l);
      f._applyRuntimeTop(QxDom.getComputedPageBoxTop(el) - t);

      f._applyRuntimeWidth(QxDom.getComputedBoxWidth(el));
      f._applyRuntimeHeight(QxDom.getComputedBoxHeight(el));

      f.setZIndex(this.getZIndex() + 1);

      break;
  };
};

proto._oncaptionmouseup = function(e)
{
  var s = this._dragSession;

  if (!s) {
    return;
  };

  // disable capturing
  this._captionBar.setCapture(false);

  // move window to last position
  if (QxUtil.isValidNumber(s.lastX)) {
    this.setLeft(s.lastX);
  };

  if (QxUtil.isValidNumber(s.lastY)) {
    this.setTop(s.lastY);
  };

  // handle frame and translucently
  switch(this.getMoveMethod())
  {
    case QxWindow.MODE_TRANSLUCENT:
      this.setOpacity(null);
      break;

    case QxWindow.MODE_FRAME:
      this._frame.setParent(null);
      break;
  };

  // cleanup session
  delete this._dragSession;
};

proto._oncaptionmousemove = function(e)
{
  var s = this._dragSession;

  // pre check for active session and capturing
  if (!s || !this._captionBar.getCapture()) {
    return;
  };

  // pre check if we go out of the available area
  if (!e.getPageX().betweenRange(s.parentAvailableAreaLeft, s.parentAvailableAreaRight) || !e.getPageY().betweenRange(s.parentAvailableAreaTop, s.parentAvailableAreaBottom)) {
    return;
  };

  // use the fast and direct dom methods
  var o = this.getMoveMethod() == QxWindow.MODE_FRAME ? this._frame : this;

  o._applyRuntimeLeft(s.lastX = e.getPageX() - s.offsetX);
  o._applyRuntimeTop(s.lastY = e.getPageY() - s.offsetY);

  e.preventDefault();
};

proto._oncaptiondblblick = function()
{
  if (!this._maximizeButton.getEnabled()) {
    return;
  };

  return this.getMode() == QxWindow.MODE_MAXIMIZED ? this.restore() : this.maximize();
};








/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return true;
  };

  if (this._layout)
  {
    this._layout.dispose();
    this._layout = null;
  };

  if (this._frame)
  {
    this._frame.dispose();
    this._frame = null;
  };

  if (this._captionBar)
  {
    this._captionBar.dispose();
    this._captionBar = null;
  };

  if (this._captionIcon)
  {
    this._captionIcon.dispose();
    this._captionIcon = null;
  };

  if (this._captionTitle)
  {
    this._captionTitle.dispose();
    this._captionTitle = null;
  };

  if (this._captionFlex)
  {
    this._captionFlex.dispose();
    this._captionFlex = null;
  };

  if (this._closeButton)
  {
    this._closeButton.dispose();
    this._closeButton = null;
  };

  if (this._minimizeButton)
  {
    this._minimizeButton.dispose();
    this._minimizeButton = null;
  };

  if (this._maximizeButton)
  {
    this._maximizeButton.dispose();
    this._maximizeButton = null;
  };

  if (this._restoreButton)
  {
    this._restoreButton.dispose();
    this._restoreButton = null;
  };

  if (this._pane)
  {
    this._pane.dispose();
    this._pane = null;
  };

  if (this._statusBar)
  {
    this._statusBar.dispose();
    this._statusBar = null;
  };

  if (this._statusText)
  {
    this._statusText.dispose();
    this._statusText = null;
  };

  return QxPopup.prototype.dispose.call(this);
};
