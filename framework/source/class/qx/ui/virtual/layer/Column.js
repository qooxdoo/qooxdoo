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
    fullUpdate : function(
      firstRow, lastRow, 
      firstColumn, lastColumn, 
      rowSizes, columnSizes
    )
    {
      var html = [];

      var height = qx.lang.Array.sum(rowSizes);
      var decorations = [];
      
      var left = 0;
      var column = firstColumn;
      var childIndex = 0;
      
      for (var x=0; x<columnSizes.length; x++)
      {
        
        var decorator = this.getDecorator(column);
        if (decorator)
        {          
          decorations.push({
            childIndex: childIndex,
            decorator: decorator,
            width: columnSizes[x],
            height: height
          });
          
          html.push(
            "<div style='",
            "position: absolute;",
            "top: 0;",
            "left:", left, "px;",
            "'>",
            decorator.getMarkup(),
            "</div>"
          ); 
          childIndex++;
        }
        else
        {
          var color = this.getColor(column);
          if (color)
          {
            html.push(
              "<div style='",
              "position: absolute;",
              "top: 0;",
              "left:", left, "px;",
              "width:", columnSizes[x], "px;",
              "height:", height, "px;",
              "background-color:", color, 
              "'>",
              "</div>"
            );
            childIndex++
          }
        }
        
        left += columnSizes[x];
        column += 1;        
      }
      
      var el = this.getContentElement().getDomElement();
      // hide element before changing the child nodes to avoid 
      // premature reflow calculations
      el.style.display = "none";
      el.innerHTML = html.join("");

      // set size of decorated columns
      for (var i=0, l=decorations.length; i<l; i++) 
      {
        var deco = decorations[i];
        deco.decorator.resize(
          el.childNodes[deco.childIndex].firstChild,
          deco.width,
          deco.height
        );
      }
      el.style.display = "block";
      
      this._firstColumn = firstColumn;
      this._lastColumn = lastColumn;
      this._rowSizes = rowSizes;
      this._columnSizes = columnSizes;
      this._height = height;
    },
    
    updateLayerWindow : function(
      firstRow, lastRow, 
      firstColumn, lastColumn, 
      rowSizes, columnSizes
    )
    {
      if (
        firstColumn !== this._firstColumn ||
        lastColumn !== this._lastColumn ||
        this._height < qx.lang.Array.sum(rowSizes)
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
