/* ****************************************************************************

   qooxdoo - the new era of web interface development

   Version:
     $Id$

   Copyright:
     (C) 2004-2005 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Authors:
     * Kent Olsson (kols)
       <kent dot olsson at chello dot se>

**************************************************************************** */

/* ****************************************************************************

#package(form)

**************************************************************************** */

function QxSplitPane(vOrientation)
{
  qx.ui.layout.BoxLayout.call(this, vOrientation);

  // ************************************************************************
  //   MOVE FRAME
  // ************************************************************************
  var f = this._frame = new qx.ui.basic.Terminator;
  f.setAppearance("splitpane-move-frame");

  // ***********************************************************************
  //   PANE 1
  // ***********************************************************************

  var p1 = this._firstWidget = new qx.ui.layout.CanvasLayout();

  this.setLeftWidget(p1);

  // ***********************************************************************
  //   SPLITTER BAR
  // ***********************************************************************

  var sb = this._bar = new qx.ui.layout.BoxLayout(vOrientation == QxConst.ORIENTATION_HORIZONTAL ? QxConst.ORIENTATION_VERTICAL : QxConst.ORIENTATION_HORIZONTAL);
  sb.setAppearance("splitpane-divider");

  switch(this.getOrientation())
  {
    case QxConst.ORIENTATION_HORIZONTAL :
      sb.setWidth(this.getDividerSize());
      break;

    case QxConst.ORIENTATION_VERTICAL :
      sb.setHeight(this.getDividerSize());
      break;
  };

  sb.addEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onbarmousedown, this);
  sb.addEventListener(QxConst.EVENT_TYPE_MOUSEUP, this._onbarmouseup, this);
  sb.addEventListener(QxConst.EVENT_TYPE_MOUSEMOVE, this._onbarmousemove, this);

  this.add(sb);

  // ***********************************************************************
  //   BUTTONS
  // ***********************************************************************
  var buttonLayout = this._buttonLayout = new qx.ui.layout.BoxLayout(this.getOrientation() == QxConst.ORIENTATION_HORIZONTAL ? QxConst.ORIENTATION_VERTICAL : QxConst.ORIENTATION_HORIZONTAL);
  buttonLayout.setHorizontalChildrenAlign(QxConst.ALIGN_CENTER);

  switch(this.getOrientation())
  {
    case QxConst.ORIENTATION_HORIZONTAL :
      this._minimizeImage = new qx.ui.basic.Image("widgets/arrows/left-divider.gif");
      this._maximizeImage = new qx.ui.basic.Image("widgets/arrows/right-divider.gif");
      this._restoreImage = new qx.ui.basic.Image("widgets/arrows/restore-horiz-divider.gif");
      break;

    case QxConst.ORIENTATION_VERTICAL :
      this._minimizeImage = new qx.ui.basic.Image("widgets/arrows/up-divider.gif");
      this._maximizeImage = new qx.ui.basic.Image("widgets/arrows/down-divider.gif");
      this._restoreImage = new qx.ui.basic.Image("widgets/arrows/restore-vert-divider.gif");
      break;
  };

  sb.add(buttonLayout);

  // ***********************************************************************
  //   BUTTONS: MINIMIZE
  // ***********************************************************************

  var minB = this._minimizeButton = new qx.ui.form.Button();
  minB.add(this._minimizeImage);
  minB.setAppearance("splitpane-button");
  minB.setTabIndex(-1);

  minB.addEventListener(QxConst.EVENT_TYPE_CLICK, this._onminimizebuttonclick, this);
  minB.addEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onbuttonmousedown, this);

  buttonLayout.add(minB);

  // ***********************************************************************
  //   BUTTONS: RESTORE
  // ***********************************************************************

  var restoreB = this._restoreButton = new qx.ui.form.Button();
  restoreB.add(this._restoreImage);
  restoreB.setAppearance("splitpane-button");
  restoreB.setTabIndex(-1);

  restoreB.addEventListener(QxConst.EVENT_TYPE_CLICK, this._onrestorebuttonclick, this);
  restoreB.addEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onbuttonmousedown, this);

  // ***********************************************************************
  //   BUTTONS: MAXIMIZE
  // ***********************************************************************

  var maxB = this._maximizeButton = new qx.ui.form.Button();
  maxB.add(this._maximizeImage);
  maxB.setAppearance("splitpane-button");
  maxB.setTabIndex(-1);

  maxB.addEventListener(QxConst.EVENT_TYPE_CLICK, this._onmaximizebuttonclick, this);
  maxB.addEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onbuttonmousedown, this);

  buttonLayout.add(maxB);

  // ***********************************************************************
  //   PANE 2
  // ***********************************************************************

  var p2 = this._secondWidget = new qx.ui.layout.CanvasLayout();

  this.setRightWidget(p2);
};

