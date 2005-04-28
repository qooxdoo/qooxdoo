function QxGridLayout(vRowConfig, vColConfig)
{
  QxLayout.call(this);  
  
  this._rowConfig = isValid(vRowConfig) ? vRowConfig : "auto,auto";
  this._colConfig = isValid(vColConfig) ? vColConfig : "100,100";
  
  this.initConfig();
};

QxGridLayout.extend(QxLayout, "QxGridLayout");

/*
------------------------------------------------------------------------------------
  PROPERTIES
------------------------------------------------------------------------------------
*/

QxGridLayout.addProperty({ name : "constraintMode", type : String, defaultValue : "clip" });
QxGridLayout.addProperty({ name : "respectSpansInAuto", type : Boolean, defaultValue : false });



/*
------------------------------------------------------------------------------------
  DATA
------------------------------------------------------------------------------------
*/

proto._rowHeights = null;
proto._colWidths = null;

proto._rowConfig = null;
proto._colConfig = null;

proto._normalizedRowHeights = null;
proto._normalizedColWidths = null;

proto._virtualCells = null;




/*
------------------------------------------------------------------------------------
  REDEFINE WIDGET METHODS
------------------------------------------------------------------------------------
*/

/*!
  Add/Append another widget. Allows to add multiple 
  widgets at once. 
*/
proto.add = function(w, h)
{
  w.setParent(this);
  w.setLayoutHint(h);
};

proto.remove = function(w)
{
  w.setParent(null);
  w.setLayoutHint(null);
};

proto._beforeShow = function(uniqModIds) {
  this._createVirtualCells();
};




/*
------------------------------------------------------------------------------------
  HANDLING FOR GRID CONFIGURATION
------------------------------------------------------------------------------------
*/

proto.initConfig = function()
{
  this._rowHeights = this._rowConfig.split(",");
  this._colWidths = this._colConfig.split(",");
  
  this._rowCount = this._rowHeights.length;
  this._colCount = this._colWidths.length;
};

proto.getRowCount = function() {
  return this._rowCount;
};

proto.getColCount = function() {
  return this._colCount;
};

proto._createVirtualCells = function()
{
  var vRowCount = this.getRowCount();
  var vColCount = this.getColCount();  
  
  var c = this._virtualCells = [];
  var p = this.getParent();
  var e = this.getElement();
  var d = p.getTopLevelWidget().getDocumentElement();
  
  var n;
  
  for (var i=0; i<vRowCount; i++)
  {
    for (var j=0; j<vColCount; j++)
    {
      n = d.createElement("div");
      n.style.position="absolute";
      n.style.border = "1px solid white";
      
      c.push(n);
      e.appendChild(n);
    };
  };
};








/*
------------------------------------------------------------------------------------
  MODIFIER
------------------------------------------------------------------------------------
*/

proto._modifyConstraintMode = function(propValue, propOldValue, propName, uniqModIds)
{
  if (this._wasVisible) 
  {
    this._layoutInternalWidgetsHorizontal("constraint-mode");
    this._layoutInternalWidgetsVertical("constraint-mode");
  };
  
  return true;  
};





/*
------------------------------------------------------------------------------------
  HORIZONTAL VALUE NORMALIZER
------------------------------------------------------------------------------------
*/

proto._normalizeHorizontalData = function(f) 
{
  var v, t;
  
  var a = this._colWidths;
  var ar = this._normalizedColWidths = [];
  
  var vChildren = this.getChildren();
  var vChildrenLength = vChildren.length;
  var vCurrentChild, vCurrentLayoutHint;
  var vMaxNeededWidth;
      
  for (var i=0, l=a.length; i<l; i++)
  {
    v = a[i];
    
    if (v == "auto")
    {
      vMaxNeededWidth = 0;
      
      for (var j=0; j<vChildrenLength; j++)
      {
        vCurrentChild = vChildren[j];
        vCurrentLayoutHint = vCurrentChild.getLayoutHint();
          
        if (vCurrentLayoutHint.col == (i+1) && (this.getRespectSpansInAuto() || isInvalidNumber(vCurrentLayoutHint.colspan) || vCurrentLayoutHint.colspan <= 1))
        {
          vMaxNeededWidth = Math.max(vCurrentChild.getAnyWidth(), vMaxNeededWidth);          
        };
      };
      
      ar[i] = vMaxNeededWidth;
      continue;
    }
    else if (typeof v == "string" && v != "auto" && v != "*")
    {
      t = parseInt(v);
      
      if (!isNaN(t))
      {
        if (v.contains("%"))
        {
          ar[i] = Math.round(f / 100 * t);
          continue;
        }
        else
        {
          ar[i] = t;  
          continue;
        };
      };
    };
    
    ar[i] = v;
  };  
};




