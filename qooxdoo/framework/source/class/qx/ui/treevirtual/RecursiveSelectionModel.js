/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 David Perez Carmona

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * David Perez Carmona (david-perez)

************************************************************************ */

/* ************************************************************************

#module(treevirtual)

************************************************************************ */

/**
 * A recursive selection model.
 * <p>Features:</p>
 * <ul>
 * <li>One a node is selected, its child nodes are also selected.
 * <li>One a node is deselected, its child nodes are also deselected.
 * <li>It is flaged visually when the child nodes are partially selected (<tt>node.bSelected=='p'</tt>).
 * </ul>
 * <p><b>Implementation note</b>: it is derived from {@link qx.ui.table.selection.Model}
 * although no functionality of this class is needed, as several Table and TreeVirtual properties
 * require a selection model be derived from this class.
 * </p>
 */
qx.Class.define("qx.ui.treevirtual.RecursiveSelectionModel",
{
  //extend : qx.core.Target,
  extend : qx.ui.table.selection.Model,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(tree)
  {
    this._tree = tree;
    //arguments.callee.base.apply(this, arguments);
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events: {
    /** Fired when the selection has changed. */
    "changeSelection" : "qx.event.type.Event"
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Ignore updating parent selection?.
     */
    _ignoreParent: 0,

    /**
     * Has the selection changed?.
     */
    _selectionChanged: false,

    /**
     * Compatibility with {@link qx.ui.table.selection.Model}.
     */
    setSelectionMode: function()
    {
    },

    /**
     * Compatibility with {@link qx.ui.table.selection.Model}.
     * @return {Object}
     */
    getSelectionMode: function()
    {
      return qx.ui.table.selection.Model.MULTIPLE_INTERVAL_SELECTION_TOGGLE;
    },

    /**
     * Clears the selection.
     *
     * @type member
     * @return {void}
     */
    clearSelection : function()
    {
      // Unselect the root node.  This will propagate to the other nodes
      this._selectNode(this._tree.getDataModel().getData()[0], false);
      this._fireChangeSelection();
    },

    /**
     * Returns whether the selection is empty.
     *
     * @type member
     * @return {Boolean} whether the selection is empty.
     */
    isSelectionEmpty : function() {
      // Is the root node selected?
      return !this._tree.getDataModel().getData()[0].bSelected;
    },

    /**
     * Returns the number of selected leaf items.
     *
     * @type member
     * @return {Integer} the number of selected items.
     */
    getSelectedCount : function()
    {
      var count = 0;
      this.iterateSelection(function(node) {
        if (!node || !node.children.length)
        {
          count++;
        }
      });
      return count;
    },

    /**
     * Returns whether a index is selected.
     *
     * @type member
     * @param index {Integer} the index to check.
     * @return {Boolean} whether the index is selected.
     */
    isSelectedIndex : function(index)
    {
      var n = this._tree.getDataModel().getNodeFromRow(index);
      return !!(n && n.bSelected);
    },

    /**
     * Calls a iterator function for each selected index.
     *
     * Usage Example:
     * <pre class='javascript'>
     * var selectedNodes = [];
     * mySelectionModel.iterateSelection(function(node) {
     *   selectedNodes.push(node));
     * });
     * </pre>
     *
     * @type member
     * @param iterator {Function} the function to call for each selected index.
     *          Gets the current node as parameter.
     * @param object {var ? null} the object to use when calling the handler.
     *          (this object will be available via "this" in the iterator)
     * @return {void}
     */
    iterateSelection : function(iterator, object)
    {
      this._iterateSelection(this._tree.getDataModel().getData(), 0, iterator, object);
    },

    _iterateSelection: function(data, nodeId, iterator, object)
    {
      var node = data[nodeId];
      if (!node.children || !node.children.length)
      {
        if (node.bSelected)
        {
          iterator.call(object, node);
        }
      }
      else
      {
        for (var i = 0; i < node.children.length; i++)
        {
          arguments.callee.call(this, data, node.children[i], iterator, object);
        }
      }
    },

    /**
     * Toggle the selection state of the selected interval.
     *
     * @type member
     * @param fromIndex {Integer} the first index of the selection (including).
     * @param toIndex {Integer} the last index of the selection (including).
     * @return {void}
     */
    setSelectionInterval : function(fromIndex, toIndex)
    {
      var mod = this._tree.getDataModel();
      for (var row = fromIndex; row <= toIndex; row++)
      {
        var node = mod.getNodeFromRow(row);
        this._selectNode(node, !node.bSelected);
      }
      this._fireChangeSelection();
    },

    /**
     * Unselects a range
     * @type member
     * @param fromIndex {Integer} the first index of the interval (including).
     * @param toIndex {Integer} the last index of the interval (including).
     * @return {void}
     */
    removeSelectionInterval : function(fromIndex, toIndex)
    {
      var mod = this._tree.getDataModel();
      for (var row = fromIndex; row <= toIndex; row++)
      {
        this._selectNode(mod.getNodeFromRow(row), false);
      }
      this._fireChangeSelection();
    },

    /**
     * Removes a interval from the current selection.
     * @type member
     * @param fromIndex {Integer} the first index of the interval (including).
     * @param toIndex {Integer} the last index of the interval (including).
     * @return {void}
     */
    _selectNode: function(node, selected)
    {
      if (node.bSelected != selected)
      {
        node.bSelected = selected;
        this._selectionChanged = true;
        this._ignoreParent++;
        try
        {
          // Process children
          if (node.children && node.children.length && selected != 'p')
          {
            var mod = this._tree.getDataModel(), data = mod.getData();
            for (var i = 0; i < node.children.length; i++)
            {
              this._selectNode(data[node.children[i]], selected);
            }
          }
        }
        finally
        {
          this._ignoreParent--;
        }
        this._updateParent(node);
      }
    },

    /**
     * This is called by {@link qx.ui.treevirtual.SimpleTreeDataRowRenderer#updateDataRowElement()}
     * Do nothing.
     * @type member
     * @param fromIndex {Integer} the first index of the selection (including).
     * @param toIndex {Integer} the last index of the selection (including).
     * @return {void}
     */
    _addSelectionInterval : function(fromIndex, toIndex)
    {
    },

    /**
     * Updates the selection state of parent nodes.
     * @type member
     * @param node {Map} the node whose parents must be updated.
    * @return {void}
     */
    _updateParent: function(node)
    {
      if (this._ignoreParent || !node.parentNodeId)
      {
        return;
      }
      // Get the parent node
      var mod = this._tree.getDataModel();
      node = mod.getData()[node.parentNodeId];

      // Determine the new value for bSelected
      var somethingSelected, somethingNotSelected;
      for (var i = 0; i < node.children.length; i++)
      {
        var n = mod.getData()[node.children[i]];
        if (n.bSelected == 'p')
        {
          somethingSelected = somethingNotSelected = true;
        }
        else if (n.bSelected)
        {
          somethingSelected = true;
        }
        else
        {
          somethingNotSelected = true;
        }
        if (somethingSelected && somethingNotSelected)
        {
          break;
        }
      }
      if (somethingSelected && somethingNotSelected)
      {
        var selected = 'p';
      }
      else if (somethingSelected)
      {
        selected = true;
      }
      else
      {
        selected = false;
      }
      if (node.bSelected != selected)
      {
        node.bSelected = selected;
        this._selectionChanged = true;
        this._updateParent(node);
      }
    },

    /**
     * Fires the "changeSelection" event to all registered listeners. If the selection model
     * currently is in batch mode, only one event will be thrown when batch mode is ended.
     *
     * @type member
     * @return {void}
     */
    _fireChangeSelection : function()
    {
      if (this._selectionChanged)
      {
        this.fireEvent("changeSelection");
        this._selectionChanged = false;
      }
    }
  }
});
