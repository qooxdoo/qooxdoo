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
     * Martin Wittemann (martinwittemann)
     * Fabian Jakobs (fjakobs)

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
qx.Interface.define("qx.data.controller.IControllerDelegate",
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
     * Filter checks the current data and returns a boolean if the data should
     * appear in the filtered data set or not.
     *
     * The filter currently works only with the {@link qx.data.controller.List}
     * controller!
     *
     * @param data {var} The data which will be checked.
     * @return {Boolean} True, if the data passes the filter, false otherwise.
     */
    filter : function(data) {},


    /**
     * Creates an item which will be added to the target as child. Be sure to
     * implement the {@link #bindItem} function as well to get the needed
     * properties bound.
     *
     * @return {qx.ui.core.Widget} A new created widget.
     */
    createItem : function() {},


    /**
     * Sets up the binding for the given item and index.
     *
     * For every property you want to bind, use
     * {@link qx.data.controller.List#bindProperty} like this:
     * <code>
     * controller.bindProperty("path.in.the.model", "label", options, item, id);
     * </code>
     *
     * @param controller {var} The currently used controller.
     * @param item {qx.ui.core.Widget} The created and used item.
     * @param id {Number} The id for the binding.
     */
    bindItem : function(controller, item, id) {}
  }
});