/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(window)

************************************************************************ */

qx.OO.defineClass("qx.ui.window.Window", qx.ui.popup.Popup,
function(vCaption, vIcon, vWindowManager)
{
  qx.ui.popup.Popup.call(this);

  // ************************************************************************
  //   FUNCTIONAL STYLE
  // ************************************************************************

  this.setMinWidth(qx.constant.Core.AUTO);
  this.setMinHeight(qx.constant.Core.AUTO);
  this.setAutoHide(false);



  // ************************************************************************
  //   MANAGER
  // ************************************************************************

  // Init Focus Manager
  this.activateFocusRoot();

  // Init Window Manager
  this.setWindowManager(vWindowManager || qx.ui.window.Window.getDefaultWindowManager());



  // ************************************************************************
  //   RESIZE AND MOVE FRAME
  // ************************************************************************

  var f = this._frame = new qx.ui.basic.Terminator;
  f.setAppearance("window-resize-frame");


  // ************************************************************************
  //   LAYOUT
  // ************************************************************************

  var l = this._layout = new qx.ui.layout.VerticalBoxLayout;
  l.setEdge(0);
  this.add(l);


  // ************************************************************************
  //   CAPTIONBAR
  // ************************************************************************

  var cb = this._captionBar = new qx.ui.layout.HorizontalBoxLayout;
  cb.setAppearance("window-captionbar");
  l.add(cb);


  // ************************************************************************
  //   CAPTIONICON
  // ************************************************************************

  if (qx.util.Validation.isValidString(vIcon))
  {
    var ci = this._captionIcon = new qx.ui.basic.Image(vIcon);
    ci.setAppearance("window-captionbar-icon");
    cb.add(ci);
  }


  // ************************************************************************
  //   CAPTIONTITLE
  // ************************************************************************

  var ct = this._captionTitle = new qx.ui.basic.Label(vCaption);
  ct.setAppearance("window-captionbar-title");
  ct.setSelectable(false);
  cb.add(ct);


  // ************************************************************************
  //   CAPTIONFLEX
  // ************************************************************************

  var cf = this._captionFlex = new qx.ui.basic.HorizontalSpacer;
  cb.add(cf);


  // ************************************************************************
  //   CAPTIONBUTTONS: MINIMIZE
  // ************************************************************************

  var bm = this._minimizeButton = new qx.ui.form.Button(null, "widget/window/minimize.gif");

  bm.setAppearance("window-captionbar-minimize-button");
  bm.setTabIndex(-1);

  bm.addEventListener(qx.constant.Event.CLICK, this._onminimizebuttonclick, this);
  bm.addEventListener(qx.constant.Event.MOUSEDOWN, this._onbuttonmousedown, this);

  cb.add(bm);


  // ************************************************************************
  //   CAPTIONBUTTONS: RESTORE
  // ************************************************************************

  var br = this._restoreButton = new qx.ui.form.Button(null, "widget/window/restore.gif");

  br.setAppearance("window-captionbar-restore-button");
  br.setTabIndex(-1);

  br.addEventListener(qx.constant.Event.CLICK, this._onrestorebuttonclick, this);
  br.addEventListener(qx.constant.Event.MOUSEDOWN, this._onbuttonmousedown, this);

  // don't add initially
  // cb.add(br);


  // ************************************************************************
  //   CAPTIONBUTTONS: MAXIMIZE
  // ************************************************************************

  var bx = this._maximizeButton = new qx.ui.form.Button(null, "widget/window/maximize.gif");

  bx.setAppearance("window-captionbar-maximize-button");
  bx.setTabIndex(-1);

  bx.addEventListener(qx.constant.Event.CLICK, this._onmaximizebuttonclick, this);
  bx.addEventListener(qx.constant.Event.MOUSEDOWN, this._onbuttonmousedown, this);

  cb.add(bx);


  // ************************************************************************
  //   CAPTIONBUTTONS: CLOSE
  // ************************************************************************

  var bc = this._closeButton = new qx.ui.form.Button(null, "widget/window/close.gif");

  bc.setAppearance("window-captionbar-close-button");
  bc.setTabIndex(-1);

  bc.addEventListener(qx.constant.Event.CLICK, this._onclosebuttonclick, this);
  bc.addEventListener(qx.constant.Event.MOUSEDOWN, this._onbuttonmousedown, this);

  cb.add(bc);


  // ************************************************************************
  //   PANE
  // ************************************************************************

  var p = this._pane = new qx.ui.layout.CanvasLayout;
  p.setHeight(qx.constant.Core.FLEX);
  p.setOverflow(qx.constant.Style.OVERFLOW_HIDDEN);
  l.add(p);


  // ************************************************************************
  //   STATUSBAR
  // ************************************************************************

  var sb = this._statusBar = new qx.ui.layout.HorizontalBoxLayout;
  sb.setAppearance("window-statusbar");


  // ************************************************************************
  //   STATUSTEXT
  // ************************************************************************

  var st = this._statusText = new qx.ui.basic.Label("Ready");
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

  this.addEventListener(qx.constant.Event.MOUSEDOWN, this._onwindowmousedown, this);
  this.addEventListener(qx.constant.Event.MOUSEUP, this._onwindowmouseup, this);
  this.addEventListener(qx.constant.Event.MOUSEMOVE, this._onwindowmousemove, this);


  // ************************************************************************
  //   EVENTS: CAPTIONBAR
  // ************************************************************************

  cb.addEventListener(qx.constant.Event.MOUSEDOWN, this._oncaptionmousedown, this);
  cb.addEventListener(qx.constant.Event.MOUSEUP, this._oncaptionmouseup, this);
  cb.addEventListener(qx.constant.Event.MOUSEMOVE, this._oncaptionmousemove, this);
  cb.addEventListener(qx.constant.Event.DBLCLICK, this._oncaptiondblblick, this);


  // ************************************************************************
  //   REMAPPING
  // ************************************************************************
  this.remapChildrenHandlingTo(this._pane);
});

