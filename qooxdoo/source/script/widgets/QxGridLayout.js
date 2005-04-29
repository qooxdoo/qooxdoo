function QxGridLayout(vRows, vCols, vShowVirtualCells)
{
  QxLayout.call(this);  
  
  this._rowHeights = [];
  this._colWidths = [];
  
  this._computedRowTypes = [];
  this._computedColTypes = [];
  
  this._computedRowHeights = [];
  this._computedColWidths = [];
  
  this._virtualCells = [];
  
  if (isValid(vShowVirtualCells)) {
    this.setShowVirtualCells(vShowVirtualCells);
  };
  
  this.addRowsFromString(vRows);
  this.addColsFromString(vCols);
};

QxGridLayout.extend(QxLayout, "QxGridLayout");



/*
------------------------------------------------------------------------------------
  PROPERTIES
------------------------------------------------------------------------------------
*/

QxGridLayout.addProperty({ name : "constraintMode", type : String, defaultValue : "clip" });
QxGridLayout.addProperty({ name : "respectSpansInAuto", type : Boolean, defaultValue : false });
QxGridLayout.addProperty({ name : "showVirtualCells", type : Boolean, defaultValue : false });




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
  if (isInvalidNumber(h.colspan)) {
    h.colspan = 1;
  };

  if (isInvalidNumber(h.rowspan)) {
    h.rowspan = 1;
  };
  
  w.setParent(this);
  w.setLayoutHint(h);
};

proto.remove = function(w)
{
  w.setParent(null);
  w.setLayoutHint(null);
};

proto.addRowsFromString = function(vRows)
{
  if (isValidString(vRows))
  {
    for (var i=0, a=vRows.split(","), l=a.length; i<l; i++) {
      this.addRow(a[i]);
    };
  };
};

proto.addColsFromString = function(vCols)
{
  if (isValidString(vCols))
  {
    for (var i=0, a=vCols.split(","), l=a.length; i<l; i++) {
      this.addCol(a[i]);
    };
  };  
};




/*
------------------------------------------------------------------------------------
  ROW/COL UTILITIES
------------------------------------------------------------------------------------
*/

proto.addRow = function(vHeight)
{
  var vPos = this._rowHeights.length + 1;  
  var vComputed, vType;
  
  switch(typeof vHeight)
  {
    case "number":
      vComputed = vHeight;
      vType = "static";
      break;
      
    case "string":
      if (vHeight == "auto")
      {
        vType = "auto";
        vComputed = this._computeAutoRowHeight(vPos, vHeight);
        break;
      }
      else if (vHeight.indexOf("*") == 0)
      {
        vType = "any";
        vComputed = this._computeAnyRowHeight(vPos, vHeight);
        break;
      }
      else if (vHeight.indexOf("%") == (vHeight.length-1))
      {
        vType = "percent";
        vComputed = this._computePercentRowHeight(vPos, vHeight);
        break;
      };
      
      var vTemp = parseInt(vHeight);
      if (!isNaN(vTemp))
      {
        vComputed = vTemp;
        vType = "static";        
        break;
      };
      
    default:
      throw new Error("Unsupported Row Type: " + vHeight);
  };
  
  this._rowHeights.push(vHeight);  
  this._rowCount = this._rowHeights.length;
  
  if (isValidString(vType)) {
    this._computedRowTypes.push(vType);
  };
  
  if (isValidNumber(vComputed)) {
    this._computedRowHeights.push(vComputed);
  };
  
  if (this.getShowVirtualCells())
  {
    for (var i=0, l=this.getColCount(); i<l; i++) {
      this._virtualCells.push(document.createElement("div"));    
    };
  };
};

