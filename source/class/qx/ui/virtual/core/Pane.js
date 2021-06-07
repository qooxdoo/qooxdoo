/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * The Pane provides a window of a larger virtual grid.
 *
 * The actual rendering is performed by one or several layers ({@link ILayer}.
 * The pane computes, which cells of the virtual area is visible and instructs
 * the layers to render these cells.
 */
qx.Class.define("qx.ui.virtual.core.Pane",
{
  extend : qx.ui.core.Widget,


  /**
   * @param rowCount {Integer?0} The number of rows of the virtual grid.
   * @param columnCount {Integer?0} The number of columns of the virtual grid.
   * @param cellHeight {Integer?28} The default cell height.
   * @param cellWidth {Integer?100} The default cell width.
   */
  construct : function(rowCount, columnCount, cellHeight, cellWidth)
  {
    this.base(arguments);

    this.__rowConfig = new qx.ui.virtual.core.Axis(cellHeight||28, rowCount||0);
    this.__columnConfig = new qx.ui.virtual.core.Axis(cellWidth||100, columnCount||0);

    this.__scrollTop = 0;
    this.__scrollLeft = 0;


    this.__paneHeight = 0;
    this.__paneWidth = 0;

    this.__layerWindow = {};
    this.__jobs = {};

    // create layer container. 
    this._setLayout(new qx.ui.virtual.core.BoundsLayout());
    this.__layerContainer = new qx.ui.container.Composite(new qx.ui.virtual.core.BoundsLayout());
    this._add(this.__layerContainer);
    this._getLayout().setItemBounds(this.__layerContainer, 0, 0, 0, 0);

    this.__layers = [];

    this.__rowConfig.addListener("change", this._onRowColumnChange, this);
    this.__columnConfig.addListener("change", this._onRowColumnChange, this);

    this.addListener("resize", this._onResize, this);
    this.addListenerOnce("appear", this._onAppear, this);

    this.addListener("pointerdown", this._onPointerDown, this);
    this.addListener("tap", this._onTap, this);
    this.addListener("dbltap", this._onDbltap, this);
    this.addListener("contextmenu", this._onContextmenu, this);
  },


  events :
  {
    /** Fired if a cell is tapped. */
    cellTap : "qx.ui.virtual.core.CellEvent",

    /** Fired if a cell is right-clicked. */
    cellContextmenu : "qx.ui.virtual.core.CellEvent",

    /** Fired if a cell is double-tapped. */
    cellDbltap : "qx.ui.virtual.core.CellEvent",

    /** Fired on resize of either the container or the (virtual) content. */
    update : "qx.event.type.Event",

    /** Fired if the pane is scrolled horizontally. */
    scrollX : "qx.event.type.Data",

    /** Fired if the pane is scrolled vertically. */
    scrollY : "qx.event.type.Data"
  },


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
    },
     
		/** Whether to auto size the row heights */
		autoSizeRows: {
		  init: false,
		  check: "Boolean"
		},
		 
		/** Whether to auto size the column widths */
		autoSizeColumns: {
		  init: false,
		  check: "Boolean"
		},
    
    /** Padding for each cell, top */
    cellPaddingTop: {
      init: 0,
      check: "Integer",
      nullable: false,
      apply: "__applyCellPadding"
    },
    
    /** Padding for each cell, right */
    cellPaddingRight: {
      init: 0,
      check: "Integer",
      nullable: false,
      apply: "__applyCellPadding"
    },
    
    /** Padding for each cell, bottom */
    cellPaddingBottom: {
      init: 0,
      check: "Integer",
      nullable: false,
      apply: "__applyCellPadding"
    },
    
    /** Padding for each cell, left */
    cellPaddingLeft: {
      init: 0,
      check: "Integer",
      nullable: false,
      apply: "__applyCellPadding"
    },
    
    /** Combines cellPaddingTop, cellPaddingRight, cellPaddingBottom, cellPaddingLeft */
    cellPadding: {
      group: [ "cellPaddingTop", "cellPaddingRight", "cellPaddingBottom", "cellPaddingLeft" ]
    }
  },


  members :
  {
    __rowConfig : null,
    __columnConfig : null,
    __scrollTop : null,
    __scrollLeft : null,
    __paneHeight : null,
    __paneWidth : null,
    __layerWindow : null,
    __jobs : null,
    __layerContainer : null,
    __layers : null,
    __dontFireUpdate : null,
    __columnSizes : null,
    __rowSizes : null,
    __pointerDownCoords : null,
    
    /** @type {qx.ui.virtual.core.ICellSizeProvider[]} the layers which provide cell sizes */
    __cellSizeProviders: null,

    /*
    ---------------------------------------------------------------------------
      ACCESSOR METHODS
    ---------------------------------------------------------------------------
    */


    /**
     * Get the axis object, which defines the row numbers and the row sizes.
     *
     * @return {qx.ui.virtual.core.Axis} The row configuration.
     */
    getRowConfig : function() {
      return this.__rowConfig;
    },
    
    /**
     * Returns the sizes for rows
     *
     * @return {Map[]} array of {`top`, `height`} 
     */
    getRowSizes() {
      return this.__rowSizes;
    },

    /**
     * Returns the sizes for columns
     *
     * @return {Map[]} array of {`left`, `width`} 
     */
    getColumnSizes() {
      return this.__columnSizes;
    },


    /**
     * Get the axis object, which defines the column numbers and the column sizes.
     *
     * @return {qx.ui.virtual.core.Axis} The column configuration.
     */
    getColumnConfig : function() {
      return this.__columnConfig;
    },

    /**
     * Apply for all found cellPaddingXxxx properties
     */
    __applyCellPadding() {
      this.fullUpdate();
    },


    /*
    ---------------------------------------------------------------------------
      LAYER MANAGEMENT
    ---------------------------------------------------------------------------
    */


    /**
     * Returns an array containing the layer container.
     *
     * @return {Object[]} The layer container array.
     */
    getChildren : function() {
      return [this.__layerContainer];
    },


    /**
     * Add a layer to the layer container.
     *
     * @param layer {qx.ui.virtual.core.ILayer} The layer to add.
     */
    addLayer : function(layer) {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertInterface(layer, qx.ui.virtual.core.ILayer);
      }

      this.__layers.push(layer);
      this.__layerContainer.getLayout().setItemBounds(layer, 0, 0, 0, 0);
      this.__layerContainer.add(layer);
      layer.connectToPane(this);
      if (qx.Interface.classImplements(layer.constructor, qx.ui.virtual.core.ILayerCellSizeProvider)) {
        if (this.__cellSizeProviders === null)
          this.__cellSizeProviders = [];
        this.__cellSizeProviders.push(layer);
      }
    },


    /**
     * Get a list of all layers.
     *
     * @return {qx.ui.virtual.core.ILayer[]} List of the pane's layers.
     */
    getLayers : function() {
      return this.__layers;
    },


    /**
     * Get a list of all visible layers.
     *
     * @return {qx.ui.virtual.core.ILayer[]} List of the pane's visible layers.
     */
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
      var paneSize = this.getInnerSize();

      if (paneSize) {
        return Math.max(0, this.__columnConfig.getTotalSize() - paneSize.width);
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
      var paneSize = this.getInnerSize();

      if (paneSize) {
        return Math.max(0, this.__rowConfig.getTotalSize() - paneSize.height);
      }

      return 0;
    },


    /**
     * Scrolls the content to the given left coordinate.
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
        var old = this.__scrollTop;
        this.__scrollTop = value;
        this._deferredUpdateScrollPosition();
        this.fireDataEvent("scrollY", value, old);
      }
    },


    /**
     * Returns the vertical scroll offset.
     *
     * @return {Integer} The vertical scroll offset.
     */
    getScrollY : function() {
      return this.__scrollTop;
    },


    /**
     * Scrolls the content to the given top coordinate.
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
        var old = this.__scrollLeft;
        this.__scrollLeft = value;
        this._deferredUpdateScrollPosition();

        this.fireDataEvent("scrollX", value, old);
      }
    },


    /**
     * Returns the horizontal scroll offset.
     *
     * @return {Integer} The horizontal scroll offset.
     */
    getScrollX : function() {
      return this.__scrollLeft;
    },


    /**
     * The (virtual) size of the content.
     *
     * @return {Map} Size of the content (keys: <code>width</code> and
     *     <code>height</code>).
     */
    getScrollSize : function()
    {
      return {
        width: this.__columnConfig.getTotalSize(),
        height: this.__rowConfig.getTotalSize()
      };
    },


    /*
    ---------------------------------------------------------------------------
      SCROLL INTO VIEW SUPPORT
    ---------------------------------------------------------------------------
    */


    /**
     * Scrolls a row into the visible area of the pane.
     *
     * @param row {Integer} The row's index.
     */
    scrollRowIntoView : function(row)
    {
      var bounds = this.getBounds();
      if (!bounds)
      {
        this.addListenerOnce("appear", function()
        {
          // It's important that the registered events are first dispatched.
          qx.event.Timer.once(function() {
            this.scrollRowIntoView(row);
          }, this, 0);
        }, this);
        return;
      }

      var itemTop = this.__rowConfig.getItemPosition(row);
      var itemBottom = itemTop + this.__rowConfig.getItemSize(row);
      var scrollTop = this.getScrollY();

      if (itemTop < scrollTop) {
        this.setScrollY(itemTop);
      } else if (itemBottom > scrollTop + bounds.height) {
        this.setScrollY(itemBottom - bounds.height);
      }
    },


    /**
     * Scrolls a column into the visible area of the pane.
     *
     * @param column {Integer} The column's index.
     */
    scrollColumnIntoView : function(column)
    {
      var bounds = this.getBounds();
      if (!bounds)
      {
        this.addListenerOnce("appear", function()
        {
          // It's important that the registered events are first dispatched.
          qx.event.Timer.once(function() {
            this.scrollColumnIntoView(column);
          }, this, 0);
        }, this);
        return;
      }

      var itemLeft = this.__columnConfig.getItemPosition(column);
      var itemRight = itemLeft + this.__columnConfig.getItemSize(column);
      var scrollLeft = this.getScrollX();

      if (itemLeft < scrollLeft) {
        this.setScrollX(itemLeft);
      } else if (itemRight > scrollLeft + bounds.width) {
        this.setScrollX(itemRight - bounds.width);
      }
    },


    /**
     * Scrolls a grid cell into the visible area of the pane.
     *
     * @param row {Integer} The cell's row index.
     * @param column {Integer} The cell's column index.
     */
    scrollCellIntoView : function(column, row)
    {
      var bounds = this.getBounds();
      if (!bounds)
      {
        this.addListenerOnce("appear", function()
        {
          // It's important that the registered events are first dispatched.
          qx.event.Timer.once(function() {
            this.scrollCellIntoView(column, row);
          }, this, 0);
        }, this);
        return;
      }

      this.scrollColumnIntoView(column);
      this.scrollRowIntoView(row);
    },


    /*
    ---------------------------------------------------------------------------
      CELL SUPPORT
    ---------------------------------------------------------------------------
    */


    /**
     * Get the grid cell at the given absolute document coordinates. This method
     * can be used to convert the pointer position returned by
     * {@link qx.event.type.Pointer#getDocumentLeft} and
     * {@link qx.event.type.Pointer#getDocumentLeft} into cell coordinates.
     *
     * @param documentX {Integer} The x coordinate relative to the viewport
     *    origin.
     * @param documentY {Integer} The y coordinate relative to the viewport
     *    origin.
     * @return {Map|null} A map containing the <code>row</code> and <code>column</code>
     *    of the found cell. If the coordinate is outside of the pane's bounds
     *    or there is no cell at the coordinate <code>null</code> is returned.
     */
    getCellAtPosition: function(documentX, documentY)
    {
      var rowData, columnData;
      var paneLocation = this.getContentLocation();

      if (
        !paneLocation ||
        documentY < paneLocation.top ||
        documentY >= paneLocation.bottom ||
        documentX < paneLocation.left ||
        documentX >= paneLocation.right
      ) {
        return null;
      }

      rowData = this.__rowConfig.getItemAtPosition(
        this.getScrollY() + documentY - paneLocation.top
      );

      columnData = this.__columnConfig.getItemAtPosition(
        this.getScrollX() + documentX - paneLocation.left
      );

      if (!rowData || !columnData) {
        return null;
      }

      return {
        row : rowData.index,
        column : columnData.index
      };
    },


    /*
    ---------------------------------------------------------------------------
      PREFETCH SUPPORT
    ---------------------------------------------------------------------------
    */


    /**
     * Increase the layers width beyond the needed width to improve
     * horizontal scrolling. The layers are only resized if invisible parts
     * left/right of the pane window are smaller than minLeft/minRight.
     *
     * @param minLeft {Integer} Only prefetch if the invisible part left of the
     *    pane window if smaller than this (pixel) value.
     * @param maxLeft {Integer} The amount of pixel the layers should reach
     *    left of the pane window.
     * @param minRight {Integer} Only prefetch if the invisible part right of the
     *    pane window if smaller than this (pixel) value.
     * @param maxRight {Integer} The amount of pixel the layers should reach
     *    right of the pane window.
     */
    prefetchX : function(minLeft, maxLeft, minRight, maxRight)
    {
      var layers = this.getVisibleLayers();
      if (layers.length == 0) {
        return;
      }

      var bounds = this.getBounds();
      if (!bounds) {
        return;
      }

      var paneRight = this.__scrollLeft + bounds.width;
      var rightAvailable = this.__paneWidth - paneRight;
      if (
        this.__scrollLeft - this.__layerWindow.left  < Math.min(this.__scrollLeft, minLeft) ||
        this.__layerWindow.right - paneRight < Math.min(rightAvailable, minRight)
      )
      {
        var left = Math.min(this.__scrollLeft, maxLeft);
        var right = Math.min(rightAvailable, maxRight);
        this._setLayerWindow(
          this.__scrollLeft - left,
          this.__scrollTop,
          false
        );
      }
    },


    /**
     * Increase the layers height beyond the needed height to improve
     * vertical scrolling. The layers are only resized if invisible parts
     * above/below the pane window are smaller than minAbove/minBelow.
     *
     * @param minAbove {Integer} Only prefetch if the invisible part above the
     *    pane window if smaller than this (pixel) value.
     * @param maxAbove {Integer} The amount of pixel the layers should reach
     *    above the pane window.
     * @param minBelow {Integer} Only prefetch if the invisible part below the
     *    pane window if smaller than this (pixel) value.
     * @param maxBelow {Integer} The amount of pixel the layers should reach
     *    below the pane window.
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
        var above = Math.min(this.__scrollTop, maxAbove);
        var below = Math.min(belowAvailable, maxBelow);
        this._setLayerWindow(
          this.__scrollLeft,
          this.__scrollTop - above,
          false
        );
      }
    },


    /*
    ---------------------------------------------------------------------------
      EVENT LISTENER
    ---------------------------------------------------------------------------
    */


    /**
     * Resize event handler.
     *
     * Updates the visible window.
     */
    _onResize : function()
    {
      if (this.getContentElement().getDomElement())
      {
        this.setDontFireUpdate(true);
        this._updateScrollPosition();
        this.setDontFireUpdate(false);
        this.fireEvent("update");
      }
    },
    
    
    setDontFireUpdate(value) {
      if (value) {
        if (this.__dontFireUpdate === undefined)
          this.__dontFireUpdate = 1;
        else
          this.__dontFireUpdate++;
      } else {
        if (this.__dontFireUpdate === undefined || this.__dontFireUpdate == 0)
          throw new Error("Mismiatched calls to " + this.classname + ".setDontFireUpdate");
        this.__dontFireUpdate--;
        if (this.__fullUpdateDeferredByDontFire)
          this.fullUpdate();
      }
    },


    /**
     * Resize event handler. Do a full update on first appear.
     */
    _onAppear : function() {
      this.fullUpdate();
    },

    /**
     * Event listener for pointer down. Remembers cell position to prevent pointer event when cell position change.
     *
     * @param e {qx.event.type.Pointer} The incoming pointer event.
     */
    _onPointerDown : function(e) {
      this.__pointerDownCoords = this.getCellAtPosition(e.getDocumentLeft(), e.getDocumentTop());
    },

    /**
     * Event listener for pointer taps. Fires an cellTap event.
     *
     * @param e {qx.event.type.Pointer} The incoming pointer event.
     */
    _onTap : function(e) {
      this.__handlePointerCellEvent(e, "cellTap");
    },


    /**
     * Event listener for context menu taps. Fires an cellContextmenu event.
     *
     * @param e {qx.event.type.Pointer} The incoming pointer event.
     */
    _onContextmenu : function(e) {
      this.__handlePointerCellEvent(e, "cellContextmenu");
    },


    /**
     * Event listener for double taps. Fires an cellDbltap event.
     *
     * @param e {qx.event.type.Pointer} The incoming pointer event.
     */
    _onDbltap : function(e) {
       this.__handlePointerCellEvent(e, "cellDbltap");
    },

    /**
     * Fixed scrollbar position whenever it is out of range
     * it can happen when removing an item from the list reducing
     * the max value for scrollY #8976
     */
    _checkScrollBounds: function() {
      var maxx = this.getScrollMaxX();
      var maxy = this.getScrollMaxY();
      if (this.__scrollLeft < 0) {
        this.__scrollLeft = 0;
      }
      else if (this.__scrollLeft > maxx) {
        this.__scrollLeft = maxx;
      }
      if (this.__scrollTop < 0) {
        this.__scrollTop = 0;
      }
      else if (this.__scrollTop > maxy) {
        this.__scrollTop = maxy;
      }
    },

    /**
     * Converts a pointer event into a cell event and fires the cell event if the
     * pointer is over a cell.
     *
     * @param e {qx.event.type.Pointer} The pointer event.
     * @param cellEventType {String} The name of the cell event to fire.
     */
    __handlePointerCellEvent : function(e, cellEventType)
    {
      var coords = this.getCellAtPosition(e.getDocumentLeft(), e.getDocumentTop());
      if (!coords) {
        return;
      }

      var pointerDownCoords = this.__pointerDownCoords;
      if (pointerDownCoords == null || pointerDownCoords.row !== coords.row || pointerDownCoords.column !== coords.column) {
        return;
      }

      this.fireNonBubblingEvent(
        cellEventType,
        qx.ui.virtual.core.CellEvent,
        [this, e, coords.row, coords.column]
      );
    },


    /*
    ---------------------------------------------------------------------------
      PANE UPDATE
    ---------------------------------------------------------------------------
    */


    /**
     * @Override
     */
    _computeSizeHint() {
      let hint = this.base(arguments);
      
      // Ignore minimums - these are calculated by BoundsLayout, but we want to fit in the 
      //  available space (eg to scroll), not push the parent out 
      hint.minWidth = null;
      hint.minHeight = null;
      return hint;
    },

    
    // overridden
    syncWidget : function(jobs)
    {
      if (this.__jobs._fullUpdate) {
        this._checkScrollBounds();
        this._fullUpdate();
      } else if (this.__jobs._updateScrollPosition) {
        this._checkScrollBounds();
        this._updateScrollPosition();
      }
      this.__jobs = {};
    },
    
    _getCellSizeHint(rowIndex, columnIndex) {
      if (this.__cellSizeProviders === null)
        return null;
        
      if (this.__cellSizeProviders.length === 1)
        return this.__cellSizeProviders[0].getCellSizeHint(rowIndex, columnIndex);
        
      function min(current, next) {
        if (next === null || next === undefined)
          return current === undefined ? null : current;
          
        if (current === null || current === undefined) {
          if (next > 0)
            return next;
          return null;
        }
        
        if (next > current) {
          return next;
        }
        
        return current === undefined ? null : current;
      }
      
      function max(current, next) {
        if (next === null || next === undefined)
          return current === undefined ? null : current;
          
        if (current === null || current === undefined) {
          if (next > 0)
            return next;
          return null;
        }
        
        if (next < current) {
          return next;
        }
        
        return current === undefined ? null : current;
      }
      
      function first(current, next) {
        if (current === null || current === undefined)
          return next;
        return current === undefined ? null : current;
      }
      
      let hint = null;
      this.__cellSizeProviders.forEach(csp => {
        let childHint = csp._getCellSizeHint(rowIndex, columnIndex);
        if (!childHint)
          return;
        if (!hint) {
          hint = childHint;
          return;
        }

        hint.minWidth = min(hint.minWidth, childHint.minWidth);
        hint.minHeight = min(hint.minHeight, childHint.minHeight);
        hint.maxWidth = max(hint.maxWidth, childHint.maxWidth);
        hint.maxHeight = max(hint.maxHeight, childHint.maxHeight);
        hint.width = first(hint.width, childHint.width);
        hint.height = first(hint.height, childHint.height);
      });
      
      return hint;
    },

    /*
     * @Override
     */
    renderLayout(left, top, width, height) {
      this.__autoSizing = true;

      let bounds = this.getBounds();
      let resizing = bounds && (bounds.width != width || bounds.height != height);

      let rowConfig = this.__rowConfig;
      let columnConfig = this.__columnConfig;
      var rowCellData = rowConfig.getItemAtPosition(top);
      var columnCellData = columnConfig.getItemAtPosition(left);

      var firstRow = 0;
      var rowSizes = [];
      var layerHeight = bounds && bounds.height || height;
      var firstColumn = 0;
      var columnSizes = [];
      var layerWidth = bounds && bounds.width || width;
      let totalRowHeight = 0;
      let totalColumnWidth = 0;
      let isAutoSizeRows = this.isAutoSizeRows();
      let isAutoSizeColumns = this.isAutoSizeColumns();
      
      let padding = {
        top: this.getCellPaddingTop(),
        right: this.getCellPaddingRight(),
        bottom: this.getCellPaddingBottom(),
        left: this.getCellPaddingLeft()
      };


      if (rowCellData && columnCellData) {
        firstRow = rowCellData.index;
        firstColumn = columnCellData.index;
        
        let columnWidths = {};
        const getColumnWidth = columnIndex => {
          if (columnWidths.hasOwnProperty(columnIndex))
            return columnWidths[columnIndex];
          return columnWidths[columnIndex] = columnConfig.getItemSize(columnIndex);
        }; 
        let columnMaxWidths = {};
        const getColumnMaxWidth = columnIndex => {
          if (columnMaxWidths.hasOwnProperty(columnIndex))
            return columnMaxWidths[columnIndex];
          return columnMaxWidths[columnIndex] = columnConfig.getItemMaxSize(columnIndex);
        };

        if (!isAutoSizeColumns && !isAutoSizeRows) {
          for (let rowIndex = firstRow; rowIndex < rowConfig.getItemCount(); rowIndex++) {
            let rowHeight = rowConfig.getItemSize(rowIndex);
            let rowMaxHeight = rowConfig.getItemMaxSize(rowIndex);
            if (rowMaxHeight && rowHeight > rowMaxHeight)
              rowHeight = rowMaxHeight;
            
            let outerHeight = rowHeight + padding.top + padding.bottom;
            rowSizes[rowIndex - firstRow] = {
              top: totalRowHeight + padding.top,
              outerTop: totalRowHeight,
              height: rowHeight,
              outerHeight: outerHeight
            };
            totalRowHeight += outerHeight;
            top += outerHeight;
          }
          
          for (let columnIndex = firstColumn; columnIndex < columnConfig.getItemCount(); columnIndex++) {
            let columnWidth = getColumnWidth(columnIndex);
            let columnMaxWidth = getColumnMaxWidth(columnIndex);
            if (columnMaxWidth && columnWidth > columnMaxWidth)
              columnWidth = columnMaxWidth;
              
            let outerWidth = columnWidth + padding.left + padding.right;
            columnSizes[columnIndex - firstColumn] = {
              outerLeft: totalColumnWidth,
              left: totalColumnWidth + padding.left,
              width: columnWidth,
              outerWidth
            };
            totalColumnWidth += columnWidth;
          }
          
        /** Autosizing columns and/or rows */
        } else {
          for (let rowIndex = firstRow; rowIndex < rowConfig.getItemCount(); rowIndex++) {
            let rowHeight = rowConfig.getDefaultItemSize();
            let rowMaxHeight = rowConfig.getItemMaxSize(rowIndex);
            
            totalColumnWidth = 0;
            for (let columnIndex = firstColumn; columnIndex < columnConfig.getItemCount(); columnIndex++) {
              let columnWidth = 100;//getColumnWidth(columnIndex);
              let columnMaxWidth = getColumnMaxWidth(columnIndex);
              
              let hint = this._getCellSizeHint(rowIndex, columnIndex);
              if (hint) {
                if (isAutoSizeRows) {
                  if (hint.minHeight !== Infinity && hint.minHeight > rowHeight)
                    rowHeight = hint.minHeight;
                  if (hint.height > rowHeight)
                    rowHeight = hint.height;
                }
                
                if (isAutoSizeColumns) {
                  if (hint.minWidth !== Infinity && hint.minWidth > columnWidth)
                    columnWidth = hint.minWidth;
                  if (hint.width > columnWidth)
                    columnWidth = hint.width;
                }
              }
              
              if (columnWidth === null)
                columnWidth = 100;
                
              if (columnMaxWidth && columnMaxWidth !== Infinity && columnWidth > columnMaxWidth)
                columnWidth = columnMaxWidth;
              let outerWidth = columnWidth + padding.left + padding.right;
              columnSizes[columnIndex - firstColumn] = {
                padding: {
                  left: padding.left, 
                  right: padding.right
                },
                left: totalColumnWidth + padding.left,
                outerLeft: totalColumnWidth,
                width: columnWidth,
                outerWidth
              };
              
              totalColumnWidth += outerWidth;
              if (totalColumnWidth > layerWidth + columnCellData.offset)
                break;
            }
            
            if (rowMaxHeight && rowMaxHeight !== Infinity && rowHeight > rowMaxHeight)
              rowHeight = rowMaxHeight;
            let outerHeight = rowHeight + padding.top + padding.bottom;
            rowSizes[rowIndex - firstRow] = {
              padding: {
                top: padding.top, 
                bottom: padding.bottom
              },
              top: totalRowHeight + padding.top,
              outerTop: totalRowHeight,
              height: rowHeight,
              outerHeight
            };
            
            totalRowHeight += outerHeight;
            rowConfig.setItemSize(rowIndex, outerHeight);
            if (totalRowHeight > layerHeight + rowCellData.offset)
              break;
          }
          
          if (firstColumn == 0 && totalColumnWidth > 0 && totalColumnWidth < layerWidth) {
            let diff = layerWidth - totalColumnWidth;
            let flexTotal = 0;
            let flexColumns = {};
            for (let columnIndex = 0; columnIndex < columnConfig.getItemCount(); columnIndex++) {
              let flex = columnConfig.getItemFlex(columnIndex);
              if (flex) {
                flexTotal += flex;
                flexColumns[columnIndex] = flex;
              }
            }
            Object.keys(flexColumns).forEach(columnIndex => {
              let flex = flexColumns[columnIndex];
              let extraWidth = Math.floor(diff * (flex / flexTotal));
              columnSizes[columnIndex].width += extraWidth;
              columnSizes[columnIndex].outerWidth += extraWidth;
              totalColumnWidth += extraWidth;
            });
          }
          columnSizes.forEach((size, columnIndex) => {
            columnConfig.setItemSize(columnIndex, size.outerWidth);
          });
        }
        
        layerHeight = totalRowHeight;
        layerWidth = totalColumnWidth;
        
        let outerLeft = 0;
        columnSizes.forEach(s => {
          s.left = outerLeft + s.padding.left;
          s.outerLeft = outerLeft;
          outerLeft += s.outerWidth;
        })
        
        this.__layerWindow = {
          top: this.__scrollTop + top - rowCellData.offset,
          bottom: this.__scrollTop + top - rowCellData.offset + layerHeight,
          left: this.__scrollLeft + left - columnCellData.offset,
          right: this.__scrollLeft + left - columnCellData.offset + layerWidth
        };
      } else {
        this.__layerWindow = {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        };
      }

      this._getLayout().setItemBounds(this.__layerContainer,
        (this.getPaddingLeft() || 0) + (this.__layerWindow.left - this.__scrollLeft),
        (this.getPaddingTop() || 0) + (this.__layerWindow.top - this.__scrollTop),
        layerWidth, layerHeight
      );

      this.__columnSizes = columnSizes;
      this.__rowSizes = rowSizes;

      for (var i = 0; i < this.__layers.length; i++) {
        var layer = this.__layers[i];
        this._getLayout().setItemBounds(layer, 0, 0, layerWidth, layerHeight);
      }

      this.base(arguments, left, top, width, height);
      this.__autoSizing = false;
    },

    /**
     * Sets the size of the layers to contain the cells at the pixel position
     * "left/right" up to "left+minHeight/right+minHeight". The offset of the
     * layer container is adjusted to respect the pane's scroll top and scroll
     * left values.
     *
     * @param left {Integer} Maximum left pixel coordinate of the layers.
     * @param top {Integer} Maximum top pixel coordinate of the layers.
     * @param doFullUpdate {Boolean?false} Whether a full update on the layer
     *    should be performed of if only the layer window should be updated.
     */
    _setLayerWindow(left, top, doFullUpdate) {
      var firstRow = 0;
      var firstColumn = 0;
      let rowConfig = this.__rowConfig;
      let columnConfig = this.__columnConfig;
      var rowCellData = rowConfig.getItemAtPosition(top);
      var columnCellData = columnConfig.getItemAtPosition(left);
      if (rowCellData && columnCellData) {
        firstRow = rowCellData.index;
        firstColumn = columnCellData.index;
      }

      for (var i = 0; i < this.__layers.length; i++) {
        var layer = this.__layers[i];

        if (doFullUpdate) {
          layer.fullUpdate(firstRow, firstColumn);
        } else {
          layer.updateLayerWindow(firstRow, firstColumn);
        }
      }
    },



    /**
     * Check whether the pane was resized and fire an {@link #update} event if
     * it was.
     */
    __checkPaneResize() {
      if (this.__dontFireUpdate) {
        return;
      }

      var scrollSize = this.getScrollSize();
      
      if (this.__paneHeight !== scrollSize.height ||
          this.__paneWidth !== scrollSize.width) {
            
        this.__paneHeight = scrollSize.height;
        this.__paneWidth = scrollSize.width;
        this.fireEvent("update");
      }
    },
    

    /**
     * Schedule a full update on all visible layers.
     */
    fullUpdate : function()
    {
      if (!this.__fullUpdateDebounced) {
        this.__fullUpdateDebounced = qx.util.Function.throttle(() => {
          this._fullUpdate();
          qx.ui.core.queue.Layout.add(this);
          qx.ui.core.queue.Widget.add(this);
        }, 50);
      }
      this.__fullUpdateDebounced();
    },

    _onRowColumnChange() {
      if (!this.__autoSizing)
        this.fullUpdate();
    },


    /**
     * Whether a full update is scheduled.
     *
     * @return {Boolean} Whether a full update is scheduled.
     */
    isUpdatePending : function() {
      return !!this.__jobs._fullUpdate;
    },


    /**
     * Perform a full update on all visible layers. All cached data will be
     * discarded.
     */
    _fullUpdate : function()
    {
      this._setLayerWindow(
        this.__scrollLeft, this.__scrollTop,
        true
      );

      this.__checkPaneResize();
    },


    /**
     * Schedule an update the visible window of the grid according to the top
     * and left scroll positions.
     */
    _deferredUpdateScrollPosition : function()
    {
      this.__jobs._updateScrollPosition = 1;
      qx.ui.core.queue.Widget.add(this);
      qx.ui.core.queue.Layout.add(this);
    },


    /**
     * Update the visible window of the grid according to the top and left scroll
     * positions.
     */
    _updateScrollPosition : function()
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
        // only update layer container offset
        this._getLayout().setItemBounds(this.__layerContainer,
          (this.getPaddingLeft() || 0) + (this.__layerWindow.left - paneWindow.left),
          (this.getPaddingTop() || 0) + (this.__layerWindow.top - paneWindow.top),
          this.__layerWindow.right - this.__layerWindow.left,
          this.__layerWindow.bottom - this.__layerWindow.top
        );
      }
      else
      {
        this._setLayerWindow(
          this.__scrollLeft, this.__scrollTop,
          false
        );
      }

      this.__checkPaneResize();
    }
  },


  destruct : function()
  {
    this._disposeArray("__layers");
    this._disposeObjects("__rowConfig", "__columnConfig", "__layerContainer");
    this.__layerWindow = this.__jobs = this.__columnSizes =
      this.__rowSizes = null;
  }
});
