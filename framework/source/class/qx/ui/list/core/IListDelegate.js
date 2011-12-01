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
 * Objects which are used as delegates for the <code>qx.ui.list.List</code> may
 * implement any of the methods described in this interface. The delegate does
 * not need to implement all the methods of this interface. If a method is not
 * implemented the <code>qx.ui.list.List</code> provides a default
 * implementation.
 *
 * Note: This interface is meant to document the delegate but should not be
 * listed in the <code>implement</code> key of a class unless all methods are
 * actually implemented.
 */
qx.Interface.define("qx.ui.list.core.IListDelegate",
{
  members :
  {
    /**
     * Gives the user the opportunity to set individual styles and properties
     * on the item widget cells created by the controller.
     *
     * @param item {qx.ui.core.Widget} Item to modify.
     */
    configureItem : function(item) {},


    /**
     * Gives the user the opportunity to set individual styles and properties
     * on the group widget cells created by the controller.
     *
     * @param item {qx.ui.core.Widget} Group to modify.
     */
    configureGroupItem : function(item) {},


    /**
     * Creates an item cell which will be used for rendering. Be sure to
     * implement the {@link #bindItem} function as well to get the needed
     * properties bound.
     *
     * @return {qx.ui.core.Widget} A new created item cell.
     */
    createItem : function() {},


    /**
     * Creates a group cell which will be used for rendering. Be sure to
     * implement the {@link #bindGroupItem} function as well to get the needed
     * properties bound.
     *
     * @return {qx.ui.core.Widget} A new created item cell.
     */
    createGroupItem : function() {},


    /**
     * Sets up the binding for the given item and index.
     *
     * For every property you want to bind, use
     * {@link MWidgetController#bindProperty} like this:
     * <code>
     * controller.bindProperty("path.in.the.model", "label", options, item, id);
     * </code>
     *
     * @param controller {MWidgetController} The currently used controller.
     * @param item {qx.ui.core.Widget} The created and used item.
     * @param id {Integer} The id for the binding.
     */
    bindItem : function(controller, item, id) {},


    /**
     * Sets up the binding for the given group item and index.
     *
     * For every property you want to bind, use
     * {@link MWidgetController#bindProperty} like this:
     * <code>
     * controller.bindProperty(null, "value", options, item, id);
     * </code>
     *
     * @param controller {MWidgetController} The currently used controller.
     * @param item {qx.ui.core.Widget} The created and used group item.
     * @param id {Integer} The id for the binding.
     */
    bindGroupItem : function(controller, item, id) {},


    /**
     * Gives the user the opportunity to filter the model. The filter
     * method has to return <code>true</code> if the given data should be
     * shown and <code>false</code> if the given data should be ignored.
     *
     * @param data {var} The data to be checked.
     * @return {Boolean} <code>true</code> if the data passes the filter,
     *   <code>false</code> otherwise.
     */
    filter : function(data) {},


    /**
     * Gives the user the opportunity to sort the model. The sorting method
     * should return a negative value if a < b, zero if a = b, or a positive
     * value if a > b.
     *
     * @param a {var} value to compare.
     * @param b {var} value to compare.
     * @return {Integer} should return a negative value if a < b, zero
     *   if a = b, or a positive value if a > b.
     */
    sorter : function(a, b) {},


    /**
     * Gives the user the opportunity to group the model. The group method
     * should return unique identifier for the passed data.
     *
     * Note: When you returning <code>null</code> the passed data will added
     * to the default group, which is <code>???</code> from the type
     * <code>String</code>. But keep in mind that you can only use the default
     * group feature when each other group identifier is also a <code>String</code>.
     * Otherwise an exception occurs, because you can't mix <code>Object</code>
     * and <code>String</code> group identifiers.
     *
     * @param data {var} The data to be checked.
     * @return {String|Object|null} The group identifier for the data.
     */
    group : function(data) {},




    /**
     * Gives the user the opportunity to reset properties or states.
     *
     * @param item {qx.ui.core.Widget} Item to modify.
     */
    onPool : function(item) {}
  }
});