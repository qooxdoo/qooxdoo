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
  
  for (var i=0, l=a.length; i<l; i++)
  {
    v = a[i];
    
    if (v == "auto")
    {
      var ch = this.getChildren();
      var chl = ch.length;
      var chc, chh;
      var maxv = 0;
      
      var vRowCount = this.getRowCount();
      
      for (var j=0; j<chl; j++)
      {
        chc = ch[j];
        chh = chc.getLayoutHint();
          
        if (chh.col == (i+1) && (this.getRespectSpansInAuto() || isInvalidNumber(chh.colspan) || chh.colspan <= 1))
        {
          maxv = Math.max(chc.getAnyWidth(), maxv);          
        };
      };
      
      ar[i] = maxv;
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
  
  for (var i=0, l=a.length; i<l; i++)
  {
    v = a[i];
    
    if (v == "auto")
    {
      var ch = this.getChildren();
      var chl = ch.length;
      var chc, chh;
      var maxv = 0;
      
      for (var j=0; j<chl; j++)
      {
        chc = ch[j];
        chh = chc.getLayoutHint();
          
        if (chh.row == (i+1) && (this.getRespectSpansInAuto() || isInvalidNumber(chh.rowspan) || chh.rowspan <= 1))
        {
          maxv = Math.max(chc.getAnyHeight(), maxv);          
        };
      };
      
      ar[i] = maxv;
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

  var ch = this.getChildren();
  var chl = ch.length;

  var chc, chh, virt, clip, clipsize, cwidth, cspanwidth;
  
  for (var i=0; i<vRowCount; i++)
  {
    for (var j=0; j<vColCount; j++)
    {
      cwidth = this._normalizedColWidths[j];
      
      for (var k=0; k<chl; k++)
      {
        chc = ch[k];
        chh = chc.getLayoutHint();
        
        if (chh.row == (i+1) && chh.col == (j+1)) 
        {
          cspanwidth = cwidth;

          if (isValidNumber(chh.colspan) && chh.colspan > 1)
          {
            for (var l=1; l<chh.colspan; l++) {
              cspanwidth += this._normalizedColWidths[j+l]
            };               
          };
          
          chc._applyPositionHorizontal(vCurrentLeft);
          
          switch(vConstraintMode)
          {
            case "max":
              chc.setMaxWidth(cspanwidth);
              chc.setClip(null);
              break;
              
            case "clip":
              clip = chc.getClip();
              clipsize = Math.min(chc.getAnyWidth(), cspanwidth);

              if (isValidArray(clip))
              {
                clip[1] = clipsize;
                chc.forceClip(null);
                chc.setClip(clip);
              }
              else
              {
                chc.setClip([0, clipsize, 0, 0]);
              };
              
              chc.setMaxWidth(Infinity);
              break;
              
            default:
              chc.setMaxWidth(Infinity);
              chc.setClip(null);
          };
          
          if (vUseVirtualCells)
          {
            virt = this._virtualCells[i*vColCount+j];
           
            virt.style.left = vCurrentLeft + "px";
            virt.style.width = cspanwidth + "px";
            
            virt.style.borderLeft = j == 0 ? "1px solid white" : "0 none";
          };
        };
      };
      
      vCurrentLeft += cwidth;
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
  
  var ch = this.getChildren();
  var chl = ch.length;
  
  var chc, chh, virt, clip, rheight, rspanheight;
  
  for (var i=0; i<vRowCount; i++)
  {
    rheight = this._normalizedRowHeights[i];
    
    for (var j=0; j<vColCount; j++)
    {
      for (var k=0; k<chl; k++)
      {
        chc = ch[k];
        chh = chc.getLayoutHint();
        
        if (chh.row == (i+1) && chh.col == (j+1))
        {
          rspanheight = rheight;

          if (isValidNumber(chh.rowspan) && chh.rowspan > 1)
          {
            for (var l=1; l<chh.rowspan; l++) {
              rspanheight += this._normalizedRowHeights[i+l]
            };               
          };
          
          chc._applyPositionVertical(vCurrentTop);

          switch(vConstraintMode)
          {
            case "max":          
              chc.setMaxHeight(rspanheight);
              chc.setClip(null);
              break;
              
            case "clip":
              clip = chc.getClip();
              clipsize = Math.min(chc.getAnyHeight(), rspanheight);

              if (isValidArray(clip))
              {
                clip[2] = clipsize;
                chc.forceClip(null);
                chc.setClip(clip);
              }
              else
              {
                chc.setClip([0, 0, clipsize, 0]);
              };
              
              chc.setMaxHeight(null);
              break;
              
            default:
              chc.setMaxHeight(Infinity);
              chc.setClip(null);
          };
        
          if (vUseVirtualCells)
          {
            virt = this._virtualCells[i*vColCount+j];
          
            virt.style.top = vCurrentTop + "px";
            virt.style.height = rspanheight + "px";
            
            virt.style.borderTop = i == 0 ? "1px solid white" : "0 none";
          };
        };        
      };
    };  
    
    vCurrentTop += rheight;
  };
};








proto._calculateChildrenDependWidth = function(vModifiedWidget, vHint) 
{
  return 500;
};

proto._calculateChildrenDependHeight = function(vModifiedWidget, vHint) 
{
  return 500;
};
