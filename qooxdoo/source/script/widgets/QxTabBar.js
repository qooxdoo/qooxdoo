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

proto._layoutInternalWidgetsVertical = function(vHint) 
{
  var vLeftValues = [];
  var vWidthValues = [];
  var vLastLeft = 2;

  var ch = this.getChildren();
  var chl = ch.length;
  var chc;
  
  for (var i=0; i<chl; i++)
  {
    chc = ch[i];
    
    if (chc instanceof QxTab && chc.getVisible())
    {
      vWidthValues[i] = chc.getPreferredWidth();

      if (chc.getChecked())
      {
        vLeftValues[i] = vLastLeft - 2;
        vLastLeft += vWidthValues[i] - 4;
      }
      else
      {
        vLeftValues[i] = vLastLeft;
        vLastLeft += vWidthValues[i];
      };
    }; 
  };
  
  if (this.getAlignTabsToLeft())
  {
    for (var i=0; i<chl; i++)
    {
      chc = ch[i];
      
      if (chc instanceof QxTab && chc.getVisible())
      {
        chc.setRight(null);
        chc.setLeft(vLeftValues[i]);         
        chc.setWidth(vWidthValues[i]);
      };
    };  
  }
  else
  {
    for (var i=0; i<chl; i++)
    {
      chc = ch[i];
      
      if (chc instanceof QxTab && chc.getVisible())
      {
        chc.setLeft(null);
        chc.setRight(vLeftValues[i]);
        chc.setWidth(vWidthValues[i]);        
      };
    };  
  };
  
  
  if (this.getPlaceOnTop())
  {
    for (var i=0; i<chl; i++)
    {
      chc = ch[i];
      
      if (chc instanceof QxTab && chc.getVisible())
      {
        chc.setBottom(null);
        
        if (chc.getChecked())
        {
          chc.setTop(0);
          chc.setHeight(chc.getPreferredHeight() + 4);
        }
        else
        {
          chc.setTop(2);
          chc.setHeight("auto");
        };        
      };
    };    
  }
  else
  {
    for (var i=0; i<chl; i++)
    {
      chc = ch[i];
      
      if (chc instanceof QxTab && chc.getVisible())
      {
        chc.setTop(null);
        
        if (chc.getChecked())
        {
          chc.setBottom(0);
          chc.setHeight(chc.getPreferredHeight() + 4);
        }
        else
        {
          chc.setBottom(2);
          chc.setHeight("auto");
        };        
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

proto._onnewchild = function(otherObject)
{
  if (this.getHeight() == "auto") 
  {
    this._setChildrenDependHeight(otherObject, "append-child");
  }
  else
  {
    this._layoutInternalWidgetsVertical("append-child");
  };
};

proto._onremovechild = function(otherObject)
{
  if (this.getHeight() == "auto") 
  {
    this._setChildrenDependHeight(otherObject, "remove-child");
  }
  else
  {
    this._layoutInternalWidgetsVertical("remove-child");
  };
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





/*
  -------------------------------------------------------------------------------
    AUTO CALCULATOR
  -------------------------------------------------------------------------------
*/

proto._calculateChildrenDependHeight = function(vModifiedWidget, vHint) 
{
  var maxHeight = 0;

  var ch = this.getChildren();
  var chl = ch.length;
  
  for (var i=0; i<chl; i++) {
    maxHeight = Math.max(ch[i].getPreferredHeight(), maxHeight)
  };
  
  // TODO: this '4' should be calculated
  return maxHeight + 4;
};