qx.Class.STATE_ACTIVE = "active";
qx.Class.STATE_MAXIMIZED = "maximized";






/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  Appearance of the widget
*/
qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "window" });

/*!
  The windowManager to use for.
*/
qx.OO.addProperty({ name : "windowManager", type : qx.constant.Type.OBJECT });

/*!
  If the window is active, only one window in a single qx.manager.object.WindowManager could
  have set this to true at the same time.
*/
qx.OO.addProperty({ name : "active", type : qx.constant.Type.BOOLEAN, defaultValue : false });

/*!
  Should be window be modal (this disable minimize and maximize buttons)
*/
qx.OO.addProperty({ name : "modal", type : qx.constant.Type.BOOLEAN, defaultValue : false });

/*!
  Should be window be modal (this disable minimize and maximize buttons)
*/
qx.OO.addProperty({ name : "mode", type : qx.constant.Type.STRING, defaultValue : null, possibleValues : [ "minimized", "maximized" ], allowNull : true });

/*!
  The opener (button) of the window
*/
qx.OO.addProperty({ name : "opener", type : qx.constant.Type.OBJECT });

/*!
  The text of the caption
*/
qx.OO.addProperty({ name : "caption", type : qx.constant.Type.STRING });

/*!
  The icon of the caption
*/
qx.OO.addProperty({ name : "icon", type : qx.constant.Type.STRING });

/*!
  The text of the statusbar
*/
qx.OO.addProperty({ name : "status", type : qx.constant.Type.STRING, defaultValue : "Ready" });

/*!
  Should the close button be shown
*/
qx.OO.addProperty({ name : "showClose", type : qx.constant.Type.BOOLEAN, defaultValue : true });

/*!
  Should the maximize button be shown
*/
qx.OO.addProperty({ name : "showMaximize", type : qx.constant.Type.BOOLEAN, defaultValue : true });

/*!
  Should the minimize button be shown
*/
qx.OO.addProperty({ name : "showMinimize", type : qx.constant.Type.BOOLEAN, defaultValue : true });

/*!
  Should the statusbar be shown
*/
qx.OO.addProperty({ name : "showStatusbar", type : qx.constant.Type.BOOLEAN, defaultValue : false });

/*!
  Should the user have the ability to close the window
*/
qx.OO.addProperty({ name : "allowClose", type : qx.constant.Type.BOOLEAN, defaultValue : true });

/*!
  Should the user have the ability to maximize the window
*/
qx.OO.addProperty({ name : "allowMaximize", type : qx.constant.Type.BOOLEAN, defaultValue : true });

/*!
  Should the user have the ability to minimize the window
*/
qx.OO.addProperty({ name : "allowMinimize", type : qx.constant.Type.BOOLEAN, defaultValue : true });

/*!
  If the text (in the captionbar) should be visible
*/
qx.OO.addProperty({ name : "showCaption", type : qx.constant.Type.BOOLEAN, defaultValue : true });

