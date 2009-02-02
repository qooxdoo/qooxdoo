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

qx.Class.define("qx.ui.virtual.layer.Column",
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
      init : "column-layer"
    }
  },
  
  
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
 
  members :
  {
    _getFirstItemIndex : function() {
      return this._firstColumn;
    },    
    
    
    fullUpdate : function(
      firstRow, lastRow, 
      firstColumn, lastColumn, 
      rowSizes, columnSizes
    )
    {
      var html = [];
      for (var x=0; x<columnSizes.length; x++)
      {
        var color = this._getItemColor(firstColumn + x);

        html.push(
          "<div style='",
          "float: left;",
          "width:", columnSizes[x], "px;",
          "height: 100%;",
          color ? "background-color:"+ color : "", 
          "'>",
          "</div>"
        );
      }
      this.getContentElement().setAttribute("html", html.join(""));
      
      this._firstColumn = firstColumn;
      this._lastColumn = lastColumn;
    },
    
    updateLayerWindow : function(
      firstRow, lastRow, 
      firstColumn, lastColumn, 
      rowSizes, columnSizes
    )
    {
      if (
        firstColumn !== this._firstColumn ||
        lastColumn !== this._lastColumn
      ) {
        this.fullUpdate(
          firstRow, lastRow, 
          firstColumn, lastColumn, 
          rowSizes, columnSizes            
        );
      }
    },
        
    
    /*
    ---------------------------------------------------------------------------
      COLOR HANDLING
    ---------------------------------------------------------------------------
    */

    setColumnColor : function(column, color) 
    {
      this._setItemColor(column, color);     
      if (column >= this._firstColumn && column <= this._lastColumn) {
        qx.ui.core.queue.Widget.add(this);
      }
    },
    
    
    getColumnColor : function(column) {
      return this._getItemColor(column)
    }
  }
});
