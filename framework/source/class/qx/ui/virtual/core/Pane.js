/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

qx.Class.define("qx.ui.virtual.core.Pane",
{
  extend : qx.ui.core.Widget,


  construct : function(rowCount, columnCount, cellHeight, cellWidth)
  {
    this.base(arguments);
    
    this.rowConfig = new qx.ui.virtual.core.Axis(cellHeight, rowCount);
    this.columnConfig = new qx.ui.virtual.core.Axis(cellWidth, columnCount);
    
    this.__scrollTop = 0;
    this.__scrollLeft = 0;
    
    this.visibleCells = {};
    this.lastVisibleCells = {};
    
    // create layer container. The container does not have a layout manager
    // layers are positioned using "setUserBounds"
    this.__layerContainer = new qx.ui.container.Composite();
    this.__layerContainer.setUserBounds(0, 0, 0, 0);
    this._add(this.__layerContainer);
    
    this.layers = [];
    
    this.addListener("resize", this._onResize, this);
    this.addListener("appear", this._onResize, this);
  },
   
   
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    _getContentHint : function() {
      return {
        width: 400,
        height: 300
      }
    },
    

    /*
    ---------------------------------------------------------------------------
      LAYER MANAGMENT
    ---------------------------------------------------------------------------
    */
    
    /**
     * Returns the layer container
     *
     * @return {qx.ui.core.Widget} The layer container
     */
    getChild : function() {
      return this.__layerContainer;
    },
    
    
    addLayer : function(layer)
    {
      this.layers.push(layer);
      layer.setUserBounds(0, 0, 0, 0);
      this.__layerContainer.add(layer);
    },
    
    
    /*
    ---------------------------------------------------------------------------
      SCROLL SUPPORT
    ---------------------------------------------------------------------------
    */
    
    /**
     * The maximum horizontal scroll position.
     *
     * @return {Integer} Maximum horizontal scroll position.
     */
    getScrollMaxX : function()
    {
      var paneSize = this.getBounds();

      if (paneSize) {
        return Math.max(0, this.columnConfig.getTotalSize() - paneSize.width);
      }

      return 0;
    },


    /**
     * The maximum vertical scroll position.
     *
     * @return {Integer} Maximum vertical scroll position.
     */
    getScrollMaxY : function()
    {
      var paneSize = this.getBounds();

      if (paneSize) {
        return Math.max(0, this.rowConfig.getTotalSize() - paneSize.height);
      }

      return 0;
    },    
    
    
    /**
     * Scrolls the content to the given left coordinate
     *
     * @param value {Integer} The vertical position to scroll to.
     */    
    setScrollY : function(value, doUpdate)
    {
      var max = this.getScrollMaxY();

      if (value < 0) {
        value = 0;
      } else if (value > max) {
        value = max;
      }
      
      this.__scrollTop = value;
      
      if (doUpdate) {
        this.updateScrollPosition();
      }
    },
    
    
    /**
     * Returns the vertical scroll offset.
     * 
     * @return {Integer} The vertical scroll offset
     */
    getScrollY : function() {
      return this.__scrollTop;
    },
    
    
    /**
     * Scrolls the content to the given top coordinate
     *
     * @param value {Integer} The horizontal position to scroll to.
     */     
    setScrollX : function(value, doUpdate)
    {
      var max = this.getScrollMaxX();

      if (value < 0) {
        value = 0;
      } else if (value > max) {
        value = max;
      }
      
      this.__scrollLeft = value;
      
      if (doUpdate) {
        this.updateScrollPosition();
      }
    },

    
    /**
     * Returns the horizontal scroll offset.
     * 
     * @return {Integer} The horizontal scroll offset
     */    
    getScrollX : function() {
      return this.__scrollLeft;
    },

    
    /**
     * The (virtual) size of the content.
     *
     * @return {Map} Size of the content (keys: <code>width</code> and <code>height</code>)
     */
    getScrollSize : function() 
    {
      return {
        width: this.columnConfig.getTotalSize(),
        height: this.rowConfig.getTotalSize()
      }      
    },
    
    
    /*
    ---------------------------------------------------------------------------
      EVENT LISTENER
    ---------------------------------------------------------------------------
    */
    
    _onResize : function() 
    {
      if (this.getContainerElement().getDomElement()) {
        this.fullUpdate();
      }
    },
    
    
    /*
    ---------------------------------------------------------------------------
      PANE UPDATE
    ---------------------------------------------------------------------------
    */
    
    fullUpdate : function()
    {
      if (this.layers.length == 0) {
        return;
      }

      var bounds = this.getBounds();
      if (!bounds) {
        return; // the pane has not yet been rendered -> wait for the appear event
      }            
     
      var rowCellData = this.rowConfig.getItemAtPosition(this.__scrollTop);
      var columnCellData = this.columnConfig.getItemAtPosition(this.__scrollLeft);
      
      var layerHeight = bounds.height; 
      if (rowCellData.offset) {
        layerHeight += this.rowConfig.getItemSize(rowCellData.index);
      }
      var layerWidth = bounds.width;
      if (columnCellData.offset) {
        layerWidth += this.columnConfig.getItemSize(columnCellData.index);
      }
      
      this.__layerContainer.setUserBounds(
        -columnCellData.offset, -rowCellData.offset, 
        layerWidth, layerHeight
      );
      
      var visibleCells = {
        firstRow: rowCellData.index,
        firstColumn: columnCellData.index
      }
      
      var rowSizes = this.rowConfig.getItemSizes(visibleCells.firstRow, bounds.height + rowCellData.offset);
      var columnSizes = this.columnConfig.getItemSizes(visibleCells.firstColumn, bounds.width + columnCellData.offset);

      visibleCells.lastRow = visibleCells.firstRow + rowSizes.length - 1;
      visibleCells.lastColumn = visibleCells.firstRow + columnSizes.length - 1;
                  
      this.lastVisibleCells = this.visibleCells;
      this.visibleCells = visibleCells;  
      
      for (var i=0; i<this.layers.length; i++) 
      {
        var layer = this.layers[i];
        layer.setUserBounds(0, 0, layerWidth, layerHeight);
        layer.fullUpdate(
          visibleCells, this.lastVisibleCells,
          rowSizes, columnSizes
        );
      }
    },
    
    
    updateScrollPosition : function() 
    {
      if (this.layers.length == 0) {
        return;
      }
      
      var bounds = this.getBounds();
      if (!bounds) {
        return; // the pane has not yet been rendered -> wait for the appear event
      }            
     
      var rowCellData = this.rowConfig.getItemAtPosition(this.__scrollTop);
      var columnCellData = this.columnConfig.getItemAtPosition(this.__scrollLeft);
           
      var layerHeight = bounds.height; 
      if (rowCellData.offset) {
        layerHeight += this.rowConfig.getItemSize(rowCellData.index);
      }
      var layerWidth = bounds.width;
      if (columnCellData.offset) {
        layerWidth += this.columnConfig.getItemSize(columnCellData.index);
      }

      this.__layerContainer.setUserBounds(
        -columnCellData.offset, -rowCellData.offset,
        layerWidth, layerHeight
      );
      
      var visibleCells = {
        firstRow: rowCellData.index,
        firstColumn: columnCellData.index
      }
      
      var rowSizes = this.rowConfig.getItemSizes(visibleCells.firstRow, bounds.height + rowCellData.offset);
      var columnSizes = this.columnConfig.getItemSizes(visibleCells.firstColumn, bounds.width + columnCellData.offset);

      visibleCells.lastRow = visibleCells.firstRow + rowSizes.length - 1;
      visibleCells.lastColumn = visibleCells.firstRow + columnSizes.length - 1;
      
      if (
        this.visibleCells.firstRow == visibleCells.firstRow &&
        this.visibleCells.firstColumn == visibleCells.firstColumn &&
        this.visibleCells.lastRow == visibleCells.lastRow &&
        this.visibleCells.lastColumn == visibleCells.lastColumn
      ) {
        return;
      }
      
      this.lastVisibleCells = this.visibleCells;
      this.visibleCells = visibleCells;               
      
      for (var i=0; i<this.layers.length; i++) 
      {
        var layer = this.layers[i];
        layer.setUserBounds(0, 0, layerWidth, layerHeight);
        layer.updateScrollPosition(
          visibleCells, this.lastVisibleCells, 
          rowSizes, columnSizes
        );
      }
    }
  }
});
