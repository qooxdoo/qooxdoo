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
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * A widget cell renderer manages a pool of widgets to render cells in a
 * {@link qx.ui.virtual.layer.WidgetCell} layer.
 */
qx.Interface.define("qx.ui.virtual.cell.IWidgetCell",
{
  members :
  {
    /**
     * Get a widget instance to render the cell
     *
     * @param data {var} Data needed for the cell to render.
     * @param states {Map} The states set on the cell (e.g. <i>selected</i>,
     * <i>focused</i>, <i>editable</i>).
     *
     * @return {qx.ui.core.LayoutItem} The cell widget
     */
    getCellWidget : function(data, states) {
      this.assertArgumentsCount(arguments, 2, 2);
      this.assertInstance(data, Object);
      this.assertMap(states);
    },


    /**
     * Release the given widget instance.
     *
     * Either pool or dispose the widget.
     *
     * @param widget {qx.ui.core.LayoutItem} The cell widget to pool
     */
    pool : function(widget) {
      this.assertArgumentsCount(arguments, 1, 1);
      this.assertInstance(widget, qx.ui.core.LayoutItem);
    },


    /**
     * Update the states of the given widget.
     *
     * @param widget {qx.ui.core.LayoutItem} The cell widget to update
     * @param states {Map} The cell widget's states
     */
    updateStates : function(widget, states) {
      this.assertArgumentsCount(arguments, 2, 2);
      this.assertInstance(widget, qx.ui.core.LayoutItem);
      this.assertMap(states);
    },


    /**
     * Update the data the cell widget should display
     *
     * @param widget {qx.ui.core.LayoutItem} The cell widget to update
     * @param data {var} The data to display
     */
    updateData : function(widget, data) {
      this.assertArgumentsCount(arguments, 2, 2);
      this.assertInstance(widget, qx.ui.core.Widget);
      this.assertInstance(data, Object);
    }
  }
});
