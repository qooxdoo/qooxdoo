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
    
    this.__paneHeight = 0;
    this.__paneWidth = 0;
        
    // create layer container. The container does not have a layout manager
    // layers are positioned using "setUserBounds"
    this.__layerContainer = new qx.ui.container.Composite();
    this.__layerContainer.setUserBounds(0, 0, 0, 0);
    this._add(this.__layerContainer);
    
    this.__layers = [];
    
    this.addListener("resize", this._onResize, this);
    this.addListener("appear", this._onResize, this);    
  },
   
  
  /*
   *****************************************************************************
      EVENTS
   *****************************************************************************
   */
  
  events :
  {
    /** Fired on resize of both the container or the (virtual) content. */
    "update" : "qx.event.type.Event",
    
    /** Dispatched when a data cell has been clicked. */
    "cellClick" : "qx.ui.table.pane.CellEvent",

    /** Dispatched when a data cell has been clicked. */
    "cellDblclick" : "qx.ui.table.pane.CellEvent",

    /** Dispatched when the context menu is needed in a data cell */
    "cellContextmenu" : "qx.ui.table.pane.CellEvent"  
  },
   
  
 /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    width :
    {
      refine : true,
      init : 400
    },


    // overridden
    height :
    {
      refine : true,
      init : 300
    }     
  },   
   
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
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
      this.__layers.push(layer);
      layer.setUserBounds(0, 0, 0, 0);
      this.__layerContainer.add(layer);
    },
    
    
    getLayers : function() {
      return this.__layers;
    },
    
    
    getVisibleLayers : function()
    {
      var layers = [];
      for (var i=0; i<this.__layers.length; i++)
      {
        var layer = this.__layers[i];
        if (layer.isVisible()) {
          layers.push(layer);
        }
      }
      return layers;
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
    setScrollY : function(value)
    {
      var max = this.getScrollMaxY();

      if (value < 0) {
        value = 0;
      } else if (value > max) {
        value = max;
      }
      
      if (this.__scrollTop !== value)
      {
        this.__scrollTop = value;
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
    setScrollX : function(value)
    {
      var max = this.getScrollMaxX();

      if (value < 0) {
        value = 0;
      } else if (value > max) {
        value = max;
      }
      
      if (value !== this.__scrollLeft)
      {
        this.__scrollLeft = value;
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
      PREFETCH SUPPORT
    ---------------------------------------------------------------------------
    */
    prefetchY : function(minAbove, maxAbove, minBelow, maxBelow)
    {
      var layers = this.getVisibleLayers();
      if (layers.length == 0) {
        return;
      }   
      
      var bounds = this.getBounds();
      if (!bounds) {
        return;
      }

      var paneBottom = this.__scrollTop + bounds.height;
      var belowAvailable = this.__paneHeight - paneBottom;
      if (
        this.__scrollTop - this.__layerWindow.top  < Math.min(this.__scrollTop, minAbove) ||
        this.__layerWindow.bottom - paneBottom < Math.min(belowAvailable, minBelow)
      )
      {      
        //console.log("prefetch");
        var above = Math.min(this.__scrollTop, maxAbove); 
        var below = Math.min(belowAvailable, maxBelow)
        this.setLayerWindow(
          layers,
          this.__scrollLeft,
          this.__scrollTop - above,
          bounds.width,
          bounds.height + above + below,
          true
        );
      }
    },
    
    
    /*
    ---------------------------------------------------------------------------
      EVENT LISTENER
    ---------------------------------------------------------------------------
    */
    
    _onResize : function() 
    {
      if (this.getContainerElement().getDomElement())
      {
        this.fullUpdate();
        this.fireEvent("update");
      }
    },
    
    
    /*
    ---------------------------------------------------------------------------
      PANE UPDATE
    ---------------------------------------------------------------------------
    */
    
    /**
     * Sets the size of the layers to contain the cells at the pixel position
     * "left/right" up to "left+minHeight/right+minHeight". The offset of the
     * layer container is adjusted to respect the pane's scroll top and scroll
     * left values. 
     */
    setLayerWindow : function(layers, left, top, minWidth, minHeight, doFullUpdate)
    {
      var rowCellData = this.rowConfig.getItemAtPosition(top);
      var columnCellData = this.columnConfig.getItemAtPosition(left);
           
      var visibleCells = {
        firstRow: rowCellData.index,
        firstColumn: columnCellData.index
      }
      
      var rowSizes = this.rowConfig.getItemSizes(visibleCells.firstRow, minHeight + rowCellData.offset);
      var columnSizes = this.columnConfig.getItemSizes(visibleCells.firstColumn, minWidth + columnCellData.offset);

      visibleCells.lastRow = visibleCells.firstRow + rowSizes.length - 1;
      visibleCells.lastColumn = visibleCells.firstColumn + columnSizes.length - 1;

      var layerWidth = qx.lang.Array.sum(columnSizes);
      var layerHeight = qx.lang.Array.sum(rowSizes);

      this.__layerWindow = {
        top: top - rowCellData.offset,
        bottom: top - rowCellData.offset + layerHeight,
        left: left - columnCellData.offset,        
        right: left - columnCellData.offset + layerWidth
      }      
      
      this.__layerContainer.setUserBounds(
        this.__layerWindow.left - this.__scrollLeft,
        this.__layerWindow.top - this.__scrollTop,
        layerWidth, layerHeight
      );            
           
      this.lastVisibleCells = this.visibleCells;
      this.visibleCells = visibleCells;
      
      this.__columnSizes = columnSizes;
      this.__rowSizes = rowSizes;
      
      // TODO: debugging code
      //qx.ui.core.queue.Manager.flush();      
      
      for (var i=0; i<this.__layers.length; i++) 
      {
        // var start = new Date();
        
        var layer = this.__layers[i];
        layer.setUserBounds(0, 0, layerWidth, layerHeight);
        
        if (doFullUpdate)
        {
          layer.fullUpdate(
            visibleCells, this.lastVisibleCells, 
            rowSizes, columnSizes
          );
        }
        else
        {
          layer.updateScrollPosition(
            visibleCells, this.lastVisibleCells, 
            rowSizes, columnSizes
          );
        }

        // TODO: debugging code    
        // this.debug("layer update ("+layer.classname+"): " + (new Date() - start) + "ms");
        // var start = new Date();
        // qx.ui.core.queue.Manager.flush();
        // this.debug("layer flush ("+layer.classname+"): " + (new Date() - start) + "ms");
      }            
    },    
    
    
    __checkPaneResize : function()
    {
      var scrollSize = this.getScrollSize();
      if (
        this.__paneHeight !== scrollSize.height ||
        this.__paneWidth !== scrollSize.width
      ) 
      {
        this.__paneHeight = scrollSize.height;
        this.__paneWidth = scrollSize.width;  
        this.fireEvent("update");
      }      
    },
    
    
    fullUpdate : function()
    {
      var layers = this.getVisibleLayers();
      if (layers.length == 0)
      {
        this.__checkPaneResize();
        return;
      }

      var bounds = this.getBounds();
      if (!bounds) {
        return; // the pane has not yet been rendered -> wait for the appear event
      }            
     
      //console.log("full update");
      this.setLayerWindow(
        layers,
        this.__scrollLeft, this.__scrollTop,
        bounds.width, bounds.height,
        true
      );
             
      this.__checkPaneResize();
    },
    
    
    updateScrollPosition : function() 
    {
      var layers = this.getVisibleLayers();
      if (layers.length == 0) {
        return;
      }
      
      var bounds = this.getBounds();
      if (!bounds) {
        return; // the pane has not yet been rendered -> wait for the appear event
      }                      
      
      // the visible window of the virtual coordinate space
      var paneWindow = {
        top: this.__scrollTop,
        bottom: this.__scrollTop + bounds.height,
        left: this.__scrollLeft,
        right: this.__scrollLeft + bounds.width
      };
      
      if (
        this.__layerWindow.top <= paneWindow.top &&
        this.__layerWindow.bottom >= paneWindow.bottom && 
        this.__layerWindow.left <= paneWindow.left &&
        this.__layerWindow.right >= paneWindow.right
      )
      {
        //console.log("scroll");
        // only update layer container offset
        this.__layerContainer.setUserBounds(          
          this.__layerWindow.left - paneWindow.left,
          this.__layerWindow.top - paneWindow.top,
          this.__layerWindow.right - this.__layerWindow.left,
          this.__layerWindow.bottom - this.__layerWindow.top
        );              
      }
      else
      {
        //console.log("update scroll pos");
        this.setLayerWindow(
          layers,
          this.__scrollLeft, this.__scrollTop,
          bounds.width, bounds.height,
          false
        )
      }
    }
  }
});
