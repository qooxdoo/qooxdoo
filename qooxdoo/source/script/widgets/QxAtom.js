function QxAtom(vText, vIcon, vIconWidth, vIconHeight)
{
  QxWidget.call(this);

  this.setCanSelect(false);

  this.setWidth("auto");
  this.setHeight("auto");

  if (isValid(vText)) {
    this.setText(vText);
  };

  if (isValid(vIcon))
  {
    this.setIcon(vIcon);

    if (isValid(vIconWidth)) {
      this.setIconWidth(vIconWidth);
    };

    if (isValid(vIconHeight)) {
      this.setIconHeight(vIconHeight);
    };
  };
};

QxAtom.extend(QxWidget, "QxAtom");




/*
------------------------------------------------------------------------------------
  PROPERTIES
------------------------------------------------------------------------------------
*/

QxAtom.addProperty({ name : "text", type : String });
QxAtom.addProperty({ name : "icon", type : String });
QxAtom.addProperty({ name : "show", type : String, defaultValue : "both" });

QxAtom.addProperty({ name : "iconPosition", type : String, defaultValue : "left" });
QxAtom.addProperty({ name : "iconTextGap", type : Number, defaultValue : 4 });

QxAtom.addProperty({ name : "iconWidth", type : Number });
QxAtom.addProperty({ name : "iconHeight", type : Number });

QxAtom.addProperty({ name : "horizontalAlign", type : String, defaultValue : "left" });
QxAtom.addProperty({ name : "verticalAlign", type : String, defaultValue : "middle" });




/*
------------------------------------------------------------------------------------
  STATE CACHE
------------------------------------------------------------------------------------
*/

proto._showText = true;
proto._showIcon = true;

proto._displayText = false;
proto._displayIcon = false;

proto._textObject = null;
proto._iconObject = null;





/*
------------------------------------------------------------------------------------
  MODIFIER
------------------------------------------------------------------------------------
*/

proto._modifyIcon = function(propValue, propOldValue, propName, uniqModIds)
{
  // re-caching internal variables
  this._pureUpdateDisplayState();

  var o = this._iconObject;

  if (this._displayIcon)
  {
    if (o)
    {
      // first setup the new source, then set the parent to myself
      // somethimes this makes things faster, because we only need
      // one rendering
      o.setSource(propValue);
      o.setParent(this);
    }
    else if (this._wasVisible)
    {
      // post-create icon object
      this._pureCreateFillIcon();
    };
  }
  else if (o)
  {
    // if we have no icon anymore, move it away
    // parent == null also moves the element out of the atom
    o.setParent(null);
    o.setSource(propValue);
  };

  return true;
};

proto._modifyText = function(propValue, propOldValue, propName, uniqModIds)
{
  // re-caching internal variables
  this._pureUpdateDisplayState();

  var o = this._textObject;

  if (this._displayText)
  {
    if (o)
    {
      // first setup the new source, then set the parent to myself
      // somethimes this makes things faster, because we only need
      // one rendering
      o.setHtml(propValue);
      o.setParent(this);
    }
    else if (this._wasVisible)
    {
      // post-create text object
      this._pureCreateFillText();
    };
  }
  else if (o)
  {
    // if we have no text anymore, move it away
    // parent == null also moves the element out of the atom
    o.setParent(null);
    o.setHtml(propValue);
  };

  return true;
};

proto._modifyShow = function(propValue, propOldValue, propName, uniqModIds)
{
  // re-caching internal variables
  this._pureUpdateDisplayState();

  // only do the following after the atom was initially visible
  if (this._wasVisible)
  {
    /* --------------------------------------------------
     1. Toggle the display of existing objects
        We use the parent property instead of a simple 
        display to remove non visible html blocks 
        completly from the DOM-tree.
    -------------------------------------------------- */
    if (this._textObject)
    {
      // we need to toggle the visibility of the existing text object
      this._textObject.setParent(this._displayText ? this : null);
    };

    if (this._iconObject)
    {
      // we need to toggle the visibility of the existing icon object
      this._iconObject.setParent(this._displayIcon ? this : null);
    };
    
    

    /* --------------------------------------------------
     2. Check if we have any non auto configuration 
        and force a relayout on this axis.
    -------------------------------------------------- */
    if (this._textObject && this._iconObject)
    {
      if (this.getWidth() != "auto") {
        this._layoutInternalWidgetsHorizontal("show");
      };

      if (this.getHeight() != "auto") {
        this._layoutInternalWidgetsVertical("show");
      };
    };
    
    
    
    /* --------------------------------------------------
     3. (Post-) Create missing objects
    -------------------------------------------------- */
    if (!this._textObject && this._displayText)
    {
      // we need to post-create the text object
      this._pureCreateFillText();      
    };

    if (!this._iconObject && this._displayIcon)
    {
      // we need to post-create the icon object
      this._pureCreateFillIcon();      
    };    
  };

  return true;
};

