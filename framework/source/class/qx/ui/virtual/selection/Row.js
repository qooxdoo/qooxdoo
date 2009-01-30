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

qx.Class.define("qx.ui.virtual.selection.Row",
{
  extend : qx.ui.virtual.selection.Abstract,
   
   
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
 
  members :
  {  
    // overridden
    _getSelectableFromMouseEvent : function(event)
    {
      var mouseTop = event.getDocumentTop();
      var paneTop = this._pane.getContentLocation().top;
      
      var row = this._pane.rowConfig.getItemAtPosition(
        this._pane.getScrollY() + mouseTop - paneTop
      ).index;
      
      return this._isSelectable(row) ? row : null;
    },        
    
    
    // overridden
    getSelectables : function() 
    {
      var selectables = [];
      
      for (var i=0, l=this._pane.rowConfig.getItemCount(); i<l; i++) 
      {
        if (this._isSelectable(i)) {
          selectables.push(i);
        }        
      }
      
      return selectables;
    },


    // overridden
    _getSelectableRange : function(item1, item2)
    {
      var selectables = [];
      var min = Math.min(item1, item2);
      var max = Math.max(item1, item2);
      
      for (var i=min; i<=max; i++) 
      {
        if (this._isSelectable(i)) {
          selectables.push(i);
        }
      }
      
      return selectables;      
    },


    // overridden
    _getFirstSelectable : function() 
    {
      var count = this._pane.rowConfig.getItemCount();
      for (var i=0; i<count; i++) 
      {
        if (this._isSelectable(i)) {
          return i;
        }      
      }
      return null;
    },


    // overridden
    _getLastSelectable : function() 
    {
      var count = this._pane.rowConfig.getItemCount();
      for (var i=count-1; i>=0; i--) 
      {
        if (this._isSelectable(i)) {
          return i;
        }      
      }
      return null;
    },


    // overridden
    _getRelatedSelectable : function(item, relation) 
    {
      var related = -1;
      if (relation == "above") {
        related = item - 1;
      } else if (relation == "under") {
        related = item + 1;
      }
      
      if (
        related >= this._pane.rowConfig.getItemCount() ||
        related < 0
      ) {
        return null;
      } else {
        return related;
      }
    },


    // overridden
    _getPage : function(lead, up) 
    {
      if (up) {
        return this._getFirstSelectable();
      } else {
        return this._getLastSelectable();
      }
    },    
    
    
    // overridden
    _isSelectable : function(item) {
      return true;
    },
    
    
    // overridden
    _selectableToHashCode : function(item) {
      return item;
    },
    
    
    // overridden
    _styleSelectable : function(item, type, enabled) {      
    },
    
    
    // overridden
    _scrollItemIntoView : function(item) 
    {
      var bounds = this._pane.getBounds();
      if (!bounds) 
      {
        this._pane.addListenerOnce("appear", function() {
          this._scrollItemIntoView(item);
        }, this);
        return;
      }

      var rowConfig = this._pane.rowConfig;
      var itemTop = rowConfig.getItemPosition(item);
      var itemBottom = itemTop + rowConfig.getItemSize(item);
      var scrollTop = this._pane.getScrollY();
     
      
      if (itemTop < scrollTop) {
        this._pane.setScrollY(itemTop);
      } else if (itemBottom > scrollTop + bounds.height) {
        this._pane.setScrollY(itemBottom - bounds.height);
      }
    },
    
    
    // overridden
    _getSelectableLocationX : function(item) 
    {
      return {
        left: 0,
        right: this._pane.columnConfig.getTotalSize() - 1
      };
    },


    // overridden
    _getSelectableLocationY : function(item) 
    {
      var rowConfig = this._pane.rowConfig;
      
      var itemTop = rowConfig.getItemPosition(item);
      var itemBottom = itemTop + rowConfig.getItemSize(item) - 1;
      
      return {
        top: itemTop,
        bottom: itemBottom
      }
    }
  }
});