QxSplitPane.extend(qx.ui.layout.BoxLayout, "QxSplitPane");


/*
------------------------------------------------------------------------------------
  STRINGS
------------------------------------------------------------------------------------
*/

QxSplitPane.MODE_OPAQUE      = "opaque";
QxSplitPane.MODE_LAZYOPAQUE  = "lazyopaque";
QxSplitPane.MODE_BAR         = "bar";
QxSplitPane.MODE_TRANSLUCENT = "translucent";

/*
------------------------------------------------------------------------------------
  PROPERTIES
------------------------------------------------------------------------------------
*/

QxSplitPane.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "splitpane" });

/*!
  If the window is resizeable
*/
QxSplitPane.addProperty({ name : "allowMove", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true });

/*!
  The resize method to use
*/
QxSplitPane.addProperty({ name : "moveMethod", type : QxConst.TYPEOF_STRING, defaultValue : QxSplitPane.MODE_BAR, possibleValues : [ QxSplitPane.MODE_OPAQUE, QxSplitPane.MODE_LAZYOPAQUE, QxSplitPane.MODE_BAR, QxSplitPane.MODE_TRANSLUCENT ] });

/*!
  The resize method to use
*/
QxSplitPane.addProperty({ name : "dividerSize", type : QxConst.TYPEOF_NUMBER, defaultValue : 7 });

/*!
  The resize method to use
*/
QxSplitPane.addProperty({ name : "dividerLocation", type : QxConst.TYPEOF_NUMBER });

/*!
  The resize method to use
*/
QxSplitPane.addProperty({ name : "firstWidget", getAlias : ["getTopWidget", "getLeftWidget"], setAlias : ["setTopWidget", "setLeftWidget"], type : QxConst.TYPEOF_OBJECT });

/*!
  The resize method to use
*/
QxSplitPane.addProperty({ name : "maximumDividerLocation", type : QxConst.TYPEOF_NUMBER });

/*!
  The resize method to use
*/
QxSplitPane.addProperty({ name : "minimumDividerLocation", type : QxConst.TYPEOF_NUMBER, defaultValue : 0 });

/*!
  The resize method to use
*/
QxSplitPane.addProperty({ name : "oneTouchExpandable", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });

/*!
  The resize method to use
*/
QxSplitPane.addProperty({ name : "secondWidget", getAlias : ["getBottomWidget", "getRightWidget"], setAlias : ["setBottomWidget", "setRightWidget"], type : QxConst.TYPEOF_OBJECT });


/*
------------------------------------------------------------------------------------
  MODIFIERS
------------------------------------------------------------------------------------
*/

proto._modifyDividerLocation = function(propValue, propOldValue, propData)
{
  if(propValue >= this.getMinimumDividerLocation() && propValue <= this.getMaximumDividerLocation()) {
this.error("Value=" + propValue);
this.error("Width=" + this.getWidth() - propValue - this.getDividerSize());
    this._lastDividerLocation = propOldValue;

    switch(this.getOrientation())
    {
      case QxConst.ORIENTATION_HORIZONTAL :
this.error("Hereeeeeee");
        this.getFirstWidget().setWidth(propValue);
        this.getSecondWidget().setWidth(this.getWidth() - propValue - this.getDividerSize());
        break;

      case QxConst.ORIENTATION_VERTICAL :
        this.getFirstWidget().setHeight(propValue);
        this.getSecondWidget().setHeight(this.getHeight() - propValue - this.getDividerSize());
        break;
    };
  };

  return true;
};

proto._modifyDividerSize = function(propValue, propOldValue, propData)
{
  if(this.getOrientation() == QxConst.ORIENTATION_HORIZONTAL) {
    this._bar.setWidth(propValue);
  }
  else if(this.getOrientation() == QxConst.ORIENTATION_VERTICAL) {
    this._bar.setHeight(propValue);
  };

  return true;
};

