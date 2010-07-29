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
     * Creates a cell renderer which will be used for rendering. Be sure to
     * implement the {@link #bindItem} function as well to get the needed
     * properties bound.
     *
     * @return {qx.ui.virtual.cell.AbstractWidget} A new created cell renderer.
     */
    createCellRenderer : function() {},

    /**
     * Sets up the binding for the given item and index.
     *
     * For every property you want to bind, use
     * {@link MWidgetCellController#bindProperty} like this:
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