/*!
  If the icon (in the captionbar) should be visible
*/
qx.OO.addProperty({ name : "showIcon", type : qx.constant.Type.BOOLEAN, defaultValue : true });

/*!
  If the window is resizeable
*/
qx.OO.addProperty({ name : "resizeable", type : qx.constant.Type.BOOLEAN, defaultValue : true });

/*!
  If the window is moveable
*/
qx.OO.addProperty({ name : "moveable", type : qx.constant.Type.BOOLEAN, defaultValue : true });

/*!
  The resize method to use
*/
qx.OO.addProperty({ name : "resizeMethod", type : qx.constant.Type.STRING, defaultValue : "frame", possibleValues : [ "opaque", "lazyopaque", "frame", "translucent" ] });

/*!
  The move method to use
*/
qx.OO.addProperty({ name : "moveMethod", type : qx.constant.Type.STRING, defaultValue : "opaque", possibleValues : [ "opaque", "frame", "translucent" ] });




/*
---------------------------------------------------------------------------
  MANAGER HANDLING
---------------------------------------------------------------------------
*/

qx.ui.window.Window.getDefaultWindowManager = function()
{
  if (!qx.ui.window.Window._defaultWindowManager) {
    qx.ui.window.Window._defaultWindowManager = new qx.manager.object.WindowManager;
  }

  return qx.ui.window.Window._defaultWindowManager;
}





/*
---------------------------------------------------------------------------
  STRINGS
---------------------------------------------------------------------------
*/

qx.ui.window.Window.MODE_OPAQUE = "opaque";
qx.ui.window.Window.MODE_LAZYOPAQUE = "lazyopaque";
qx.ui.window.Window.MODE_FRAME = "frame";
qx.ui.window.Window.MODE_TRANSLUCENT = "translucent";

qx.ui.window.Window.MODE_MINIMIZED = "minimized";
qx.ui.window.Window.MODE_MAXIMIZED = "maximized";





/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

qx.Proto.getPane = function() {
  return this._pane;
}

qx.Proto.getCaptionBar = function() {
  return this._captionBar;
}

qx.Proto.getStatusBar = function() {
  return this._statusBar;
}

qx.Proto.close = function() {
  this.hide();
}

qx.Proto.open = function(vOpener)
{
  if (qx.util.Validation.isValid(vOpener)) {
    this.setOpener(vOpener);
  }

  if (this.getCentered()) {
    this.centerToBrowser();
  }

  this.show();
}

qx.Proto.focus = function() {
  this.setActive(true);
}

qx.Proto.blur = function() {
  this.setActive(false);
}

qx.Proto.maximize = function() {
  this.setMode(qx.ui.window.Window.MODE_MAXIMIZED);
}

qx.Proto.minimize = function() {
  this.setMode(qx.ui.window.Window.MODE_MINIMIZED);
}

qx.Proto.restore = function() {
  this.setMode(null);
}








/*
---------------------------------------------------------------------------
  APPEAR/DISAPPEAR
---------------------------------------------------------------------------
*/

qx.Proto._beforeAppear = function()
{
  // Intentionally bypass superclass and call super.super._beforeAppear
  qx.ui.layout.CanvasLayout.prototype._beforeAppear.call(this);

  qx.manager.object.PopupManager.update();

  this.getWindowManager().add(this);
  this._makeActive();
}

qx.Proto._beforeDisappear = function()
{
  // Intentionally bypass superclass and call super.super._beforeDisappear
  qx.ui.layout.CanvasLayout.prototype._beforeDisappear.call(this);

  // Be sure to disable any capturing inside invisible parts
  // Is this to much overhead?
  // Are there any other working solutions?
  var vWidget = this.getTopLevelWidget().getEventManager().getCaptureWidget();
  if (vWidget && this.contains(vWidget)) {
    vWidget.setCapture(false);
  }

  this.getWindowManager().remove(this);
  this._makeInactive();
}





/*
---------------------------------------------------------------------------
  ZIndex Positioning
---------------------------------------------------------------------------
*/

qx.Proto._minZIndex = 1e5;

qx.Proto._sendTo = function()
{
  var vAll = qx.lang.Object.getValues(this.getWindowManager().getAll()).sort(qx.util.Compare.byZIndex);
  var vLength = vAll.length;
  var vIndex = this._minZIndex;

  for (var i=0; i<vLength; i++) {
    vAll[i].setZIndex(vIndex++);
  }
}






/*
---------------------------------------------------------------------------
  MODIFIERS
---------------------------------------------------------------------------
*/

