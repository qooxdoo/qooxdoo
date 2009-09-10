/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(table)

************************************************************************ */

/**
 * An abstract resize behavior.  All resize behaviors should extend this
 * class.
 */
qx.Class.define("qx.legacy.ui.table.columnmodel.resizebehavior.Abstract",
{
  type : "abstract",
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._resizeColumnData = [];
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Called when the ResizeTableColumnModel is initialized, and upon loading of
     * a new TableModel, to allow the Resize Behaviors to know how many columns
     * are in use.
     *
     * @abstract
     * @param numColumns {Integer} The numbrer of columns in use.
     * @return {void}
     * @throws the abstract function warning.
     */
    _setNumColumns : function(numColumns) {
      throw new Error("_setNumColumns is abstract");
    },


    /**
     * Called when the table has first been rendered.
     *
     * @abstract
     * @param tableColumnModel {qx.legacy.ui.table.columnmodel.Resize} The table column model in use.  Of particular interest is the property
     *     <i>_table</i> which is a reference to the table widget.  This allows
     *     access to any other features of the table, for use in calculating widths
     *     of columns.
     * @param event {var} The <i>onappear</i> event object.
     * @return {void}
     * @throws the abstract function warning.
     */
    onAppear : function(tableColumnModel, event) {
      throw new Error("onAppear is abstract");
    },


    /**
     * Called when the table width changes due to either a window size change
     * or a parent object changing size causing the table to change size.
     *
     * @abstract
     * @param tableColumnModel {qx.legacy.ui.table.columnmodel.Resize} The table column model in use.  Of particular interest is the property
     *     <i>_table</i> which is a reference to the table widget.  This allows
     *     access to any other features of the table, for use in calculating widths
     *     of columns.
     * @param event {var} The <i>tableWidthChanged</i> event object.
     * @return {void}
     * @throws the abstract function warning.
     */
    onTableWidthChanged : function(tableColumnModel, event) {
      throw new Error("onTableWidthChanged is abstract");
    },


    /**
     * Called when the use of vertical scroll bar in the table changes, either
     * from present to not present, or vice versa.
     *
     * @abstract
     * @param tableColumnModel {qx.legacy.ui.table.columnmodel.Resize} The table column model in use.  Of particular interest is the property
     *     <i>_table</i> which is a reference to the table widget.  This allows
     *     access to any other features of the table, for use in calculating widths
     *     of columns.
     * @param event {var} The <i>verticalScrollBarChanged</i> event object.  This event has data,
     *     obtained via event.getValue(), which is a boolean indicating whether a
     *     vertical scroll bar is now present.
     * @return {void}
     * @throws the abstract function warning.
     */
    onVerticalScrollBarChanged : function(tableColumnModel, event) {
      throw new Error("onVerticalScrollBarChanged is abstract");
    },


    /**
     * Called when a column width is changed.
     *
     * @abstract
     * @param tableColumnModel {qx.legacy.ui.table.columnmodel.Resize} The table column model in use.  Of particular interest is the property
     *     <i>_table</i> which is a reference to the table widget.  This allows
     *     access to any other features of the table, for use in calculating widths
     *     of columns.
     * @param event {var} The <i>widthChanged</i> event object.  This event has data, obtained via
     *     event.getValue(), which is an object with three properties: the column
     *     which changed width (data.col), the old width (data.oldWidth) and the new
     *     width (data.newWidth).
     * @return {void}
     * @throws the abstract function warning.
     */
    onColumnWidthChanged : function(tableColumnModel, event) {
      throw new Error("onColumnWidthChanged is abstract");
    },


    /**
     * Called when a column visibility is changed.
     *
     * @abstract
     * @param tableColumnModel {qx.legacy.ui.table.columnmodel.Resize} The table column model in use.  Of particular interest is the property
     *     <i>_table</i> which is a reference to the table widget.  This allows
     *     access to any other features of the table, for use in calculating widths
     *     of columns.
     * @param event {var} The <i>visibilityChanged</i> event object.  This event has data, obtained
     *     via event.getValue(), which is an object with two properties: the column
     *     which changed width (data.col) and the new visibility of the column
     *     (data.visible).
     * @return {void}
     * @throws the abstract function warning.
     */
    onVisibilityChanged : function(tableColumnModel, event) {
      throw new Error("onVisibilityChanged is abstract");
    },

    /**
     * Determine the inner width available to columns in the table.
     *
     * @param tableColumnModel {qx.legacy.ui.table.columnmodel.Resize}
     *   The table column model in use.
     * @return {Map}
     *   {'width'} Provide width without scrollbar space; scrollbar space is available
     *   {'extraWidth'} qx.legacy.ui.core.Widget.SCROLLBAR_SIZE
     */
    _getAvailableWidth : function(tableColumnModel)
    {
      // Get the inner width off the table
      var el = tableColumnModel._table.getElement();
      var width = qx.legacy.html.Dimension.getInnerWidth(el);

      // Get the last meta column scroller
      var scrollers = tableColumnModel._table._getPaneScrollerArr();
      var lastScroller = scrollers[scrollers.length - 1];

      // Update the scroll bar visibility so we can determine if the vertical bar
      // is displayed.  If it is, we'll need to reduce available space by its
      // width.
      tableColumnModel._table._updateScrollBarVisibility();

      // If the column visibility button is displayed or a verticalscroll bar is
      // being displayed, then reduce the available width by the width of those.
      if (
        tableColumnModel._table.getColumnVisibilityButtonVisible() ||
        (
          lastScroller._verScrollBar.getVisibility() &&
          lastScroller._verScrollBar.getWidth() == "auto"
        )
      )
      {
        // provide width without scrollbar space; no scrollbar space available
        return {
          width      : width - qx.legacy.ui.core.Widget.SCROLLBAR_SIZE,
          extraWidth : 0
        };
      }

      // provide width without scrollbar space; scrollbar space is available
      return {
        width      : width - qx.legacy.ui.core.Widget.SCROLLBAR_SIZE,
        extraWidth : qx.legacy.ui.core.Widget.SCROLLBAR_SIZE
      };
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_resizeColumnData");
  }
});