proto.addCol = function(vWidth)
{
  var vPos = this._colWidths.length + 1;  
  var vComputed, vType;
  
  switch(typeof vWidth)
  {
    case "number":
      vComputed = vWidth;
      vType = "static";
      break;
      
    case "string":
      if (vWidth == "auto")
      {
        vType = "auto";
        vComputed = this._computeAutoColWidth(vPos, vWidth);
        break;
      }
      else if (vWidth.indexOf("*") == 0)
      {
        vType = "any";
        vComputed = this._computeAnyColWidth(vPos, vWidth);
        break;
      }
      else if (vWidth.indexOf("%") == (vWidth.length-1))
      {
        vType = "percent";
        vComputed = this._computePercentColWidth(vPos, vWidth);
        break;
      };
      
      var vTemp = parseInt(vWidth);
      if (!isNaN(vTemp))
      {
        vComputed = vTemp;
        vType = "static";        
        break;
      };
            
    default:
      throw new Error("Unsupported Col Type: " + vWidth);
  };
  
  this._colWidths.push(vWidth);
  this._colCount = this._colWidths.length;
  
  if (isValidString(vType)) {
    this._computedColTypes.push(vType);
  };
  
  if (isValidNumber(vComputed)) {
    this._computedColWidths.push(vComputed);
  };

  if (this.getShowVirtualCells())
  {
    // mhh, does this work?  
    for (var i=0, l=this.getRowCount(); i<l; i++) {
      this._virtualCells.insertAt(document.createElement("div"), i*this._colCount);
    };  
  };
};

proto.getRowCount = function() {
  return this._rowCount;
};

proto.getColCount = function() {
  return this._colCount;
};







/*
------------------------------------------------------------------------------------
  LAYOUT
------------------------------------------------------------------------------------
*/

proto._layoutHorizontalInitialDone = false;

proto._layoutInternalWidgetsHorizontal = function(vHint, vModifiedChild)
{
  if (!this._layoutHorizontalInitialDone) {
    vHint = "initial";
  };
  
  var vCol;
  
  switch(vHint)
  {
    case "initial":
      for (var i=0, ch=this.getChildren(), chl=ch.length, chc=ch[0]; i<chl; i++, chc=ch[i]) {
        this._layoutHorizontal(chc);
      };
      break;

    case "load":
    case "size":
      if (vModifiedChild && this._updateAutoCols(vModifiedChild)) 
      {
        var vMatchCol = vModifiedChild.getLayoutHint().col;
        
        var vLayoutHint;
        var vCol;
        
        for (var i=0, ch=this.getChildren(), chl=ch.length, chc=ch[0]; i<chl; i++, chc=ch[i])
        {
          vLayoutHint = chc.getLayoutHint();
          vCol = vLayoutHint.col;
          
          if (vCol >= vMatchCol || (vCol < vMatchCol && (vLayoutHint.colspan + vCol) >= vMatchCol))
          {
            this._layoutHorizontal(chc);     
          };
        };
      };
      
      break;
      
    case "append-child":
      var vChange = false;
    
      for (var i=0, ch=this.getChildren(), chl=ch.length, chc=ch[0]; i<chl; i++, chc=ch[i])
      {
        vCol = chc.getLayoutHint().col;
        
        if (vChange)
        {
          this._layoutHorizontal(chc);
        }
        else
        {
          switch(this._computedColTypes[vCol-1])
          {
            case "auto":
              this._layoutHorizontal(chc);
              vChange = true;
              break;
          };          
        };
      };
      
      break;      
    
    case "inner-width":
      var vChange = false;
      var vLayoutHint, vColSpan;
      
      for (var i=0, ch=this.getChildren(), chl=ch.length, chc=ch[0]; i<chl; i++, chc=ch[i])
      {
        vLayoutHint = chc.getLayoutHint();
        vCol = vLayoutHint.col;
        
        if (vChange)
        {
          this._layoutHorizontal(chc);
        }
        else
        {
          switch(this._computedColTypes[vCol-1])
          {
            case "percent":
            case "any":
              this._layoutHorizontal(chc);
              vChange = true;
              break;
              
              
            default:
              // Detection for childs which uses rowspan and
              // override their starting cell and so could have
              // a cell in their rowspan which type is percent or any
              vColSpan = vLayoutHint.colspan;
              
              for (var j=1; j<vColSpan; j++)
              {
                switch(this._computedColTypes[vCol-1+j])
                {
                  case "percent":
                  case "any":
                    this._layoutHorizontal(chc);
                    vChange = true;
                    break;             
                };
              };              
          };
        };        
      };
      
      break;
  };
  
  this._layoutHorizontalInitialDone = true;
};




proto._layoutVerticalInitialDone = false;