qx.Proto._modifyActive = function(propValue, propOldValue, propData)
{
  if (propOldValue)
  {
    if (this.getFocused()) {
      this.setFocused(false);
    }

    if (this.getWindowManager().getActiveWindow() == this) {
      this.getWindowManager().setActiveWindow(null);
    }

    this.removeState(qx.ui.window.Window.STATE_ACTIVE);
    this._captionBar.removeState(qx.ui.window.Window.STATE_ACTIVE);
  }
  else
  {
    // Switch focus
    // Also do this if gets inactive as this moved the focus outline
    // away from any focused child.
    if (!this.getFocusedChild()) {
      this.setFocused(true);
    }

    this.getWindowManager().setActiveWindow(this);
    this.bringToFront();

    this.addState(qx.ui.window.Window.STATE_ACTIVE);
    this._captionBar.addState(qx.ui.window.Window.STATE_ACTIVE);
  }

  return true;
}

qx.Proto._modifyModal = function(propValue, propOldValue, propData)
{
  // Inform blocker
  if (this._initialLayoutDone && this.getVisibility() && this.getDisplay())
  {
    var vTop = this.getTopLevelWidget();
    propValue ? vTop.block(this) : vTop.release(this);
  }

  // Disallow minimize and close for modal dialogs
  this._closeButtonManager();
  this._minimizeButtonManager();

  return true;
}

qx.Proto._modifyAllowClose = function(propValue, propOldValue, propData) {
  return this._closeButtonManager();
}

qx.Proto._modifyAllowMaximize = function(propValue, propOldValue, propData) {
  return this._maximizeButtonManager();
}

qx.Proto._modifyAllowMinimize = function(propValue, propOldValue, propData) {
  return this._minimizeButtonManager();
}

qx.Proto._modifyMode = function(propValue, propOldValue, propData)
{
  switch(propValue)
  {
    case qx.ui.window.Window.MODE_MINIMIZED:
      this._minimize();
      break;

    case qx.ui.window.Window.MODE_MAXIMIZED:
      this._maximize();
      break;

    default:
      switch(propOldValue)
      {
        case qx.ui.window.Window.MODE_MAXIMIZED:
          this._restoreFromMaximized();
          break;

        case qx.ui.window.Window.MODE_MINIMIZED:
          this._restoreFromMinimized();
          break;
      }
  }

  return true;
}

qx.Proto._modifyShowCaption = function(propValue, propOldValue, propData)
{
  if (propValue)
  {
    this._captionBar.addAt(this._captionTitle, this.getShowIcon() ? 1 : 0);
  }
  else
  {
    this._captionBar.remove(this._captionTitle);
  }

  return true;
}

qx.Proto._modifyShowIcon = function(propValue, propOldValue, propData)
{
  if (propValue)
  {
    this._captionBar.addAtBegin(this._captionIcon);
  }
  else
  {
    this._captionBar.remove(this._captionIcon);
  }

  return true;
}

qx.Proto._modifyShowStatusbar = function(propValue, propOldValue, propData)
{
  if (propValue)
  {
    this._layout.addAtEnd(this._statusBar);
  }
  else
  {
    this._layout.remove(this._statusBar);
  }

  return true;
}

qx.Proto._modifyShowClose = function(propValue, propOldValue, propData)
{
  if (propValue)
  {
    this._captionBar.addAtEnd(this._closeButton);
  }
  else
  {
    this._captionBar.remove(this._closeButton);
  }

  return true;
}

qx.Proto._modifyShowMaximize = function(propValue, propOldValue, propData)
{
  if (propValue)
  {
    var t = this.getMode() == qx.ui.window.Window.STATE_MAXIMIZED ? this._restoreButton : this._maximizeButton;

    if (this.getShowMinimize())
    {
      this._captionBar.addAfter(t, this._minimizeButton);
    }
    else
    {
      this._captionBar.addAfter(t, this._captionFlex);
    }
  }
  else
  {
    this._captionBar.remove(this._maximizeButton);
    this._captionBar.remove(this._restoreButton);
  }

  return true;
}

qx.Proto._modifyShowMinimize = function(propValue, propOldValue, propData)
{
  if (propValue)
  {
    this._captionBar.addAfter(this._minimizeButton, this._captionFlex);
  }
  else
  {
    this._captionBar.remove(this._minimizeButton);
  }

  return true;
}

qx.Proto._minimizeButtonManager = function()
{
  this._minimizeButton.setEnabled(this.getAllowMinimize() && !this.getModal());

  return true;
}

