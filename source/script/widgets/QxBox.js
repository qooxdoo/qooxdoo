function QxBox()
{
  QxWidget.call(this);
  
  
  
};

QxBox.extend(QxWidget, "QxBox");

/*
  Horizontal alignment of box content block (if orientation==horizontal)
  
  Possible values: left, center, right
*/
QxBox.addProperty({ name : "horizontalBlockAlign", type : String, defaultValue : "left" });

/*
  Vertical alignment of box content block (if orientation==vertical)
  
  Possible values: top, middle, bottom
*/
QxBox.addProperty({ name : "verticalBlockAlign", type : String, defaultValue : "top" });

/*!
  Orientation of box
  
  Possible values: horizontal or vertical
*/
QxBox.addProperty({ name : "orientation", type : String, defaultValue : "horizontal" });


//QxBox.addProperty({ name : "verti



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
    
    w += chc.getMarginLeft() + chc.getMarginRight();
    
    // this.debug("Width[" + chc + "]:" + w);
    
    sum += w;   
  };
    
  this.debug("Positions: " + p);
  
  var startpos = 0;
  
  switch(this.getHorizontalBlockAlign())
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




















proto._modifyHorizontalBlockAlign = function(propValue, propOldValue, propName, uniqModIds)
{
  this._layoutInternalWidgetsHorizontal();
  this._layoutInternalWidgetsVertical();
  
  return true;
};

proto._modifyVerticalBlockAlign = function(propValue, propOldValue, propName, uniqModIds)
{
  this._layoutInternalWidgetsHorizontal();
  this._layoutInternalWidgetsVertical();
  
  return true;
};

proto._modifyOrientation = function(propValue, propOldValue, propName, uniqModIds)
{
  this._layoutInternalWidgetsHorizontal();
  this._layoutInternalWidgetsVertical();
  
  return true;
};











proto._calculateChildrenDependWidth = function(vModifiedWidget, vHint) 
{
  if (this.getOrientation() == "vertical") {
    return QxWidget.prototype._calculateChildrenDependWidth.call(this, vModifiedWidget, vHint);
  };
  
  var w = 0;
  
  var ch = this.getChildren();
  var chl = ch.length;
  var chc;
  
  for (var i=0; i<chl; i++)
  {
    chc = ch[i];
    w += chc.getMarginLeft() + chc.getAnyWidth() + chc.getMarginRight();
  };
  
  return w;
};

proto._calculateChildrenDependHeight = function(vModifiedWidget, vHint) 
{
  if (this.getOrientation() == "horizontal") {
    return QxWidget.prototype._calculateChildrenDependHeight.call(this, vModifiedWidget, vHint);
  };  
  
  var h = 0;
  
  var ch = this.getChildren();
  var chl = ch.length;
  var chc;
  
  for (var i=0; i<chl; i++)
  {
    chc = ch[i];
    h += chc.getMarginTop() + chc.getAnyHeight() + chc.getMarginBottom();
  };
  
  return h;
};