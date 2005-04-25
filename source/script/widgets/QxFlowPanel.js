function QxFlowPanel()
{
  QxWidget.call(this);
  
};

QxFlowPanel.extend(QxWidget, "QxFlowPanel");

QxFlowPanel.addProperty({ name : "horizontalSpacing", type : Number, defaultValue : 10 });
QxFlowPanel.addProperty({ name : "verticalSpacing", type : Number, defaultValue : 10 });

/*
  Horizontal alignment of box content block
  
  Possible values: left, center, right
*/
QxFlowPanel.addProperty({ name : "horizontalBlockAlign", type : String, defaultValue : "left" });

/*!
  Vertical alignment of each child in the block
  
  Possible values: top, middle, bottom
*/
QxFlowPanel.addProperty({ name : "verticalChildrenAlign", type : String, defaultValue : "middle" });


/*
------------------------------------------------------------------------------------
  BASICS

  Extend this core functions of QxWidget.
------------------------------------------------------------------------------------
*/

proto._onnewchild = QxBox.prototype._onnewchild;
proto._onremovechild = QxBox.prototype._onremovechild;

proto._innerWidthChanged = QxBox.prototype._innerWidthChanged;
proto._innerHeightChanged = QxBox.prototype._innerHeightChanged;

proto._childOuterWidthChanged = QxBox.prototype._childOuterWidthChanged;
proto._childOuterHeightChanged = QxBox.prototype._childOuterHeightChanged;

proto._setChildrenDependWidth = QxBox.prototype._setChildrenDependWidth;
proto._setChildrenDependHeight = QxBox.prototype._setChildrenDependHeight;




/*
------------------------------------------------------------------------------------
  RENDERER: PLACEMENT OF CHILDREN
------------------------------------------------------------------------------------
*/

proto._layoutInternalWidgetsHorizontal = function()
{
  var innerWidth = this.getInnerWidth();
  var innerHeight = this.getInnerHeight();
  
  var blockAlign = this.getHorizontalBlockAlign();
  var childrenAlign = this.getVerticalChildrenAlign();
  
  var spacingX = this.getHorizontalSpacing();
  var spacingY = this.getVerticalSpacing();
  
  var paddingLeft = this.getPaddingLeft();
  var paddingTop = this.getPaddingTop();
  
  var ch = this.getChildren();
  var chl = ch.length;
  var chc;
  
  var sumX = 0;
  var sumY = 0;
  
  var tempX;
  var tempY;
  
  var rowWidths = [];
  var rowHeights = [];
  var rowXStarts = [];
  var rowCount = 0;
  
  var maxY = 0;
  
  var posX = [];
  var posY = [];
  
  for (var i=0; i<chl; i++)
  {
    chc = ch[i];
    
    tempX = chc.getMarginLeft() + chc.getAnyWidth() + chc.getMarginRight();
    tempY = chc.getAnyHeight();
    
    if ((sumX + tempX) > innerWidth)
    {
      // this.debug("MAX REACHED: " + innerWidth);
      
      chc.__row = ++rowCount;      
      
      rowWidths.push(sumX);
      rowHeights.push(maxY);
      
      switch (blockAlign)
      {
        case "center":
          rowXStarts.push(paddingLeft + ((innerWidth - sumX) / 2));
          break;

        case "right":
          rowXStarts.push(paddingLeft + innerWidth - sumX);
          break;
          
        default:
          rowXStarts.push(paddingLeft);
          break;
      };

      sumY += maxY + spacingY;
      
      // this.debug("CHILD: " + i + " :: " + 0 + "x" + sumY);
      
      // store values for this child
      posX.push(0);
      posY.push(sumY);

      // calculate new values for next child
      sumX = tempX + spacingX;
      maxY = tempY;
    }
    else
    {
      // this.debug("CHILD: " + i + " :: " + sumX + "x" + sumY);
      
      chc.__row = rowCount;
      
      // store values for this child
      posX.push(sumX);
      posY.push(sumY);
      
      // calculate new values for next child
      sumX += tempX + spacingX;  
      maxY = Math.max(maxY, tempY);
    };
  };  
  
  rowWidths.push(sumX);
  rowHeights.push(maxY);  
  
  switch (blockAlign)
  {
    case "center":
      rowXStarts.push(paddingLeft + ((innerWidth - sumX) / 2));
      break;

    case "right":
      rowXStarts.push(paddingLeft + innerWidth - sumX);
      break;
      
    default:
      rowXStarts.push(paddingLeft);
      break;
  };  
  
  this.debug("POS-X: " + posX);
  this.debug("POS-Y: " + posY);
  
  this.debug("ROW-X-STARTS: " + rowXStarts);
  this.debug("ROW-HEIGHTS: " + rowHeights);

  var currentRow;
  
  for (var i=0; i<chl; i++) 
  {
    chc = ch[i];
    
    // cache row number and delete from child
    currentRow = chc.__row;
    delete chc.__row;  
    
    // calculate new position values (taking children alignment into account now)
    tempX = rowXStarts[currentRow] + posX[i];
    tempY = paddingTop + posY[i];
    
    switch(childrenAlign)
    {
      case "middle":
        tempY += (rowHeights[currentRow] - chc.getAnyHeight()) / 2;
        break;
      
      case "bottom":
        tempY += rowHeights[currentRow] - chc.getAnyHeight();
        break;      
    };  

    // apply new positions    
    chc._applyPositionHorizontal(tempX);
    chc._applyPositionVertical(tempY);
  };   
  
  return true;
};





proto._layoutInternalWidgetsVertical = function() {
  return true;
};


proto._calculateChildrenDependWidth = function(vModifiedWidget, vHint) {
  return 200;  
};

proto._calculateChildrenDependHeight = function(vModifiedWidget, vHint) {
  return 200;  
};
    
    
  