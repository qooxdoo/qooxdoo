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
  QxBoxLayout.call(this, vOrientation);

  // ************************************************************************
  //   MOVE FRAME
  // ************************************************************************
  var f = this._frame = new QxTerminator;
  f.setAppearance("splitpane-move-frame");

  // ***********************************************************************
  //   PANE 1
  // ***********************************************************************

  var p1 = this._leftWidget = new QxCanvasLayout();

  this.setLeftWidget(p1);

  // ***********************************************************************
  //   SPLITTER BAR
  // ***********************************************************************

  var sb = this._bar = new QxBoxLayout(vOrientation == QxConst.ORIENTATION_HORIZONTAL ? QxConst.ORIENTATION_VERTICAL : QxConst.ORIENTATION_HORIZONTAL);
  sb.setAppearance("splitpane-divider");

  if(this.getOrientation() == QxConst.ORIENTATION_HORIZONTAL) {
    sb.setWidth(this.getDividerSize());
    sb.setHorizontalChildrenAlign(QxConst.ALIGN_CENTER);
  }
  else if(this.getOrientation() == QxConst.ORIENTATION_VERTICAL) {
    sb.setHeight(this.getDividerSize());
    sb.setVerticalChildrenAlign(QxConst.ALIGN_MIDDLE);
  };

  sb.addEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onbarmousedown, this);
  sb.addEventListener(QxConst.EVENT_TYPE_MOUSEUP, this._onbarmouseup, this);
  sb.addEventListener(QxConst.EVENT_TYPE_MOUSEMOVE, this._onbarmousemove, this);

  this.add(sb);

  // ***********************************************************************
  //   BUTTONS
  // ***********************************************************************

  if(this.getOrientation() == QxConst.ORIENTATION_HORIZONTAL) {
    this._minimizeImage = new QxImage("widgets/arrows/left-divider.gif");
    this._maximizeImage = new QxImage("widgets/arrows/right-divider.gif");
    this._restoreImage = new QxImage("widgets/arrows/restore-horiz-divider.gif");
  }
  else if(this.getOrientation() == QxConst.ORIENTATION_VERTICAL) {
    this._minimizeImage = new QxImage("widgets/arrows/up-divider.gif");
    this._maximizeImage = new QxImage("widgets/arrows/down-divider.gif");
    this._restoreImage = new QxImage("widgets/arrows/restore-vert-divider.gif");
  };

  // ***********************************************************************
  //   BUTTONS: MINIMIZE
  // ***********************************************************************

  var minB = this._minimizeButton = new QxButton();
  minB.add(this._minimizeImage);
  minB.setAppearance("splitpane-button");
  minB.setTabIndex(-1);

  minB.addEventListener(QxConst.EVENT_TYPE_CLICK, this._onminimizebuttonclick, this);
  minB.addEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onbuttonmousedown, this);

  sb.add(minB);

  // ***********************************************************************
  //   BUTTONS: RESTORE
  // ***********************************************************************

  var restoreB = this._restoreButton = new QxButton();
  restoreB.add(this._restoreImage);
  restoreB.setAppearance("splitpane-button");
  restoreB.setTabIndex(-1);

  restoreB.addEventListener(QxConst.EVENT_TYPE_CLICK, this._onrestorebuttonclick, this);
  restoreB.addEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onbuttonmousedown, this);

  // ***********************************************************************
  //   BUTTONS: MAXIMIZE
  // ***********************************************************************

  var maxB = this._maximizeButton = new QxButton();
  maxB.add(this._maximizeImage);
  maxB.setAppearance("splitpane-button");
  maxB.setTabIndex(-1);

  maxB.addEventListener(QxConst.EVENT_TYPE_CLICK, this._onmaximizebuttonclick, this);
  maxB.addEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onbuttonmousedown, this);

  sb.add(maxB);

  // ***********************************************************************
  //   PANE 2
  // ***********************************************************************

  var p2 = this._rightWidget = new QxCanvasLayout();

  this.setRightWidget(p2);
};

QxSplitPane.extend(QxBoxLayout, "QxSplitPane");


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
QxSplitPane.addProperty({ name : "moveMethod", type : QxConst.TYPEOF_STRING, defaultValue : "bar", possibleValues : [ QxSplitPane.MODE_OPAQUE, QxSplitPane.MODE_LAZYOPAQUE, QxSplitPane.MODE_BAR, QxSplitPane.MODE_TRANSLUCENT ] });