proto._modifyElement = function(propValue, propOldValue, propName, uniqModIds)
{
  if (propValue)
  {
    // this will add the class QxAtomBase to all widgets
    // which extends QxAtom.
    this._addCssClassName("QxAtomBase");

    // Create icon object if needed.
    if (this._displayIcon && !this._iconObject) {
      this._pureCreateFillIcon();
    };

    // Create text object if needed.
    if (this._displayText && !this._textObject) {
      this._pureCreateFillText();
    };
  };

  return QxWidget.prototype._modifyElement.call(this, propValue, propOldValue, propName, uniqModIds);
};

proto._modifyEnabled = function(propValue, propOldValue, propName, uniqModIds)
{
  // We need to inform the text and icon object about any changes.
  
  if (this._iconObject) {
    this._iconObject.setEnabled(propValue);
  };

  if (this._textObject) {
    this._textObject.setEnabled(propValue);
  };
  
  return QxWidget.prototype._modifyEnabled.call(this, propValue, propOldValue, propName, uniqModIds);
};

proto._modifyIconPosition = function(propValue, propOldValue, propName, uniqModIds)
{
  if (!this._wasVisible) {
    return true;
  };
  
  if (1 == 1 || this._displayText && this._displayIcon)
  {
    // Search for a simple position switch first...
    switch(propValue)
    {
      case "left":
        if (propOldValue == "right") {
          return this._layoutInternalWidgetsHorizontal("icon-position");
        };
        
        break;
      
      case "right":
        if (propOldValue == "left") {
          return this._layoutInternalWidgetsHorizontal("icon-position");
        };
        
        break;
      
      case "top":
        if (propOldValue == "bottom") {
          return this._layoutInternalWidgetsVertical("icon-position");
        };
        
        break;
      
      case "bottom":
        if (propOldValue == "top") {
          return this._layoutInternalWidgetsVertical("icon-position");
        };
        
        break;
    };
    
    // ...if nothing was found use the more complex 
    // re-calculation and -layouting.
    if (this.getWidth() == "auto")
    {
      this._setChildrenDependWidth(this, "icon-position");
    }
    else
    {
      this._layoutInternalWidgetsHorizontal("icon-position");
    };
    
    if (this.getHeight() == "auto")
    {
      this._setChildrenDependHeight(this, "icon-position");
    }
    else
    {
      this._layoutInternalWidgetsVertical("icon-position");
    };
  };

  return true;
};

proto._modifyIconTextGap = function(propValue, propOldValue, propName, uniqModIds)
{
  if (!this._wasVisible) {
    return true;
  };  
  
  if (this._displayText && this._displayIcon)
  {
    switch(this.getIconPosition())
    {
      case "left":
      case "right":
        return this.getWidth() == "auto" ? this._setChildrenDependWidth(this, "icon-text-gap") : this._layoutInternalWidgetsHorizontal("icon-text-gap");

      case "top":
      case "bottom":
        return this.getHeight() == "auto" ? this._setChildrenDependHeight(this, "icon-text-gap") : this._layoutInternalWidgetsVertical("icon-text-gap");
    };
  };

  return true;
};

proto._modifyHorizontalAlign = function(propValue, propOldValue, propName, uniqModIds)
{
  if (!this._wasVisible || this.getWidth() == "auto") {
    return true;
  };
  
  return this._layoutInternalWidgetsHorizontal("align");
};

proto._modifyVerticalAlign = function(propValue, propOldValue, propName, uniqModIds)
{
  if (!this._wasVisible || this.getHeight() == "auto") {
    return true;
  };
  
  return this._layoutInternalWidgetsVertical("align");
};

/*
  -------------------------------------------------------------------------------
    HELPER
  -------------------------------------------------------------------------------
*/

/*!
  Create the internal used text object.
*/
proto._pureCreateFillText = function()
{
  // this.debug("Create text object");

  // create object instance
  var t = this._textObject = new QxContainer(this.getText());

  // make text anonymous
  t.setAnonymous(true);

  // copy enabled status to  text
  t.setEnabled(this.isEnabled());

  // set parent
  t.setParent(this);
};

/*!
  Create the internal used icon object.
*/
proto._pureCreateFillIcon = function()
{
  // this.debug("Create icon object");

  // create object instance
  var i = this._iconObject = new QxImage(this.getIcon(), this.getIconWidth(), this.getIconHeight());

  // make icon anonymous
  i.setAnonymous(true);

  // copy enabled status to icon
  i.setEnabled(this.isEnabled());

  // set parent
  i.setParent(this);
};

