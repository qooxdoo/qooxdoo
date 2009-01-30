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
  extend : qx.ui.core.selection.Abstract,
   
  
  /*
   *****************************************************************************
      CONSTRUCTOR
   *****************************************************************************
   */

  /**
   * @param scroller {qx.ui.virtual.core.Scroller} The virtual scroller to connect to
   */
  construct : function(scroller)
  {
    this.base(arguments);

    this.__scroller = scroller;
  },
   
   
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
 
  members :
  {   
    // overridden
    _capture : function() {
      this.__scroller.capture();
    },


    // overridden
    _releaseCapture : function() {
      this.__scroller.releaseCapture();
    },    
    
    
    _getSelectableFromMouseEvent : function(event)
    {
      var pane = this.__scroller.pane;
      var mouseTop = event.getDocumentTop();
      var paneTop = pane.getContentLocation().top;
      var row = pane.rowConfig.getItemAtPosition(pane.getScrollY() + mouseTop - paneTop).index;
      return this._isSelectable(row) ? row : null;
    },        
    
    
    getSelectables : function() 
    {
      var selectables = [];
      
      for (var i=0, l=this.__scroller.pane.rowConfig.getItemCount(); i<l; i++) 
      {
        if (this._isSelectable(i)) {
          selectables.push(i);
        }        
      }
      
      return selectables;
    },


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


    _getFirstSelectable : function() 
    {
      var count = this.__scroller.getChildren().length;
      for (var i=0; i<count; i++) 
      {
        if (this._isSelectable(i)) {
          return i;
        }      
      }
      return null;
    },


    _getLastSelectable : function() 
    {
      var count = this.__scroller.getChildren().length;
      for (var i=count-1; i>=0; i--) 
      {
        if (this._isSelectable(i)) {
          return i;
        }      
      }
      return null;
    },


    _getRelatedSelectable : function(item, relation) 
    {
      var related = -1;
      if (relation == "above") {
        related = item - 1;
      } else if (relation == "under") {
        related = item + 1;
      }
      
      if (
        related >= this.__scroller.getChildren().length ||
        related < 0
      ) {
        return null;
      } else {
        return related;
      }
    },


    _getPage : function(lead, up) 
    {
      if (up) {
        return this._getFirstSelectable();
      } else {
        return this._getLastSelectable();
      }
    },    
    
    
    _isSelectable : function(item) {
      return true;
    },
    
    
    _selectableToHashCode : function(item) {
      return item;
    },
    
    
    _styleSelectable : function(item, type, enabled) {
      this.__scroller.updateSelection();
    },
    
    
    _getScroll : function()
    {
      return {
        left : this.__scroller.getScrollX(),
        top : this.__scroller.getScrollY()
      };
    },
    

    _scrollBy : function(xoff, yoff) 
    {
      this.__scroller.scrollByX(xoff);
      this.__scroller.scrollByY(yoff);
    },
    
    
    _scrollItemIntoView : function(item) 
    {
      var bounds = this.__scroller.pane.getBounds();
      if (!bounds) 
      {
        this.__scroller.pane.addListenerOnce("appear", function() {
          this._scrollItemIntoView(item);
        }, this);
        return;
      }

      var rowConfig = this.__scroller.pane.rowConfig;
      var itemTop = rowConfig.getItemPosition(item);
      var itemBottom = itemTop + rowConfig.getItemSize(item);
      var scrollTop = this.__scroller.getScrollY();
     
      
      if (itemTop < scrollTop) {
        this.__scroller.scrollToY(itemTop);
      } else if (itemBottom > scrollTop + bounds.height) {
        this.__scroller.scrollToY(itemBottom - bounds.height);
      }
    },
    
    
    // overridden
    _getSelectableLocationX : function(item) 
    {
      return {
        left: 0,
        right: this.__scroller.columnConfig.getTotalSize() - 1
      };
    },


    // overridden
    _getSelectableLocationY : function(item) 
    {
      var rowConfig = this.__scroller.pane.rowConfig;
      
      var itemTop = rowConfig.getItemPosition(item);
      var itemBottom = itemTop + rowConfig.getItemSize(item) - 1;
      
      return {
        top: itemTop,
        bottom: itemBottom
      }
    },    

    
    // overridden
    _getLocation : function()
    {
      var elem = this.__scroller.pane.getContentElement().getDomElement();
      return elem ? qx.bom.element.Location.get(elem) : null;
    },
    
    
    // overridden
    _getDimension : function() {
      return this.__scroller.pane.getInnerSize();
    }    
  }
});
