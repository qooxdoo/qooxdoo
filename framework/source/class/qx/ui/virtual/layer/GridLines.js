/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.ui.virtual.layer.GridLines",
{
  extend : qx.ui.core.Widget,
  
  implement : [qx.ui.virtual.core.ILayer],
  
  construct : function(orientation) 
  {
    this.base(arguments);
    this._isHorizontal = (orientation || "vertical") == "horizontal";
  },
  
  
  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    anonymous :
    {
      refine: true,
      init: true
    }
  },
   
  
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
 
  members :
  {  
    _color : "gray",
  
    __renderHorizontalLines : function(htmlArr, rowSizes)
    {
      var top = 0;
      for (var y=0; y<rowSizes.length-1; y++)
      {
        top += rowSizes[y] - 1;       
        htmlArr.push(
          "<div style='",
          "position: relative;",
          "height: 1px;",
          "width: 100%;",
          "top:", top, "px;",
          "background-color:", this._color, 
          "'>",
          "</div>"
        );
      }  
    },
    
    __renderVerticalLines : function(htmlArr, columnSizes)
    {
      var left = 0;
      for (var x=0; x<columnSizes.length-1; x++)
      {
        left += columnSizes[x];       
        htmlArr.push(
          "<div style='",
          "position: absolute;",
          "width: 1px;",          
          "height: 100%;",
          "top: 0px;",
          "left:", left-1, "px;",
          "background-color:", this._color, 
          "'>",
          "</div>"
        );
      }      
    },
  
    fullUpdate : function(
      firstRow, lastRow, 
      firstColumn, lastColumn, 
      rowSizes, columnSizes
    )
    {
      var html = [];
      if (this._isHorizontal) {
        this.__renderHorizontalLines(html, rowSizes);
      } else {
        this.__renderVerticalLines(html, columnSizes);
      }
      this.getContentElement().setAttribute("html", html.join(""));
      
      this._firstRow = firstRow;
      this._lastRow = lastRow;
      this._firstColumn = firstColumn;
      this._lastColumn = lastColumn;       
    },
    
    updateLayerWindow : function(
      firstRow, lastRow, 
      firstColumn, lastColumn, 
      rowSizes, columnSizes
    ) 
    {
      var rowChanged = firstRow !== this._firstRow;
      var columnChanged = firstColumn !== this._firstColumn;
      
      if (
        (this._isHorizontal && rowChanged) ||
        (!this._isHorizontal && columnChanged)
      ) {
        this.fullUpdate(
          firstRow, lastRow, 
          firstColumn, lastColumn, 
          rowSizes, columnSizes
        );
      }
    }
  }
});
