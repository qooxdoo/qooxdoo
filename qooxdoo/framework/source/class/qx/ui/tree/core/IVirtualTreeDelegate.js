/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * EXPERIMENTAL!
 * 
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
     * on the node widget cells created by the controller.
     *
     * @param node {qx.ui.core.Widget} Node to modify.
     */
    configureNode : function(node) {},


    /**
     * Gives the user the opportunity to set individual styles and properties
     * on the leaf widget cells created by the controller.
     *
     * @param leaf {qx.ui.core.Widget} Leaf to modify.
     */
    configureLeaf : function(leaf) {},


    /**
     * Creates an node cell which will be used for rendering. Be sure to
     * implement the {@link #bindNode} function as well to get the needed
     * properties bound.
     *
     * @return {qx.ui.core.Widget} A new created item cell.
     */
    createNode : function() {},


    /**
     * Creates a leaf cell which will be used for rendering. Be sure to
     * implement the {@link #bindLeaf} function as well to get the needed
     * properties bound.
     *
     * @return {qx.ui.core.Widget} A new created item cell.
     */
    createLeaf : function() {},


    /**
     * Sets up the binding for the given node and index.
     *
     * For every property you want to bind, use
     * {@link MWidgetController#bindProperty} like this:
     * <code>
     * controller.bindProperty("path.in.the.model", "label", options, item, id);
     * </code>
     *
     * @param controller {MWidgetController} The currently used controller.
     * @param node {qx.ui.core.Widget} The created and used node.
     * @param id {Integer} The id for the binding.
     */
    bindNode : function(controller, node, id) {},


    /**
     * Sets up the binding for the given leaf and index.
     *
     * For every property you want to bind, use
     * {@link MWidgetController#bindProperty} like this:
     * <code>
     * controller.bindProperty(null, "value", options, item, id);
     * </code>
     *
     * @param controller {MWidgetController} The currently used controller.
     * @param leaf {qx.ui.core.Widget} The created and used leaf.
     * @param id {Integer} The id for the binding.
     */
    bindLeaf : function(controller, leaf, id) {}
  }
});