/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 Derrell Lipman

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * Utility functions for working with nodes.  These methods allow reference
 * to a node by either the object itself or the object's node id.
 */
qx.Mixin.define("qx.ui.treevirtual.MNode",
{
  members :
  {
    /**
     * Get a node object given its node id.
     *
     * @param nodeReference {Object | Integer}
     *   The node to have its opened/closed state toggled.  The node can be
     *   represented either by the node object, or the node id (as would have
     *   been returned by addBranch(), addLeaf(), etc.).
     *
     * @return {Object}
     *   If the nodeReference is a node object itself, that same node object
     *   is returned (identity).  Otherwise, the node object is looked up
     *   using the specified node id.
     */
    nodeGet : function(nodeReference)
    {
      if (typeof(nodeReference) == "object")
      {
        return nodeReference;
      }
      else if (typeof(nodeReference) == "number")
      {
        return this.getTableModel().getData()[nodeReference];
      }
      else
      {
        throw new Error("Expected node object or node id");
      }
    },


    /**
     * Toggle the opened state of the node: if the node is opened, close
     * it; if it is closed, open it.
     *
     * @param nodeReference {Object | Integer}
     *   The node to have its opened/closed state toggled.  The node can be
     *   represented either by the node object, or the node id (as would have
     *   been returned by addBranch(), addLeaf(), etc.)
     *
     */
    nodeToggleOpened : function(nodeReference)
    {
      var node;
      var nodeId;

      if (typeof(nodeReference) == "object")
      {
        node = nodeReference;
        nodeId = node.nodeId;
      }
      else if (typeof(nodeReference) == "number")
      {
        nodeId = nodeReference;
        node = this.getTableModel().getData()[nodeId];
      }
      else
      {
        throw new Error("Expected node object or node id");
      }

      this.getTableModel().setState(nodeId, { bOpened : ! node.bOpened });
    },


    /**
     * Set state attributes of a tree node.
     *
     * @param nodeReference {Object | Integer}
     *   The node for which attributes are being set.  The node can be
     *   represented either by the node object, or the node id (as would have
     *   been returned by addBranch(), addLeaf(), etc.)
     *
     * @param attributes {Map}
     *   Map with the node properties to be set.  The map may contain any of
     *   the properties described in
     *   {@link qx.ui.treevirtual.SimpleTreeDataModel}
     *
     */
    nodeSetState : function(nodeReference, attributes)
    {
      var nodeId;

      if (typeof(nodeReference) == "object")
      {
        nodeId = nodeReference.nodeId;
      }
      else if (typeof(nodeReference) == "number")
      {
        nodeId = nodeReference;
      }
      else
      {
        throw new Error("Expected node object or node id");
      }

      this.getTableModel().setState(nodeId, attributes);
    },


    /**
     * Set the label for a node.
     *
     * @param nodeReference {Object | Integer}
     *   The node for which the label is being set.  The node can be
     *   represented either by the node object, or the node id (as would have
     *   been returned by addBranch(), addLeaf(), etc.)
     *
     * @param label {String}
     *   The new label for the specified node
     *
     */
    nodeSetLabel : function(nodeReference, label)
    {
      this.nodeSetState(nodeReference, { label : label });
    },


    /**
     * Get the label for a node.
     *
     * @param nodeReference {Object | Integer}
     *   The node for which the label is being retrieved.  The node can be
     *   represented either by the node object, or the node id (as would have
     *   been returned by addBranch(), addLeaf(), etc.)
     *
     * @return {String}
     *   The label for the specified node
     */
    nodeGetLabel : function(nodeReference)
    {
      var node = this.nodeGet(nodeReference);
      return node.label;
    },


    /**
     * Set the selected state for a node.
     *
     * @param nodeReference {Object | Integer}
     *   The node for which the selected state is being set.  The node can be
     *   represented either by the node object, or the node id (as would have
     *   been returned by addBranch(), addLeaf(), etc.)
     *
     * @param b {Boolean}
     *   The new selected state for the specified node.
     *
     */
    nodeSetSelected : function(nodeReference, b)
    {
      this.nodeSetState(nodeReference, { bSelected : b });
    },


    /**
     * Get the selected state for a node.
     *
     * @param nodeReference {Object | Integer}
     *   The node for which the selected state is being retrieved.  The node
     *   can be represented either by the node object, or the node id (as
     *   would have been returned by addBranch(), addLeaf(), etc.)
     *
     * @return {Boolean}
     *   The selected state for the specified node.
     */
    nodeGetSelected : function(nodeReference)
    {
      var node = this.nodeGet(nodeReference);
      return node.bSelected;
    },


    /**
     * Set the opened state for a node.  (Note that this method has no effect
     * if the requested state is the same as the current state.)
     *
     * @param nodeReference {Object | Integer}
     *   The node for which the opened state is being set.  The node can be
     *   represented either by the node object, or the node id (as would have
     *   been returned by addBranch(), addLeaf(), etc.)
     *
     * @param b {Boolean}
     *   The new opened state for the specified node.
     *
     */
    nodeSetOpened : function(nodeReference, b)
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

      // Only set new state if not already in the requested state, since
      // setting new state involves dispatching events.
      if (b != node.bOpened)
      {
        this.nodeToggleOpened(node);
      }
    },


    /**
     * Get the opened state for a node.
     *
     * @param nodeReference {Object | Integer}
     *   The node for which the opened state is being retrieved.  The node can
     *   be represented either by the node object, or the node id (as would
     *   have been returned by addBranch(), addLeaf(), etc.)
     *
     * @return {Boolean}
     *   The opened state for the specified node.
     */
    nodeGetOpened : function(nodeReference)
    {
      var node = this.nodeGet(nodeReference);
      return node.bOpened;
    },


    /**
     * Set the hideOpenClose state for a node.
     *
     * @param nodeReference {Object | Integer}
     *   The node for which the hideOpenClose state is being set.  The node
     *   can be represented either by the node object, or the node id (as
     *   would have been returned by addBranch(), addLeaf(), etc.)
     *
     * @param b {Boolean}
     *   The new hideOpenClose state for the specified node.
     *
     */
    nodeSetHideOpenClose : function(nodeReference, b)
    {
      this.nodeSetState(nodeReference, { bHideOpenClose : b });
    },


    /**
     * Get the hideOpenClose state for a node.
     *
     * @param nodeReference {Object | Integer}
     *   The node for which the hideOpenClose state is being retrieved.  The
     *   node can be represented either by the node object, or the node id (as
     *   would have been returned by addBranch(), addLeaf(), etc.)
     *
     * @return {Boolean}
     *   The new hideOpenClose state for the specified node.
     */
    nodeGetHideOpenClose : function(nodeReference)
    {
      var node = this.nodeGet(nodeReference);
      return node.bHideOpenClose;
    },


    /**
     * Set the icon for a node when in its unselected (normal) state.
     *
     * @param nodeReference {Object | Integer}
     *   The node for which the icon is being set.  The node can be
     *   represented either by the node object, or the node id (as would have
     *   been returned by addBranch(), addLeaf(), etc.)
     *
     * @param path {String}
     *   The path to the icon to be used when the node is not selected
     *
     */
    nodeSetIcon : function(nodeReference, path)
    {
      this.nodeSetState(nodeReference, { icon : path });
    },


    /**
     * Get the icon for a node when in its unselected (normal) state.
     *
     * @param nodeReference {Object | Integer}
     *   The node for which the icon is being retrieved.  The node can be
     *   represented either by the node object, or the node id (as would have
     *   been returned by addBranch(), addLeaf(), etc.)
     *
     * @return {String}
     *   The path to the icon to be used when the node is not selected, if a
     *   path has been previously provided (i.e. not using the default icon).
     */
    nodeGetIcon : function(nodeReference)
    {
      var node = this.nodeGet(nodeReference);
      return node.icon;
    },


    /**
     * Set the icon for a node when in its selected state.
     * <p>
     * NOTE: As of 13 Mar 2009, this feature is disabled by default, by
     *       virtue of the fact that the tree's "alwaysUpdateCells" property
     *       has a setting of 'false' now instead of 'true'. Setting this
     *       property to true allows the icon to change upon selection, but
     *       causes problems such as single clicks not always selecting a
     *       row, and, in IE, double click operations failing
     *       completely. (For more information, see bugs 605 and 2021.) To
     *       re-enable the option to have an unique icon that is displayed
     *       when the node is selected, issue
     *       <code>tree.setAlwaysUpdateCells(true);</code>
     *
     * @param nodeReference {Object | Integer}
     *   The node for which the icon is being set.  The node can be
     *   represented either by the node object, or the node id (as would have
     *   been returned by addBranch(), addLeaf(), etc.)
     *
     * @param path {String}
     *   The path to the icon to be used when the node is selected
     *
     */
    nodeSetSelectedIcon : function(nodeReference, path)
    {
      this.nodeSetState(nodeReference, { iconSelected : path });
    },


    /**
     * Get the icon for a node when in its selected state.
     *
     * @param nodeReference {Object | Integer}
     *   The node for which the icon is being retrieved.  The node can be
     *   represented either by the node object, or the node id (as would have
     *   been returned by addBranch(), addLeaf(), etc.)
     *
     * @return {String}
     *   The path to the icon to be used when the node is selected, if a path
     *   has been previously provided (i.e. not using the default icon).
     */
    nodeGetSelectedIcon : function(nodeReference)
    {
      var node = this.nodeGet(nodeReference);
      return node.iconSelected;
    },


    /**
     * Set the cell style for a node
     *
     * @param nodeReference {Object | Integer}
     *   The node for which the cell style is being set.  The node can be
     *   represented either by the node object, or the node id (as would have
     *   been returned by addBranch(), addLeaf(), etc.)
     *
     * @param style {String}

     *   The CSS style to be applied for the tree column cell for this node,
     *   if a style has been previously provided (i.e. not using the default
     *   style).
     *
     */
    nodeSetCellStyle : function(nodeReference, style)
    {
      this.nodeSetState(nodeReference, { cellStyle : style });
    },


    /**
     * Get the cell style for a node
     *
     * @param nodeReference {Object | Integer}
     *   The node for which the cell style is being retrieved.  The node can be
     *   represented either by the node object, or the node id (as would have
     *   been returned by addBranch(), addLeaf(), etc.)
     *
     * @return {String}
     *   The CSS style being applied for the tree column cell for this node.
     */
    nodeGetCellStyle : function(nodeReference)
    {
      var node = this.nodeGet(nodeReference);
      return node.cellStyle;
    },


    /**
     * Set the label style for a node
     *
     * @param nodeReference {Object | Integer}
     *   The node for which the label style is being set.  The node can be
     *   represented either by the node object, or the node id (as would have
     *   been returned by addBranch(), addLeaf(), etc.)
     *
     * @param style {String}
     *   The CSS style to be applied for the label for this node.
     *
     */
    nodeSetLabelStyle : function(nodeReference, style)
    {
      this.nodeSetState(nodeReference, { labelStyle : style });
    },


    /**
     * Get the label style for a node
     *
     * @param nodeReference {Object | Integer}
     *   The node for which the label style is being retrieved.  The node can
     *   be represented either by the node object, or the node id (as would
     *   have been returned by addBranch(), addLeaf(), etc.)
     *
     * @return {String}
     *   The CSS style being applied for the label for this node, if a style
     *   has been previously provided (i.e. not using the default style).
     */
    nodeGetLabelStyle : function(nodeReference)
    {
      var node = this.nodeGet(nodeReference);
      return node.cellStyle;
    }
  }
});
