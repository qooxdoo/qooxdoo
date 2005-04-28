function QxGridLayout(vRowConfig, vColConfig)
{
  QxLayout.call(this);  
  
  this._rowConfig = isValid(vRowConfig) ? vRowConfig : "auto,auto";
  this._colConfig = isValid(vColConfig) ? vColConfig : "100,100";
  
  this._rowHeights = this._rowConfig.split(",");
  this._colWidths = this._colConfig.split(",");
  
  this.setRowCount(this._rowHeights.length);
  this.setColCount(this._colWidths.length);
};

QxGridLayout.extend(QxLayout, "QxGridLayout");

QxGridLayout.addProperty({ name : "rowCount", type : Number, defaultValue : 2 });
QxGridLayout.addProperty({ name : "colCount", type : Number, defaultValue : 2 });

QxGridLayout.addProperty({ name : "colMode", type : String, defaultValue : "clip" });
QxGridLayout.addProperty({ name : "respectSpansInAuto", type : Boolean, defaultValue : false });


proto._rowHeights = null;
proto._colWidths = null;

proto._rowConfig = null;
proto._colConfig = null;

proto._normalizedRowHeights = null;
proto._normalizedColWidths = null;

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


/*
------------------------------------------------------------------------------------
  RENDERER: PLACEMENT OF CHILDREN
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
      
      var rc = this.getRowCount();
      
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
      
      var rc = this.getColCount();
      
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

proto._layoutInternalWidgetsHorizontal = function()
{
  var innerWidth = this.getInnerWidth();
  
  this._normalizeHorizontalData(innerWidth);
  
  var rc = this.getRowCount();
  var cc = this.getColCount();
  
  var ch = this.getChildren();
  var chl = ch.length;
  var chc, chh;
  
  var padx = this.getPaddingLeft();
  var posx = padx;
  
  var usevirt = isValid(this._virtualCols);
  var virt;
  
  var clip, clipsize;
  var cwidth, cspanwidth;
  var colMode = this.getColMode();
  
  for (var i=0; i<rc; i++)
  {
    for (var j=0; j<cc; j++)
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
          
          chc._applyPositionHorizontal(posx);
          
          switch(colMode)
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
          
          if (usevirt)
          {
            virt = this._virtualCols[i*cc+j];
           
            virt.style.left = posx + "px";
            virt.style.width = cspanwidth + "px";
            
            virt.style.borderLeft = j == 0 ? "1px solid white" : "0 none";
          };
        };
      };
      
      posx += cwidth;
    };  

    posx = padx;
  };
};

proto._layoutInternalWidgetsVertical = function() 
{
  var innerHeight = this.getInnerHeight();
  
  this._normalizeVerticalData(innerHeight);
  
  var rc = this.getRowCount();
  var cc = this.getColCount();
  
  var ch = this.getChildren();
  var chl = ch.length;
  var chc, chh;
  
  var pady = this.getPaddingTop();
  var posy = pady;
  
  var usevirt = isValid(this._virtualCols);
  var virt;  
  
  var clip;
  var rheight, rspanheight;
  var colMode = this.getColMode();
  
  for (var i=0; i<rc; i++)
  {
    rheight = this._normalizedRowHeights[i];
    
    for (var j=0; j<cc; j++)
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
          
          chc._applyPositionVertical(posy);

          switch(colMode)
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
        
          if (usevirt)
          {
            virt = this._virtualCols[i*cc+j];
          
            virt.style.top = posy + "px";
            virt.style.height = rspanheight + "px";
            
            virt.style.borderTop = i == 0 ? "1px solid white" : "0 none";
          };
        };        
      };
    };  
    
    posy += rheight;
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







proto._virtualCols = null;

proto._createVirtualCols = function()
{
  var rc = this.getRowCount();
  var cc = this.getColCount();  
  
  var c = this._virtualCols = [];
  var p = this.getParent();
  var e = this.getElement();
  var d = p.getTopLevelWidget().getDocumentElement();
  
  var n;
  
  for (var i=0; i<rc; i++)
  {
    for (var j=0; j<cc; j++)
    {
      n = d.createElement("div");
      n.style.position="absolute";
      n.style.border = "1px solid white";
      
      c.push(n);
      e.appendChild(n);
    };
  };
};


proto._beforeShow = function(uniqModIds) {
  this._createVirtualCols();
};







proto._modifyColMode = function(propValue, propOldValue, propName, uniqModIds)
{
  if (this._wasVisible) 
  {
    this._layoutInternalWidgetsHorizontal();
    this._layoutInternalWidgetsVertical();
  };
  
  return true;  
};