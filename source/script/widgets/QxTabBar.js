function QxTabBar()
{
  QxWidget.call(this);

  this.setLeft(0);
  this.setRight(0);
  
  this.setHeight("auto");

  this._updatePlacement();
  this._updateState();

  this._manager = new QxRadioButtonManager();
  this._manager.addEventListener("changeSelected", this._onchange, this);
};

QxTabBar.extend(QxWidget, "QxTabBar");





/*
------------------------------------------------------------------------------------
  PROPERTIES
------------------------------------------------------------------------------------
*/

QxTabBar.addProperty({ name : "placeOnTop", type : Boolean, defaultValue : true });
QxTabBar.addProperty({ name : "alignTabsToLeft", type : Boolean, defaultValue : true });
QxTabBar.addProperty({ name : "activeTabHeightDiff", type : Number, defaultValue : 2 });
QxTabBar.addProperty({ name : "activeTabOverlap", type : Number, defaultValue : 2 });





/*
------------------------------------------------------------------------------------
  UTILITY
------------------------------------------------------------------------------------
*/

proto.getManager = function() {
  return this._manager;
};






/*
------------------------------------------------------------------------------------
  MODIFIERS
------------------------------------------------------------------------------------
*/

proto._modifyPlaceOnTop = function(propValue, propOldValue, propName, uniqModIds)
{
  this.getParent().setPlaceBarOnTop(propValue, uniqModIds);
  this._updatePlacement();

  return true;
};

proto._modifyAlignTabsToLeft = function(propValue, propOldValue, propName, uniqModIds)
{
  this._updateState();
  
  return true;
};



/*
------------------------------------------------------------------------------------
  EVENTS
------------------------------------------------------------------------------------
*/

proto._onchange = function(e) {
  this._layoutInternalWidgets("change-active-tab");
};





/*
------------------------------------------------------------------------------------
  UPDATE
------------------------------------------------------------------------------------
*/

proto._updatePlacement = function()
{
  if (this.getPlaceOnTop())
  {
    this.setBottom(null);
    this.setTop(0);
  }
  else
  {
    this.setTop(null);
    this.setBottom(0);
  };

  this._updateState();
};

proto._updateState = function() {
  this.setState((this.getPlaceOnTop() ? "top" : "bottom") + (this.getAlignTabsToLeft() ? "Left" : "Right"));
};






/*
------------------------------------------------------------------------------------
  LAYOUTER
------------------------------------------------------------------------------------
*/

proto._layoutInternalWidgets = function(vHint) 
{
  this._layoutInternalWidgetsHorizontal(vHint);
  this._layoutInternalWidgetsVertical(vHint);
};

proto._layoutInternalWidgetsHorizontal = function(vHint)
{
  // "position" will be called if we move a child
  // we move the child here, so we don't need to handle this.
  if (!isValidString(vHint) || vHint == "position") {
    return;
  };

  var vPane = this.getParent().getPane();

  if (!this.isCreated() || !vPane.isCreated()) {
    return true;
  };
  
  // this could be used for implemented scrolling buttons
  // var vFull = this.getComputedBoxWidth();
  
  if (this.getAlignTabsToLeft())
  {
    var vReset = "setRight";
    var vSet = "setLeft";
    var vLastLeft = vPane.getComputedBorderLeft();
  }
  else
  {
    var vReset = "setLeft";
    var vSet = "setRight";
    var vLastLeft = vPane.getComputedBorderRight();
  };

  var ch = this.getChildren();
  var chl = ch.length;
  var chc;
  
  for (var i=0; i<chl; i++)
  {
    chc = ch[i];

    if (chc instanceof QxTab && chc.getVisible())
    {
      // wait for all things to load up correclty (means QxTab with images, ...)
      if (chc.getPreferredWidth() == null) {
        return true;
      };

      chc[vReset](null);

      if (chc.getChecked())
      {
        chc[vSet](vLastLeft - this.getActiveTabOverlap());
        vLastLeft += chc.getPreferredWidth() - (2 * this.getActiveTabOverlap());
      }
      else
      {
        chc[vSet](vLastLeft);
        vLastLeft += chc.getPreferredWidth();
      };
    };
  };
};

