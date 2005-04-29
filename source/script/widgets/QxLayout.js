function QxLayout()
{
  QxWidget.call(this);
};

QxLayout.extend(QxWidget, "QxLayout");

/*
------------------------------------------------------------------------------------
  BASICS

  Extend this core functions of QxWidget.
------------------------------------------------------------------------------------
*/

proto._onnewchild = function(otherObject)
{
  this.getWidth() == "auto" ? this._setChildrenDependWidth(otherObject, "append-child") : this._layoutInternalWidgetsHorizontal("append-child");
  this.getHeight() == "auto" ? this._setChildrenDependHeight(otherObject, "append-child") : this._layoutInternalWidgetsVertical("append-child");
};

proto._onremovechild = function(otherObject)
{
  this.getWidth() == "auto" ? this._setChildrenDependWidth(otherObject, "remove-child") : this._layoutInternalWidgetsHorizontal("remove-child");
  this.getHeight() == "auto" ? this._setChildrenDependHeight(otherObject, "remove-child") : this._layoutInternalWidgetsVertical("remove-child");
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
  this._layoutInternalWidgetsHorizontal("inner-width");
  
  // Update children
  var ch = this._children;
  var chl = ch.length;

  for (var i=0; i<chl; i++) {
    ch[i]._renderHorizontal("parent");
  };  
};


proto._innerHeightChanged = function()
{
  // Invalidate internal cache
  this._invalidateInnerHeight();

  // Update placement of children
  this._layoutInternalWidgetsVertical("inner-height");
  
  // Update children
  var ch = this._children;
  var chl = ch.length;

  for (var i=0; i<chl; i++) {
    ch[i]._renderVertical("parent");
  };  
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
  
  this._layoutInternalWidgetsVertical(vHint);
  
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
  
  this.debug(vModifiedChild + " :: " + vHint);
  
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






/*
------------------------------------------------------------------------------------
  RENDERER: CHILDREN DEPEND DIMENSIONS: MAIN
------------------------------------------------------------------------------------
*/

proto._setChildrenDependWidth = function(vModifiedWidget, vHint)
{
  var newWidth = this._calculateChildrenDependWidth(vModifiedWidget, vHint);

  // If the width did not change the setter below will not re-layout the children.
  // We will force this here if the icon or text was appended, to ensure a perfect layout.
  if (this._widthMode == "inner" && this._widthModeValue == newWidth)
  {
    if (vHint == "size") {
      return this._layoutInternalWidgetsHorizontal(vHint);
    };
  }
  else
  {
    this.setInnerWidth(newWidth, null, true);
  };

  return true;
};

proto._setChildrenDependHeight = function(vModifiedWidget, vHint)
{
  var newHeight = this._calculateChildrenDependHeight(vModifiedWidget, vHint);

  // If the height did not change the setter below will not re-layout the children.
  // We will force this here if the icon or text was appended, to ensure a perfect layout.
  if (this._heightMode == "inner" && this._heightModeValue == newHeight)
  {
    if (vHint == "size") {
      return this._layoutInternalWidgetsVertical(vHint);
    };
  }
  else
  {
    this.setInnerHeight(newHeight, null, true);
  };

  return true;
};