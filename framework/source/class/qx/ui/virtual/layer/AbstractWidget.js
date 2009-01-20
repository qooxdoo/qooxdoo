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

qx.Class.define("qx.ui.virtual.layer.AbstractWidget",
{
  extend : qx.ui.core.Widget,
  
  construct : function()
  {
    this.base(arguments);
    this._pool = [];
  },
  
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
 
  members :
  {
    _getWidget : function(row, column) {
      throw new Error("_getWidget is abstract");
    },
    
    _poolWidget: function(widget) {
      throw new Error("_poolWidget is abstract");
    },

    _configureWidget : function(widget, row, column) 
    {
      throw new Error("_configureWidget is abstract");
    },    
    
    fullUpdate : function(visibleCells, lastVisibleCells, rowSizes, columnSizes)
    {
      var children = this._getChildren();
      for (var i=0; i<children.length; i++) {
        this._poolWidget(children[i]);
      }
      
      this._removeAll();
      
      var top = 0;
      var left = 0;
      for (var x=0; x<columnSizes.length; x++)
      {
        for (var y=0; y<rowSizes.length; y++)
        {
          var rowIndex = visibleCells.firstRow + y;
          var colIndex = visibleCells.firstColumn + x;
                
          var item = this._getWidget(rowIndex, colIndex);
          this._configureWidget(item, rowIndex, colIndex);
                
          item.setUserBounds(left, top, columnSizes[x], rowSizes[y]);
          this._add(item);

          top += rowSizes[y];
        }
        left += columnSizes[x];
        top = 0;
      }
    },
    
    updateScrollPosition : function(visibleCells, lastVisibleCells, rowSizes, columnSizes) 
    {
      this.fullUpdate(visibleCells, lastVisibleCells, rowSizes, columnSizes);
    }
  }
});