proto._layoutInternalWidgetsVertical = function(vHint, vModifiedChild)
{
  if (!this._layoutVerticalInitialDone) {
    vHint = "initial";
  };
  
  var vRow;
  
  switch(vHint)
  {
    case "initial":
      for (var i=0, ch=this.getChildren(), chl=ch.length, chc=ch[0]; i<chl; i++, chc=ch[i]) {
        this._layoutVertical(chc);
      };
      break;
    
    case "load":  
    case "size":
      if (vModifiedChild && this._updateAutoRows(vModifiedChild)) 
      {
        var vMatchRow = vModifiedChild.getLayoutHint().row;
        
        var vLayoutHint;
        var vRow;
        
        for (var i=0, ch=this.getChildren(), chl=ch.length, chc=ch[0]; i<chl; i++, chc=ch[i])
        {
          vLayoutHint = chc.getLayoutHint();
          vRow = vLayoutHint.row;
          
          if (vRow >= vMatchRow || (vRow < vMatchRow && (vLayoutHint.rowspan + vRow) >= vMatchRow))
          {
            this._layoutVertical(chc);     
          };
        };
      };
      
      break;
      
    case "append-child":
      var vChange = false;
    
      for (var i=0, ch=this.getChildren(), chl=ch.length, chc=ch[0]; i<chl; i++, chc=ch[i])
      {
        vRow = chc.getLayoutHint().row;
        
        if (vChange)
        {
          this._layoutVertical(chc);
        }
        else
        {
          switch(this._computedRowTypes[vRow-1])
          {
            case "auto":
              this._layoutVertical(chc);
              vChange = true;
              break;
          };          
        };
      };
      
      break;
    
    case "inner-height":
      var vChange = false;
      var vLayoutHint, vRowSpan;
    
      for (var i=0, ch=this.getChildren(), chl=ch.length, chc=ch[0]; i<chl; i++, chc=ch[i])
      {
        vLayoutHint = chc.getLayoutHint();
        vRow = vLayoutHint.row;
        
        if (vChange)
        {
          this._layoutVertical(chc);
        }
        else
        {
          switch(this._computedRowTypes[vRow-1])
          {
            case "percent":
            case "any":
              this._layoutVertical(chc);
              vChange = true;
              break;
              
            default:
              // Detection for childs which uses rowspan and
              // override their starting cell and so could have
              // a cell in their rowspan which type is percent or any
              vRowSpan = vLayoutHint.rowspan;
              
              for (var j=1; j<vRowSpan; j++)
              {
                switch(this._computedRowTypes[vRow-1+j])
                {
                  case "percent":
                  case "any":
                    this._layoutVertical(chc);
                    vChange = true;
                    break;             
                };
              };
          };          
        };
      };
      
      break;
  };
  
  this._layoutVerticalInitialDone = true;
};








proto._layoutHorizontal = function(vWidget)
{
  var vHint = vWidget.getLayoutHint();
  
  var vRow = vHint.row-1;
  var vCol = vHint.col-1;
  
  var vColSpan = vHint.colspan;
  
  var vColCount = this.getColCount();  
  var vLeft = this.getPaddingLeft();
  var vWidth = 0;
  
  
  /* ------------------------------
     Calculate Position & Size
  ------------------------------ */ 
  for (var i=0; i<vCol; i++) {
    vLeft += this._computedColWidths[i];
  };
  
  for (var j=0; j<vColSpan; j++) {
    vWidth += this._computedColWidths[i+j];
  };
  

  /* ------------------------------
     Apply position
  ------------------------------ */  
  vWidget._applyPositionHorizontal(vLeft);
  
  
  /* ------------------------------
     Apply clip
  ------------------------------ */  
  var vClip = vWidget.getClip();
  if (vClip)
  {
    vClip[1] = vWidth;
    vWidget.forceClip(null);
    vWidget.setClip(vClip);
  }
  else
  {
    vWidget.setClip([0, vWidth, 0, 0])  
  };
  
  
  /* ------------------------------
     Virtual Cell Support
  ------------------------------ */  
  if (this.getShowVirtualCells())
  {
    var vCell = this._virtualCells[(vRow*vColCount) + vCol];
    var vCellStyle = vCell.style;
    
    vCellStyle.position = "absolute";
    vCellStyle.border = "1px solid #4D79FF";
    vCellStyle.left = vLeft + "px";
    vCellStyle.width = vWidth + "px";
    vCellStyle.zIndex = "-1";
  
    if (!vCellStyle.parentNode) {
      this.getElement().appendChild(vCell);
    };
  };
};

