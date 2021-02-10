/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * This utility class implements some methods for the <code>VirtualTree</code>.
 */
qx.Class.define("qx.ui.tree.core.Util",
{
  statics :
  {
    /**
     * Returns if the passed item is a node or a leaf.
     *
     * @param node {qx.core.Object} Node to check.
     * @param childProperty {String} The property name to find the children.
     * @return {Boolean} <code>True</code> when the passed item is a node,
     *   </code>false</code> when it is a leaf.
     */
    isNode : function(node, childProperty)
    {
      if (node == null || childProperty == null) {
        return false;
      }
      return qx.Class.hasProperty(node.constructor, childProperty);
    },


    /**
     * Returns whether the node has visible children or not.
     *
     * @param node {qx.core.Object} Node to check.
     * @param childProperty {String} The property name to find the children.
     * @param ignoreLeafs {Boolean?} Indicates whether leafs are ignored. This means when it is set to
     *    <code>true</code> a node which contains only leafs has no children. The default value is <code>false</code>.
     * @return {Boolean} <code>True</code> when the node has visible children,
     *   <code>false</code> otherwise.
     */
    hasChildren : function(node, childProperty, ignoreLeafs)
    {
      if (node == null || childProperty == null || !this.isNode(node, childProperty)) {
        return false;
      }

      var children = node.get(childProperty);
      if (children == null) {
        return false;
      }

      if (!ignoreLeafs) {
        return children.length > 0;
      }
      else
      {
        for (var i = 0; i < children.getLength(); i++)
        {
          var child = children.getItem(i);
          if (this.isNode(child, childProperty)) {
            return true;
          }
        }
      }
      return false;
    }
  }
});