proto._modifyFirstWidget = function(propValue, propOldValue, propData)
{
  if (propOldValue)
  {
    this.remove(propOldValue);

    if(this._leftWidget) {
      this._firstWidget.dispose();
      this._firstWidget = null;
    };
  };

  if (!propValue)
  {
    propValue = new qx.ui.layout.CanvasLayout();
  };

  this.addAtBegin(propValue);
  this._lastDividerLocation = propValue.getWidth();

//  if(!this.getMaximumDividerLocation())
//  {
//    this.setMaximumDividerLocation(this.getWidth() - this.getDividerSize());
//  };

  return true;
};

proto._modifyMaximumDividerLocation = function(propValue, propOldValue, propData)
{
  var maxValue;

  switch(this.getOrientation())
  {
    case QxConst.ORIENTATION_HORIZONTAL :
      maxValue = this.getWidth();
      break;

    case QxConst.ORIENTATION_VERTICAL :
      maxValue = this.getHeight();
      break;
  };

  if(propValue >= 0 && propValue <= (maxValue - this.getDividerSize()) && propValue >= this.getMinimumDividerLocation()) {
    return true;
  };

  return false;   
};

proto._modifyMinimumDividerLocation = function(propValue, propOldValue, propData)
{
  var minValue;

  if(this.getOrientation() == QxConst.ORIENTATION_HORIZONTAL) {
    minValue = this.getWidth();
  }
  else if(this.getOrientation() == QxConst.ORIENTATION_VERTICAL) {
    minValue = this.getHeight();
  };

  if(propValue >= 0 && propValue <= (maxValue - this.getDividerSize()) && propValue <= this.getMaximumDividerLocation()) {
    return true;
  };

  return false;
};

proto._modifySecondWidget = function(propValue, propOldValue, propData)
{
  if (propOldValue)
  {
    this.remove(propOldValue);

    if(this._secondWidget) {
      this._secondWidget.dispose();
      this._secondWidget = null;
    };
  };

  if (!propValue)
  {
    propValue = new qx.ui.layout.CanvasLayout();
  };

  this.addAtEnd(propValue);
  this._lastDividerLocation = this.getFirstWidget().getWidth();

  return true;
};


/*
------------------------------------------------------------------------------------
  EVENTS: SPLITTER BAR
------------------------------------------------------------------------------------
*/

proto._onbarmousedown = function(e)
{
  this._bar.focus();

  // enable capturing
  this._bar.setCapture(true);

  // activate global cursor
  this.getTopLevelWidget().setGlobalCursor(this._bar.getCursor());

  // caching element
  var el = this._bar.getElement();

  // measuring and caching of values for move session
  var pl = this.getElement();

  var l = qx.dom.DomLocation.getPageAreaLeft(pl);
  var t = qx.dom.DomLocation.getPageAreaTop(pl);
  var r = qx.dom.DomLocation.getPageAreaRight(pl);
  var b = qx.dom.DomLocation.getPageAreaBottom(pl);

  // handle frame and translucently
  switch(this.getMoveMethod())
  {
    case QxSplitPane.MODE_TRANSLUCENT:
      this._bar.setOpacity(0.5);
      break;

    case QxSplitPane.MODE_BAR:
      var f = this._frame;

      if (f.getParent() != this._bar.getParent())
      {
        f.setParent(this._bar.getParent());
        qx.ui.core.Widget.flushGlobalQueues();
      };

      f._applyRuntimeLeft(qx.dom.DomLocation.getPageBoxLeft(el) - l);
      f._applyRuntimeTop(qx.dom.DomLocation.getPageBoxTop(el) - t);

      f._applyRuntimeWidth(qx.dom.DomDimension.getBoxWidth(el));
      f._applyRuntimeHeight(qx.dom.DomDimension.getBoxHeight(el));

      f.setZIndex(this._bar.getZIndex() + 1);
      break;
  };

  // create move session
  var s = this._moveSession = {};

  switch(this.getOrientation())
  {
    case QxConst.ORIENTATION_HORIZONTAL :
      s.firstPageX = e.getPageX();

      s.boxWidth = qx.dom.DomDimension.getBoxWidth(el);
      s.boxLeft = qx.dom.DomLocation.getPageBoxLeft(el);

      s.parentAreaOffsetLeft = l;
      s.parentAreaOffsetRight = r;

      s.minPos = this.getMinimumDividerLocation() ? this.getMinimumDividerLocation() : 0;
      s.maxPos = this.getMaximumDividerLocation() ? this.getMaximumDividerLocation() : (r - l - s.boxWidth);
      break;

    case QxConst.ORIENTATION_VERTICAL :
      s.firstPageY = e.getPageY();

      s.boxHeight = qx.dom.DomDimension.getBoxHeight(el);
      s.boxTop = qx.dom.DomLocation.getPageBoxTop(el);

      s.parentAreaOffsetTop = t;
      s.parentAreaOffsetBottom = b;

      s.minPos = this.getMinimumDividerLocation() ? this.getMinimumDividerLocation() : 0;
      s.maxPos = this.getMaximumDividerLocation() ? this.getMaximumDividerLocation() : (b - t - s.boxHeight);
      break;
  };
};

