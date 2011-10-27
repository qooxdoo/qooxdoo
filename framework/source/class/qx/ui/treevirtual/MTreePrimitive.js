/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * Primitives for building trees and tree nodes.
 *
 * The methods in this mixin are included directly in the SimpleTreeDataModel
 * but are also useful for other types of trees (not TreeVirtual) that need
 * similar tree and node creation.
 */
qx.Mixin.define("qx.ui.treevirtual.MTreePrimitive",
{
  statics :
  {
    /** Primitive types of tree nodes */
    Type :
    {
      LEAF   : 1,
      BRANCH : 2
    },

    /**
     * Add a node to the tree.
     *
     * NOTE: This method is for <b>internal use</b> and should not be called by
     *       users of this class. There is no guarantee that the interface to this
     *       method will remain unchanged over time.
     *
     * @param nodeArr {Array|Map}
     *   The array to which new nodes are to be added. See, however, the
     *   nodeId parameter. If nodeId values will be provided, then nodeArr can
     *   be a map. The traditional TreeVirtual does not provide node ids, and
     *   passes an array for this parameter.
     *
     * @param parentNodeId {Integer}
     *   The node id of the parent of the node being added
     *
     * @param label {String}
     *   The string to display as the label for this node
     *
     * @param bOpened {Boolean}
     *   <i>true</i> if the tree should be rendered in its opened state;
     *   <i>false</i> otherwise.
     *
     * @param bHideOpenCloseButton {Boolean}
     *   <i>true</i> if the open/close button should be hidden (not displayed);
     *   </i>false</i> to display the open/close button for this node.
     *
     * @param type {Integer}
     *   The type of node being added.  The type determines whether children
     *   may be added, and determines the default icons to use.  This
     *   parameter must be one of the following values:
     *   <dl>
     *     <dt>qx.ui.treevirtual.SimpleTreeDataModel.Type.BRANCH</dt>
     *     <dd>
     *       This node is a branch.  A branch node may have children.
     *     </dd>
     *     <dt>qx.ui.treevirtual.SimpleTreeDataModel.Type.LEAF</dt>
     *     <dd>
     *       This node is a leaf, and may not have children
     *     </dd>
     *   </dl>
     *
     * @param icon {String}
     *   The relative (subject to alias expansion) or full path of the icon to
     *   display for this node when it is not a selected node.
     *
     * @param iconSelected {String}
     *   The relative (subject to alias expansion) or full path of the icon to
     *   display for this node when it is a selected node.
     *   <p>
     *   NOTE: As of 13 Mar 2009, this feature is disabled by default, by
     *         virtue of the fact that the tree's "alwaysUpdateCells" property
     *         has a setting of 'false' now instead of 'true'. Setting this
     *         property to true allows the icon to change upon selection, but
     *         causes problems such as single clicks not always selecting a
     *         row, and, in IE, double click operations failing
     *         completely. (For more information, see bugs 605 and 2021.) To
     *         re-enable the option to have an unique icon that is displayed
     *         when the node is selected, issue
     *         <code>tree.setAlwaysUpdateCells(true);</code>
     *
     * @param nodeId {Integer?}
     *   The requested node id for this new node. If not provided, nodeArr
     *   will be assumed to be an array, not a map, and the next available
     *   index of the array will be used. If it is provided, then nodeArr may
     *   be either an array or a map.
     *
     * @return {Integer} The node id of the newly-added node.
     *
     * @throws {Error} If one tries to add a child to a non-existent parent.
     * @throws {Error} If one tries to add a node to a leaf.
     */
    _addNode : function(nodeArr,
                        parentNodeId,
                        label,
                        bOpened,
                        bHideOpenCloseButton,
                        type,
                        icon,
                        iconSelected,
                        nodeId)
    {
      var parentNode;

      // Ensure that if parent was specified, it exists
      if (parentNodeId)
      {
        parentNode = nodeArr[parentNodeId];

        if (!parentNode)
        {
          throw new Error("Request to add a child to a non-existent parent");
        }

        // Ensure parent isn't a leaf
        if (parentNode.type == qx.ui.treevirtual.SimpleTreeDataModel.Type.LEAF)
        {
          throw new Error("Sorry, a LEAF may not have children.");
        }
      }
      else
      {
        // This is a child of the root
        parentNode = nodeArr[0];
        parentNodeId = 0;
      }

      // If this is a leaf, we don't present open/close icon
      if (type == qx.ui.treevirtual.SimpleTreeDataModel.Type.LEAF)
      {
        // mask off the opened bit but retain the hide open/close button bit
        bOpened = false;
        bHideOpenCloseButton = false;
      }

      // Determine the node id of this new node
      if (nodeId === undefined)
      {
        nodeId = nodeArr.length;
      }

      // Set the data for this node.
      var node =
      {
        type           : type,
        nodeId         : nodeId,
        parentNodeId   : parentNodeId,
        label          : label,
        bSelected      : false,
        bOpened        : bOpened,
        bHideOpenClose : bHideOpenCloseButton,
        icon           : icon,
        iconSelected   : iconSelected,
        children       : [ ],
        columnData     : [ ]
      };

      // Add this node to the array
      nodeArr[nodeId] = node;

      // Add this node to its parent's child array.
      parentNode.children.push(nodeId);

      // Return the node id we just added
      return nodeId;
    },

    /**
     * An empty tree contains only this one node
     *
     * @return {Map}
     *   Returns a root node with all relevant fields filled.
     */
    _getEmptyTree : function()
    {
      return {
               label    : "<virtual root>",
               nodeId   : 0,
               bOpened  : true,
               children : []
             };
    }
  }
});