/*
------------------------------------------------------------------------------------
  VERTICAL VALUE NORMALIZER
------------------------------------------------------------------------------------
*/

proto._normalizeVerticalData = function(f) 
{
  var v, t;
  
  var a = this._rowHeights;
  var ar = this._normalizedRowHeights = [];
  
  var vChildren = this.getChildren();
  var vChildrenLength = vChildren.length;
  
  var vCurrentChild, vCurrentLayoutHint;
  var vMaxNeededHeight;

  for (var i=0, l=a.length; i<l; i++)
  {
    v = a[i];
    
    if (v == "auto")
    {
      vMaxNeededHeight = 0
      
      for (var j=0; j<vChildrenLength; j++)
      {
        vCurrentChild = vChildren[j];
        vCurrentLayoutHint = vCurrentChild.getLayoutHint();
          
        if (vCurrentLayoutHint.row == (i+1) && (this.getRespectSpansInAuto() || isInvalidNumber(vCurrentLayoutHint.rowspan) || vCurrentLayoutHint.rowspan <= 1))
        {
          vMaxNeededHeight = Math.max(vCurrentChild.getAnyHeight(), vMaxNeededHeight);          
        };
      };
      
      ar[i] = vMaxNeededHeight;
      continue;
    }
    else if (typeof v == "string" && v != "auto" && v != "*")
    {
      t = parseInt(v);
      
      if (!isNaN(t))
      {
        if (v.contains("%"))
        {
          ar[i] = Math.round(f / 100 * t);
          continue;
        }
        else
        {
          ar[i] = t;  
          continue;
        };
      };
    };
    
    ar[i] = v;
  };
};






/*
------------------------------------------------------------------------------------
  RENDERER: HORIZONTAL PLACEMENT OF CHILDREN
------------------------------------------------------------------------------------
*/

proto._layoutInternalWidgetsHorizontal = function(vHint)
{
  /* ---------------------------------------
     Recalculate dimensions (if needed)
  --------------------------------------- */
  var innerWidth = this.getInnerWidth();

  if (vHint == "inner-width") {  
    this._normalizeHorizontalData(innerWidth);
  };
  
  
  
  /* ---------------------------------------
     Prepare variables
  --------------------------------------- */
  var vConstraintMode = this.getConstraintMode();
  var vUseVirtualCells = isValid(this._virtualCells);
  
  var vRowCount = this.getRowCount();
  var vColCount = this.getColCount();
  
  var vPaddingLeft = this.getPaddingLeft();
  var vCurrentLeft = vPaddingLeft;

  var vChildren = this.getChildren();
  var vChildrenLength = vChildren.length;

  var vCurrentChild, vCurrentLayoutHint, vVirtualCell, vClip, vClipSize, vColWidth, vColSpanWidth;
  
  for (var i=0; i<vRowCount; i++)
  {
    for (var j=0; j<vColCount; j++)
    {
      vColWidth = this._normalizedColWidths[j];
      
      for (var k=0; k<vChildrenLength; k++)
      {
        vCurrentChild = vChildren[k];
        vCurrentLayoutHint = vCurrentChild.getLayoutHint();
        
        if (vCurrentLayoutHint.row == (i+1) && vCurrentLayoutHint.col == (j+1)) 
        {
          vColSpanWidth = vColWidth;

          if (isValidNumber(vCurrentLayoutHint.colspan) && vCurrentLayoutHint.colspan > 1)
          {
            for (var l=1; l<vCurrentLayoutHint.colspan; l++) {
              vColSpanWidth += this._normalizedColWidths[j+l]
            };               
          };
          
          vCurrentChild._applyPositionHorizontal(vCurrentLeft);
          
          switch(vConstraintMode)
          {
            case "max":
              vCurrentChild.setMaxWidth(vColSpanWidth);
              vCurrentChild.setClip(null);
              break;
              
            case "clip":
              vClip = vCurrentChild.getClip();
              vClipSize = Math.min(vCurrentChild.getAnyWidth(), vColSpanWidth);

              if (isValidArray(vClip))
              {
                vClip[1] = vClipSize;
                vCurrentChild.forceClip(null);
                vCurrentChild.setClip(vClip);
              }
              else
              {
                vCurrentChild.setClip([0, vClipSize, 0, 0]);
              };
              
              vCurrentChild.setMaxWidth(Infinity);
              break;
              
            default:
              vCurrentChild.setMaxWidth(Infinity);
              vCurrentChild.setClip(null);
          };
          
          if (vUseVirtualCells)
          {
            vVirtualCell = this._virtualCells[i*vColCount+j];
           
            vVirtualCell.style.left = vCurrentLeft + "px";
            vVirtualCell.style.width = vColSpanWidth + "px";
            
            vVirtualCell.style.borderLeft = j == 0 ? "1px solid white" : "0 none";
          };
        };
      };
      
      vCurrentLeft += vColWidth;
    };  

    vCurrentLeft = vPaddingLeft;
  };
};





