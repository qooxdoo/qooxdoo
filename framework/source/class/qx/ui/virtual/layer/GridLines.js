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

/**
 * Represents horizontal or vertical lines.
 */
qx.Class.define("qx.ui.virtual.layer.GridLines",
{
  extend : qx.ui.core.Widget,
  
  implement : [qx.ui.virtual.core.ILayer],
  
  /**
   * @param orientation {String?"horizontal"} The grid line orientation.
   */
  construct : function(orientation) 
  {
    this.base(arguments);

    this.__lineColors = [];
    this.__lineSizes = [];

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

    /** The default color for grid lines.*/
    defaultLineColor :
    {
      init : "gray",
      check : "Color",
      themeable : true
    },

    /** The default width/height for grid lines.*/
    defaultLineSize :
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

    /** Stores the colors for deviant grid lines. */
    __lineColors : null,

    /** Stores the width/height for deviant grid lines. */
    __lineSizes : null,

    /**
     * Sets the color for the grid line with the given index.
     * 
     * @param index {PositiveNumber} The index of the line.
     * @param color {Color} The color.
     */
    setLineColor : function(index, color)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        qx.core.Assert.assertPositiveNumber(index);
        qx.core.Assert.assertString(color);
      }
      this.__lineColors[index] = color;
    },

    /**
     * Sets the width/height for the grid line with the given index.
     * 
     * @param index {PositiveNumber} The index of the line.
     * @param size {PositiveInteger} The size.
     */
    setLineSize : function(index, size)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        qx.core.Assert.assertPositiveInteger(index);
        qx.core.Assert.assertPositiveInteger(size);
      }
      this.__lineSizes[index] = size;
    },

    /**
     * Returns the size of the grid line with the given index.
     * 
     * @param index {PositiveNumber} The index of the line.
     * @return {PositiveInteger} The size.
     */
    getLineSize : function(index) {
      return this.__lineSizes[index] || this.getDefaultLineSize();
    },

    /**
     * Returns the color of the grid line with the given index.
     * 
     * @param index {PositiveNumber} The index of the line.
     * @return {String} The color.
     */
    getLineColor : function(index) {
      return this.__lineColors[index] || this.getDefaultLineColor();
    },

    /**
     * Helper function to render horizontal lines.
     * 
     * @param htmlArr {Array} An array to store the generated HTML in.
     * @param rowSizes {Array} An array containing the row sizes.
     */
    __renderHorizontalLines : function(htmlArr, rowSizes)
    {
      var top = 0;
      var color, height;
      for (var y=0; y<rowSizes.length-1; y++)
      {
        color = this.getLineColor(this._firstRow + y);
        height = this.getLineSize(this._firstRow + y);

        top += rowSizes[y];
        htmlArr.push(
          "<div style='",
          "position: absolute;",
          "height: " + height + "px;",
          "width: 100%;",
          "top:", top - ((height > 1) ? Math.floor(height / 2) : 1), "px;",
          "background-color:", color, 
          "'>",
          "</div>"
        );
      }  
    },
    
    /**
     * Helper function to render vertical lines.
     * 
     * @param htmlArr {Array} The array to store the generated HTML in.
     * @param columnSizes {Array} An array containing the column sizes.
     */
    __renderVerticalLines : function(htmlArr, columnSizes)
    {
      var left = 0;
      var color, width;
      for (var x=0; x<columnSizes.length-1; x++)
      {
        color = this.getLineColor(this._firstColumn + x);
        width = this.getLineSize(this._firstColumn + x);

        left += columnSizes[x];
        htmlArr.push(
          "<div style='",
          "position: absolute;",
          "width: " + width + "px;",          
          "height: 100%;",
          "top: 0px;",
          "left:", left - ((width > 1) ? Math.floor(width / 2) : 1), "px;",
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