qx.Proto._closeButtonManager = function()
{
  this._closeButton.setEnabled(this.getAllowClose() && !this.getModal());

  return true;
}

qx.Proto._maximizeButtonManager = function()
{
  var b = this.getAllowMaximize() && this.getResizeable() && this._computedMaxWidthTypeNull && this._computedMaxHeightTypeNull;

  this._maximizeButton.setEnabled(b);
  this._restoreButton.setEnabled(b);

  return true;
}

qx.Proto._modifyStatus = function(propValue, propOldValue, propData)
{
  this._statusText.setHtml(propValue);

  return true;
}

qx.Proto._modifyMaxWidth = function(propValue, propOldValue, propData) {
  return this._maximizeButtonManager();
}

qx.Proto._modifyMaxHeight = function(propValue, propOldValue, propData) {
  return this._maximizeButtonManager();
}

qx.Proto._modifyResizeable = function(propValue, propOldValue, propData) {
  return this._maximizeButtonManager();
}

qx.Proto._modifyCaption = function(propValue, propOldValue, propData)
{
  this._captionTitle.setHtml(propValue);
  return true;
}





/*
---------------------------------------------------------------------------
  STATE LAYOUT IMPLEMENTATION
---------------------------------------------------------------------------
*/

qx.Proto._minimize = function()
{
  this.blur();
  this.hide();
}

qx.Proto._restoreFromMaximized = function()
{
  // restore previous dimension and location
  this.setLeft(this._previousLeft ? this._previousLeft : null);
  this.setWidth(this._previousWidth ? this._previousWidth : null);
  this.setRight(this._previousRight ? this._previousRight : null);

  this.setTop(this._previousTop ? this._previousTop : null);
  this.setHeight(this._previousHeight ? this._previousHeight : null);
  this.setBottom(this._previousBottom ? this._previousBottom : null);

  // update state
  this.removeState(qx.ui.window.Window.STATE_MAXIMIZED);

  // toggle button
  if (this.getShowMaximize())
  {
    var cb = this._captionBar;
    var v = cb.indexOf(this._restoreButton);

    cb.remove(this._restoreButton);
    cb.addAt(this._maximizeButton, v);
  }

  // finally focus the window
  this.focus();
}

qx.Proto._restoreFromMinimized = function()
{
  this.show();
  this.focus();
}

qx.Proto._maximize = function()
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
  this.addState(qx.ui.window.Window.STATE_MAXIMIZED);

  // toggle button
  if (this.getShowMaximize())
  {
    var cb = this._captionBar;
    var v = cb.indexOf(this._maximizeButton);

    cb.remove(this._maximizeButton);
    cb.addAt(this._restoreButton, v);
  }

  // finally focus the window
  this.focus();
}







/*
---------------------------------------------------------------------------
  EVENTS: WINDOW
---------------------------------------------------------------------------
*/

qx.Proto._onwindowmousedown = function(e)
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

    var l = qx.dom.DomLocation.getPageAreaLeft(pl);
    var t = qx.dom.DomLocation.getPageAreaTop(pl);
    var r = qx.dom.DomLocation.getPageAreaRight(pl);
    var b = qx.dom.DomLocation.getPageAreaBottom(pl);

    // handle frame and translucently
    switch(this.getResizeMethod())
    {
      case qx.ui.window.Window.MODE_TRANSLUCENT:
        this.setOpacity(0.5);
        break;

      case qx.ui.window.Window.MODE_FRAME:
        var f = this._frame;

        if (f.getParent() != this.getParent())
        {
          f.setParent(this.getParent());
          qx.ui.core.Widget.flushGlobalQueues();
        }

        f._applyRuntimeLeft(qx.dom.DomLocation.getPageBoxLeft(el) - l);
        f._applyRuntimeTop(qx.dom.DomLocation.getPageBoxTop(el) - t);

        f._applyRuntimeWidth(qx.dom.DomDimension.getBoxWidth(el));
        f._applyRuntimeHeight(qx.dom.DomDimension.getBoxHeight(el));

        f.setZIndex(this.getZIndex() + 1);

        break;
    }

    // create resize session
    var s = this._resizeSession = {};

    if (this._resizeWest)
    {
      s.boxWidth = qx.dom.DomDimension.getBoxWidth(el);
      s.boxRight = qx.dom.DomLocation.getPageBoxRight(el);
    }

    if (this._resizeWest || this._resizeEast)
    {
      s.boxLeft = qx.dom.DomLocation.getPageBoxLeft(el);

      s.parentAreaOffsetLeft = l;
      s.parentAreaOffsetRight = r;

      s.minWidth = this.getMinWidthValue();
      s.maxWidth = this.getMaxWidthValue();
    }

    if (this._resizeNorth)
    {
      s.boxHeight = qx.dom.DomDimension.getBoxHeight(el);
      s.boxBottom = qx.dom.DomLocation.getPageBoxBottom(el);
    }

    if (this._resizeNorth || this._resizeSouth)
    {
      s.boxTop = qx.dom.DomLocation.getPageBoxTop(el);

      s.parentAreaOffsetTop = t;
      s.parentAreaOffsetBottom = b;

      s.minHeight = this.getMinHeightValue();
      s.maxHeight = this.getMaxHeightValue();
    }
  }
  else
  {
    // cleanup resize session
    delete this._resizeSession;
  }
}

