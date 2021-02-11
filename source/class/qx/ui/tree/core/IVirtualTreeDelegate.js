/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * Objects which are used as delegates for the <code>qx.ui.tree.VirtualTree</code> may
 * implement any of the methods described in this interface. The delegate does
 * not need to implement all the methods of this interface. If a method is not
 * implemented the <code>qx.ui.tree.VirtualTree</code> provides a default
 * implementation.
 *
 * Note: This interface is meant to document the delegate but should not be
 * listed in the <code>implement</code> key of a class unless all methods are
 * actually implemented.
 */
qx.Interface.define("qx.ui.tree.core.IVirtualTreeDelegate",
{
  members :
  {
    /**
     * Gives the user the opportunity to set individual styles and properties
     * on the widget cells created by the controller.
     *
     * @param item {qx.ui.core.Widget} Item to modify.
     */
    configureItem : function(item) {},


    /**
     * Creates a widget cell which will be used for rendering. Be sure to
     * implement the {@link #bindItem} function as well to get the needed
     * properties bound.
     *
     * @return {qx.ui.core.Widget} A new created item cell.
     */
    createItem : function() {},


    /**
     * Sets up the binding for the given widget cell and index.
     *
     * For every property you want to bind, use
     * {@link MWidgetController#bindProperty} like this:
     * <code>
     * controller.bindProperty(null, "value", options, item, id);
     * </code>
     *
     * @param controller {qx.ui.list.core.MWidgetController} The currently used controller.
     * @param item {qx.ui.core.Widget} The created and used item.
     * @param id {Integer} The id for the binding.
     */
    bindItem : function(controller, item, id) {},


    /**
     * Gives the user the opportunity to reset properties or states.
     *
     * @param item {qx.ui.core.Widget} Item to modify.
     */
    onPool : function(item) {},


    /**
     * Filter checks the current data and returns a boolean if the data should
     * appear in the filtered data set or not.
     *
     * @param data {var} The data which will be checked.
     * @return {Boolean} True, if the data passes the filter, false otherwise.
     */
    filter : function(data) {},


    /**
     * Gives the user the opportunity to sort the children items from a node.
     * The sorting method should return a negative value if a < b, zero
     * if a = b, or a positive value if a > b.
     *
     * @param a {var} value to compare.
     * @param b {var} value to compare.
     * @return {Integer} should return a negative value if a < b, zero
     *   if a = b, or a positive value if a > b.
     */
    sorter : function(a, b) {}
  }
});