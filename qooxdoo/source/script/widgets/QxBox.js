function QxBox()
{
  QxWidget.call(this);
  
  
  
};

QxBox.extend(QxWidget, "QxBox");

/*
  Alignment of box content
  
  Possible values: left|top, center, right|bottom
*/
QxBox.addProperty({ name : "align", type : String, defaultValue : "left" });

/*!
  Orientation of box
  
  Possible values: horizontal or vertical
*/
QxBox.addProperty({ name : "orient", type : String, defaultValue : "horizontal" });

/*!
  This describes how to layout the controls when there are no flexing children and there is any remaining space. 

  Possible values are: start, center, end
*/
QxBox.addProperty({ name : "align", type : String });




/*
------------------------------------------------------------------------------------
  BASICS

  Extend this core functions of QxWidget.
------------------------------------------------------------------------------------
*/

proto._onnewchild = function(otherObject)
{
  if (this.getWidth() == "auto")
  {
    this._setChildrenDependWidth(otherObject, "append-child");
  }
  else
  {
    this._layoutInternalWidgetsHorizontal("append-child");
  };

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
  if (this.getWidth() == "auto")
  {
    this._setChildrenDependWidth(otherObject, "remove-child");
  }
  else
  {
    this._layoutInternalWidgetsHorizontal("remove-child");
  };

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

proto._innerWidthChanged = function()
{
  // Invalidate internal cache
  this._invalidateInnerWidth();
  
  // Update placement of children
  this._layoutInternalWidgetsHorizontal("inner-width")
};


proto._innerHeightChanged = function()
{
  // Invalidate internal cache
  this._invalidateInnerHeight();

  // Update placement of children
  this._layoutInternalWidgetsVertical("inner-height")
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
  
  this.debug("CHILD_OUTER_WIDTH: " + vModifiedChild + " : " + vHint + " :: " + vModifiedChild.getPreferredWidth());

  switch(vHint)
  {
    case "position-and-size":
    case "position":
      break;

    default:
      if (this.getWidth() == "auto")
      {
        return this._setChildrenDependWidth(vModifiedChild, vHint);
      }
      else
      {
        this._layoutInternalWidgetsHorizontal(vHint);
      };
  };

  // new, inherit from widget
  QxWidget.prototype._childOuterWidthChanged.call(this, vModifiedChild, vHint);
};

proto._childOuterHeightChanged = function(vModifiedChild, vHint)
{
  if (!this._wasVisible) {
    return;
  };

  switch(vHint)
  {
    case "position-and-size":
    case "position":
      break;

    default:
      if (this.getHeight() == "auto")
      {
        return this._setChildrenDependHeight(vModifiedChild, vHint);
      }
      else
      {
        this._layoutInternalWidgetsVertical(vHint);
      };
  };

  // new, inherit from widget
  QxWidget.prototype._childOuterHeightChanged.call(this, vModifiedChild, vHint);
};















proto._layoutInternalWidgetsHorizontal = function()
{
  var inner = this.getInnerWidth();
  
  var sum = 0;
  
  var ch = this.getChildren();
  var chl = ch.length;
  var chc;
  var w;
  var p = [];
  
  for (var i=0; i<chl; i++)
  {
    chc = ch[i];
    
    p.push(sum);
    
    w = chc.getWidth();
    
    if (w == "auto" || w == null)
    {
      if (chc.isCreated())
      {
        w = chc.getPreferredWidth() || chc.getComputedBoxWidth() || 0;
      }
      else
      {
        w = 0;
      };
    };
    
    // this.debug("Width[" + chc + "]:" + w);
    
    sum += w;   
  };
    
  this.debug("Positions: " + p);
  
  var startpos = 0;
  
  switch(this.getAlign())
  {
    case "left":
      break;
      
    case "center":
      startpos = (inner - sum) / 2;
      break;
      
    case "right":
      startpos = inner - sum;
      break;
  };


  for (var i=0; i<chl; i++)
  {
    chc = ch[i];

    chc.setLeft(startpos + p[i]);    
  };

  
  
};



proto._layoutInternalWidgetsVertical = function()
{


};











proto._checkAlign = function(propValue, propOldValue, propName, uniqModIds)
{
  if (this.getOrient() == "horizontal")
  {
    switch(propValue)
    {
      case "left":  
      case "right":
      
      case "center":
        return propValue;
        
      default:
        throw new Error("Unallowed alignment for QxBox with orientation: " + this.getOrient());      
    };
  }
  else
  {
    switch(propValue)
    {
      case "top":  
      case "bottom":
      
      case "center":
        return propValue;
        
      default:
        throw new Error("Unallowed alignment for QxBox with orientation: " + this.getOrient());      
    };    
  };
};


proto._modifyAlign = function(propValue, propOldValue, propName, uniqModIds)
{
  this._layoutInternalWidgetsHorizontal();
  return true;
};