qx.Proto._onwindowmouseup = function(e)
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
      case qx.ui.window.Window.MODE_FRAME:
        var o = this._frame;
        if (!(o && o.getParent())) {
          break;
        }
        // no break here

      case qx.ui.window.Window.MODE_LAZYOPAQUE:
        if (qx.util.Validation.isValidNumber(s.lastLeft)) {
          this.setLeft(s.lastLeft);
        }

        if (qx.util.Validation.isValidNumber(s.lastTop)) {
          this.setTop(s.lastTop);
        }

        if (qx.util.Validation.isValidNumber(s.lastWidth)) {
          this.setWidth(s.lastWidth);
        }

        if (qx.util.Validation.isValidNumber(s.lastHeight)) {
          this.setHeight(s.lastHeight);
        }

        if (this.getResizeMethod() == qx.ui.window.Window.MODE_FRAME) {
          this._frame.setParent(null);
        }
        break;

      case qx.ui.window.Window.MODE_TRANSLUCENT:
        this.setOpacity(null);
        break;
    }

    // cleanup session
    delete this._resizeNorth;
    delete this._resizeEast;
    delete this._resizeSouth;
    delete this._resizeWest;

    delete this._resizeSession;
  }
}

qx.Proto._near = function(p, e) {
  return e > (p - 5) && e < (p + 5);
}

qx.Proto._onwindowmousemove = function(e)
{
  if (!this.getResizeable() || this.getMode() != null) {
    return;
  }

  var s = this._resizeSession;

  if (s)
  {
    if (this._resizeWest)
    {
      s.lastWidth = qx.lang.Number.limit(s.boxWidth + s.boxLeft - Math.max(e.getPageX(), s.parentAreaOffsetLeft), s.minWidth, s.maxWidth);
      s.lastLeft = s.boxRight - s.lastWidth - s.parentAreaOffsetLeft;
    }
    else if (this._resizeEast)
    {
      s.lastWidth = qx.lang.Number.limit(Math.min(e.getPageX(), s.parentAreaOffsetRight) - s.boxLeft, s.minWidth, s.maxWidth);
    }

    if (this._resizeNorth)
    {
      s.lastHeight = qx.lang.Number.limit(s.boxHeight + s.boxTop - Math.max(e.getPageY(), s.parentAreaOffsetTop), s.minHeight, s.maxHeight);
      s.lastTop = s.boxBottom - s.lastHeight - s.parentAreaOffsetTop;
    }
    else if (this._resizeSouth)
    {
      s.lastHeight = qx.lang.Number.limit(Math.min(e.getPageY(), s.parentAreaOffsetBottom) - s.boxTop, s.minHeight, s.maxHeight);
    }

    switch(this.getResizeMethod())
    {
      case qx.ui.window.Window.MODE_OPAQUE:
      case qx.ui.window.Window.MODE_TRANSLUCENT:
        if (this._resizeWest || this._resizeEast)
        {
          this.setWidth(s.lastWidth);

          if (this._resizeWest) {
            this.setLeft(s.lastLeft);
          }
        }

        if (this._resizeNorth || this._resizeSouth)
        {
          this.setHeight(s.lastHeight);

          if (this._resizeNorth) {
            this.setTop(s.lastTop);
          }
        }

        break;

      default:
        var o = this.getResizeMethod() == qx.ui.window.Window.MODE_FRAME ? this._frame : this;

        if (this._resizeWest || this._resizeEast)
        {
          o._applyRuntimeWidth(s.lastWidth);

          if (this._resizeWest) {
            o._applyRuntimeLeft(s.lastLeft);
          }
        }

        if (this._resizeNorth || this._resizeSouth)
        {
          o._applyRuntimeHeight(s.lastHeight);

          if (this._resizeNorth) {
            o._applyRuntimeTop(s.lastTop);
          }
        }
    }
  }
  else
  {
    var resizeMode = qx.constant.Core.EMPTY;
    var el = this.getElement();

    this._resizeNorth = this._resizeSouth = this._resizeWest = this._resizeEast = false;

    if (this._near(qx.dom.DomLocation.getPageBoxTop(el), e.getPageY()))
    {
      resizeMode = "n";
      this._resizeNorth = true;
    }
    else if (this._near(qx.dom.DomLocation.getPageBoxBottom(el), e.getPageY()))
    {
      resizeMode = "s";
      this._resizeSouth = true;
    }

    if (this._near(qx.dom.DomLocation.getPageBoxLeft(el), e.getPageX()))
    {
      resizeMode += "w";
      this._resizeWest = true;
    }
    else if (this._near(qx.dom.DomLocation.getPageBoxRight(el), e.getPageX()))
    {
      resizeMode += "e";
      this._resizeEast = true;
    }

    if (this._resizeNorth || this._resizeSouth || this._resizeWest || this._resizeEast)
    {
      this.setCursor(resizeMode + "-resize");
    }
    else
    {
      this.setCursor(null);
    }
  }

  e.preventDefault();
}







