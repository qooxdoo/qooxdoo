function QxTabBar()
{
  QxToolBar.call(this);

  this.setLeft(0);
  this.setRight(0);

  this._updatePlacement();
  this._updateAlignment();

  this._manager = new QxRadioButtonManager();
  this._manager.addEventListener("changeSelected", this._updatePage, this);
};

QxTabBar.extend(QxToolBar, "QxTabBar");

QxTabBar.addProperty({ name : "placeOnTop", type : Boolean, defaultValue : true });
QxTabBar.addProperty({ name : "alignTabsToLeft", type : Boolean, defaultValue : true });
QxTabBar.addProperty({ name : "activeTabHeightDiff", type : Number, defaultValue : 2 });
QxTabBar.addProperty({ name : "activeTabOverlay", type : Number, defaultValue : 2 });

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
  this._updateAlignment();
  return true;
};






/*
------------------------------------------------------------------------------------
  UPDATE
------------------------------------------------------------------------------------
*/

proto._updatePage = function(e)
{
  var oldTab = e.getOldValue();
  var newTab = e.getNewValue();

  if (oldTab && oldTab.getPage()) {
    oldTab.getPage().setVisible(false);
  };

  if (newTab && newTab.getPage()) {
    newTab.getPage().setVisible(true);
  };
  
  this._layoutInternalWidgetsVertical();
  this._layoutInternalWidgetsHorizontal();
};

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

proto._updateAlignment = function() {
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

proto._layoutInternalWidgetsHorizontal = function(vHint) 
{
  var vPane = this.getParent().getPane();
  
  if (!this.isCreated() || !vPane.isCreated()) {
    return true;
  };
  
  var vLastLeft = this.getAlignTabsToLeft() ? vPane.getComputedBorderLeft() : vPane.getComputedBorderRight();
  
  var ch = this.getChildren();
  var chl = ch.length;
  var chc;
  
  if (this.getAlignTabsToLeft())
  {
    var vReset = "setRight";
    var vSet = "setLeft";
  }
  else
  {
    var vReset = "setLeft";
    var vSet = "setRight";
  };  
  
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
        chc[vSet](vLastLeft - this.getActiveTabOverlay());
        vLastLeft += chc.getPreferredWidth() - (2 * this.getActiveTabOverlay());
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

  var vPaneBorder = this.getPlaceOnTop() ? vPane.getComputedBorderTop() : vPane.getComputedBorderBottom();
  var vActiveDiff = this.getActiveTabHeightDiff();

  var ch = this.getChildren();
  var chl = ch.length;
  var chc;  
  
  if (this.getPlaceOnTop())
  {
    var vReset = "setBottom";
    var vSet = "setTop";
  }
  else
  {
    var vReset = "setTop";
    var vSet = "setBottom";
  };
  
  for (var i=0; i<chl; i++)
  {
    chc = ch[i];
    
    if (chc instanceof QxTab && chc.getVisible())
    {
      chc[vReset](null);
      chc.setMinHeight(this._maxHeight);
      
      if (chc.getChecked())
      {
        chc[vSet](0);
        chc.setHeight(this._maxActiveHeight);
      }
      else
      {
        chc[vSet](vActiveDiff);
        chc.setHeight("auto");
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

proto._childOuterWidthChanged = function(vModifiedChild, vHint)
{
  if (!this._wasVisible) {
    return;
  };

  if (this.getWidth() == "auto")
  {
    return this._setChildrenDependWidth(vModifiedChild, vHint);
  }
  else
  {
    this._layoutInternalWidgetsHorizontal();
  };
};

proto._childOuterHeightChanged = function(vModifiedChild, vHint)
{
  if (!this._wasVisible) {
    return;
  };

  if (this.getHeight() == "auto")
  {
    return this._setChildrenDependHeight(vModifiedChild, vHint);
  }
  else
  {
    this._layoutInternalWidgetsVertical();
  };
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
  
  var vPaneBorder = this.getPlaceOnTop() ? vPane.getComputedBorderTop() : vPane.getComputedBorderBottom();

  var ch = this.getChildren();
  var chl = ch.length;
  
  var maxHeight = 0;
  for (var i=0; i<chl; i++) {
    maxHeight = Math.max(ch[i].getPreferredHeight(), maxHeight)
  };
  
  this._maxHeight = maxHeight;
  return this._maxActiveHeight = maxHeight + this.getActiveTabHeightDiff() + vPaneBorder;
};