proto._onbarmouseup = function(e)
{
  var s = this._moveSession;

  if (s)
  {
    // disable capturing
    this._bar.setCapture(false);

    // deactivate global cursor
    this._bar.getTopLevelWidget().setGlobalCursor(null);

    // sync sizes to bar
    switch(this.getMoveMethod())
    {
      case QxSplitPane.MODE_BAR:
        var obj = this._frame;

        if (!(obj && obj.getParent())) {
          break;
        };
        // no break here

      case QxSplitPane.MODE_LAZYOPAQUE:
        var firstWidget = this.getFirstWidget();
        var secondWidget = this.getSecondWidget();

        switch(this.getOrientation())
        {
          case QxConst.ORIENTATION_HORIZONTAL :
            this._lastDividerLocation = s.boxLeft;

            s.newPosition = s.boxLeft - s.parentAreaOffsetLeft + e.getPageX() - s.firstPageX;
            firstWidget.setWidth(s.newPosition.limit(s.minPos, s.maxPos));
            secondWidget.setWidth(s.parentAreaOffsetRight - s.parentAreaOffsetLeft - s.boxWidth - s.newPosition);
            break;

          case QxConst.ORIENTATION_VERTICAL :
            this._lastDividerLocation = s.boxTop;

            s.newPosition = s.boxTop - s.parentAreaOffsetTop + e.getPageY() - s.firstPageY;
            firstWidget.setHeight(s.newPosition.limit(s.minPos, s.maxPos));
            secondWidget.setHeight(s.parentAreaOffsetBottom - s.parentAreaOffsetTop - s.boxHeight - s.newPosition);
            break;
        };

        if (this.getMoveMethod() == QxSplitPane.MODE_BAR) {
          this._frame.setParent(null);
        };

        // Divider buttons
        this._buttonLayout.addAt(this._minimizeButton, 0);
        this._buttonLayout.addAt(this._maximizeButton, 1);

        if(this.getDividerLocation() == this._lastDividerLocation)
        {
          this._buttonLayout.remove(this._restoreButton);
        }
        else
        {
          this._buttonLayout.addAt(this._restoreButton, 2);
        };
        
        break;

      case QxSplitPane.MODE_TRANSLUCENT:
        this._bar.setOpacity(null);
        break;
    };

    this.setDividerLocation(this._lastDividerLocation);

    delete this._moveSession;
  };
};