/*
---------------------------------------------------------------------------
  EVENTS: BUTTONS
---------------------------------------------------------------------------
*/

qx.Proto._onbuttonmousedown = function(e) {
  e.stopPropagation();
}

qx.Proto._onminimizebuttonclick = function(e)
{
  this.minimize();

  // we need to be sure that the button gets the right states after clicking
  // because the button will move and does not get the mouseup event anymore
  this._minimizeButton.removeState(qx.ui.form.Button.STATE_PRESSED);
  this._minimizeButton.removeState(qx.ui.form.Button.STATE_ABANDONED);
  this._minimizeButton.removeState(qx.ui.core.Widget.STATE_OVER);

  e.stopPropagation();
}

qx.Proto._onrestorebuttonclick = function(e)
{
  this.restore();

  // we need to be sure that the button gets the right states after clicking
  // because the button will move and does not get the mouseup event anymore
  this._restoreButton.removeState(qx.ui.form.Button.STATE_PRESSED);
  this._restoreButton.removeState(qx.ui.form.Button.STATE_ABANDONED);
  this._restoreButton.removeState(qx.ui.core.Widget.STATE_OVER);

  e.stopPropagation();
}

qx.Proto._onmaximizebuttonclick = function(e)
{
  this.maximize();

  // we need to be sure that the button gets the right states after clicking
  // because the button will move and does not get the mouseup event anymore
  this._maximizeButton.removeState(qx.ui.form.Button.STATE_PRESSED);
  this._maximizeButton.removeState(qx.ui.form.Button.STATE_ABANDONED);
  this._maximizeButton.removeState(qx.ui.core.Widget.STATE_OVER);

  e.stopPropagation();
}

qx.Proto._onclosebuttonclick = function(e)
{
  this.close();

  // we need to be sure that the button gets the right states after clicking
  // because the button will move and does not get the mouseup event anymore
  this._closeButton.removeState(qx.ui.form.Button.STATE_PRESSED);
  this._closeButton.removeState(qx.ui.form.Button.STATE_ABANDONED);
  this._closeButton.removeState(qx.ui.core.Widget.STATE_OVER);

  e.stopPropagation();
}







/*
---------------------------------------------------------------------------
  EVENTS: CAPTIONBAR
---------------------------------------------------------------------------
*/

