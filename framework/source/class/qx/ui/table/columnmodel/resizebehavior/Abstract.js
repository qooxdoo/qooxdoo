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

/**
 * An abstract resize behavior.  All resize behaviors should extend this
 * class.
 */
qx.Class.define("qx.ui.table.columnmodel.resizebehavior.Abstract",
{
  type : "abstract",
  extend : qx.core.Object,



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
     * @param tableColumnModel {qx.ui.table.columnmodel.Resize} The table column model in use.  Of particular interest is the method
     *     <i>getTable</i> which is a reference to the table widget.  This allows
     *     access to any other features of the table, for use in calculating widths
     *     of columns.
     * @param event {var} The <i>onappear</i> event object.
     * @param forceRefresh {Boolean?false} Whether a refresh should be forced
     * @return {void}
     * @throws the abstract function warning.
     */
    onAppear : function(tableColumnModel, event, forceRefresh) {
      throw new Error("onAppear is abstract");
    },


    /**
     * Called when the table width changes due to either a window size change
     * or a parent object changing size causing the table to change size.
     *
     * @abstract
     * @param tableColumnModel {qx.ui.table.columnmodel.Resize} The table column model in use.  Of particular interest is the method
     *     <i>getTable</i> which is a reference to the table widget.  This allows
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
     * @param tableColumnModel {qx.ui.table.columnmodel.Resize} The table column model in use.  Of particular interest is the method
     *     <i>getTable</i> which is a reference to the table widget.  This allows
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
     * @param tableColumnModel {qx.ui.table.columnmodel.Resize} The table column model in use.  Of particular interest is the method
     *     <i>getTable</i> which is a reference to the table widget.  This allows
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
     * @param tableColumnModel {qx.ui.table.columnmodel.Resize} The table column model in use.  Of particular interest is the method
     *     <i>getTable</i> which is a reference to the table widget.  This allows
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
     * @param tableColumnModel {qx.ui.table.columnmodel.Resize}
     *   The table column model in use.
     * @return {Integer} The available width
     */
    _getAvailableWidth : function(tableColumnModel)
    {
      // Get the inner width off the table
      var table = tableColumnModel.getTable();

      var scrollerArr = table._getPaneScrollerArr();
      var scrollerParentWidth = scrollerArr[0].getLayoutParent().getBounds().width;

      var lastScroller = scrollerArr[scrollerArr.length-1];

      var topRight = lastScroller.getTopRightWidget();
      var topRightWidth = topRight && topRight.getBounds() ? topRight.getBounds().width : 0;

      var scrollBarWidth = lastScroller.getVerticalScrollBarWidth();

      return scrollerParentWidth - Math.max(topRightWidth, scrollBarWidth);
    }
  }});
