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

qx.Class.define("qx.ui.virtual.layer.Row",
{
  extend : qx.ui.core.Widget,
  
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
 
  members :
  {
    _even : "yellow",
    _odd : "white",
    _colors : {
      "2" : "red",
      "10": "blue",
      "13": "gray"
    },
  
    fullUpdate : function(visibleCells, lastVisibleCells, rowSizes, columnSizes)
    {
      var html = [];
      for (var y=0; y<rowSizes.length; y++)
      {
        var rowIndex = visibleCells.firstRow + y;
        if (this._colors[rowIndex]) {
          var color = this._colors[rowIndex];
        } else {
          color = rowIndex % 2 == 0 ? this._even : this._odd;
        }

        html.push(
          "<div style='",
          "height:", rowSizes[y], "px;",
          "width: 100%;",
          "background-color:", color, 
          "'>",
          "</div>"
        );
      }
      this.getContentElement().setAttribute("html", html.join(""));
    },
    
    updateScrollPosition : function(visibleCells, lastVisibleCells, rowSizes, columnSizes) 
    {
      if (
        visibleCells.firstRow !== lastVisibleCells.firstRow ||
        visibleCells.lastRow !== lastVisibleCells.lastRow
      ) {
        this.fullUpdate(visibleCells, lastVisibleCells, rowSizes, columnSizes);
      }
    }
  }
});