qx.Proto._oncaptionmousedown = function(e)
{
  if (!e.isLeftButtonPressed() || !this.getMoveable() || this.getMode() != null) {
    return;
  }

  // enable capturing
  this._captionBar.setCapture(true);

  // element cache
  var el = this.getElement();

  // measuring and caching of values for drag session
  var pa = this.getParent();
  var pl = pa.getElement();

  var l = qx.dom.DomLocation.getPageAreaLeft(pl);
  var t = qx.dom.DomLocation.getPageAreaTop(pl);
  var r = qx.dom.DomLocation.getPageAreaRight(pl);
  var b = qx.dom.DomLocation.getPageAreaBottom(pl);

  this._dragSession =
  {
    offsetX : e.getPageX() - qx.dom.DomLocation.getPageBoxLeft(el) + l,
    offsetY : e.getPageY() - qx.dom.DomLocation.getPageBoxTop(el) + t,

    parentAvailableAreaLeft : l + 5,
    parentAvailableAreaTop : t + 5,
    parentAvailableAreaRight : r - 5,
    parentAvailableAreaBottom : b - 5
  }

  // handle frame and translucently
  switch(this.getMoveMethod())
  {
    case qx.ui.window.Window.MODE_TRANSLUCENT:
      this.setOpacity(0.5);
      break;

    case qx.ui.window.Window.MODE_FRAME:
      var f = this._frame;

      if (f.getParent() != this.getParent())
      {
        f.setParent(this.getParent());
        qx.ui.core.Widget.flushGlobalQueues();
      }

      f._applyRuntimeLeft(qx.dom.DomLocation.getPageBoxLeft(el) - l);
      f._applyRuntimeTop(qx.dom.DomLocation.getPageBoxTop(el) - t);

      f._applyRuntimeWidth(qx.dom.DomDimension.getBoxWidth(el));
      f._applyRuntimeHeight(qx.dom.DomDimension.getBoxHeight(el));

      f.setZIndex(this.getZIndex() + 1);

      break;
  }
}

qx.Proto._oncaptionmouseup = function(e)
{
  var s = this._dragSession;

  if (!s) {
    return;
  }

  // disable capturing
  this._captionBar.setCapture(false);

  // move window to last position
  if (qx.util.Validation.isValidNumber(s.lastX)) {
    this.setLeft(s.lastX);
  }

  if (qx.util.Validation.isValidNumber(s.lastY)) {
    this.setTop(s.lastY);
  }

  // handle frame and translucently
  switch(this.getMoveMethod())
  {
    case qx.ui.window.Window.MODE_TRANSLUCENT:
      this.setOpacity(null);
      break;

    case qx.ui.window.Window.MODE_FRAME:
      this._frame.setParent(null);
      break;
  }

  // cleanup session
  delete this._dragSession;
}

qx.Proto._oncaptionmousemove = function(e)
{
  var s = this._dragSession;

  // pre check for active session and capturing
  if (!s || !this._captionBar.getCapture()) {
    return;
  }

  // pre check if we go out of the available area
  if (!qx.lang.Number.isBetweenRange(e.getPageX(), s.parentAvailableAreaLeft, s.parentAvailableAreaRight) || !qx.lang.Number.isBetweenRange(e.getPageY(), s.parentAvailableAreaTop, s.parentAvailableAreaBottom)) {
    return;
  }

  // use the fast and direct dom methods
  var o = this.getMoveMethod() == qx.ui.window.Window.MODE_FRAME ? this._frame : this;

  o._applyRuntimeLeft(s.lastX = e.getPageX() - s.offsetX);
  o._applyRuntimeTop(s.lastY = e.getPageY() - s.offsetY);

  e.preventDefault();
}

qx.Proto._oncaptiondblblick = function()
{
  if (!this._maximizeButton.getEnabled()) {
    return;
  }

  return this.getMode() == qx.ui.window.Window.MODE_MAXIMIZED ? this.restore() : this.maximize();
}








/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return true;
  }

  if (this._layout)
  {
    this._layout.dispose();
    this._layout = null;
  }

  if (this._frame)
  {
    this._frame.dispose();
    this._frame = null;
  }

  if (this._captionBar)
  {
    this._captionBar.dispose();
    this._captionBar = null;
  }

  if (this._captionIcon)
  {
    this._captionIcon.dispose();
    this._captionIcon = null;
  }

  if (this._captionTitle)
  {
    this._captionTitle.dispose();
    this._captionTitle = null;
  }

  if (this._captionFlex)
  {
    this._captionFlex.dispose();
    this._captionFlex = null;
  }

  if (this._closeButton)
  {
    this._closeButton.dispose();
    this._closeButton = null;
  }

  if (this._minimizeButton)
  {
    this._minimizeButton.dispose();
    this._minimizeButton = null;
  }

  if (this._maximizeButton)
  {
    this._maximizeButton.dispose();
    this._maximizeButton = null;
  }

  if (this._restoreButton)
  {
    this._restoreButton.dispose();
    this._restoreButton = null;
  }

  if (this._pane)
  {
    this._pane.dispose();
    this._pane = null;
  }

  if (this._statusBar)
  {
    this._statusBar.dispose();
    this._statusBar = null;
  }

  if (this._statusText)
  {
    this._statusText.dispose();
    this._statusText = null;
  }

  return qx.ui.popup.Popup.prototype.dispose.call(this);
}
