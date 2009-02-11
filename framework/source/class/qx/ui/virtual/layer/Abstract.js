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
 * Abstract base class for layers o a virtual pane.
 * 
 * This class queues calls to {@link #fullUpdate}, {@link #updateLayerWindow}
 * and {@link #updateLayerData} and only performs the absolute necessary
 * actions. Concrete implementation of this class must at least implement
 * the {@link #_fullUpdate} method. Additionally the two methods 
 * {@link #_updateLayerWindow} and {@link _updateLayerData} may be implemented
 * to increase the performance.
 */
qx.Class.define("qx.ui.virtual.layer.Abstract",
{
  extend : qx.ui.core.Widget,
  type : "abstract",

  implement : [qx.ui.virtual.core.ILayer],
  
  /*
   *****************************************************************************
      CONSTRUCTOR
   *****************************************************************************
   */

   construct : function()
   {
     this.base(arguments);
     
     this.__jobs = {};
     this.__arguments = null;
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
    }    
  },
  
  
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
 
  members :
  {
    /**
     * Get the first rendered row
     * 
     * @return {Integer} The first rendered row
     */
    getFirstRow : function() {
      return this.__firstRow;
    },
    

    /**
     * Get the last rendered row
     * 
     * @return {Integer} The last rendered row
     */    
    getLastRow : function() {
      return this.__lastRow;
    },
    
    
    /**
     * Get the first rendered column
     * 
     * @return {Integer} The first rendered column
     */    
    getFirstColumn : function() {
      return this.__firstColumn;
    },

    
    /**
     * Get the last rendered column
     * 
     * @return {Integer} The last rendered column
     */    
    getLastColumn : function() {
      return this.__lastColumn;
    },
    
    
    /**
     * Get the sizes of the rendered rows
     * 
     * @return {Integer[]} List of row heights
     */
    getRowSizes : function() {
      return this.__rowSizes;
    },
    

    /**
     * Get the sizes of the rendered column
     * 
     * @return {Integer[]} List of column widths
     */
    getColumnSizes : function() {
      return this.__columnSizes;
    },
    
    
    // overridden
    syncWidget : function()
    {
      // return if the layer is not yet rendered
      // it will rendered in the appear event
      if (!this.getContentElement().getDomElement()) {
        return;
      }
      
      if (
        this.__jobs.fullUpdate || 
        this.__jobs.updateLayerWindow && this.__jobs.updateLayerData
      )
      {
        this._fullUpdate.apply(this, this.__arguments);
      }
      else if (this.__jobs.updateLayerWindow) 
      {
        this._updateLayerWindow.apply(this, this.__arguments);
      }
      else if (this.__jobs.updateLayerData)
      {
        this._updateLayerData();
      }
      
      if (this.__jobs.fullUpdate || this.__jobs.updateLayerWindow)
      {
        var args = this.__arguments;
        this.__firstRow = args[0];
        this.__lastRow = args[1];
        this.__firstColumn = args[2];
        this.__lastColumn = args[3];
        this.__rowSizes = args[4];
        this.__columnSizes = args[5];
      }
      this.__jobs = {};
    },
    
    
    /**
     * Update the layer to reflect changes in the data the layer displays.
     * 
     * Note: It is guaranteed that this method is only called after the layer
     * has been rendered. 
     */
    _updateLayerData : function() 
    {
      this._fullUpdate(
        this.__firstRow, this.__lastRow,
        this.__firstColumn, this.__lastColumn,
        this.__rowSizes, this.__columnSizes
      );
    },
    

    /**
     * Do a complete update of the layer. All cached data should be discarded.
     * This method is called e.g. after changes to the grid geometry
     * (row/column sizes, row/column count, ...).
     * 
     * Note: It is guaranteed that this method is only called after the layer
     * has been rendered. 
     *  
     * @param firstRow {Integer} Index of the first row to display
     * @param lastRow {Integer} Index of the last row to display
     * @param firstColumn {Integer} Index of the first column to display
     * @param lastColumn {Integer} Index of the last column to display
     * @param rowSizes {Integer[]} Array of heights for each row to display
     * @param columnSizes {Integer[]} Array of widths for each column to display
     */    
    _fullUpdate : function(
      firstRow, lastRow, 
      firstColumn, lastColumn, 
      rowSizes, columnSizes    
    ) {
      throw new Error("Abstract method '_fullUpdate' called!");
    },

    
    /**
     * Update the layer to display a different window of the virtual grid.
     * This method is called if the pane is scrolled, resized or cells
     * are prefetched. The implementation can assume that no other grid
     * data has been changed since the last "fullUpdate" of "updateLayerWindow"
     * call.
     * 
     * Note: It is guaranteed that this method is only called after the layer
     * has been rendered.
     * 
     * @param firstRow {Integer} Index of the first row to display
     * @param lastRow {Integer} Index of the last row to display
     * @param firstColumn {Integer} Index of the first column to display
     * @param lastColumn {Integer} Index of the last column to display
     * @param rowSizes {Integer[]} Array of heights for each row to display
     * @param columnSizes {Integer[]} Array of widths for each column to display
     */    
    _updateLayerWindow : function(
      firstRow, lastRow, 
      firstColumn, lastColumn, 
      rowSizes, columnSizes
    ) 
    {
      this._fullUpdate(
        firstRow, lastRow, 
        firstColumn, lastColumn, 
        rowSizes, columnSizes
      );
    },

    
    // interface implementation
    updateLayerData : function()
    {
      this.__jobs.updateLayerData = true;
      qx.ui.core.queue.Widget.add(this);
    },
    
    
    // interface implementation
    fullUpdate : function(
      firstRow, lastRow, 
      firstColumn, lastColumn, 
      rowSizes, columnSizes
    ) 
    {
      this.__arguments = arguments;
      this.__jobs.fullUpdate = true;
      qx.ui.core.queue.Widget.add(this);
    },
    
    
    // interface implementation
    updateLayerWindow : function(
      firstRow, lastRow, 
      firstColumn, lastColumn, 
      rowSizes, columnSizes
    ) {
      this.__arguments = arguments;
      this.__jobs.updateLayerWindow = true;
      qx.ui.core.queue.Widget.add(this);      
    }        
  }
});
