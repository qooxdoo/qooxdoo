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
   * Jonathan Weiß (jonathan_rass)
   * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.ui.virtual.layer.WidgetCellSpan",
{
  extend : qx.test.ui.virtual.layer.LayerTestCase,

  members :
  { 
    setUp : function()
    {
      this._pool = [];
      this.base(arguments);
    },  
  
    
    _createLayer : function() 
    {
      this.__cellRenderer = new qx.ui.virtual.cell.Cell();
      
      var rowConfig = new qx.ui.virtual.core.Axis(10, 100);
      var columnConfig = new qx.ui.virtual.core.Axis(20, 100);
      
      return new qx.ui.virtual.layer.WidgetCellSpan(
        this,
        rowConfig,
        columnConfig
      );
    },
    
    
    getCellWidget : function(row, column) 
    {
      var widget = this._pool.pop() || new qx.ui.core.Widget();
      widget.setUserData("row", row);
      widget.setUserData("column", column);
      widget.setBackgroundColor((row + column) % 2 == 0 ? "red" : "green");
      return widget;
    },
    
    
    poolCellWidget : function(widget) 
    {      
      widget.setUserData("row", -1);
      widget.setUserData("column", -1);
      this._pool.push(widget);
    },
    
    
    _assertCells : function(firstRow, firstColumn, rowCount, columnCount, msg) 
    {
      var children = this.layer._cellLayer._getChildren();
      
      this.assertEquals(rowCount * columnCount, children.length);
      
      for (var y=0; y<rowCount; y++)
      {
        for (var x=0; x<columnCount; x++)
        {
          var row = firstRow + y;
          var column = firstColumn + x;
          
          var widget = children[y*columnCount + x];
          this.assertEquals(row, widget.getUserData("row"));
          this.assertEquals(column, widget.getUserData("column"));
        }
      }
    }
  }
});
