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

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/16/places/*)
#asset(qx/icon/${qx.icontheme}/22/places/*)
#asset(qx/icon/${qx.icontheme}/32/places/*)
#asset(qx/icon/${qx.icontheme}/48/places/*)
#asset(qx/icon/${qx.icontheme}/64/places/*)
#asset(qx/icon/${qx.icontheme}/128/places/*)

************************************************************************ */

qx.Class.define("qx.ui.virtual.layer.WidgetList",
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
    _pool : null,
    
    _getWidget : function(row, column) {
      return this._pool.pop() || new qx.ui.basic.Atom();
    },
    
    _poolWidget: function(widget) {
      this._pool.push(widget);
    },
    
    _configureWidget : function(widget, row, column) 
    {
      widget.set({
        label: "Item #" + row,
        icon: "icon/32/places/folder.png"
      });      
    },    
    
    fullUpdate : function(visibleCells, lastVisibleCells, rowSizes, columnSizes)
    {
      var children = this._getChildren();
      for (var i=0; i<children.length; i++) {
        this._poolWidget(children[i]);
      }
      
      this._removeAll();
      
      var top = 0;
      for (var y=0; y<rowSizes.length; y++)
      {
        var rowIndex = visibleCells.firstRow + y;
        
        var item = this._getWidget(rowIndex, 0);
        this._configureWidget(item, rowIndex, 0);
        
        item.setUserBounds(0, top, columnSizes[0], rowSizes[y]);
        this._add(item);
        
        top += rowSizes[y];
      }
    },
    
    updateScrollPosition : function(visibleCells, lastVisibleCells, rowSizes, columnSizes) 
    {
      this.fullUpdate(visibleCells, lastVisibleCells, rowSizes, columnSizes);
    }
  }
});
