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
 * A model that contains all meta data about columns, such as width, renderers,
 * visibility and order.
 *
 * @see qx.ui.table.ITableModel
 */
qx.Class.define("qx.ui.table.columnmodel.Basic",
{
  extend : qx.core.Object,



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
    "widthChanged" : "qx.event.type.DataEvent",

    /**
     * Fired when the visibility of a column has changed. This event is equal to
      * "visibilityChanged", but is fired right before.
     */
    "visibilityChangedPre" : "qx.event.type.DataEvent",

    /**
     * Fired when the visibility of a column has changed. The data property of the
     * event is a map having the following attributes:
     * <ul>
     *   <li>col: The model index of the column the visibility of which has changed.</li>
     *   <li>visible: Whether the column is now visible.</li>
     * </ul>
     */
    "visibilityChanged" : "qx.event.type.DataEvent",

    /**
     * Fired when the column order has changed. The data property of the
     * event is a map having the following attributes:
     * <ul>
     *   <li>col: The model index of the column that was moved.</li>
     *   <li>fromOverXPos: The old overall x position of the column.</li>
     *   <li>toOverXPos: The new overall x position of the column.</li>
     * </ul>
     */
    "orderChanged" : "qx.event.type.DataEvent"
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {

    /** {int} the default width of a column in pixels. */
    DEFAULT_WIDTH           : 100,

    /** {DefaultDataCellRenderer} the default header cell renderer. */
    DEFAULT_HEADER_RENDERER : qx.ui.table.headerrenderer.Default,

    /** {DefaultDataCellRenderer} the default data cell renderer. */
    DEFAULT_DATA_RENDERER   : qx.ui.table.cellrenderer.Default,

    /** {TextFieldCellEditorFactory} the default editor factory. */
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
     * @param colCount {Integer} the number of columns the model should have.
     * @return {void}
     */
    init : function(colCount)
    {
      this.__columnDataArr = [];

      var width = qx.ui.table.columnmodel.Basic.DEFAULT_WIDTH;
      var headerRenderer = this.__headerRenderer = new qx.ui.table.columnmodel.Basic.DEFAULT_HEADER_RENDERER();
      var dataRenderer = this.__dataRenderer = new qx.ui.table.columnmodel.Basic.DEFAULT_DATA_RENDERER();
      var editorFactory = this.__editorFactory = new qx.ui.table.columnmodel.Basic.DEFAULT_EDITOR_FACTORY();
      this.__overallColumnArr = [];
      this.__visibleColumnArr = [];

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
    },


    /**
     * Return the array of visible columns
     *
     * @return {Array} List of all visible columns
     */
    getVisibleColumns : function() {
      return this.__visibleColumnArr;
    },


    /**
     * Sets the width of a column.
     *
     * @param col {Integer} the model index of the column.
     * @param width {Integer} the new width the column should get in pixels.
     * @return {void}
     */
    setColumnWidth : function(col, width)
    {
      var oldWidth = this.__columnDataArr[col].width;

      if (oldWidth != width)
      {
        this.__columnDataArr[col].width = width;

        var data =
        {
          col      : col,
          newWidth : width,
          oldWidth : oldWidth
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
    getColumnWidth : function(col) {
      return this.__columnDataArr[col].width;
    },


    /**
     * Sets the header renderer of a column.
     *
     * @param col {Integer} the model index of the column.
     * @param renderer {HeaderCellRenderer} the new header renderer the column
     *      should get.
     * @return {void}
     */
    setHeaderCellRenderer : function(col, renderer)
    {
      var oldRenderer = this.__columnDataArr[col].headerRenderer;
      if (oldRenderer !== this.__headerRenderer) {
        oldRenderer.dispose();
      }

      this.__columnDataArr[col].headerRenderer = renderer;
    },


    /**
     * Returns the header renderer of a column.
     *
     * @param col {Integer} the model index of the column.
     * @return {HeaderCellRenderer} the header renderer of the column.
     */
    getHeaderCellRenderer : function(col) {
      return this.__columnDataArr[col].headerRenderer;
    },


    /**
     * Sets the data renderer of a column.
     *
     * @param col {Integer} the model index of the column.
     * @param renderer {DataCellRenderer} the new data renderer the column should get.
     * @return {void}
     */
    setDataCellRenderer : function(col, renderer)
    {
      var oldRenderer = this.__columnDataArr[col].headerRenderer;
      if (oldRenderer !== this.__dataRenderer) {
        oldRenderer.dispose();
      }

      this.__columnDataArr[col].dataRenderer = renderer;
    },


    /**
     * Returns the data renderer of a column.
     *
     * @param col {Integer} the model index of the column.
     * @return {DataCellRenderer} the data renderer of the column.
     */
    getDataCellRenderer : function(col) {
      return this.__columnDataArr[col].dataRenderer;
    },


    /**
     * Sets the cell editor factory of a column.
     *
     * @param col {Integer} the model index of the column.
     * @param factory {CellEditorFactory} the new cell editor factory the column should get.
     * @return {void}
     */
    setCellEditorFactory : function(col, factory)
    {
      var oldRenderer = this.__columnDataArr[col].headerRenderer;
      if (oldRenderer !== this.__editorFactory) {
        oldRenderer.dispose();
      }

      this.__columnDataArr[col].editorFactory = factory;
    },


    /**
     * Returns the cell editor factory of a column.
     *
     * @param col {Integer} the model index of the column.
     * @return {CellEditorFactory} the cell editor factory of the column.
     */
    getCellEditorFactory : function(col) {
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
     * @return {var} the "column to x postion" map.
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
      return this.__visibleColumnArr.length;
    },


    /**
     * Returns the model index of a column at a certain visible x position.
     *
     * @param visXPos {Integer} the visible x position of the column.
     * @return {Integer} the model index of the column.
     */
    getVisibleColumnAtX : function(visXPos) {
      return this.__visibleColumnArr[visXPos];
    },


    /**
     * Returns the visible x position of a column.
     *
     * @param col {Integer} the model index of the column.
     * @return {Integer} the visible x position of the column.
     */
    getVisibleX : function(col) {
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
    getOverallColumnAtX : function(overXPos) {
      return this.__overallColumnArr[overXPos];
    },


    /**
     * Returns the overall x position of a column.
     *
     * @param col {Integer} the model index of the column.
     * @return {Integer} the overall x position of the column.
     */
    getOverallX : function(col) {
      return this._getColToXPosMap()[col].overX;
    },


    /**
     * Returns whether a certain column is visible.
     *
     * @param col {Integer} the model index of the column.
     * @return {Boolean} whether the column is visible.
     */
    isColumnVisible : function(col) {
      return (this._getColToXPosMap()[col].visX != null);
    },


    /**
     * Sets whether a certain column is visible.
     *
     * @param col {Integer} the model index of the column.
     * @param visible {Boolean} whether the column should be visible.
     * @return {void}
     * @throws TODOC
     */
    setColumnVisible : function(col, visible)
    {
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
     * @param fromOverXPos {Integer} the overall x postion of the column to move.
     * @param toOverXPos {Integer} the overall x postion of where the column should be
     *      moved to.
     * @return {void}
     */
    moveColumn : function(fromOverXPos, toOverXPos)
    {
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

    this._disposeFields(
      "__overallColumnArr", "__visibleColumnArr",
      "__columnDataArr", "__colToXPosMap"
    );

    this._disposeObjects(
      "__headerRenderer",
      "__dataRenderer",
      "__editorFactory"
    );
  }
});
