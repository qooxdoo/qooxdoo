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
 *
 */
qx.Mixin.define("qx.legacy.ui.treevirtual.MFamily",
{
  members :
  {
    /**
     * Get the first child of the specified node.
     *
     *
     * @param nodeReference {Object | Integer}
     *   The node for which the first child is desired.  The node can be
     *   represented either by the node object, or the node id (as would have
     *   been returned by addBranch(), addLeaf(), etc.)
     *
     * @return {Integer}
     *   The node id of the first child.
     */
    familyGetFirstChild : function(nodeReference)
    {
      var node;

      if (typeof(nodeReference) == "object")
      {
        node = nodeReference;
      }
      else if (typeof(nodeReference) == "number")
      {
        node = this.getTableModel().getData()[nodeReference];
      }
      else
      {
        throw new Error("Expected node object or node id");
      }

      if (node.children.length > 0)
      {
        return node.children[0];
      }

      return null;
    },


    /**
     * Get the last child of the specified node.
     *
     *
     * @param nodeReference {Object | Integer}
     *   The node for which the last child is desired.  The node can be
     *   represented either by the node object, or the node id (as would have
     *   been returned by addBranch(), addLeaf(), etc.)
     *
     * @return {Integer}
     *   The node id of the last child.
     */
    familyGetLastChild : function(nodeReference)
    {
      var node;

      if (typeof(nodeReference) == "object")
      {
        node = nodeReference;
      }
      else if (typeof(nodeReference) == "number")
      {
        node = this.getTableModel().getData()[nodeReference];
      }
      else
      {
        throw new Error("Expected node object or node id");
      }

      if (node.children.length > 0)
      {
        return node.children[node.children.length - 1];
      }

      return null;
    },


    /**
     * Get the next sibling of the specified node.
     *
     *
     * @param nodeReference {Object | Integer}
     *   The node for which the next sibling is desired.  The node can be
     *   represented either by the node object, or the node id (as would have
     *   been returned by addBranch(), addLeaf(), etc.)
     *
     * @return {Integer}
     *   The node id of the next sibling.
     */
    familyGetNextSibling : function(nodeReference)
    {
      var nodeId;
      var nodes = this.getTableModel().getData();

      if (typeof(nodeReference) == "object")
      {
        node = nodeReference;
      }
      else if (typeof(nodeReference) == "number")
      {
        nodeId = nodeReference;
        var node = nodes[nodeId];
      }
      else
      {
        throw new Error("Expected node object or node id");
      }

      var myNodeId = node.nodeId;
      var parentChildren = nodes[node.parentNodeId].children;

      // Find this node id in our parent's children array
      for (var i=0; i<parentChildren.length; i++)
      {
        // Is this our id?
        if (parentChildren[i] == myNodeId)
        {
          // Yup.  Ensure there is a next sibling.
          if (i < parentChildren.length - 1)
          {
            // There is.  Return the next sibling.
            return parentChildren[i + 1];
          }

          // There's no next sibling
          return null;
        }
      }
    },


    /**
     * Get the previous sibling of the specified node.
     *
     *
     * @param nodeReference {Object | Integer}
     *   The node for which the previous sibling is desired.  The node can be
     *   represented either by the node object, or the node id (as would have
     *   been returned by addBranch(), addLeaf(), etc.)
     *
     * @return {Integer}
     *   The node id of the previous sibling.
     */
    familyGetPrevSibling : function(nodeReference)
    {
      var nodeId;
      var nodes = this.getTableModel().getData();

      if (typeof(nodeReference) == "object")
      {
        node = nodeReference;
      }
      else if (typeof(nodeReference) == "number")
      {
        nodeId = nodeReference;
        var node = nodes[nodeId];
      }
      else
      {
        throw new Error("Expected node object or node id");
      }

      var myNodeId = node.nodeId;
      var parentChildren = nodes[node.parentNodeId].children;

      // Find this node id in our parent's children array
      for (var i=0; i<parentChildren.length; i++)
      {
        // Is this our id?
        if (parentChildren[i] == myNodeId)
        {
          // Yup.  Ensure there is a previous sibling.
          if (i > 0)
          {
            // There is.  Return the previous sibling.
            return parentChildren[i - 1];
          }

          // There's no previous sibling
          return null;
        }
      }
    }
  }
});
