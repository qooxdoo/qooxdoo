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

/**
 * The Row layer renders row background colors. 
 */
qx.Class.define("qx.ui.virtual.layer.Row",
{
  extend : qx.ui.virtual.layer.AbstractBackground,

  
  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "row-layer"
    }
  },
  
  
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
 
  members :
  {
    // overridden
    _getFirstItemIndex : function() {
      return this._firstRow;
    },    
    
    
    // overridden
    fullUpdate : function(
      firstRow, lastRow, 
      firstColumn, lastColumn, 
      rowSizes, columnSizes
    )
    {
      var html = [];
      for (var y=0; y<rowSizes.length; y++)
      {
        var color = this.getColor(firstRow + y);

        html.push(
          "<div style='",
          "height:", rowSizes[y], "px;",
          "width: 100%;",
          color ? "background-color:"+ color : "", 
          "'>",
          "</div>"
        );
      }
      this.getContentElement().setAttribute("html", html.join(""));
      
      this._firstRow = firstRow;
      this._lastRow = lastRow;
    },
    
    
    // overridden
    updateLayerWindow : function(
      firstRow, lastRow, 
      firstColumn, lastColumn, 
      rowSizes, columnSizes
    )
    {
      if (
        firstRow !== this._firstRow ||
        lastRow !== this._lastRow
      ) {
        this.fullUpdate(
          firstRow, lastRow, 
          firstColumn, lastColumn, 
          rowSizes, columnSizes            
        );
      }
    },
        
    
    // overridden
    setColor : function(index, color) 
    {
      this.base(arguments, index, color);     
      if (index >= this._firstRow && index <= this._lastRow) {
        qx.ui.core.queue.Widget.add(this);
      }
    }
  }
});
