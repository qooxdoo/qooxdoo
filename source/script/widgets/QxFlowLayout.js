function QxFlowLayout()
{
  QxLayout.call(this);  
};

QxFlowLayout.extend(QxLayout, "QxFlowLayout");

/*!
  Horizontal spacing between widgets (like cellspacing in HTML tables)
  
  Possible values: any positive integer value
*/
QxFlowLayout.addProperty({ name : "horizontalSpacing", type : Number, defaultValue : 0 });

/*!
  Vertical spacing between widgets (like cellspacing in HTML tables)
  
  Possible values: any positive integer value
*/
QxFlowLayout.addProperty({ name : "verticalSpacing", type : Number, defaultValue : 0 });

/*
  Horizontal alignment of box content block
  
  Possible values: left, center, right
*/
QxFlowLayout.addProperty({ name : "horizontalBlockAlign", type : String, defaultValue : "left" });

/*!
  Vertical alignment of each child in the block
  
  Possible values: top, middle, bottom
*/
QxFlowLayout.addProperty({ name : "verticalChildrenAlign", type : String, defaultValue : "top" });





/*
------------------------------------------------------------------------------------
  RENDERER: PLACEMENT OF CHILDREN
------------------------------------------------------------------------------------
*/

proto._layoutInternalWidgetsHorizontal = function()
{
  // --------------------------------------------------------------------------------------------
  // Cache data from configuration
  // --------------------------------------------------------------------------------------------
  var innerWidth = this.getInnerWidth();
  var innerHeight = this.getInnerHeight();
  
  var blockAlign = this.getHorizontalBlockAlign();
  var childrenAlign = this.getVerticalChildrenAlign();
  
  var spacingX = this.getHorizontalSpacing();
  var spacingY = this.getVerticalSpacing();
  
  var paddingLeft = this.getPaddingLeft();
  var paddingTop = this.getPaddingTop();
  

  // --------------------------------------------------------------------------------------------
  // Working variables
  // --------------------------------------------------------------------------------------------
  var accumulatedWidth = 0;
  var accumulatedHeight = 0;
  
  var childNeededWidth;
  var childNeededHeight;
  
  var currentRow;  
  var childCalculatedLeft, childCalculatedTop;  
  
  var maxRequiredRowHeight = 0;
  
  var rows = [];
  var childOffsetLeft = [];
  
  
  // --------------------------------------------------------------------------------------------
  // Method to store row data  
  // --------------------------------------------------------------------------------------------
  function storeRow(accumulatedWidth, accumulatedHeight, maxRequiredRowHeight)
  {
    var r = {
      width : accumulatedWidth,
      height : maxRequiredRowHeight,
      offsetTop : accumulatedHeight
    };
    
    switch(blockAlign)
    {
      case "center":
        r.offsetLeft = (innerWidth - accumulatedWidth) / 2;
        break;
      
      case "right":
        r.offsetLeft = innerWidth - accumulatedWidth;
        break;
      
      default:
        r.offsetLeft = 0;
    };
    
    rows.push(r);
  };  
  
  
  // --------------------------------------------------------------------------------------------
  // Summarize children data and positions
  // --------------------------------------------------------------------------------------------
  var ch = this.getChildren();
  var chl = ch.length;
  var chc;
    
  for (var i=0; i<chl; i++)
  {
    chc = ch[i];
    
    // measure child
    childNeededWidth = chc.getMarginLeft() + chc.getAnyWidth() + chc.getMarginRight();
    childNeededHeight = chc.getAnyHeight();
    
    if ((accumulatedWidth + childNeededWidth) > innerWidth)
    {
      // store current row data
      storeRow(accumulatedWidth, accumulatedHeight, maxRequiredRowHeight);
      
      // store row id to dom node
      chc.__row = rows.length;

      // add row to height
      accumulatedHeight += maxRequiredRowHeight + spacingY;
      
      // store values for this child
      childOffsetLeft.push(0);

      // calculate new values for next child
      accumulatedWidth = childNeededWidth + spacingX;
      maxRequiredRowHeight = childNeededHeight;
    }
    else
    {
      // store row id to dom node
      chc.__row = rows.length;
      
      // store values for this child
      childOffsetLeft.push(accumulatedWidth);
      
      // calculate new values for next child
      accumulatedWidth += childNeededWidth + spacingX;  
      maxRequiredRowHeight = Math.max(maxRequiredRowHeight, childNeededHeight);
    };
  };  
  
  // store current row data
  storeRow(accumulatedWidth, accumulatedHeight, maxRequiredRowHeight);  
  
  

  // --------------------------------------------------------------------------------------------  
  // Calculate offsets and apply children alignments, finally apply data
  // --------------------------------------------------------------------------------------------
  for (var i=0; i<chl; i++) 
  {
    chc = ch[i];
    
    // cache row number and delete from dom node
    currentRow = rows[chc.__row];
    delete chc.__row;  
    
    // calculate new position values (taking children alignment into account now)
    childCalculatedLeft = paddingLeft + currentRow.offsetLeft + childOffsetLeft[i];
    childCalculatedTop = paddingTop + currentRow.offsetTop;
    
    switch(childrenAlign)
    {
      case "middle":
        childCalculatedTop += (currentRow.height - chc.getAnyHeight()) / 2;
        break;
      
      case "bottom":
        childCalculatedTop += currentRow.height - chc.getAnyHeight();
        break;      
    };  

    // apply new positions    
    chc._applyPositionHorizontal(childCalculatedLeft);
    chc._applyPositionVertical(childCalculatedTop);
  };   
  
  return true;
};

proto._layoutInternalWidgetsVertical = function() {
  return true;
};

proto._calculateChildrenDependWidth = function(vModifiedWidget, vHint) {
  throw new Error("Auto Width is not supported by QxFlowLayout");
};

proto._calculateChildrenDependHeight = function(vModifiedWidget, vHint) {
  throw new Error("Auto Height is not supported by QxFlowLayout");
};
