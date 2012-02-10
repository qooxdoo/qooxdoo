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

/**
 * A model that contains all meta data about columns, such as width, renderer,
 * visibility and order.
 *
 * @see qx.ui.table.ITableModel
 */
qx.Class.define("qx.ui.table.columnmodel.Basic",
{
  extend : qx.core.Object,


  construct : function()
  {
    this.base(arguments);

    this.__overallColumnArr = [];
    this.__visibleColumnArr = [];
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events : {

    /**
     * Fired when the width of a column has changed. The data property of the event is
     * a map having the following attributes:
     * <ul>
     *   <li>col: The model index of the column the width of which has changed.</li>
     *   <li>newWidth: The new width of the column in pixels.</li>
     *   <li>oldWidth: The old width of the column in pixels.</li>
     * </ul>
     */
    "widthChanged" : "qx.event.type.Data",

    /**
     * Fired when the visibility of a column has changed. This event is equal to
      * "visibilityChanged", but is fired right before.
     */
    "visibilityChangedPre" : "qx.event.type.Data",

    /**
     * Fired when the visibility of a column has changed. The data property of the
     * event is a map having the following attributes:
     * <ul>
     *   <li>col: The model index of the column the visibility of which has changed.</li>
     *   <li>visible: Whether the column is now visible.</li>
     * </ul>
     */
    "visibilityChanged" : "qx.event.type.Data",

    /**
     * Fired when the column order has changed. The data property of the
     * event is a map having the following attributes:
     * <ul>
     *   <li>col: The model index of the column that was moved.</li>
     *   <li>fromOverXPos: The old overall x position of the column.</li>
     *   <li>toOverXPos: The new overall x position of the column.</li>
     * </ul>
     */
    "orderChanged" : "qx.event.type.Data",

    /**
     * Fired when the cell renderer of a column has changed.
     * The data property of the event is a map having the following attributes:
     * <ul>
     *   <li>col: The model index of the column that was moved.</li>
     * </ul>
     */
    "headerCellRendererChanged" : "qx.event.type.Data"
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {

    /** {Integer} the default width of a column in pixels. */
    DEFAULT_WIDTH           : 100,

    /** {qx.ui.table.headerrenderer.Default} the default header cell renderer. */
    DEFAULT_HEADER_RENDERER : qx.ui.table.headerrenderer.Default,

    /** {qx.ui.table.cellrenderer.Default} the default data cell renderer. */
    DEFAULT_DATA_RENDERER   : qx.ui.table.cellrenderer.Default,

    /** {qx.ui.table.celleditor.TextField} the default editor factory. */
    DEFAULT_EDITOR_FACTORY  : qx.ui.table.celleditor.TextField
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __internalChange : null,
    __colToXPosMap : null,
    __visibleColumnArr : null,
    __overallColumnArr : null,
    __columnDataArr : null,

    __headerRenderer : null,
    __dataRenderer : null,
    __editorFactory : null,


    /**
     * Initializes the column model.
     *
     * @param colCount {Integer}
     *   The number of columns the model should have.
     *
     * @param table {qx.ui.table.Table}
     *   The table to which this column model is attached.
     */
    init : function(colCount, table)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertInteger(colCount, "Invalid argument 'colCount'.");
      }

      this.__columnDataArr = [];

      var width = qx.ui.table.columnmodel.Basic.DEFAULT_WIDTH;
      var headerRenderer = this.__headerRenderer ||  (this.__headerRenderer = new qx.ui.table.columnmodel.Basic.DEFAULT_HEADER_RENDERER());
      var dataRenderer = this.__dataRenderer || (this.__dataRenderer = new qx.ui.table.columnmodel.Basic.DEFAULT_DATA_RENDERER());
      var editorFactory = this.__editorFactory || (this.__editorFactory = new qx.ui.table.columnmodel.Basic.DEFAULT_EDITOR_FACTORY());
      this.__overallColumnArr = [];
      this.__visibleColumnArr = [];

      // Get the initially hidden column array, if one was provided. Older
      // subclasses may not provide the 'table' argument, so we treat them
      // traditionally with no initially hidden columns.
      var initiallyHiddenColumns;

      // Was a table provided to us?
      if (table)
      {
        // Yup. Get its list of initially hidden columns, if the user provided
        // such a list.
        initiallyHiddenColumns = table.getInitiallyHiddenColumns();
      }

      // If no table was specified, or if the user didn't provide a list of
      // initially hidden columns, use an empty list.
      initiallyHiddenColumns = initiallyHiddenColumns || [];


      for (var col=0; col<colCount; col++)
      {
        this.__columnDataArr[col] =
        {
          width          : width,
          headerRenderer : headerRenderer,
          dataRenderer   : dataRenderer,
          editorFactory  : editorFactory
        };

        this.__overallColumnArr[col] = col;
        this.__visibleColumnArr[col] = col;
      }

      this.__colToXPosMap = null;

      // If any columns are initialy hidden, hide them now. Make it an
      // internal change so that events are not generated.
      this.__internalChange = true;
      for (var hidden=0; hidden<initiallyHiddenColumns.length; hidden++)
      {
        this.setColumnVisible(initiallyHiddenColumns[hidden], false);
      }
      this.__internalChange = false;

      for (col=0; col<colCount; col++)
      {
        var data =
        {
          col     : col,
          visible : this.isColumnVisible(col)
        };

        this.fireDataEvent("visibilityChangedPre", data);
        this.fireDataEvent("visibilityChanged", data);
      }
    },


    /**
     * Return the array of visible columns
     *
     * @return {Array} List of all visible columns
     */
    getVisibleColumns : function() {
      return this.__visibleColumnArr != null ? this.__visibleColumnArr : [];
    },


    /**
     * Sets the width of a column.
     *
     * @param col {Integer}
     *   The model index of the column.
     *
     * @param width {Integer}
     *   The new width the column should get in pixels.
     *
     * @param isMouseAction {Boolean}
     *   <i>true</i> if the column width is being changed as a result of a
     *   mouse drag in the header; false or undefined otherwise.
     *
     * @return {void}
     */
    setColumnWidth : function(col, width, isMouseAction)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        this.assertInteger(col, "Invalid argument 'col'.");
        this.assertInteger(width, "Invalid argument 'width'.");
        this.assertNotUndefined(this.__columnDataArr[col], "Column not found in table model");
      }

      var oldWidth = this.__columnDataArr[col].width;

      if (oldWidth != width)
      {
        this.__columnDataArr[col].width = width;

        var data =
        {
          col           : col,
          newWidth      : width,
          oldWidth      : oldWidth,
          isMouseAction : isMouseAction || false
        };

        this.fireDataEvent("widthChanged", data);
      }
    },


    /**
     * Returns the width of a column.
     *
     * @param col {Integer} the model index of the column.
     * @return {Integer} the width of the column in pixels.
     */
    getColumnWidth : function(col)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertInteger(col, "Invalid argument 'col'.");
        this.assertNotUndefined(this.__columnDataArr[col], "Column not found in table model");
      }

      return this.__columnDataArr[col].width;
    },


    /**
     * Sets the header renderer of a column.
     *
     * @param col {Integer} the model index of the column.
     * @param renderer {qx.ui.table.IHeaderRenderer} the new header renderer the column
     *      should get.
     * @return {void}
     */
    setHeaderCellRenderer : function(col, renderer)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        this.assertInteger(col, "Invalid argument 'col'.");
        this.assertInterface(renderer, qx.ui.table.IHeaderRenderer, "Invalid argument 'renderer'.");
        this.assertNotUndefined(this.__columnDataArr[col], "Column not found in table model");
      }

      var oldRenderer = this.__columnDataArr[col].headerRenderer;
      if (oldRenderer !== this.__headerRenderer) {
        oldRenderer.dispose();
      }

      this.__columnDataArr[col].headerRenderer = renderer;
      this.fireDataEvent("headerCellRendererChanged", {col:col});
    },


    /**
     * Returns the header renderer of a column.
     *
     * @param col {Integer} the model index of the column.
     * @return {qx.ui.table.IHeaderRenderer} the header renderer of the column.
     */
    getHeaderCellRenderer : function(col)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        this.assertInteger(col, "Invalid argument 'col'.");
        this.assertNotUndefined(this.__columnDataArr[col], "Column not found in table model");
      }

      return this.__columnDataArr[col].headerRenderer;
    },


    /**
     * Sets the data renderer of a column.
     *
     * @param col {Integer} the model index of the column.
     * @param renderer {qx.ui.table.ICellRenderer} the new data renderer
     *   the column should get.
     * @return {qx.ui.table.ICellRenderer?null} If an old renderer was set and
     *   it was not the default renderer, the old renderer is returned for
     *   pooling or disposing.
     */
    setDataCellRenderer : function(col, renderer)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        this.assertInteger(col, "Invalid argument 'col'.");
        this.assertInterface(renderer, qx.ui.table.ICellRenderer, "Invalid argument 'renderer'.");
        this.assertNotUndefined(this.__columnDataArr[col], "Column not found in table model");
      }

      this.__columnDataArr[col].dataRenderer = renderer;

      var oldRenderer = this.__columnDataArr[col].dataRenderer;
      if (oldRenderer !== this.__dataRenderer) {
        return oldRenderer;
      }
      return null;
    },


    /**
     * Returns the data renderer of a column.
     *
     * @param col {Integer} the model index of the column.
     * @return {qx.ui.table.ICellRenderer} the data renderer of the column.
     */
    getDataCellRenderer : function(col)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        this.assertInteger(col, "Invalid argument 'col'.");
        this.assertNotUndefined(this.__columnDataArr[col], "Column not found in table model");
      }

      return this.__columnDataArr[col].dataRenderer;
    },


    /**
     * Sets the cell editor factory of a column.
     *
     * @param col {Integer} the model index of the column.
     * @param factory {qx.ui.table.ICellEditorFactory} the new cell editor factory the column should get.
     * @return {void}
     */
    setCellEditorFactory : function(col, factory)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        this.assertInteger(col, "Invalid argument 'col'.");
        this.assertInterface(factory, qx.ui.table.ICellEditorFactory, "Invalid argument 'factory'.");
        this.assertNotUndefined(this.__columnDataArr[col], "Column not found in table model");
      }

      var oldFactory = this.__columnDataArr[col].editorFactory;
      if (oldFactory !== this.__editorFactory) {
        oldFactory.dispose();
      }

      this.__columnDataArr[col].editorFactory = factory;
    },


    /**
     * Returns the cell editor factory of a column.
     *
     * @param col {Integer} the model index of the column.
     * @return {qx.ui.table.ICellEditorFactory} the cell editor factory of the column.
     */
    getCellEditorFactory : function(col)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        this.assertInteger(col, "Invalid argument 'col'.");
        this.assertNotUndefined(this.__columnDataArr[col], "Column not found in table model");
      }

      return this.__columnDataArr[col].editorFactory;
    },


    /**
     * Returns the map that translates model indexes to x positions.
     *
     * The returned map contains for a model index (int) a map having two
     * properties: overX (the overall x position of the column, int) and
     * visX (the visible x position of the column, int). visX is missing for
     * hidden columns.
     *
     * @return {Map} the "column to x position" map.
     */
    _getColToXPosMap : function()
    {
      if (this.__colToXPosMap == null)
      {
        this.__colToXPosMap = {};

        for (var overX=0; overX<this.__overallColumnArr.length; overX++)
        {
          var col = this.__overallColumnArr[overX];
          this.__colToXPosMap[col] = { overX : overX };
        }

        for (var visX=0; visX<this.__visibleColumnArr.length; visX++)
        {
          var col = this.__visibleColumnArr[visX];
          this.__colToXPosMap[col].visX = visX;
        }
      }

      return this.__colToXPosMap;
    },


    /**
     * Returns the number of visible columns.
     *
     * @return {Integer} the number of visible columns.
     */
    getVisibleColumnCount : function() {
      return this.__visibleColumnArr != null ? this.__visibleColumnArr.length : 0;
    },


    /**
     * Returns the model index of a column at a certain visible x position.
     *
     * @param visXPos {Integer} the visible x position of the column.
     * @return {Integer} the model index of the column.
     */
    getVisibleColumnAtX : function(visXPos)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertInteger(visXPos, "Invalid argument 'visXPos'.");
      }

      return this.__visibleColumnArr[visXPos];
    },


    /**
     * Returns the visible x position of a column.
     *
     * @param col {Integer} the model index of the column.
     * @return {Integer} the visible x position of the column.
     */
    getVisibleX : function(col)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertInteger(col, "Invalid argument 'col'.");
      }

      return this._getColToXPosMap()[col].visX;
    },


    /**
     * Returns the overall number of columns (including hidden columns).
     *
     * @return {Integer} the overall number of columns.
     */
    getOverallColumnCount : function() {
      return this.__overallColumnArr.length;
    },


    /**
     * Returns the model index of a column at a certain overall x position.
     *
     * @param overXPos {Integer} the overall x position of the column.
     * @return {Integer} the model index of the column.
     */
    getOverallColumnAtX : function(overXPos)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertInteger(overXPos, "Invalid argument 'overXPos'.");
      }

      return this.__overallColumnArr[overXPos];
    },


    /**
     * Returns the overall x position of a column.
     *
     * @param col {Integer} the model index of the column.
     * @return {Integer} the overall x position of the column.
     */
    getOverallX : function(col)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertInteger(col, "Invalid argument 'col'.");
      }

      return this._getColToXPosMap()[col].overX;
    },


    /**
     * Returns whether a certain column is visible.
     *
     * @param col {Integer} the model index of the column.
     * @return {Boolean} whether the column is visible.
     */
    isColumnVisible : function(col)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertInteger(col, "Invalid argument 'col'.");
      }

      return (this._getColToXPosMap()[col].visX != null);
    },


    /**
     * Sets whether a certain column is visible.
     *
     * @param col {Integer} the model index of the column.
     * @param visible {Boolean} whether the column should be visible.
     * @return {void}
     */
    setColumnVisible : function(col, visible)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        this.assertInteger(col, "Invalid argument 'col'.");
        this.assertBoolean(visible, "Invalid argument 'visible'.");
      }

      if (visible != this.isColumnVisible(col))
      {
        if (visible)
        {
          var colToXPosMap = this._getColToXPosMap();

          var overX = colToXPosMap[col].overX;

          if (overX == null) {
            throw new Error("Showing column failed: " + col + ". The column is not added to this TablePaneModel.");
          }

          // get the visX of the next visible column after the column to show
          var nextVisX;

          for (var x=overX+1; x<this.__overallColumnArr.length; x++)
          {
            var currCol = this.__overallColumnArr[x];
            var currVisX = colToXPosMap[currCol].visX;

            if (currVisX != null)
            {
              nextVisX = currVisX;
              break;
            }
          }

          // If there comes no visible column any more, then show the column
          // at the end
          if (nextVisX == null) {
            nextVisX = this.__visibleColumnArr.length;
          }

          // Add the column to the visible columns
          this.__visibleColumnArr.splice(nextVisX, 0, col);
        }
        else
        {
          var visX = this.getVisibleX(col);
          this.__visibleColumnArr.splice(visX, 1);
        }

        // Invalidate the __colToXPosMap
        this.__colToXPosMap = null;

        // Inform the listeners
        if (!this.__internalChange)
        {
          var data =
          {
            col     : col,
            visible : visible
          };

          this.fireDataEvent("visibilityChangedPre", data);
          this.fireDataEvent("visibilityChanged", data);
        }
      }
    },


    /**
     * Moves a column.
     *
     * @param fromOverXPos {Integer} the overall x position of the column to move.
     * @param toOverXPos {Integer} the overall x position of where the column should be
     *      moved to.
     */
    moveColumn : function(fromOverXPos, toOverXPos)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        this.assertInteger(fromOverXPos, "Invalid argument 'fromOverXPos'.");
        this.assertInteger(toOverXPos, "Invalid argument 'toOverXPos'.");
      }

      this.__internalChange = true;

      var col = this.__overallColumnArr[fromOverXPos];
      var visible = this.isColumnVisible(col);

      if (visible) {
        this.setColumnVisible(col, false);
      }

      this.__overallColumnArr.splice(fromOverXPos, 1);
      this.__overallColumnArr.splice(toOverXPos, 0, col);

      // Invalidate the __colToXPosMap
      this.__colToXPosMap = null;

      if (visible) {
        this.setColumnVisible(col, true);
      }
      this.__internalChange = false;

      // Inform the listeners
      var data =
      {
        col          : col,
        fromOverXPos : fromOverXPos,
        toOverXPos   : toOverXPos
      };

      this.fireDataEvent("orderChanged", data);
    },


    /**
     * Reorders all columns to new overall positions. Will fire one "orderChanged" event
     * without data afterwards
     *
     * @param newPositions {Integer[]} Array mapping the index of a column in table model to its wanted overall
     *                            position on screen (both zero based). If the table models holds
     *                            col0, col1, col2 and col3 and you give [1,3,2,0], the new column order
     *                            will be col3, col0, col2, col1
     */
    setColumnsOrder : function(newPositions)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertArray(newPositions, "Invalid argument 'newPositions'.");
      }

      if (newPositions.length == this.__overallColumnArr.length)
      {
        this.__internalChange = true;

        // Go through each column an switch visible ones to invisible. Reason is unknown,
        // this just mimicks the behaviour of moveColumn. Possibly useful because setting
        // a column visible later updates a map with its screen coords.
        var isVisible = new Array(newPositions.length);
        for (var colIdx = 0; colIdx < this.__overallColumnArr.length; colIdx++)
        {
          var visible = this.isColumnVisible(colIdx);
          isVisible[colIdx] = visible; //Remember, as this relies on this.__colToXPosMap which is cleared below
          if (visible){
            this.setColumnVisible(colIdx, false);
          }
        }

        // Store new position values
        this.__overallColumnArr = qx.lang.Array.clone(newPositions);

        // Invalidate the __colToXPosMap
        this.__colToXPosMap = null;

        // Go through each column an switch invisible ones back to visible
        for (var colIdx = 0; colIdx < this.__overallColumnArr.length; colIdx++){
          if (isVisible[colIdx]) {
            this.setColumnVisible(colIdx, true);
          }
        }
        this.__internalChange = false;

        // Inform the listeners. Do not add data as all known listeners in qooxdoo
        // only take this event to mean "total repaint necesscary". Fabian will look
        // after deprecating the data part of the orderChanged - event
        this.fireDataEvent("orderChanged");

      } else {
        throw new Error("setColumnsOrder: Invalid number of column positions given, expected "
                        + this.__overallColumnArr.length + ", got " + newPositions.length);
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    for (var i=0; i< this.__columnDataArr.length; i++)
    {
      this.__columnDataArr[i].headerRenderer.dispose();
      this.__columnDataArr[i].dataRenderer.dispose();
      this.__columnDataArr[i].editorFactory.dispose();
    }

    this.__overallColumnArr = this.__visibleColumnArr =
      this.__columnDataArr = this.__colToXPosMap = null;

    this._disposeObjects(
      "__headerRenderer",
      "__dataRenderer",
      "__editorFactory"
    );
  }
});
