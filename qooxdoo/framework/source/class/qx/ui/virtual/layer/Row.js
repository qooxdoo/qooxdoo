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
    appearance :
    {
      refine : true,
      init : "row-layer"
    },
     
    /** color of row with even index */
    colorEven :
    {
      nullable : true,
      check : "Color",
      apply : "_applyColorEven",
      themeable : true
    },
    
    /** color of row with odd index */
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
  
    fullUpdate : function(visibleCells, rowSizes, columnSizes)
    {
      var html = [];
      for (var y=0; y<rowSizes.length; y++)
      {
        var rowIndex = visibleCells.firstRow + y;
        var color = this.getRowColor(rowIndex);

        html.push(
          "<div style='",
          "height:", rowSizes[y], "px;",
          "width: 100%;",
          color ? "background-color:"+ color : "", 
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
        this.fullUpdate(visibleCells, rowSizes, columnSizes);
      }
    },
        
    
    /*
    ---------------------------------------------------------------------------
      COLOR HANDLING
    ---------------------------------------------------------------------------
    */

    setRowColor : function(row, color) 
    {
      if (color) {
        this.__customColors[row] = qx.theme.manager.Color.getInstance().resolve(color);
      } else {
        delete(this.__customColors[row]);
      }      
    },
    
    clearCustomRowColors : function() {
      this.__customRowColors = {};
    },
    
    getRowColor : function(row)
    {
      var customColor = this.__customColors[row];
      if (customColor) {
        return customColor;
      } else {
        return row % 2 == 0 ? this.__colorEven : this.__colorOdd;
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
    },
    
    // property apply
    _applyColorOdd : function(value, old)
    {
      if (value) {
        this.__colorOdd = qx.theme.manager.Color.getInstance().resolve(value);
      } else {
        this.__colorOdd = null;
      }
    }    
  }
});