/*!
  The resize method to use
*/
QxSplitPane.addProperty({ name : "dividerLocation", type : QxConst.TYPEOF_NUMBER });

/*!
  The resize method to use
*/
QxSplitPane.addProperty({ name : "dividerSize", type : QxConst.TYPEOF_NUMBER, defaultValue : 7 });

/*!
  The resize method to use
*/
QxSplitPane.addProperty({ name : "leftWidget", getAlias : "getTopWidget", setAlias : "setTopWidget", type : QxConst.TYPEOF_OBJECT });

/*!
  The resize method to use
*/
QxSplitPane.addProperty({ name : "maximumDividerLocation", type : QxConst.TYPEOF_NUMBER });

/*!
  The resize method to use
*/
QxSplitPane.addProperty({ name : "minimumDividerLocation", type : QxConst.TYPEOF_NUMBER });

/*!
  The resize method to use
*/
QxSplitPane.addProperty({ name : "oneTouchExpandable", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });

/*!
  The resize method to use
*/
QxSplitPane.addProperty({ name : "rightWidget", getAlias : "getBottomWidget", setAlias : "setBottomWidget", type : QxConst.TYPEOF_OBJECT });


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
  MODIFIERS
------------------------------------------------------------------------------------
*/

proto._modifyDividerLocation = function(propValue, propOldValue, propData)
{
  if(propValue >= this.getMinimumDividerLocation() && propValue <= this.getMaximumDividerLocation()) {
    if(this.getOrientation() == QxConst.ORIENTATION_HORIZONTAL) {
      this.getLeftWidget().setWidth(propValue);
      this.getRightWidget().setWidth(this.Width() - propValue - this.getDividerSize());
    }
    else if(this.getOrientation() == QxConst.ORIENTATION_VERTICAL) {
      this.getTopWidget().setHeight(propValue);
      this.getBottomWidget().setHeight(this.Height() - propValue - this.getDividerSize());
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

proto._modifyLeftWidget = function(propValue, propOldValue, propData)
{
  if (propOldValue)
  {
    this.remove(propOldValue);

    if(this._leftWidget) {
      this._leftWidget.dispose();
      this._leftWidget = null;
    };

    this._lastDividerLocation = propValue.getWidth();
  };

  if (propValue)
  {
    this.addAtBegin(propValue);
  };

  return true;
};

proto._modifyMaximumDividerLocation = function(propValue, propOldValue, propData)
{
  var maxValue;

  if(this.getOrientation() == QxConst.ORIENTATION_HORIZONTAL) {
    maxValue = this.getWidth();
  }
  else if(this.getOrientation() == QxConst.ORIENTATION_VERTICAL) {
    maxValue = this.getHeight();
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

proto._modifyRightWidget = function(propValue, propOldValue, propData)
{
  if (propOldValue)
  {
    this.remove(propOldValue);

    if(this._rightWidget) {
      this._rightWidget.dispose();
      this._rightWidget = null;
    };

    this._lastDividerLocation = propValue.getWidth();
  };

  if (propValue)
  {
    this.addAtEnd(propValue);
  };

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

  if (this._moveNorth || this._moveSouth || this._moveWest || this._moveEast)
  {
    // enable capturing
    this._bar.setCapture(true);

    // activate global cursor
    this._bar.getTopLevelWidget().setGlobalCursor(this._bar.getCursor());

    // caching element
    var el = this._bar.getElement();

    // measuring and caching of values for move session
    var pl = this.getElement();

    var l = QxDom.getComputedPageAreaLeft(pl);
    var t = QxDom.getComputedPageAreaTop(pl);
    var r = QxDom.getComputedPageAreaRight(pl);
    var b = QxDom.getComputedPageAreaBottom(pl);

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
        };

        f._applyRuntimeLeft(QxDom.getComputedPageBoxLeft(el) - l);
        f._applyRuntimeTop(QxDom.getComputedPageBoxTop(el) - t);

        f._applyRuntimeWidth(QxDom.getComputedBoxWidth(el));
        f._applyRuntimeHeight(QxDom.getComputedBoxHeight(el));

        f.setZIndex(this._bar.getZIndex() + 1);
        break;
    };

    // create move session
    var s = this._moveSession = {};

    if (this._moveWest || this._moveEast)
    {
      s.boxWidth = QxDom.getComputedBoxWidth(el);

      s.parentAreaOffsetLeft = l;
      s.parentAreaOffsetRight = r;

      s.minWidth = this.getMinimumDividerLocation() ? this.getMinimumDividerLocation() : 0;
      s.maxWidth = this.getMaximumDividerLocation() ? this.getMaximumDividerLocation() : (r -l - this.getDividerSize());
    }
    else if (this._moveNorth || this._moveSouth)
    {
      s.boxHeight = QxDom.getComputedBoxHeight(el);

      s.parentAreaOffsetTop = t;
      s.parentAreaOffsetBottom = b;

      s.minHeight = this.getMinimumDividerLocation() ? this.getMinimumDividerLocation() : 0;
      s.maxHeight = this.getMaximumDividerLocation() ? this.getMaximumDividerLocation() : (b - t - this.getDividerSize());
    };
  }
  else
  {
    // cleanup move session
    delete this._moveSession;
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
        var o = this._frame;

        if (!(o && o.getParent())) {
          break;
        };
        // no break here

      case QxSplitPane.MODE_LAZYOPAQUE:
        if (QxUtil.isValidNumber(s.lastPosition)) {
          var leftWidget = topWidget = this.getLeftWidget();
          var rightWidget = bottomWidget = this.getRightWidget();

          if(this._moveWest || this._moveEast) {
            this._lastDividerLocation = leftWidget.getWidth();

            leftWidget.setWidth(s.lastPosition);
            rightWidget.setWidth(s.parentAreaOffsetRight - s.parentAreaOffsetLeft - s.lastPosition - s.boxWidth);
          }
          else if(this._moveNorth || this._moveSouth) {
            this._lastDividerLocation = topWidget.getHeight();

            topWidget.setHeight(s.lastPosition);
            bottomWidget.setHeight(s.parentAreaOffsetBottom - s.parentAreaOffsetTop - s.lastPosition - s.boxHeight);
          };
        };

        if (this.getMoveMethod() == QxSplitPane.MODE_BAR) {
          this._frame.setParent(null);
        };

        if(this._moveWest || this._moveNorth) {
          this._bar.remove(this._minimizeButton);
          this._bar.addAt(this._restoreButton, 0);
          this._bar.addAt(this._maximizeButton, 1);
        }
        else if(this._moveEast || this._moveSouth) {
          this._bar.addAt(this._minimizeButton, 0);
          this._bar.remove(this._maximizeButton);
          this._bar.addAt(this._restoreButton, 1);
        };
        break;

      case QxSplitPane.MODE_TRANSLUCENT:
        this._bar.setOpacity(null);
        break;
    };

    // cleanup session
    delete this._moveNorth;
    delete this._moveEast;
    delete this._moveSouth;
    delete this._moveWest;

    delete this._moveSession;
  };
};

proto._near = function(p, e) {
  var dividerSize = this.getDividerSize();

  return e > (p - dividerSize) && e < (p + dividerSize);
};

proto._onbarmousemove = function(e)
{
  if (!this.getAllowMove()) {
    return;
  };

  var s = this._moveSession;

  if (s)
  {
    if (this._moveWest || this._moveEast)
    {
      s.lastPosition = (e.getPageX() - s.parentAreaOffsetLeft).limit(s.boxWidth, s.maxWidth);
    }
    else if (this._moveNorth || this._moveSouth)
    {
      s.lastPosition = Math.min(e.getPageY() - s.parentAreaOffsetTop).limit(s.minHeight, s.maxHeight);
    };

    switch(this.getMoveMethod())
    {
      case QxSplitPane.MODE_OPAQUE:
      case QxSplitPane.MODE_TRANSLUCENT:
        if (this._moveWest || this._moveEast)
        {
          this._bar.setLeft(s.lastPosition);
        }
        else if (this._moveNorth || this._moveSouth)
        {
          this._bar.setTop(s.lastPosition);
        };
        break;

      default:
        var o = this.getMoveMethod() == QxSplitPane.MODE_BAR ? this._frame : this._bar;

        if (this._moveWest || this._moveEast)
        {
          o._applyRuntimeLeft(s.lastPosition);
        } 
        else if (this._moveNorth || this._moveSouth)
        {
          o._applyRuntimeTop(s.lastPosition);
       };
    };
  }
  else
  {
    var moveMode = QxConst.CORE_EMPTY;
    var el = this._bar.getElement();

    this._moveNorth = this._moveSouth = this._moveWest = this._moveEast = false;

    if (this._near(QxDom.getComputedPageBoxTop(el), e.getPageY()))
    {
      moveMode = "n";
      this._moveNorth = true;
    }
    else if (this._near(QxDom.getComputedPageBoxBottom(el), e.getPageY()))
    {
      moveMode = "s";
      this._moveSouth = true;
    }
    else if (this._near(QxDom.getComputedPageBoxLeft(el), e.getPageX()))
    {
      moveMode = "w";
      this._moveWest = true;
    }
    else if (this._near(QxDom.getComputedPageBoxRight(el), e.getPageX()))
    {
      moveMode = "e";
      this._moveEast = true;
    };

    if (this._moveNorth || this._moveSouth || this._moveWest || this._moveEast)
    {
      this._bar.setCursor(moveMode + "-resize");
    }
    else
    {
      this._bar.setCursor(null);
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

  this._bar.remove(this._minimizeButton);
  this._bar.addAt(this._restoreButton, 0);
  this._bar.addAt(this._maximizeButton, 1);
};

proto._onrestorebuttonclick = function(e) {
  this.restore();

  this._bar.remove(this._restoreButton);
  this._bar.addAt(this._minimizeButton, 0);
  this._bar.addAt(this._maximizeButton, 1);
};

proto._onmaximizebuttonclick = function(e)
{
  this.maximize();

  this._bar.addAt(this._minimizeButton, 0);
  this._bar.remove(this._maximizeButton);
  this._bar.addAt(this._restoreButton, 1);
};


/*
------------------------------------------------------------------------------------
  UTILITY FUNCTIONS
------------------------------------------------------------------------------------
*/

proto.addLeft = function(vWidget) {
  this.getLeftWidget().add(vWidget);
};

proto.addTop = function(vWidget) {
  this.getTopWidget().add(vWidget);
};

proto.addRight = function(vWidget) {
  this.getRightWidget().add(vWidget);
};

proto.addBottom = function(vWidget) {
  this.getBottomWidget().add(vWidget);
};

proto.minimize = function() {
  if(this.getOrientation() == QxConst.ORIENTATION_HORIZONTAL) {
    this.getLeftWidget().setWidth(0);
    this.getRightWidget().setWidth(this.getWidth() - this.getDividerSize());
  }
  else if(this.getOrientation() == QxConst.ORIENTATION_VERTICAL) {
    this.getTopWidget().setHeight(0);
    this.getBottomWidget().setHeight(this.getHeight() - this.getDividerSize());
  };
};

proto.maximize = function() {
  if(this.getOrientation() == QxConst.ORIENTATION_HORIZONTAL) {
    this.getLeftWidget().setWidth(this.getWidth() - this.getDividerSize());
    this.getRightWidget().setWidth(0);
  }
  else if(this.getOrientation() == QxConst.ORIENTATION_VERTICAL) {
    this.getTopWidget().setHeight(this.getHeight() - this.getDividerSize());
    this.getBottomWidget().setHeight(0);
  };
};

proto.restore = function() {
  if(this.getOrientation() == QxConst.ORIENTATION_HORIZONTAL) {
    this.getLeftWidget().setWidth(this._lastDividerLocation);
    this.getRightWidget().setWidth(this.getWidth() - this._lastDividerLocation - this.getDividerSize());
  }
  else if(this.getOrientation() == QxConst.ORIENTATION_VERTICAL) {
    this.getTopWidget().setHeight(this._lastDividerLocation);
    this.getBottomWidget().setHeight(this.getHeight() - this._lastDividerLocation - this.getDividerSize());
  };
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

  if (this._minimizeButton) {
    this._minimizeButton.removeEventListener(QxConst.EVENT_TYPE_EXECUTE, this._onminimizebuttonclick, this);
    this._minimizeButton.dispose();
    this._minimizeButton = null;
  };

  if (this._maximizeButton) {
    this._maximizeButton.removeEventListener(QxConst.EVENT_TYPE_EXECUTE, this._onmaximizebuttonclick, this);
    this._maximizeButton.dispose();
    this._maximizeButton = null;
  };

  if (this._leftWidget)
  {
    this._leftWidget.dispose();
    this._leftWidget = null;
  };

  if (this._rightWidget)
  {
    this._rightWidget.dispose();
    this._rightWidget = null;
  };

  return QxBoxLayout.prototype.dispose.call(this);
};