/*
------------------------------------------------------------------------------------
  RENDERER: VERTICAL PLACEMENT OF CHILDREN
------------------------------------------------------------------------------------
*/

proto._layoutInternalWidgetsVertical = function(vHint) 
{
  /* ---------------------------------------
     Recalculate dimensions (if needed)
  --------------------------------------- */
  var innerHeight = this.getInnerHeight();
  
  if (vHint == "inner-height") {  
    this._normalizeVerticalData(innerHeight);
  };
  
  
  
  /* ---------------------------------------
     Prepare variables
  --------------------------------------- */  
  var vConstraintMode = this.getConstraintMode();
  var vUseVirtualCells = isValid(this._virtualCells);
  
  var vRowCount = this.getRowCount();
  var vColCount = this.getColCount();
  
  var vPaddingTop = this.getPaddingTop();
  var vCurrentTop = vPaddingTop;
  
  var vChildren = this.getChildren();
  var vChildrenLength = vChildren.length;
  
  var vCurrentChild, vCurrentLayoutHint, vVirtualCell, vClip, vRowHeight, vRowSpanHeight;
  
  for (var i=0; i<vRowCount; i++)
  {
    vRowHeight = this._normalizedRowHeights[i];
    
    for (var j=0; j<vColCount; j++)
    {
      for (var k=0; k<vChildrenLength; k++)
      {
        vCurrentChild = vChildren[k];
        vCurrentLayoutHint = vCurrentChild.getLayoutHint();
        
        if (vCurrentLayoutHint.row == (i+1) && vCurrentLayoutHint.col == (j+1))
        {
          vRowSpanHeight = vRowHeight;

          if (isValidNumber(vCurrentLayoutHint.rowspan) && vCurrentLayoutHint.rowspan > 1)
          {
            for (var l=1; l<vCurrentLayoutHint.rowspan; l++) {
              vRowSpanHeight += this._normalizedRowHeights[i+l]
            };               
          };
          
          vCurrentChild._applyPositionVertical(vCurrentTop);

          switch(vConstraintMode)
          {
            case "max":          
              vCurrentChild.setMaxHeight(vRowSpanHeight);
              vCurrentChild.setClip(null);
              break;
              
            case "clip":
              vClip = vCurrentChild.getClip();
              vClipSize = Math.min(vCurrentChild.getAnyHeight(), vRowSpanHeight);

              if (isValidArray(vClip))
              {
                vClip[2] = vClipSize;
                vCurrentChild.forceClip(null);
                vCurrentChild.setClip(vClip);
              }
              else
              {
                vCurrentChild.setClip([0, 0, vClipSize, 0]);
              };
              
              vCurrentChild.setMaxHeight(null);
              break;
              
            default:
              vCurrentChild.setMaxHeight(Infinity);
              vCurrentChild.setClip(null);
          };
        
          if (vUseVirtualCells)
          {
            vVirtualCell = this._virtualCells[i*vColCount+j];
          
            vVirtualCell.style.top = vCurrentTop + "px";
            vVirtualCell.style.height = vRowSpanHeight + "px";
            
            vVirtualCell.style.borderTop = i == 0 ? "1px solid white" : "0 none";
          };
        };        
      };
    };  
    
    vCurrentTop += vRowHeight;
  };
};






/*
------------------------------------------------------------------------------------
  RENDERER: CHILDREN DEPEND DIMENSIONS
------------------------------------------------------------------------------------
*/

proto._calculateChildrenDependWidth = function(vModifiedWidget, vHint) 
{
  return 500;
};

proto._calculateChildrenDependHeight = function(vModifiedWidget, vHint) 
{
  return 500;
};
