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
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

qx.Class.define("qx.ui.virtual.layer.GridLines",
{
  extend : qx.ui.core.Widget,
  
  implement : [qx.ui.virtual.core.ILayer],
  
  construct : function(orientation) 
  {
    this.base(arguments);

    this.__lineColors = [];
    this.__lineWidths = [];

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
    },

    defaultLineColor :
    {
      init : "gray",
      check : "Color",
      themeable : true
    },

    defaultLineWidth :
    {
      init : "1",
      check : "PositiveInteger",
      themeable : true
    }

  },
   
  
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
 
  members :
  {  

    __lineColors : null,
    __lineWidths : null,

    setLineColor : function(index, color)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        qx.core.Assert.assertPositiveInteger(index);
        qx.core.Assert.assertString(color);
      }
      this.__lineColors[index] = color;
    },

    setLineWidth : function(index, width)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        qx.core.Assert.assertPositiveInteger(index);
        qx.core.Assert.assertPositiveInteger(width);
      }
      this.__lineWidths[index] = width;
    },

    getLineWidth : function(index) {
      return this.__lineWidths[index] || this.getDefaultLineWidth();
    },

    getLineColor : function(index) {
      return this.__lineColors[index] || this.getDefaultLineColor();
    },

    __renderHorizontalLines : function(htmlArr, rowSizes)
    {
      var top = 0;
      var color, height;
      for (var y=0; y<rowSizes.length-1; y++)
      {
        color = this.getLineColor(this._firstRow + y);
        height = this.getLineWidth(this._firstRow + y);

        top += rowSizes[y] - 1;       
        htmlArr.push(
          "<div style='",
          "position: relative;",
          "height: " + height + "px;",
          "width: 100%;",
          "top:", top, "px;",
          "background-color:", color, 
          "'>",
          "</div>"
        );
      }  
    },
    
    __renderVerticalLines : function(htmlArr, columnSizes)
    {
      var left = 0;
      var color, width;
      for (var x=0; x<columnSizes.length-1; x++)
      {
        color = this.getLineColor(this._firstColumn + x);
        width = this.getLineWidth(this._firstColumn + x);

        left += columnSizes[x];       
        htmlArr.push(
          "<div style='",
          "position: absolute;",
          "width: " + width + "px;",          
          "height: 100%;",
          "top: 0px;",
          "left:", left-1, "px;",
          "background-color:", color, 
          "'>",
          "</div>"
        );
      }      
    },

    // interface implementation
    fullUpdate : function(
      firstRow, lastRow, 
      firstColumn, lastColumn, 
      rowSizes, columnSizes
    )
    {
      this._firstRow = firstRow;
      this._lastRow = lastRow;
      this._firstColumn = firstColumn;
      this._lastColumn = lastColumn;       

      var html = [];
      if (this._isHorizontal) {
        this.__renderHorizontalLines(html, rowSizes);
      } else {
        this.__renderVerticalLines(html, columnSizes);
      }
      this.getContentElement().setAttribute("html", html.join(""));
    },
    
    // interface implementation
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
