/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Fabian Jakobs (fjakobs)
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * Objects, which are used as delegates for a data binding controller may
 * implement any of the methods described in this interface. The delegate does
 * not need implement all of the methods of this interface. If a method is not
 * implemented the controller provides a default implementation.
 *
 * Note: This interface is meant to document the delegate but should not be
 * listed in the <code>implement</code> key of a class unless all methods are
 * really implemented.
 */
qx.Interface.define("qx.ui.list.core.IControllerDelegate",
{
  members :
  {
    /**
     * Gives the user the opportunity to set individual styles and properties
     * on the by the controller created widgets.
     *
     * @param item {var} Item to modify.
     */
    configureItem : function(item) {},


    /**
     * Creates a item cell which will be used for rendering. Be sure to
     * implement the {@link #bindItem} function as well to get the needed
     * properties bound.
     *
     * @return {var} A new created item cell.
     */
    createItem : function() {},


    /**
     * Filter checks the current data and returns a boolean if the data should
     * appear in the filtered data set or not.
     *
     * @param data {var} The data which will be checked.
     * @return {Boolean} True, if the data passes the filter, false otherwise.
     */
    filter : function(data) {},


    /**
     * If a sorter function is given, this will be used to compare the items.
     *
     * @param a {var} value to compare.
     * @param b {var} value to compare.
     * @return {Integer} should return a negative value if a < b, zero if a = b, or a positive value if a > b.
     */
    sorter : function(a, b) {},


    /**
     * Gives the user the opportunity to group there model.
     * 
     * @param data {var} The data which will be checked.
     * @return {String|null} The group name for the data or <code>null</code>
     *   when the data has no group.
     */
    group : function(data) {},


    /**
     * Sets up the binding for the given item and index.
     *
     * For every property you want to bind, use
     * {@link MWidgetController#bindProperty} like this:
     * <code>
     * controller.bindProperty("path.in.the.model", "label", options, item, id);
     * </code>
     *
     * @param controller {var} The currently used controller.
     * @param item {qx.ui.core.Widget} The created and used item.
     * @param id {Integer} The id for the binding.
     */
    bindItem : function(controller, item, id) {}
  }
});