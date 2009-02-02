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

qx.Class.define("qx.ui.virtual.layer.AbstractBackground",
{
  extend : qx.ui.core.Widget,

  implement : [qx.ui.virtual.core.ILayer],
  
  /*
   *****************************************************************************
      CONSTRUCTOR
   *****************************************************************************
   */

   /**
    */
   construct : function(colorEven, colorOdd)
   {
     this.base(arguments);
     
     if (colorEven) {
       this.setColorEven(colorEven);
     }
     
     if (colorOdd) {
       this.setColorOdd(colorOdd);
     }
     
     this.__customColors = {};
   },

   
  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    anonymous :
    {
      refine: true,
      init: true
    },    
     
    /** color for event indexes */
    colorEven :
    {
      nullable : true,
      check : "Color",
      apply : "_applyColorEven",
      themeable : true
    },
    
    /** color for odd indexes */
    colorOdd :
    {
      nullable : true,
      check : "Color",
      apply : "_applyColorOdd",
      themeable : true
    }
  },
  
  
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
 
  members :
  {
    __colorEven : null,
    __colorOdd : null,
    __customColors : null,
    
    
    _getFirstItemIndex : function() {
      throw new Error("Abstract method call: _isSelectable()");
    },
  
    
    syncWidget : function()
    {
      var el = this.getContentElement().getDomElement();
      if (!el) {
        return;
      }
      
      var children = el.childNodes;
      var index = this._getFirstItemIndex();
      for (var i=0, l=children.length; i<l; i++)
      {
        var color = this._getItemColor(index++);
        children[i].style.backgroundColor = color;
      }
    },
    
    
    fullUpdate : function(
      firstRow, lastRow, 
      firstColumn, lastColumn, 
      rowSizes, columnSizes
    ) {
      throw new Error("Abstract method call: _isSelectable()");
    },
    
    updateLayerWindow : function(
      firstRow, lastRow, 
      firstColumn, lastColumn, 
      rowSizes, columnSizes
    ) {
      throw new Error("Abstract method call: _isSelectable()");
    },
        
    
    /*
    ---------------------------------------------------------------------------
      COLOR HANDLING
    ---------------------------------------------------------------------------
    */

    _setItemColor : function(index, color) 
    {
      if (color) {
        this.__customColors[index] = qx.theme.manager.Color.getInstance().resolve(color);
      } else {
        delete(this.__customColors[index]);
      }      
    },
    
    
    _clearCustomColors : function()
    {
      this.__customColors = {};
      qx.ui.core.queue.Widget.add(this);
    },
    
    
    _getItemColor : function(index)
    {
      var customColor = this.__customColors[index];
      if (customColor) {
        return customColor;
      } else {
        return index % 2 == 0 ? this.__colorEven : this.__colorOdd;
      }
    },
    
    
    // property apply
    _applyColorEven : function(value, old)
    {
      if (value) {
        this.__colorEven = qx.theme.manager.Color.getInstance().resolve(value);
      } else {
        this.__colorEven = null;
      }
      qx.ui.core.queue.Widget.add(this);
    },
    
    // property apply
    _applyColorOdd : function(value, old)
    {
      if (value) {
        this.__colorOdd = qx.theme.manager.Color.getInstance().resolve(value);
      } else {
        this.__colorOdd = null;
      }
      qx.ui.core.queue.Widget.add(this);
    }    
  }
});
