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
 * The model of a table pane. This model works as proxy to a
 * {@link qx.ui.table.columnmodel.Basic} and manages the visual order of the columns shown in
 * a {@link TablePane}.
 */
qx.Class.define("qx.ui.table.pane.Model",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   *
   * @param tableColumnModel {qx.ui.table.columnmodel.Basic} The TableColumnModel of which this
   *    model is the proxy.
   */
  construct : function(tableColumnModel)
  {
    this.base(arguments);

    tableColumnModel.addListener("visibilityChangedPre", this._onColVisibilityChanged, this);

    this.__tableColumnModel = tableColumnModel;
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fired when the model changed. */
    "modelChanged" : "qx.event.type.Event"
  },



  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {

    /** {string} The type of the event fired when the model changed. */
    EVENT_TYPE_MODEL_CHANGED : "modelChanged"
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {

    /** The visible x position of the first column this model should contain. */
    firstColumnX :
    {
      check : "Integer",
      init : 0,
      apply : "_applyFirstColumnX"
    },


    /**
     * The maximum number of columns this model should contain. If -1 this model will
     * contain all remaining columns.
     */
    maxColumnCount :
    {
      check : "Number",
      init : -1,
      apply : "_applyMaxColumnCount"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __columnCount : null,
    __tableColumnModel : null,


    // property modifier
    _applyFirstColumnX : function(value, old)
    {
      this.__columnCount = null;
      this.fireEvent(qx.ui.table.pane.Model.EVENT_TYPE_MODEL_CHANGED);
    },

    // property modifier
    _applyMaxColumnCount : function(value, old)
    {
      this.__columnCount = null;
      this.fireEvent(qx.ui.table.pane.Model.EVENT_TYPE_MODEL_CHANGED);
    },


    /**
     * Connects the table model to the column model
     *
     * @param tableColumnModel {qx.ui.table.columnmodel.Basic} the column model
     */
    setTableColumnModel : function(tableColumnModel) {
      this.__tableColumnModel = tableColumnModel;
    },


    /**
     * Event handler. Called when the visibility of a column has changed.
     *
     * @param evt {Map} the event.
     * @return {void}
     */
    _onColVisibilityChanged : function(evt)
    {
      this.__columnCount = null;

      // TODO: Check whether the column is in this model (This is a little bit
      //     tricky, because the column could _have been_ in this model, but is
      //     not in it after the change)
      this.fireEvent(qx.ui.table.pane.Model.EVENT_TYPE_MODEL_CHANGED);
    },


    /**
     * Returns the number of columns in this model.
     *
     * @return {Integer} the number of columns in this model.
     */
    getColumnCount : function()
    {
      if (this.__columnCount == null)
      {
        var firstX = this.getFirstColumnX();
        var maxColCount = this.getMaxColumnCount();
        var totalColCount = this.__tableColumnModel.getVisibleColumnCount();

        if (maxColCount == -1 || (firstX + maxColCount) > totalColCount) {
          this.__columnCount = totalColCount - firstX;
        } else {
          this.__columnCount = maxColCount;
        }
      }

      return this.__columnCount;
    },


    /**
     * Returns the model index of the column at the position <code>xPos</code>.
     *
     * @param xPos {Integer} the x postion in the table pane of the column.
     * @return {Integer} the model index of the column.
     */
    getColumnAtX : function(xPos)
    {
      var firstX = this.getFirstColumnX();
      return this.__tableColumnModel.getVisibleColumnAtX(firstX + xPos);
    },


    /**
     * Returns the x position of the column <code>col</code>.
     *
     * @param col {Integer} the model index of the column.
     * @return {Integer} the x postion in the table pane of the column.
     */
    getX : function(col)
    {
      var firstX = this.getFirstColumnX();
      var maxColCount = this.getMaxColumnCount();

      var x = this.__tableColumnModel.getVisibleX(col) - firstX;

      if (x >= 0 && (maxColCount == -1 || x < maxColCount)) {
        return x;
      } else {
        return -1;
      }
    },


    /**
     * Gets the position of the left side of a column (in pixels, relative to the
     * left side of the table pane).
     *
     * This value corresponds to the sum of the widths of all columns left of the
     * column.
     *
     * @param col {Integer} the model index of the column.
     * @return {var} the position of the left side of the column.
     */
    getColumnLeft : function(col)
    {
      var left = 0;
      var colCount = this.getColumnCount();

      for (var x=0; x<colCount; x++)
      {
        var currCol = this.getColumnAtX(x);

        if (currCol == col) {
          return left;
        }

        left += this.__tableColumnModel.getColumnWidth(currCol);
      }

      return -1;
    },


    /**
     * Returns the total width of all columns in the model.
     *
     * @return {Integer} the total width of all columns in the model.
     */
    getTotalWidth : function()
    {
      var totalWidth = 0;
      var colCount = this.getColumnCount();

      for (var x=0; x<colCount; x++)
      {
        var col = this.getColumnAtX(x);
        totalWidth += this.__tableColumnModel.getColumnWidth(col);
      }

      return totalWidth;
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("__tableColumnModel");
  }
});