/*!
  This update the caches of QxAtom. This makes it more
  speedy and easily to do the real rendering afterwards.
*/
proto._pureUpdateDisplayState = function()
{
  switch(this.getShow())
  {
    case "both":
      this._showText = this._showIcon = true;
      this._displayIcon = this._hasIcon();
      this._displayText = this._hasText();
      break;

    case "none":
      this._showText = this._showIcon = this._displayIcon = this._displayText = false;
      break;

    case "icon":
      this._showIcon = true;
      this._displayIcon = this._hasIcon();
      this._showText = this._displayText = false;
      break;

    case "text":
      this._showText = true;
      this._displayText = this._hasText();
      this._showIcon = this._displayIcon = false;
      break;

    default:
      throw new Error("Invalid value for show property: " + this.getShow());

  };
};

proto._hasText = function() {
  return isValid(this.getText());
};

proto._hasIcon = function() {
  return isValid(this.getIcon());
};


/*
------------------------------------------------------------------------------------
  RENDERER: CHILDREN DEPEND DIMENSIONS: MAIN
------------------------------------------------------------------------------------
*/

proto._setChildrenDependWidth = function(vModifiedWidget, vHint)
{
  // Ingore unload event if we have a valid icon to load.
  // Note: This does not handle missing images correctly.
  if (this._displayIcon && vModifiedWidget == this._iconObject && vHint == "unload") {
    return true;
  };
  
  //this.debug("depend width: widget=" + vModifiedWidget + ", hint=" + vHint);

  var newWidth = this._calculateChildrenDependWidth(vModifiedWidget, vHint);
  
  // this.debug("NewCalculatedWidth: " + newWidth + ", " + this._wasVisible + " == " + this._widthModeValue);
  
  // If the width did not change the setter below will not re-layout the children.
  // We will force this here if the icon or text was appended, to ensure a perfect layout.
  if (this._widthMode == "inner" && this._widthModeValue == newWidth)
  {
    if ((vHint == "load" || vHint == "append-child") && (vModifiedWidget == this._textObject || vModifiedWidget == this._iconObject))
    {
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
  // Ingore unload event if we have a valid icon to load.
  // Note: This does not handle missing images correctly.
  if (this._displayIcon && vModifiedWidget == this._iconObject && vHint == "unload") {
    return true;
  };
  
  // this.debug("depend-height: widget=" + vModifiedWidget + ", hint=" + vHint);

  var newHeight = this._calculateChildrenDependHeight(vModifiedWidget, vHint);

  // If the height did not change the setter below will not re-layout the children.
  // We will force this here if the icon or text was appended, to ensure a perfect layout.
  if (this._heightMode == "inner" && this._heightModeValue == newHeight)
  {
    if ((vHint == "load" || vHint == "append-child") && (vModifiedWidget == this._textObject || vModifiedWidget == this._iconObject))
    {
      return this._layoutInternalWidgetsVertical(vHint);
    };
  }
  else
  {
    this.setInnerHeight(newHeight, null, true);  
  };

  return true;
};





/*
  -------------------------------------------------------------------------------
    AUTO CALCULATOR
  -------------------------------------------------------------------------------
*/

proto._calculateChildrenDependWidth = function() {
  return this._calculateChildrenDependHelper("Width", "left", "right");
};

proto._calculateChildrenDependHeight = function() {
  return this._calculateChildrenDependHelper("Height", "top", "bottom");
};

proto._calculateChildrenDependHelper = function(vNameRangeUp, vNameStart, vNameStop)
{
  if (this._displayText && this._textObject && this._textObject.getParent() != this) {
    return null;
  };
  
  if (this._displayIcon && this._iconObject && this._iconObject.getParent() != this) {
    return null;
  }; 
  
  if(this._displayIcon && (!this._iconObject || (!this._iconObject.getLoaded() && isInvalid(this._iconObject["get" + vNameRangeUp]())))) {
    return null;
  };  

  if (this._displayText && this._displayIcon)
  {
    switch(this.getIconPosition())
    {
      case vNameStart:
      case vNameStop:
        return this._textObject["getAny" + vNameRangeUp]() + this.getIconTextGap() + this._iconObject["getAny" + vNameRangeUp]();
        
      default:
        return Math.max(Math.max(this._textObject["getAny" + vNameRangeUp](), this._iconObject["getAny" + vNameRangeUp]()), 0);
    };
  }
  else if (this._displayText)
  {
    return this._textObject["getAny" + vNameRangeUp]();
  }
  else if (this._displayIcon)
  {
    return this._iconObject["getAny" + vNameRangeUp]();
  }
  else
  {
    // need be 0 (not null) to keep the padding working correctly.
    return 0;
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

  // Update placement of icon and text
  this._layoutInternalWidgetsHorizontal("inner-width");
  
  // Update children
  var ch = this._children;
  var chl = ch.length;
  var chc;

  for (var i=0; i<chl; i++)
  {
    chc = ch[i];

    if (chc != this._textObject && chc != this._iconObject) {
      chc._renderHorizontal("parent");
    };
  }; 
};


proto._innerHeightChanged = function()
{
  // Invalidate internal cache
  this._invalidateInnerHeight();

  // Update placement of icon and text
  this._layoutInternalWidgetsVertical("inner-height");

  // Update children
  var ch = this._children;
  var chl = ch.length;
  var chc;

  for (var i=0; i<chl; i++)
  {
    chc = ch[i];

    if (chc != this._textObject && chc != this._iconObject) {
      chc._renderVertical("parent");
    };
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

  if (this.getWidth() == "auto")
  {
    return this._setChildrenDependWidth(vModifiedChild, vHint);
  }
  else
  {
    this._layoutInternalWidgetsHorizontal(vHint);
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
    this._layoutInternalWidgetsVertical(vHint);
  };
};





/*
------------------------------------------------------------------------------------
  RENDERER: PLACEMENT OF TEXT AND ICON
------------------------------------------------------------------------------------
*/

proto._layoutInternalWidgetsHorizontal = function(vHint) {
  return this._layoutInternalWidgetsHelper(vHint, "Width", "Horizontal", "left", "right", "Left");
};

proto._layoutInternalWidgetsVertical = function(vHint) {
  return this._layoutInternalWidgetsHelper(vHint, "Height", "Vertical", "top", "bottom", "Top");
};

proto._layoutInternalWidgetsHelper = function(vHint, vNameRangeUp, vDirection, vNameStart, vNameStop, vPaddingStartUp)
{
  try
  {
    var vTextPos = 0;
    var vIconPos = 0;
    
    // this.debug("DISPLAY: " + this._displayIcon + ", " + this._displayText);
  
    var vBoxSize;
  
    if (this._displayText && this._displayIcon)
    {
      if (!this._textObject || !this._iconObject) {
        return;
      };
  
      var vTextSize = this._textObject["getAny" + vNameRangeUp]();
      var vIconSize = this._iconObject["getAny" + vNameRangeUp]();
  
      switch(this.getIconPosition())
      {
        case vNameStart:
          vTextPos = vIconSize + this.getIconTextGap();
          vBoxSize = vTextPos + vTextSize;
          break;
        
        case vNameStop:
          vIconPos = vTextSize + this.getIconTextGap();
          vBoxSize = vIconPos + vIconSize;
          break;
          
        default:
          if( vTextSize > vIconSize ) {
            vIconPos = (vTextSize - vIconSize) / 2;
          } else {
            vTextPos = (vIconSize - vTextSize) / 2;
          };
  
          vBoxSize = Math.max(vTextSize, vIconSize);
      };
    }   
    else if (this._displayText)
    {
      vBoxSize = this._textObject["getAny" + vNameRangeUp]();
    }
    else if (this._displayIcon)
    {
      vBoxSize = this._iconObject["getAny" + vNameRangeUp]();
    }
    else
    {
      return;  
    };
  
  
    var vBoxPos = this["getComputedPadding" + vPaddingStartUp]();
  
    switch(this["get"+vDirection+"Align"]()) {
  
    case "center":
    case "middle":
      vBoxPos += (this["getInner" + vNameRangeUp]() - vBoxSize) / 2;
      break;
    case "right":
    case "bottom":
      vBoxPos += this["getInner" + vNameRangeUp]() - vBoxSize;
      break;
    };
  
    vIconPos += vBoxPos;
    vTextPos += vBoxPos;
  
  
  
    // Apply new values
    if (this._iconObject && isValidNumber(vIconPos)) {
      this._iconObject["_applyPosition" + vDirection](vIconPos);
    };
    
    if (this._textObject && isValidNumber(vTextPos)) {
      this._textObject["_applyPosition" + vDirection](vTextPos);
    };
  }
  catch(ex)
  {
    throw new Error("Failed to internal render widgets: " + ex);
  };
  
  return true;  
};







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
  -------------------------------------------------------------------------------
    CLONE
  -------------------------------------------------------------------------------
*/

proto._cloneRecursive = function(cloneInstance)
{
  var ch = this.getChildren();
  var chl = ch.length;
  var chc;
  var cloneChild;

  for (var i=0; i<chl; i++) 
  {
    chc = ch[i];
    
    if (chc != this._iconObject && chc != this._textObject)
    {
      cloneChild = chc.clone(true);
      cloneInstance.add(cloneChild);
    };
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
  
  if (this._iconObject)
  {
    this._iconObject.dispose();
    this._iconObject = null;
  };

  if (this._textObject)
  {
    this._textObject.dispose();
    this._textObject = null;
  };
  
  this._showText = this._showIcon = this._displayText = this._displayIcon = null;
  
  return QxWidget.prototype.dispose.call(this);
};