proto._layoutVertical = function(vWidget)
{
  var vHint = vWidget.getLayoutHint();
  
  var vRow = vHint.row-1;
  var vCol = vHint.col-1;
  
  var vRowSpan = vHint.rowspan;
  
  var vColCount = this.getColCount();  
  var vTop = this.getPaddingTop();
  var vHeight = 0;


  /* ------------------------------
     Calculate Position & Size
  ------------------------------ */  
  for (var i=0; i<vRow; i++) {
    vTop += this._computedRowHeights[i];
  };
  
  for (var j=0; j<vRowSpan; j++) {
    vHeight += this._computedRowHeights[i+j];
  };
  
  
  /* ------------------------------
     Apply position
  ------------------------------ */  
  vWidget._applyPositionVertical(vTop);


  /* ------------------------------
     Apply clip
  ------------------------------ */  
  var vClip = vWidget.getClip();
  if (vClip)
  {
    vClip[2] = vHeight;
    vWidget.forceClip(null);
    vWidget.setClip(vClip);
  }
  else
  {
    vWidget.setClip([0, 0, vHeight, 0])  
  };
  

  /* ------------------------------
     Virtual Cell Support
  ------------------------------ */  
  if (this.getShowVirtualCells())
  {
    var vCell = this._virtualCells[(vRow*vColCount) + vCol];
    var vCellStyle = vCell.style;
    
    vCellStyle.position = "absolute";
    vCellStyle.border = "1px solid #4D79FF";
    vCellStyle.top = vTop + "px";
    vCellStyle.height = vHeight + "px";
    vCellStyle.zIndex = "-1";
    
    if (!vCellStyle.parentNode) {
      this.getElement().appendChild(vCell);
    };
  };
};














proto._updatePercentCols = function()
{
  var vColCount = this.getColCount();
  
  for (var i=0; i<vColCount; i++) {
    if (this._computedColTypes[i] == "percent") {
      this._computedColWidths[i] = this._computePercentColWidth(i, this._colWidths[i]);
    }; 
  };  
};

proto._updatePercentRows = function()
{
  var vRowCount = this.getRowCount();
  
  for (var i=0; i<vRowCount; i++) {
    if (this._computedRowTypes[i] == "percent") {
      this._computedRowHeights[i] = this._computePercentRowHeight(i, this._rowHeights[i]);
    }; 
  };  
};





proto._updateAnyCols = function()
{
  var vColCount = this.getColCount();
  var vRet = false;
  var vNew;
  
  for (var i=0; i<vColCount; i++) 
  {
    if (this._computedColTypes[i] == "any") 
    {
      vNew = this._computeAnyColWidth(i, this._colWidths[i]);
      
      if (vNew != this._computedColWidths[i])
      {
        this._computedColWidths[i] = vNew;
        vRet = true;
      };
    }; 
  };
  
  return vRet;
};

proto._updateAnyRows = function()
{
  var vRowCount = this.getRowCount();
  var vRet = false;
  var vNew;  
  
  for (var i=0; i<vRowCount; i++) 
  {
    if (this._computedRowTypes[i] == "any") 
    {
      vNew = this._computeAnyRowHeight(i, this._rowHeights[i]);
      
      if (vNew != this._computedRowHeights[i])
      {
        this._computedRowHeights[i] = vNew;
        vRet = true;
      };
    }; 
  };  
  
  return vRet;
};





proto._updateAutoRows = function(otherObject)
{
  var vHint = otherObject.getLayoutHint();
  var vRow = vHint.row;
  
  if (this._computedColTypes[vRow-1] == "auto") 
  {  
    var vNew = this._computeAutoRowHeight(vRow);
    
    if (vNew != this._computedRowHeights[vRow-1])
    {
      this._computedRowHeights[vRow-1] = vNew;
      return true;
    };     
  };
  
  return false;
};


proto._updateAutoCols = function(otherObject)
{
  var vHint = otherObject.getLayoutHint();
  var vCol = vHint.col;
  
  if (this._computedColTypes[vCol-1] == "auto") 
  {  
    var vNew = this._computeAutoColWidth(vCol);
    
    if (vNew != this._computedColWidths[vCol-1])
    {
      this._computedColWidths[vCol-1] = vNew;
      return true;
    };
  };
  
  return false;
};








