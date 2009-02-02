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
    // overridden
    _getFirstItemIndex : function() {
      return this._firstColumn;
    },    
    
    
    // overridden
    fullUpdate : function(
      firstRow, lastRow, 
      firstColumn, lastColumn, 
      rowSizes, columnSizes
    )
    {
      var html = [];
      for (var x=0; x<columnSizes.length; x++)
      {
        var color = this.getColor(firstColumn + x);

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
       

    // overridden
    setColor : function(index, color) 
    {
      this.base(arguments, index, color);     
      if (index >= this._firstColumn && index <= this._lastColumn) {
        qx.ui.core.queue.Widget.add(this);
      }
    }
  }
});
