/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)

************************************************************************ */

/* ************************************************************************

#module(ui_table)

************************************************************************ */

/**
 * A table model that loads its data from a backend.
 * <p>
 * Only those  rows are loaded that are near the area the user is currently
 * viewing. If the user scrolls, the rows he will see soon are loaded
 * asynchroniously in the background. All loaded data is managed in a cache that
 * automatically removes the last resently used rows when it gets full.
 * <p>
 * This class is abstract: The actual loading of row data must be done by
 * subclasses.
 */
qx.Class.define("qx.legacy.ui.table.model.Remote",
{
  extend : qx.legacy.ui.table.model.Abstract,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._sortColumnIndex = -1;
    this._sortAscending = true;
    this._rowCount = -1;

    this._lruCounter = 0;

    // Holds the index of the first block that is currently loading.
    // Is -1 if there is currently no request on its way.
    this._firstLoadingBlock = -1;

    // Holds the index of the first row that should be loaded when the response of
    // the current request arrives. Is -1 we need no following request.
    this._firstRowToLoad = -1;

    // Counterpart to _firstRowToLoad
    this._lastRowToLoad = -1;

    // Holds whether the current request will bring obsolete data. When true the
    // response of the current request will be ignored.
    this._ignoreCurrentRequest = false;

    this._rowBlockCache = {};
    this._rowBlockCount = 0;
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {

    /** The number of rows that are stored in one cache block. */
    blockSize :
    {
      check : "Integer",
      init : 50
    },

    /** The maximum number of row blocks kept in the cache. */
    maxCachedBlockCount :
    {
      check : "Integer",
      init : 15
    },


    /**
     * Whether to clear the cache when some rows are removed.
     * If false the rows are removed locally in the cache.
     */
    clearCacheOnRemove :
    {
      check : "Boolean",
      init : false
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    getRowCount : function()
    {
      if (this._rowCount == -1)
      {
        this._loadRowCount();

        // NOTE: _loadRowCount may set this._rowCount
        return (this._rowCount == -1) ? 0 : this._rowCount;
      }
      else
      {
        return this._rowCount;
      }
    },


    /**
     * Implementing classes have to call {@link _onRowCountLoaded()} when the
     * server response arrived. That method has to be called! Even when there
     * was an error.
     *
     * @abstract
     * @return {void}
     * @throws the abstract function warning.
     */
    _loadRowCount : function() {
      throw new Error("_loadRowCount is abstract");
    },


    /**
     * Sets the row count.
     *
     * Has to be called by {@link _loadRowCount()}.
     *
     * @param rowCount {Integer} the number of rows in this model or null if loading.
     * @return {void}
     */
    _onRowCountLoaded : function(rowCount)
    {
      // this.debug("row count loaded: " + rowCount);
      if (rowCount == null || rowCount < 0) {
        rowCount = 0;
      }

      this._rowCount = rowCount;

      // Inform the listeners
      var data =
      {
        firstRow    : 0,
        lastRow     : rowCount - 1,
        firstColumn : 0,
        lastColumn  : this.getColumnCount() - 1
      };

      this.fireDataEvent(qx.legacy.ui.table.ITableModel.EVENT_TYPE_DATA_CHANGED, data);
    },


    /**
     * Reloads the model and clears the local cache.
     *
     * @return {void}
     */
    reloadData : function()
    {
      this.clearCache();

      // If there is currently a request on its way, then this request will bring
      // obsolete data -> Ignore it
      if (this._firstLoadingBlock != -1) {
        var cancelingSuceed = this._cancelCurrentRequest();
        if (cancelingSuceed) {
          // The request was cancelled -> We're not loading any blocks any more
          this._firstLoadingBlock = -1;
          this._ignoreCurrentRequest = false;
        } else {
          // The request was not cancelled -> Ignore it
          this._ignoreCurrentRequest = true;
        }
      }

      // Forget a possibly outstanding request
      // (_loadRowCount will tell the listeners anyway, that the whole table changed)
      this._firstRowToLoad = -1;
      this._lastRowToLoad = -1;

      // NOTE: This will inform the listeners as soon as the new row count is known
      this._loadRowCount();
    },


    /**
     * Clears the cache.
     *
     * @return {void}
     */
    clearCache : function()
    {
      this._rowBlockCache = {};
      this._rowBlockCount = 0;
    },


    /**
     * Returns the current state of the cache.
     * <p>
     * Do not change anything in the returned data. This breaks the model state.
     * Use this method only together with {@link #restoreCacheContent} for backing
     * up state for a later restore.
     *
     * @return {Map} the current cache state.
     */
    getCacheContent : function() {
      return {
        sortColumnIndex : this._sortColumnIndex,
        sortAscending   : this._sortAscending,
        rowCount        : this._rowCount,
        lruCounter      : this._lruCounter,
        rowBlockCache   : this._rowBlockCache,
        rowBlockCount   : this._rowBlockCount
      };
    },


    /**
     * Restores a cache state created by {@link #getCacheContent}.
     *
     * @param cacheContent {Map} An old cache state.
     */
    restoreCacheContent : function(cacheContent)
    {
      // If there is currently a request on its way, then this request will bring
      // obsolete data -> Ignore it
      if (this._firstLoadingBlock != -1)
      {
        // Try to cancel the current request
        var cancelingSuceed = this._cancelCurrentRequest();

        if (cancelingSuceed)
        {
          // The request was cancelled -> We're not loading any blocks any more
          this._firstLoadingBlock = -1;
          this._ignoreCurrentRequest = false;
        }
        else
        {
          // The request was not cancelled -> Ignore it
          this._ignoreCurrentRequest = true;
        }
      }

      // Restore the cache content
      this._sortColumnIndex = cacheContent.sortColumnIndex;
      this._sortAscending = cacheContent.sortAscending;
      this._rowCount = cacheContent.rowCount;
      this._lruCounter = cacheContent.lruCounter;
      this._rowBlockCache = cacheContent.rowBlockCache;
      this._rowBlockCount = cacheContent.rowBlockCount;

      // Inform the listeners
      var data =
      {
        firstRow    : 0,
        lastRow     : this._rowCount - 1,
        firstColumn : 0,
        lastColumn  : this.getColumnCount() - 1
      };

      this.dispatchEvent(new qx.event.type.DataEvent(qx.legacy.ui.table.ITableModel.EVENT_TYPE_DATA_CHANGED, data), true);
    },


    /**
     * Cancels the current request if possible.
     *
     * Should be overridden by subclasses if they are able to cancel requests. This
     * allows sending a new request directly after a call of {@link #reloadData}.
     *
     * @return {Boolean} whether the request was cancelled.
     */
    _cancelCurrentRequest : function() {
      return false;
    },


    /**
     * Iterates through all cached rows.
     *
     * The iterator will be called for each cached row with two parameters: The row
     * index of the current row (Integer) and the row data of that row (var[]). If
     * the iterator returns something this will be used as new row data.
     *
     * The iterator is called in the same order as the rows are in the model
     * (the row index is always ascending).
     *
     * @param iterator {Function} The iterator function to call.
     * @param object {Object} context of the iterator
     * @return {void}
     */
    iterateCachedRows : function(iterator, object)
    {
      var blockSize = this.getBlockSize();
      var blockCount = Math.ceil(this.getRowCount() / blockSize);

      // Remove the row and move the rows of all following blocks
      for (var block=0; block<=blockCount; block++)
      {
        var blockData = this._rowBlockCache[block];

        if (blockData != null)
        {
          var rowOffset = block * blockSize;
          var rowDataArr = blockData.rowDataArr;

          for (var relRow=0; relRow<rowDataArr.length; relRow++)
          {
            // Call the iterator for this row
            var rowData = rowDataArr[relRow];
            var newRowData = iterator.call(object, rowOffset + relRow, rowData);

            if (newRowData != null) {
              rowDataArr[relRow] = newRowData;
            }
          }
        }
      }
    },

    // overridden
    prefetchRows : function(firstRowIndex, lastRowIndex)
    {
      // this.debug("Prefetch wanted: " + firstRowIndex + ".." + lastRowIndex);
      if (this._firstLoadingBlock == -1)
      {
        var blockSize = this.getBlockSize();
        var totalBlockCount = Math.ceil(this._rowCount / blockSize);

        // There is currently no request running -> Start a new one
        // NOTE: We load one more block above and below to have a smooth
        //       scrolling into the next block without blank cells
        var firstBlock = parseInt(firstRowIndex / blockSize) - 1;

        if (firstBlock < 0) {
          firstBlock = 0;
        }

        var lastBlock = parseInt(lastRowIndex / blockSize) + 1;

        if (lastBlock >= totalBlockCount) {
          lastBlock = totalBlockCount - 1;
        }

        // Check which blocks we have to load
        var firstBlockToLoad = -1;
        var lastBlockToLoad = -1;

        for (var block=firstBlock; block<=lastBlock; block++)
        {
          if (this._rowBlockCache[block] == null || this._rowBlockCache[block].isDirty)
          {
            // We don't have this block
            if (firstBlockToLoad == -1) {
              firstBlockToLoad = block;
            }

            lastBlockToLoad = block;
          }
        }

        // Load the blocks
        if (firstBlockToLoad != -1)
        {
          this._firstRowToLoad = -1;
          this._lastRowToLoad = -1;

          this._firstLoadingBlock = firstBlockToLoad;

          // this.debug("Starting server request. rows: " + firstRowIndex + ".." + lastRowIndex + ", blocks: " + firstBlockToLoad + ".." + lastBlockToLoad);
          this._loadRowData(firstBlockToLoad * blockSize, (lastBlockToLoad + 1) * blockSize - 1);
        }
      }
      else
      {
        // There is already a request running -> Remember this request
        // so it can be executed after the current one is finished.
        this._firstRowToLoad = firstRowIndex;
        this._lastRowToLoad = lastRowIndex;
      }
    },


    /**
     * Loads some row data from the server.
     *
     * Implementing classes have to call {@link _onRowDataLoaded()} when the server
     * response arrived. That method has to be called! Even when there was an error.
     *
     * @abstract
     * @param firstRow {Integer} The index of the first row to load.
     * @param lastRow {Integer} The index of the last row to load.
     * @return {void}
     * @throws the abstract function warning.
     */
    _loadRowData : function(firstRow, lastRow) {
      throw new Error("_loadRowCount is abstract");
    },


    /**
     * Sets row data.
     *
     * Has to be called by {@link _loadRowData()}.
     *
     * @param rowDataArr {Map[]} the loaded row data or null if there was an error.
     * @return {void}
     */
    _onRowDataLoaded : function(rowDataArr)
    {
      if (rowDataArr != null && !this._ignoreCurrentRequest)
      {
        var blockSize = this.getBlockSize();
        var blockCount = Math.ceil(rowDataArr.length / blockSize);

        if (blockCount == 1)
        {
          // We got one block -> Use the rowData directly
          this._setRowBlockData(this._firstLoadingBlock, rowDataArr);
        }
        else
        {
          // We got more than one block -> We've to split the rowData
          for (var i=0; i<blockCount; i++)
          {
            var rowOffset = i * blockSize;
            var blockRowData = [];
            var mailCount = Math.min(blockSize, rowDataArr.length - rowOffset);

            for (var row=0; row<mailCount; row++) {
              blockRowData.push(rowDataArr[rowOffset + row]);
            }

            this._setRowBlockData(this._firstLoadingBlock + i, blockRowData);
          }
        }

        // this.debug("Got server answer. blocks: " + this._firstLoadingBlock + ".." + (this._firstLoadingBlock + blockCount - 1) + ". mail count: " + rowDataArr.length + " block count:" + blockCount);
        // Inform the listeners
        var data =
        {
          firstRow    : this._firstLoadingBlock * blockSize,
          lastRow     : (this._firstLoadingBlock + blockCount + 1) * blockSize - 1,
          firstColumn : 0,
          lastColumn  : this.getColumnCount() - 1
        };

        this.fireDataEvent(qx.legacy.ui.table.ITableModel.EVENT_TYPE_DATA_CHANGED, data);
      }

      // We're not loading any blocks any more
      this._firstLoadingBlock = -1;
      this._ignoreCurrentRequest = false;

      // Check whether we have to start a new request
      if (this._firstRowToLoad != -1) {
        this.prefetchRows(this._firstRowToLoad, this._lastRowToLoad);
      }
    },


    /**
     * Sets the data of one block.
     *
     * @param block {Integer} the index of the block.
     * @param rowDataArr {var[][]} the data to set.
     * @return {void}
     */
    _setRowBlockData : function(block, rowDataArr)
    {
      if (this._rowBlockCache[block] == null)
      {

        // This is a new block -> Check whether we have to remove another block first
        this._rowBlockCount++;

        while (this._rowBlockCount > this.getMaxCachedBlockCount())
        {
          // Find the last recently used block
          // NOTE: We never remove block 0 and 1
          var lruBlock;
          var minLru = this._lruCounter;

          for (var currBlock in this._rowBlockCache)
          {
            var currLru = this._rowBlockCache[currBlock].lru;

            if (currLru < minLru && currBlock > 1)
            {
              minLru = currLru;
              lruBlock = currBlock;
            }
          }

          // Remove that block
          // this.debug("Removing block: " + lruBlock + ". current LRU: " + this._lruCounter);
          delete this._rowBlockCache[lruBlock];
          this._rowBlockCount--;
        }
      }

      this._rowBlockCache[block] =
      {
        lru        : ++this._lruCounter,
        rowDataArr : rowDataArr
      };
    },


    /**
     * Removes a rows from the model.
     *
     * @param rowIndex {Integer} the index of the row to remove.
     * @return {void}
     */
    removeRow : function(rowIndex)
    {
      if (this.getClearCacheOnRemove())
      {
        this.clearCache();

        // Inform the listeners
        var data =
        {
          firstRow    : 0,
          lastRow     : this.getRowCount() - 1,
          firstColumn : 0,
          lastColumn  : this.getColumnCount() - 1
        };

        this.fireDataEvent(qx.legacy.ui.table.ITableModel.EVENT_TYPE_DATA_CHANGED, data);
      }
      else
      {
        var blockSize = this.getBlockSize();
        var blockCount = Math.ceil(this.getRowCount() / blockSize);
        var startBlock = parseInt(rowIndex / blockSize);

        // Remove the row and move the rows of all following blocks
        for (var block=startBlock; block<=blockCount; block++)
        {
          var blockData = this._rowBlockCache[block];

          if (blockData != null)
          {
            // Remove the row in the start block
            // NOTE: In the other blocks the first row is removed
            //       (This is the row that was)
            var removeIndex = 0;

            if (block == startBlock) {
              removeIndex = rowIndex - block * blockSize;
            }

            blockData.rowDataArr.splice(removeIndex, 1);

            if (block == blockCount - 1)
            {
              // This is the last block
              if (blockData.rowDataArr.length == 0)
              {
                // It is empty now -> Remove it
                delete this._rowBlockCache[block];
              }
            }
            else
            {
              // Try to copy the first row of the next block to the end of this block
              // so this block can stays clean
              var nextBlockData = this._rowBlockCache[block + 1];

              if (nextBlockData != null) {
                blockData.rowDataArr.push(nextBlockData.rowDataArr[0]);
              }
              else
              {
                // There is no row to move -> Mark this block as dirty
                blockData.isDirty = true;
              }
            }
          }
        }

        if (this._rowCount != -1) {
          this._rowCount--;
        }

        // Inform the listeners
        if (this.hasListener(qx.legacy.ui.table.ITableModel.EVENT_TYPE_DATA_CHANGED))
        {
          var data =
          {
            firstRow    : rowIndex,
            lastRow     : this.getRowCount() - 1,
            firstColumn : 0,
            lastColumn  : this.getColumnCount() - 1
          };

          this.fireDataEvent(qx.legacy.ui.table.ITableModel.EVENT_TYPE_DATA_CHANGED, data);
        }
      }
    },


    /**
     *
     * See overridden method for details.
     *
     * @param rowIndex {Integer} the model index of the row.
     * @return {Object} Map containing a value for each column.
     */
    getRowData : function(rowIndex)
    {
      var blockSize = this.getBlockSize();
      var block = parseInt(rowIndex / blockSize);
      var blockData = this._rowBlockCache[block];

      if (blockData == null)
      {
        // This block is not (yet) loaded
        return null;
      }
      else
      {
        var rowData = blockData.rowDataArr[rowIndex - (block * blockSize)];

        // Update the last recently used counter
        if (blockData.lru != this._lruCounter) {
          blockData.lru = ++this._lruCounter;
        }

        return rowData;
      }
    },

    // overridden
    getValue : function(columnIndex, rowIndex)
    {
      var rowData = this.getRowData(rowIndex);

      if (rowData == null) {
        return null;
      }
      else
      {
        var columnId = this.getColumnId(columnIndex);
        return rowData[columnId];
      }
    },

    // overridden
    setValue : function(columnIndex, rowIndex, value)
    {
      var rowData = this.getRowData(rowIndex);

      if (rowData == null) {
        // row has not yet been loaded or does not exist
        return null;
      }
      else
      {
        var columnId = this.getColumnId(columnIndex);
        rowData[columnId] = value;

        // Inform the listeners
        if (this.hasListener(qx.legacy.ui.table.ITableModel.EVENT_TYPE_DATA_CHANGED))
        {
          var data =
          {
            firstRow    : rowIndex,
            lastRow     : rowIndex,
            firstColumn : columnIndex,
            lastColumn  : columnIndex
          };

          this.fireDataEvent(qx.legacy.ui.table.ITableModel.EVENT_TYPE_DATA_CHANGED, data);
        }
      }
    },


    /**
     * Sets whether a column is sortable.
     *
     * @param columnIndex {Integer} the column of which to set the sortable state.
     * @param sortable {Boolean} whether the column should be sortable.
     * @return {void}
     */
    setColumnSortable : function(columnIndex, sortable)
    {
      if (sortable != this.isColumnSortable(columnIndex))
      {
        if (this._sortableColArr == null) {
          this._sortableColArr = [];
        }

        this._sortableColArr[columnIndex] = sortable;

        this.fireEvent(qx.legacy.ui.table.ITableModel.EVENT_TYPE_META_DATA_CHANGED);
      }
    },

    // overridden
    isColumnSortable : function(columnIndex)
    {
      return (
        this._sortableColArr
        ? (this._sortableColArr[columnIndex] !== false)
        : true
      );
    },

    // overridden
    sortByColumn : function(columnIndex, ascending)
    {
      if (this._sortColumnIndex != columnIndex || this._sortAscending != ascending)
      {
        this._sortColumnIndex = columnIndex;
        this._sortAscending = ascending;

        this.clearCache();

        // Inform the listeners
        this.fireEvent(qx.legacy.ui.table.ITableModel.EVENT_TYPE_META_DATA_CHANGED);
      }
    },

    // overridden
    getSortColumnIndex : function() {
      return this._sortColumnIndex;
    },

    // overridden
    isSortAscending : function() {
      return this._sortAscending;
    }
  }
});