proto._layoutInternalWidgetsVertical = function(vHint)
{
  var vPane = this.getParent().getPane();

  if (!this.isCreated() || !vPane.isCreated()) {
    return true;
  };
  
  var vActiveDiff = this.getActiveTabHeightDiff();
  var vMax = this._maxHeight;
  var vActiveMax = this._maxActiveHeight;

  if (this.getPlaceOnTop())
  {
    var vReset = "setBottom";
    var vSet = "setTop";
    var vPaneBorder = vPane.getComputedBorderTop();
  }
  else
  {
    var vReset = "setTop";
    var vSet = "setBottom";
    var vPaneBorder = vPane.getComputedBorderBottom();
  };

  var ch = this.getChildren();
  var chl = ch.length;
  var chc;

  for (var i=0; i<chl; i++)
  {
    chc = ch[i];

    if (chc instanceof QxTab && chc.getVisible())
    {
      chc[vReset](null);

      if (chc.getChecked())
      {
        chc[vSet](0);
        chc.setHeight(vActiveMax);
      }
      else
      {
        chc[vSet](vActiveDiff);
        chc.setHeight("auto");
        chc.setMinHeight(vMax);
      };
    };
  };
};






/*
------------------------------------------------------------------------------------
  BASICS

  Extend this core functions of QxWidget.
------------------------------------------------------------------------------------
*/

proto._onnewchild = function(otherObject) {
  this._layoutInternalWidgetsHorizontal("append-child");
};

proto._onremovechild = function(otherObject) {
  this._layoutInternalWidgetsHorizontal("remove-child");
};




/*
------------------------------------------------------------------------------------
  RENDERER: INNER DIMENSION SIGNAL

  should be called always when the inner dimension have been modified
------------------------------------------------------------------------------------
*/

proto._innerHeightChanged = function()
{
  // Invalidate internal cache
  this._invalidateInnerHeight();

  // Update placement of icon and text
  this._layoutInternalWidgetsVertical("inner-height");
};

proto._innerWidthChanged = function()
{
  // Invalidate internal cache
  this._invalidateInnerWidth();

  // Update placement of icon and text
  this._layoutInternalWidgetsHorizontal("inner-width");
};






/*
------------------------------------------------------------------------------------
  RENDERER: OUTER DIMENSION SIGNAL

  should be called always when the outer dimensions have been modified
------------------------------------------------------------------------------------
*/

proto._childOuterWidthChanged = function(vModifiedChild, vHint) {
  return !this._wasVisible ? true : this.getWidth() == "auto" ? this._setChildrenDependWidth(vModifiedChild, vHint) : this._layoutInternalWidgetsHorizontal(vHint);
};

proto._childOuterHeightChanged = function(vModifiedChild, vHint) {
  return !this._wasVisible ? true : this.getHeight() == "auto" ? this._setChildrenDependHeight(vModifiedChild, vHint) : this._layoutInternalWidgetsVertical(vHint);
};





/*
  -------------------------------------------------------------------------------
    AUTO CALCULATOR
  -------------------------------------------------------------------------------
*/

proto._maxHeight = 0;
proto._maxActiveHeight = 0;

proto._calculateChildrenDependHeight = function(vModifiedWidget, vHint)
{
  var vPane = this.getParent().getPane();

  if (!vPane.isCreated()) {
    return null;
  };

  var ch = this.getChildren();
  var chl = ch.length;

  var maxHeight = 0;
  for (var i=0; i<chl; i++) {
    maxHeight = Math.max(ch[i].getPreferredHeight(), maxHeight)
  };

  this._maxHeight = maxHeight;
  return this._maxActiveHeight = maxHeight + this.getActiveTabHeightDiff() + (this.getPlaceOnTop() ? vPane.getComputedBorderTop() : vPane.getComputedBorderBottom());
};




/*
  -------------------------------------------------------------------------------
    DISPOSER
  -------------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };
  
  if (this._manager)
  {
    this._manager.dispose();
    this._manager = null;
  };
  
  this._maxHeight = this._maxActiveHeight = null;
  
  QxWidget.prototype.dispose.call(this);
};