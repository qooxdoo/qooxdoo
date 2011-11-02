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
 * Interface describes the methods which the {@link qx.ui.tree.provider.WidgetProvider}
 * uses for communication.
 */
qx.Interface.define("qx.ui.tree.core.IVirtualTree",
{
  members :
  {
    /**
     * Return whether top level items should have an open/close button. The top
     * level item item is normally the root item, but when the root is hidden,
     * the root children are the top level items.
     *
     * @return {Boolean} Returns <code>true</code> when top level items should
     *   show open/close buttons, <code>false</code> otherwise.
     */
    isShowTopLevelOpenCloseIcons : function() {},


    /**
     * Returns the internal data structure. The Array index is the row and the
     * value is the model item.
     *
     * @internal
     * @return {qx.data.Array} The internal data structure.
     */
    getLookupTable : function() {},


    /**
     * Returns if the passed item is a note or a leaf.
     *
     * @internal
     * @param item {qx.core.Object} Item to check.
     * @return {Boolean} <code>True</code> when item is a node,
     *   </code>false</code> when item is a leaf.
     */
    isNode : function(item)
    {
      this.assertArgumentsCount(arguments, 1, 1);
      this.assertInterface(item, qx.core.Object);
    },


    /**
     * Return whether the node is opened or closed.
     *
     * @param node {qx.core.Object} Node to check.
     * @return {Boolean} Returns <code>true</code> when the node is opened,
     *   <code>false</code> otherwise.
     */
    isNodeOpen : function(node)
    {
      this.assertArgumentsCount(arguments, 1, 1);
      this.assertInterface(node, qx.core.Object);
    },


    /**
     * Returns the row's nesting level.
     *
     * @param row {Integer} The row to get the nesting level.
     * @return {Integer} The row's nesting level or <code>null</code>.
     */
    getLevel : function(row)
    {
      this.assertArgumentsCount(arguments, 1, 1);
      this.assertInteger(row);
    },


    /**
     * Return whether the node has visible children or not.
     *
     * @internal
     * @param node {qx.core.Object} Node to check.
     * @return {Boolean} <code>True</code> when the node has visible children,
     *   <code>false</code> otherwise.
     */
    hasChildren : function(node)
    {
      this.assertArgumentsCount(arguments, 1, 1);
      this.assertInterface(node, qx.core.Object);
    },


    /**
     * Opens the passed node.
     *
     * @param node {qx.core.Object} Node to open.
     */
    openNode : function(node)
    {
      this.assertArgumentsCount(arguments, 1, 1);
      this.assertInterface(node, qx.core.Object);
    },


    /**
     * Closes the passed node.
     *
     * @param node {qx.core.Object} Node to close.
     */
    closeNode : function(node)
    {
      this.assertArgumentsCount(arguments, 1, 1);
      this.assertInterface(node, qx.core.Object);
    },

    /**
     * Returns the current selection.
     *
     * @return {qx.data.Arra} The current selected elements.
     */
    getSelection : function() {}
  }
});