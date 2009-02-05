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
    
    syncWidget : function()
    {
      if (!this._columnSizes) {
        return;
      }
      this.fullUpdate(
        this._firstRow, this._lastRow,
        0, 0, 
        this._rowSizes, this._columnSizes
      )
    },
    
    
    // overridden
    fullUpdate : function(
      firstRow, lastRow, 
      firstColumn, lastColumn, 
      rowSizes, columnSizes
    )
    {
      var html = [];
      
      var width = qx.lang.Array.sum(columnSizes);
      var decoratedRows = {};
      
      var top = 0;
      for (var y=0; y<rowSizes.length; y++)
      {
        var deco = this.getDecorator(firstRow + y);
        if (deco) 
        {
          decoratedRows[y] = deco;
          this._hasDecoratedRows = true;
        } else {
          var color = this.getColor(firstRow + y);
        }
        
        html.push(
          "<div style='",
          "position: absolute;",
          "left: 0;",
          "top:", top, "px;",
          "height:", rowSizes[y], "px;",
          "width:", width, "px;",
          color ? "background-color:"+ color : "", 
          "'>",
          deco ? deco.getMarkup() : "",
          "</div>"
        );
        
        top += rowSizes[y];
      }
      var el = this.getContentElement().getDomElement();
      el.innerHTML = html.join("");
      
      for (var y in decoratedRows) 
      {
        var deco = decoratedRows[y];
        deco.resize(el.childNodes[y].firstChild, width, rowSizes[y]);
      }
      
      this._firstRow = firstRow;
      this._lastRow = lastRow;
      this._rowSizes = rowSizes;
      this._columnSizes = columnSizes;
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