proto._onnewchild = function(otherObject)
{
  if (this._updateAutoRows(otherObject)) 
  {
    // Some overhead, but I have no better implementation idea yet.
    if (this._updateAnyRows()) {
      this._layoutInternalWidgetsVertical("inner-height");    
    };

    this.getHeight() == "auto" ? this._setChildrenDependHeight(otherObject, "append-child") : this._layoutInternalWidgetsVertical("append-child");
  };

  if (this._updateAutoCols(otherObject)) 
  { 
    // Some overhead, but I have no better implementation idea yet. 
    if (this._updateAnyCols()) {
      this._layoutInternalWidgetsHorizontal("inner-width");    
    };
    
    this.getWidth() == "auto" ? this._setChildrenDependWidth(otherObject, "append-child") : this._layoutInternalWidgetsHorizontal("append-child");
  };  
};

proto._onremovechild = function(otherObject)
{
  if (this._updateAutoRows(otherObject)) 
  {
    // Some overhead, but I have no better implementation idea yet.
    if (this._updateAnyRows()) {
      this._layoutInternalWidgetsVertical("inner-height");    
    };
    
    this.getHeight() == "auto" ? this._setChildrenDependHeight(otherObject, "remove-child") : this._layoutInternalWidgetsVertical("remove-child");
  };

  if (this._updateAutoCols(otherObject)) 
  {  
    // Some overhead, but I have no better implementation idea yet. 
    if (this._updateAnyCols()) {
      this._layoutInternalWidgetsHorizontal("inner-width");    
    };
    
    this.getWidth() == "auto" ? this._setChildrenDependWidth(otherObject, "remove-child") : this._layoutInternalWidgetsHorizontal("remove-child");
  };
};








proto._innerWidthChanged = function()
{
  // Invalidate internal cache
  this._invalidateInnerWidth();
  
  // Update percent cols
  this._updatePercentCols();
  
  // Update any cols
  this._updateAnyCols();
  
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

  // Update percent rows
  this._updatePercentRows();
  
  // Update any rows
  this._updateAnyRows();  

  // Update placement of children
  this._layoutInternalWidgetsVertical("inner-height");
  
  // Update children
  var ch = this._children;
  var chl = ch.length;

  for (var i=0; i<chl; i++) {
    ch[i]._renderVertical("parent");
  };  
};













proto._computePercentRowHeight = function(vPos, vHeight)
{
  if (!this.isCreated()) {
    return 0;
  };
  
  vHeight = parseFloat(vHeight);
  
  if (isNaN(vHeight)) {
    return 0;
  };
  
  return Math.round(this.getInnerHeight() * vHeight / 100);
};

proto._computePercentColWidth = function(vPos, vWidth)
{
  if (!this.isCreated()) {
    return 0;
  };
  
  vWidth = parseFloat(vWidth);
  
  if (isNaN(vWidth)) {
    return 0;
  };
  
  return Math.round(this.getInnerWidth() * vWidth / 100);  
};









proto._computeAutoRowHeight = function(vPos)
{
  var vMaxHeight = 0;
  
  for (var i=0, ch=this.getChildren(), chl=ch.length, chc=ch[0]; i<chl; i++, chc=ch[i])
  {  
    if (chc.getLayoutHint().row == vPos) {
      vMaxHeight = Math.max(chc.getAnyHeight(), vMaxHeight);
    };
  };
  
  return vMaxHeight;
};

proto._computeAutoColWidth = function(vPos)
{
  var vMaxWidth = 0;
  
  for (var i=0, ch=this.getChildren(), chl=ch.length, chc=ch[0]; i<chl; i++, chc=ch[i])
  {  
    if (chc.getLayoutHint().col == vPos) {
      vMaxWidth = Math.max(chc.getAnyWidth(), vMaxWidth);
    };
  };
  
  return vMaxWidth;
};







proto._computeAnyRowHeight = function(vPos, vHeight)
{
  if (!this.isCreated()) {
    return 0;
  };

  var innerHeight = this.getInnerHeight();
  var rows = this._computedRowHeights;
  var rowLength = rows.length;
  var rowTypes = this._computedRowTypes;
  
  for(var i=0; i<rowLength; i++)
  {
    if (rowTypes[i] != "any") {
      innerHeight -= rows[i];   
    };
  };
  
  return Math.max(0, innerHeight);
};


proto._computeAnyColWidth = function(vPos, vWidth)
{
  if (!this.isCreated()) {
    return 0;
  };
  
  var innerWidth = this.getInnerWidth();
  var cols = this._computedColWidths;
  var colLength = cols.length;
  var colTypes = this._computedColTypes;
  
  for(var i=0; i<colLength; i++)
  {
    if (colTypes[i] != "any") {
      innerWidth -= cols[i];   
    };
  };
  
  return Math.max(0, innerWidth);
};