proto._onbarmousemove = function(e)
{
  if (!this.getAllowMove()) {
    return;
  };

  var s = this._moveSession;

  if (s)
  {
    switch(this.getMoveMethod())
    {
      case QxSplitPane.MODE_OPAQUE:
      case QxSplitPane.MODE_TRANSLUCENT:
        switch(this.getOrientation())
        {
          case QxConst.ORIENTATION_HORIZONTAL :
            this._bar.setLeft((s.boxLeft - s.parentAreaOffsetLeft + e.getPageX() - s.firstPageX).limit(s.minPos, s.maxPos));
            break;

          case QxConst.ORIENTATION_VERTICAL :
            this._bar.setTop((s.boxTop - s.parentAreaOffsetTop + e.getPageY() - s.firstPageY).limit(s.minPos, s.maxPos));
            break;
        };
        break;

      default:
        var o = this.getMoveMethod() == QxSplitPane.MODE_BAR ? this._frame : this._bar;

        switch(this.getOrientation())
        {
          case QxConst.ORIENTATION_HORIZONTAL :
            o._applyRuntimeLeft((s.boxLeft - s.parentAreaOffsetLeft + e.getPageX() - s.firstPageX).limit(s.minPos, s.maxPos));
            break;

          case QxConst.ORIENTATION_VERTICAL :
            o._applyRuntimeTop((s.boxTop - s.parentAreaOffsetTop + e.getPageY() - s.firstPageY).limit(s.minPos, s.maxPos));
            break;
        };
    };
  }
  else
  {
    switch(this.getOrientation())
    {
      case QxConst.ORIENTATION_HORIZONTAL :
        this._bar.setCursor("w-resize");
        break;

      case QxConst.ORIENTATION_VERTICAL :
        this._bar.setCursor("n-resize");
        break;
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

  this._buttonLayout.remove(this._restoreButton);
  this._buttonLayout.addAt(this._restoreButton, 0);
  this._buttonLayout.addAt(this._maximizeButton, 1);
};

proto._onrestorebuttonclick = function(e) {
  this.restore();

  this._buttonLayout.remove(this._restoreButton);
  this._buttonLayout.addAt(this._minimizeButton, 0);
  this._buttonLayout.addAt(this._maximizeButton, 1);
};

proto._onmaximizebuttonclick = function(e)
{
  this.maximize();

  this._buttonLayout.addAt(this._minimizeButton, 0);
  this._buttonLayout.remove(this._restoreButton);
  this._buttonLayout.addAt(this._restoreButton, 1);
};


/*
------------------------------------------------------------------------------------
  UTILITY FUNCTIONS
------------------------------------------------------------------------------------
*/

proto.addLeft = function(vWidget) {
  this.getFirstWidget().add(vWidget);
};

proto.addTop = function(vWidget) {
  this.getFirstWidget().add(vWidget);
};

proto.addRight = function(vWidget) {
  this.getSecondWidget().add(vWidget);
};

proto.addBottom = function(vWidget) {
  this.getSecondWidget().add(vWidget);
};

proto.minimize = function() {
  this.setDividerLocation(0);
};

proto.maximize = function() {
  this.setDividerLocation(this.getMaximumDividerLocation() ? this.getMaximumDividerLocation() : (this.getWidth() - this.getDividerSize()));
};

proto.restore = function() {
  this.setDividerLocation(this._lastDividerLocation);
};


/*
------------------------------------------------------------------------------------
  DISPOSER
------------------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return true;
  };

  if (this._frame)
  {
    this._frame.dispose();
    this._frame = null;
  };

  if (this._bar)
  {
    this._bar.removeEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onbarmousedown, this);
    this._bar.removeEventListener(QxConst.EVENT_TYPE_MOUSEUP, this._onbarmouseup, this);
    this._bar.removeEventListener(QxConst.EVENT_TYPE_MOUSEMOVE, this._onbarmousemove, this);
    this._bar.dispose();
    this._bar = null;
  };

  if (this._buttonLayout) {
    this._buttonLayout.dispose();
    this._buttonLayout = null;
  };

  if (this._minimizeButton) {
    this._minimizeButton.removeEventListener(QxConst.EVENT_TYPE_CLICK, this._onminimizebuttonclick, this);
    this._minimizeButton.removeEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onbuttonmousedown, this);
    this._minimizeButton.dispose();
    this._minimizeButton = null;
  };

  if (this._maximizeButton) {
    this._maximizeButton.removeEventListener(QxConst.EVENT_TYPE_CLICK, this._onminimizebuttonclick, this);
    this._maximizeButton.removeEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onbuttonmousedown, this);
    this._maximizeButton.dispose();
    this._maximizeButton = null;
  };

  if (this._restoreButton) {
    this._restoreButton.removeEventListener(QxConst.EVENT_TYPE_CLICK, this._onminimizebuttonclick, this);
    this._restoreButton.removeEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onbuttonmousedown, this);
    this._restoreButton.dispose();
    this._restoreButton = null;
  };

  if (this._firstWidget)
  {
    this._firstWidget.dispose();
    this._firstWidget = null;
  };

  if (this._secondWidget)
  {
    this._secondWidget.dispose();
    this._secondWidget = null;
  };

  if(this._minimizeImage)
  {
    this._minimizeImage.dispose();
    this._minimizeImage = null;
  };

  if(this._maximizeImage)
  {
    this._maximizeImage.dispose();
    this._maximizeImage = null;
  };

  if(this._restoreImage)
  {
    this._restoreImage.dispose();
    this._restoreImage = null;
  };

  delete this._lastDividerLocation;

  return qx.ui.layout.BoxLayout.prototype.dispose.call(this);
};