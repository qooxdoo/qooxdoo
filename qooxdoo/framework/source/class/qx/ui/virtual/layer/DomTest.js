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

qx.Class.define("qx.ui.virtual.layer.DomTest",
{
  extend : qx.ui.core.Widget,
  
  implement : [qx.ui.virtual.core.ILayer],
  
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    fullUpdate : function(visibleCells, rowSizes, columnSizes)
    {
      var el = this.getContainerElement().getDomElement();
      if (!el) {
        return;
      }
      el.innerHTML = "";
      
      var Style = qx.bom.element.Style;
      var Attribute = qx.bom.element.Attribute;
        
      var left = 0;
      var top = 0;
      var row = visibleCells.firstRow;
      var col = visibleCells.firstColumn;
      for (var x=0; x<rowSizes.length; x++)
      {
        var left = 0;
        var col = visibleCells.firstColumn;
        for(var y=0; y<columnSizes.length; y++)
        {
          var color = (row+col) % 2 == 0 ? "blue" : "yellow";
          var content = col + "x" + row;
          var cell = document.createElement("div");
          Style.setCss(cell, [
            "position:absolute;",
            "left:", left, "px;",
            "top:", top, "px;",
            "width:", columnSizes[y], "px;",
            "height:", rowSizes[x], "px;"
          ].join(""));
          
          Attribute.set(cell, "text", content);
          left += columnSizes[y];
          el.appendChild(cell);
        }
        top += rowSizes[x];
        row++;
      }
    },
    
    
    updateLayerWindow : function(visibleCells, lastVisibleCells, rowSizes, columnSizes) {
      this.fullUpdate(visibleCells, rowSizes, columnSizes);
    }
  }
});
