/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2010 Derrell Lipman

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * A simple tree data model used as the table model
 *
 * The object structure of a single node of the tree is:
 *
 * <pre class='javascript'>
 * {
 *   // USER-PROVIDED ATTRIBUTES
 *   // ------------------------
 *   type           : qx.ui.treevirtual.MTreePrimitive.Type.LEAF,
 *   parentNodeId   : 23,    // index of the parent node in _nodeArr
 *
 *   label          : "My Documents",
 *   bSelected      : true,  // true if node is selected; false otherwise.
 *   bOpened        : true,  // true (-), false (+)
 *   bHideOpenClose : false, // whether to hide the open/close button
 *   icon           : "images/folder.gif",
 *   iconSelected   : "images/folder_selected.gif",
 *
 *   cellStyle      : "background-color:cyan"
 *   labelStyle     : "background-color:red;color:white"
 *
 *   // USER-PROVIDED COLUMN DATA
 *   columnData     : [
 *                      null, // null at index of tree column (typically 0)
 *                      "text of column 1",
 *                      "text of column 2"
 *                    ],
 *
 *   // APPLICATION-, MIXIN-, and SUBCLASS-PROVIDED CUSTOM DATA
 *   data           : {
 *                      application :
 *                      {
 *                          // application-specific user data goes in here
 *                          foo: "bar",
 *                          ...
 *                      },
 *                      MDragAndDropSupport :
 *                      {
 *                          // Data required for the Drag & Drop mixin.
 *                          // When a mixin is included, its constructor
 *                          // should create this object, named according
 *                          // to the mixin or subclass name (empty or
 *                          // otherwise)
 *                      },
 *                      ... // Additional mixins or subclasses.
 *                    },
 *
 *   // INTERNALLY-CALCULATED ATTRIBUTES
 *   // --------------------------------
 *   // The following properties need not (and should not) be set by the
 *   // caller, but are automatically calculated.  Some are used internally,
 *   // while others may be of use to event listeners.
 *
 *   nodeId         : 42,   // The index in _nodeArr, useful to event listeners.
 *   children       : [ ],  // each value is an index into _nodeArr
 *
 *   level          : 2,    // The indentation level of this tree node
 *   labelPos       : 40,   // The left position of the label text - stored when the cell is rendered
 *
 *   bFirstChild    : true,
 *   lastChild      : [ false ],  // Array where the index is the column of
 *                                // indentation, and the value is a boolean.
 *                                // These are used to locate the
 *                                // appropriate "tree line" icon.
 * }
 * </pre>
 */
qx.Class.define("qx.ui.treevirtual.SimpleTreeDataModel",
{
  extend : qx.ui.table.model.Abstract,

  include : qx.ui.treevirtual.MTreePrimitive,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._rowArr = []; // rows, resorted into tree order as necessary
    this._nodeArr = []; // tree nodes, organized with hierarchy

    this._nodeRowMap = []; // map nodeArr index to rowArr index.  The
                           // index of this array is the index of
                           // _nodeArr, and the values in this array are
                           // the indexes into _rowArr.

    this._treeColumn = 0; // default column for tree nodes

    this._selections = {}; // list of indexes of selected nodes

    // the root node, needed to store its children
    this._nodeArr.push(qx.ui.treevirtual.MTreePrimitive._getEmptyTree());

    // Track which columns are editable
    this.__editableColArr = null;
  },


  properties :
  {
    /**
     * Gives the user the opportunity to filter the model. The filter
     * function is called for every node in the model. It gets as an argument the
     * <code>node</code> object and has to return
     * <code>true</code> if the given data should be shown and
     * <code>false</code> if the given data should be ignored.
     */
    filter :
    {
      check : "Function",
      nullable : true,
      apply : "_applyFilter"
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __tree           : null,
    __editableColArr : null,
    __tempTreeData : null,
    __recalculateLastChildFlags : null,

    /** Rows, resorted into tree order as necessary */
    _rowArr : null,

    /** Tree nodes, organized with hierarchy */
    _nodeArr : null,

    /**
     * Map nodeArr index to rowArr index.  The index of this array is the
     * index of _nodeArr, and the values in this array are the indexes into
     * _rowArr.
     */
    _nodeRowMap : null,

    /** Column for tree nodes */
    _treeColumn : null,

    /** list of indexes of selected nodes */
    _selections : null,

    /**
     * Set the tree object for which this data model is used.
     *
     * @param tree {qx.ui.treevirtual.TreeVirtual}
     *    The tree used to render the data in this model.
     *
     */
    setTree : function(tree)
    {
      this.__tree = tree;
    },

    /**
     * Get the tree object for which this data model is used.
     *
     * @return {qx.ui.treevirtual.TreeVirtual}
     */
    getTree : function()
    {
      return this.__tree;
    },

    /**
     * Sets all columns editable or not editable.
     *
     * @param editable {Boolean}
     *   Whether all columns are editable.
     *
     */
    setEditable : function(editable)
    {
      this.__editableColArr = [];

      for (var col=0; col<this.getColumnCount(); col++)
      {
        this.__editableColArr[col] = editable;
      }

      this.fireEvent("metaDataChanged");
    },


    /**
     * Sets whether a column is editable.
     *
     * @param columnIndex {Integer}
     *   The column of which to set the editable state.
     *
     * @param editable {Boolean}
     *   Whether the column should be editable.
     *
     */
    setColumnEditable : function(columnIndex, editable)
    {
      if (editable != this.isColumnEditable(columnIndex))
      {
        if (this.__editableColArr == null)
        {
          this.__editableColArr = [];
        }

        this.__editableColArr[columnIndex] = editable;

        this.fireEvent("metaDataChanged");
      }
    },

    // overridden
    isColumnEditable : function(columnIndex)
    {
      if (columnIndex == this._treeColumn)
      {
        return this.__tree.getAllowNodeEdit();
      }

      return(this.__editableColArr
             ? this.__editableColArr[columnIndex] == true
             : false);
    },


    // overridden
    isColumnSortable : function(columnIndex)
    {
      return false;
    },


    /**
     * Sorts the model by a column.
     *
     * @param columnIndex {Integer} the column to sort by.
     * @param ascending {Boolean} whether to sort ascending.
     * @throws {Error} If one tries to sort the tree by column
     */
    sortByColumn : function(columnIndex, ascending)
    {
      throw new Error("Trees can not be sorted by column");
    },


    /**
     * Returns the column index the model is sorted by. This model is never
     * sorted, so -1 is returned.
     *
     * @return {Integer}
     *   -1, to indicate that the model is not sorted.
     */
    getSortColumnIndex : function()
    {
      return -1;
    },


    /**
     * Specifies which column the tree is to be displayed in.  The tree is
     * displayed using the SimpleTreeDataCellRenderer.  Other columns may be
     * provided which use different cell renderers.
     *
     * Setting the tree column involves more than simply setting this column
     * index; it also requires setting an appropriate cell renderer for this
     * column, that knows how to render a tree. The expected and typical
     * method of setting the tree column is to provide it in the 'custom'
     * parameter to the TreeVirtual constructor, which also initializes the
     * proper cell renderers. This method does not set any cell renderers. If
     * you wish to call this method on your own, you should also manually set
     * the cell renderer for the specified column, and likely also set the
     * cell renderer for column 0 (the former tree column) to something
     * appropriate to your data.
     *
     *
     * @param columnIndex {Integer}
     *   The index of the column in which the tree should be displayed.
     *
     */
    setTreeColumn : function(columnIndex)
    {
      this._treeColumn = columnIndex;
    },


    /**
     * Get the column in which the tree is to be displayed.
     *
     * @return {Integer}
     *   The column in which the tree is to be displayed
     */
    getTreeColumn : function()
    {
      return this._treeColumn;
    },

    // overridden
    getRowCount : function()
    {
      return this._rowArr.length;
    },

    // overridden
    getRowData : function(rowIndex)
    {
      return this._rowArr[rowIndex];
    },


    /**
     * Returns a cell value by column index.
     *
     * @throws {Error} if the row index is out of bounds.
     * @param columnIndex {Integer} the index of the column.
     * @param rowIndex {Integer} the index of the row.
     * @return {var} The value of the cell.
     * @see #getValueById
     */
    getValue : function(columnIndex, rowIndex)
    {
      if (rowIndex < 0 || rowIndex >= this._rowArr.length)
      {
        throw new Error("this._rowArr row " +
                        "(" + rowIndex + ") out of bounds: " +
                        this._rowArr +
                        " (0.." + (this._rowArr.length - 1) + ")");
      }

      if (columnIndex < 0 || columnIndex >= this._rowArr[rowIndex].length)
      {
        throw new Error("this._rowArr column " +
                        "(" + columnIndex + ") out of bounds: " +
                        this._rowArr[rowIndex] +
                        " (0.." + (this._rowArr[rowIndex].length - 1) + ")");
      }

      return this._rowArr[rowIndex][columnIndex];
    },


    // overridden
    setValue : function(columnIndex, rowIndex, value)
    {
      // convert from rowArr to nodeArr, and get the requested node
      var node = this.getNodeFromRow(rowIndex);

      if (columnIndex === this._treeColumn)
      {
        if (!this.__tree.getAllowNodeEdit() || value["label"] === undefined) {
          return;
        }
        // only allow to set the node label via this method, clone the original node
        var updatedNode = qx.lang.Object.clone(node);
        updatedNode.label = value.label;
        this._nodeArr[node.nodeId] = updatedNode;
      } else {
        if (node.columnData[columnIndex] == value) {
          return;
        }
        node.columnData[columnIndex] = value;
      }
      this.setData();
      // Inform the listeners
      if (this.hasListener("dataChanged"))
      {
        var data = {
          firstRow: rowIndex,
          lastRow: rowIndex,
          firstColumn: columnIndex,
          lastColumn: columnIndex
        };
        this.fireDataEvent("dataChanged", data);
      }
    },


    /**
     * Returns the node object specific to a currently visible row. In this
     * simple tree data model, that's the same as retrieving the value of the
     * tree column of the specified row.
     *
     * @throws {Error}
     *   Thrown if the row index is out of bounds.
     *
     * @param rowIndex {Integer}
     *   The index of the row.
     *
     * @return {Object}
     *   The node object associated with the specified row.
     */
    getNode : function(rowIndex)
    {
      if (rowIndex < 0 || rowIndex >= this._rowArr.length)
      {
        throw new Error("this._rowArr row " +
                        "(" + rowIndex + ") out of bounds: " +
                        this._rowArr +
                        " (0.." + (this._rowArr.length - 1) + ")");
      }

      return this._rowArr[rowIndex][this._treeColumn];
    },


    /**
     * Add a branch to the tree.
     *
     * @param parentNodeId {Integer}
     *   The node id of the parent of the node being added
     *
     * @param label {String}
     *   The string to display as the label for this node
     *
     * @param bOpened {Boolean}
     *   <i>True</i> if the branch should be rendered in its opened state;
     *   <i>false</i> otherwise.
     *
     * @param bHideOpenCloseButton {Boolean}
     *   <i>True</i> if the open/close button should not be displayed;
     *   <i>false</i> if the open/close button should be displayed
     *
     * @param icon {String}
     *   The relative (subject to alias expansion) or full path of the icon to
     *   display for this node when it is not a selected node.
     *
     * @param iconSelected {String}
     *   The relative (subject to alias expansion) or full path of the icon to
     *   display for this node when it is a selected node.
     *
     * @return {Integer}
     *   The node id of the newly-added branch.
     */
    addBranch : function(parentNodeId,
                         label,
                         bOpened,
                         bHideOpenCloseButton,
                         icon,
                         iconSelected)
    {
      return qx.ui.treevirtual.MTreePrimitive._addNode(
        this._nodeArr,
        parentNodeId,
        label,
        bOpened,
        bHideOpenCloseButton,
        qx.ui.treevirtual.MTreePrimitive.Type.BRANCH,
        icon,
        iconSelected);
    },


    /**
     * Add a leaf to the tree.
     *
     * @param parentNodeId {Integer}
     *   The node id of the parent of the node being added
     *
     * @param label {String}
     *   The string to display as the label for this node
     *
     * @param icon {String}
     *   The relative (subject to alias expansion) or full path of the icon to
     *   display for this node when it is not a selected node.
     *
     * @param iconSelected {String}
     *   The relative (subject to alias expansion) or full path of the icon to
     *   display for this node when it is a selected node.
     *
     * @return {Integer} The node id of the newly-added leaf.
     */
    addLeaf : function(parentNodeId,
                       label,
                       icon,
                       iconSelected)
    {
      return qx.ui.treevirtual.MTreePrimitive._addNode(
        this._nodeArr,
        parentNodeId,
        label,
        false,
        false,
        qx.ui.treevirtual.MTreePrimitive.Type.LEAF,
        icon,
        iconSelected);
    },


    /**
     * Prune the tree by removing, recursively, all of a node's children.  If
     * requested, also remove the node itself.
     *
     * @param nodeReference {Object | Integer}
     *   The node to be pruned from the tree.  The node can be represented
     *   either by the node object, or the node id (as would have been
     *   returned by addBranch(), addLeaf(), etc.)
     *
     * @param bSelfAlso {Boolean}
     *   If <i>true</i> then remove the node identified by <i>nodeId</i> as
     *   well as all of the children.
     *
     * @throws {Error} If the node object or id is not valid.
     *
     */
    prune : function(nodeReference, bSelfAlso)
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
      }
      else
      {
        throw new Error("Expected node object or node id");
      }

      // First, recursively remove all children
      for (var i=this._nodeArr[nodeId].children.length-1; i>=0; i--)
      {
        this.prune(this._nodeArr[nodeId].children[i], true);
      }

      // Now remove ourself, if requested. (Don't try to remove the root node)
      if (bSelfAlso && nodeId != 0)
      {
        // Delete ourself from our parent's children list
        node = this._nodeArr[nodeId];
        qx.lang.Array.remove(this._nodeArr[node.parentNodeId].children,
                             nodeId);

        // Delete ourself from the selections list, if we're in it.
        if (this._selections[nodeId])
        {
          delete this._selections[nodeId];
        }

        // We can't splice the node itself out, because that would muck up the
        // nodeId == index correspondence.  Instead, just replace the node
        // with null so its index just becomes unused.
        this._nodeArr[nodeId] = null;
      }
    },


    /**
     * Move a node in the tree.
     *
     * @param moveNodeReference {Object | Integer}
     *   The node to be moved.  The node can be represented
     *   either by the node object, or the node id (as would have been
     *   returned by addBranch(), addLeaf(), etc.)
     *
     * @param parentNodeReference {Object | Integer}
     *   The new parent node, which must not be a LEAF.  The node can be
     *   represented either by the node object, or the node id (as would have
     *   been returned by addBranch(), addLeaf(), etc.)
     *
     * @throws {Error} If the node object or id is not valid.
     * @throws {Error} If one tries to add a child to a non-existent parent.
     * @throws {Error} If one tries to add a node to a leaf.
     */
    move : function(moveNodeReference,
                    parentNodeReference)
    {
      var moveNode;
      var moveNodeId;
      var parentNode;
      var parentNodeId;

      // Replace null parent with node id 0
      parentNodeReference = parentNodeReference || 0;

      if (typeof(moveNodeReference) == "object")
      {
        moveNode = moveNodeReference;
        moveNodeId = moveNode.nodeId;
      }
      else if (typeof(moveNodeReference) == "number")
      {
        moveNodeId = moveNodeReference;
        moveNode = this._nodeArr[moveNodeId];
      }
      else
      {
        throw new Error("Expected move node object or node id");
      }

      if (typeof(parentNodeReference) == "object")
      {
        parentNode = parentNodeReference;
        parentNodeId = parentNode.nodeId;
      }
      else if (typeof(parentNodeReference) == "number")
      {
        parentNodeId = parentNodeReference;
        parentNode = this._nodeArr[parentNodeId];
      }
      else
      {
        throw new Error("Expected parent node object or node id");
      }

      // Ensure parent isn't a leaf
      if (parentNode.type == qx.ui.treevirtual.MTreePrimitive.Type.LEAF)
      {
        throw new Error("Sorry, a LEAF may not have children.");
      }

      // Remove the node from its current parent's children list
      var oldParent = this._nodeArr[moveNode.parentNodeId];
      qx.lang.Array.remove(oldParent.children, moveNodeId);

      // Add the node to its new parent's children list
      parentNode.children.push(moveNodeId);

      // Replace this node's parent reference
      this._nodeArr[moveNodeId].parentNodeId = parentNodeId;
    },


    /**
     * Orders the node and creates all data needed to render the tree.
     *
     * @param nodeId {Integer}
     *   A node identifier, as previously returned by {@link #addBranch} or
     *   {@link #addLeaf}.
     * @param level {Integer} the level in the hierarchy
     */
    __inorder : function(nodeId, level)
    {
      var filter = this.getFilter();
      var child = null;
      var childNodeId;

      // For each child of the specified node...
      var numChildren = this._nodeArr[nodeId].children.length;
      var index = 0;
      var children = this.__tempTreeData[nodeId] = [];
      for (var i=0; i<numChildren; i++)
      {
        // Determine the node id of this child
        childNodeId = this._nodeArr[nodeId].children[i];

        // Get the child node
        child = this._nodeArr[childNodeId];

        // Skip deleted nodes or apply the filter
        if (child == null || (filter && !filter.call(this, child))) {
          this.__recalculateLastChildFlags = true;
          continue;
        }

        // Remember the children so that we can add the lastChild flags later
        children.push(child);

        // (Re-)assign this node's level
        child.level = level;

        // Determine if we're the first child of our parent
        child.bFirstChild = (index == 0);

        // Set the last child flag of the node only when no node was skipped.
        // Otherwise we will have to recalculate the last child flags, as
        // the parent or sibling node might become the first child.
        if (!this.__recalculateLastChildFlags) {
          this.__setLastChildFlag(child, i == numChildren - 1);
        }

        // Ensure there's an entry in the columnData array for each column
        if (!child.columnData)
        {
          child.columnData = [ ];
        }

        if (child.columnData.length < this.getColumnCount())
        {
          child.columnData[this.getColumnCount() - 1] = null;
        }

        // Add this node to the row array.  Initialize a row data array.
        var rowData = [ ];

        // If additional column data is provided...
        if (child.columnData)
        {
          // ... then add each column data.
          for (var j=0; j<child.columnData.length; j++)
          {
            // Is this the tree column?
            if (j == this._treeColumn)
            {
              // Yup.  Add the tree node data
              rowData.push(child);
            }
            else
            {
              // Otherwise, add the column data verbatim.
              rowData.push(child.columnData[j]);
            }
          }
        }
        else
        {
          // No column data.  Just add the tree node.
          rowData.push(child);
        }

        // Track the _rowArr index for each node so we can handle
        // selections.
        this._nodeRowMap[child.nodeId] = this._rowArr.length;

        // Add the row data to the row array
        this._rowArr.push(rowData);

        // If this node is selected, ...
        if (child.bSelected)
        {
          // ... indicate so for the row.
          rowData.selected = true;
          this._selections[child.nodeId] = true;
        }

        // If this child is opened, ...
        if (child.bOpened)
        {
          // ... then add its children too.
          this.__inorder(childNodeId, level + 1);
        }
        index++;
      }
    },


    /**
     * Calculates the lastChild flags to the nodes, so that the tree can render the
     * tree lines right.
     *
     * @param nodeId {Integer}
     *   A node identifier, as previously returned by {@link #addBranch} or
     *   {@link #addLeaf}.
     */
    __calculateLastChildFlags : function(nodeId)
    {
      var tempTreeData = this.__tempTreeData;
      var children =  tempTreeData[nodeId];
      var numChildren = children.length;
      for (var i = 0; i < numChildren; i++)
      {
        var child = children[i];

        this.__setLastChildFlag(child, i == numChildren - 1);

        var hasChildren = tempTreeData[child.nodeId] && tempTreeData[child.nodeId].length > 0;
        if (hasChildren) {
          this.__calculateLastChildFlags(child.nodeId);
        }
      }
    },


    /**
     * Sets the last child flag for a node and all it's parents.
     *
     * @param node {Object} the node object
     * @param isLastChild {Boolean} whether the node is the last child
     */
    __setLastChildFlag : function(node, isLastChild)
    {
      // Determine if we're the last child of our parent
      node.lastChild = [ isLastChild ];

      // Get our parent.
      var parent =  this._nodeArr[node.parentNodeId];

      // For each parent node, determine if it is a last child
      while (parent.nodeId)
      {
        var bLast = parent.lastChild[parent.lastChild.length - 1];
        node.lastChild.unshift(bLast);
        parent = this._nodeArr[parent.parentNodeId];
      }
    },


    /**
     * Renders the tree data.
     */
    __render : function()
    {
      // Reset the __tempTreeData
      this.__tempTreeData = [];
      this.__recalculateLastChildFlags = false;

      // Reset the row array
      this._rowArr = [];

      // Reset the _nodeArr -> _rowArr map
      this._nodeRowMap = [];

      // Reset the set of selections
      this._selections = {};

      // Begin in-order traversal of the tree from the root to regenerate
      // _rowArr.
      this.__inorder(0, 1);

      // Reset the lastChild flags when needed, so that the tree can render the
      // tree lines right.
      if (this.__recalculateLastChildFlags) {
        this.__calculateLastChildFlags(0);
      }

      // Give the memory free
      this.__tempTreeData = null;

      // Inform the listeners
      if (this.hasListener("dataChanged"))
      {
        var data =
        {
          firstRow    : 0,
          lastRow     : this._rowArr.length - 1,
          firstColumn : 0,
          lastColumn  : this.getColumnCount() - 1
        };

        this.fireDataEvent("dataChanged", data);
      }
    },


    /**
     * Sets the whole data en bulk, or notifies the data model that node
     * modifications are complete.
     *
     * @param nodeArr {Array | null}
     *   Pass either an Array of node objects, or null.
     *
     *   If non-null, nodeArr is an array of node objects containing the
     *   entire tree to be displayed.  If loading the whole data en bulk in
     *   this way, it is assumed that the data is correct!  No error checking
     *   or validation is done.  You'd better know what you're doing!  Caveat
     *   emptor.
     *
     *
     *   If nodeArr is null, then this call is a notification that the user
     *   has completed building or modifying a tree by issuing a series of
     *   calls to {@link #addBranch} and/or {@link #addLeaf}.
     *
     *
     * @throws {Error} If the parameter has the wrong type.
     */
    setData : function(nodeArr)
    {
      if (nodeArr instanceof Array)
      {
        // Save the user-supplied data.
        this._nodeArr = nodeArr;
      }
      else if (nodeArr !== null && nodeArr !== undefined)
      {
        throw new Error("Expected array of node objects or null/undefined; " +
                        "got " + typeof (nodeArr));
      }

      // Re-render the row array
      this.__render();

      // Set selections in the selection model now
      var selectionModel = this.getTree().getSelectionModel();
      var selections = this._selections;
      for (var nodeId in selections)
      {
        var nRowIndex = this.getRowFromNodeId(nodeId);
        selectionModel.setSelectionInterval(nRowIndex, nRowIndex);
      }
    },


    /**
     * Return the array of node data.
     *
     * @return {Array}
     *  Array of node objects.
     *  See {@link qx.ui.treevirtual.SimpleTreeDataModel} for a description
     *  nodes in this array.
     */
    getData : function()
    {
      return this._nodeArr;
    },


    /**
     * Clears the tree of all nodes
     *
     */
    clearData : function ()
    {
      this._clearSelections();
      this.setData([ qx.ui.treevirtual.MTreePrimitive._getEmptyTree() ]);
    },


    /**
     * Add data to an additional column (a column other than the tree column)
     * of the tree.
     *
     * @param nodeId {Integer}
     *   A node identifier, as previously returned by {@link #addBranch} or
     *   {@link #addLeaf}.
     *
     * @param columnIndex {Integer}
     *   The column number to which the provided data applies
     *
     * @param data {var}
     *   The cell data for the specified column
     *
     */
    setColumnData : function(nodeId, columnIndex, data)
    {
      this._nodeArr[nodeId].columnData[columnIndex] = data;
    },


    /**
     * Retrieve the data from an additional column (a column other than the
     * tree column) of the tree.
     *
     * @param nodeId {Integer}
     *   A node identifier, as previously returned by {@link #addBranch} or
     *   {@link #addLeaf}.
     *
     * @param columnIndex {Integer}
     *   The column number to which the provided data applies
     *
     * @return {var} The cell data for the specified column
     */
    getColumnData : function(nodeId, columnIndex)
    {
      return this._nodeArr[nodeId].columnData[columnIndex];
    },


    /**
     * Set state attributes of a node.
     *
     * @param nodeReference {Object | Integer}
     *   The node to have its attributes set.  The node can be represented
     *   either by the node object, or the node id (as would have been
     *   returned by addBranch(), addLeaf(), etc.)
     *
     * @param attributes {Map}
     *   Each property name in the map may correspond to the property names of
     *   a node which are specified as <i>USER-PROVIDED ATTRIBUTES</i> in
     *   {@link SimpleTreeDataModel}.  Each property value will be assigned
     *   to the corresponding property of the node specified by nodeId.
     *
     * @throws {Error} If the node object or id is not valid.
     */
    setState : function(nodeReference, attributes)
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
        node = this._nodeArr[nodeId];
      }
      else
      {
        throw new Error("Expected node object or node id");
      }

      for (var attribute in attributes)
      {
        // Do any attribute-specific processing
        switch(attribute)
        {
        case "bSelected":
          var nRowIndex = this.getRowFromNodeId(nodeId);
          var selectionModel = this.getTree().getSelectionModel();
          var TV = qx.ui.treevirtual.TreeVirtual;
          var bChangeSelection =
            (typeof(nRowIndex) === "number" &&
             this.getTree().getSelectionMode() != TV.SelectionMode.NONE);

          // The selected state is changing. Keep track of what is selected
          if (attributes[attribute])
          {
            this._selections[nodeId] = true;

            // Add selection range for node
            if (bChangeSelection &&
                ! selectionModel.isSelectedIndex(nRowIndex))
            {
              selectionModel.setSelectionInterval(nRowIndex, nRowIndex);
            }
          }
          else
          {
            delete this._selections[nodeId];

            // Delete selection range for node
            if (bChangeSelection &&
                selectionModel.isSelectedIndex(nRowIndex))
            {
              selectionModel.removeSelectionInterval(nRowIndex, nRowIndex);
            }
          }
          break;

        case "bOpened":
          // Don't do anything if this is a leaf, leaf has no opened/closed
          if (node.type === qx.ui.treevirtual.MTreePrimitive.Type.LEAF) {
            break;
          }

          // Don't do anything if the requested state is the same as the
          // current state.
          if (attributes[attribute] == node.bOpened)
          {
            break;
          }

          // Get the tree to which this data model is attached
          var tree = this.__tree;

          // Are we opening or closing?
          if (node.bOpened)
          {
            // We're closing.  If there are listeners, generate a treeClose
            // event.
            tree.fireDataEvent("treeClose", node);
          }
          else
          {
            // We're opening.  Are there any children?
            if (node.children.length > 0)
            {
              // Yup.  If there any listeners, generate a "treeOpenWithContent"
              // event.
              tree.fireDataEvent("treeOpenWithContent", node);
            }
            else
            {
              // No children.  If there are listeners, generate a
              // "treeOpenWhileEmpty" event.
              tree.fireDataEvent("treeOpenWhileEmpty", node);
            }
          }

          // Event handler may have modified the opened state.  Check before
          // toggling.
          if (!node.bHideOpenClose)
          {
            // It's still boolean.  Toggle the state
            node.bOpened = !node.bOpened;

            // Clear the old selections in the tree
            tree.getSelectionModel()._resetSelection();
          }

          // Re-render the row data since formerly visible rows may now be
          // invisible, or vice versa.
          this.setData();
          break;

        default:
          // no attribute-specific processing required
          break;
        }

        // Set the new attribute value
        node[attribute] = attributes[attribute];
      }
    },


    /**
     * Return the mapping of nodes to rendered rows.  This function is intended
     * for use by the cell renderer, not by users of this class.
     * It is also useful to select a node.
     *
     * @return {Array}
     *   The array containing mappings of nodes to rendered rows.
     */
    getNodeRowMap : function()
    {
      return this._nodeRowMap;
    },

    /**
     * This operation maps nodes to rowIndexes.  It does the opposite job to {@link #getNodeFromRow}.
     *
     * @param nodeId {Integer}
     *   The id of the node (as would have been returned by addBranch(),
     *   addLeaf(), etc.) to get the row index for.
     * @return {Integer} row index for the given node ID
     */
    getRowFromNodeId : function(nodeId)
    {
      return this._nodeRowMap[nodeId];
    },

    /**
     * This operation maps rowIndexes to nodes.  It does the opposite job to {@link #getRowFromNodeId}.
     * This function is useful to map selection (row based) to nodes.
     *
     * @param rowIndex {Integer} zero-based row index.
     * @return {Object} node associated to <tt>rowIndex</tt>.
     */
    getNodeFromRow : function(rowIndex)
    {
      return this._nodeArr[this._rowArr[rowIndex][this._treeColumn].nodeId];
    },


    /**
     * Clear all selections in the data model.  This method does not clear
     * selections displayed in the widget, and is intended for internal use,
     * not by users of this class.
     *
     */
    _clearSelections : function()
    {
      // Clear selected state for any selected nodes.
      for (var selection in this._selections)
      {
        this._nodeArr[selection].bSelected = false;
      }

      // Reinitialize selections array.
      this._selections = { };
    },


    /**
     * Return the nodes that are currently selected.
     *
     * @return {Array}
     *   An array containing the nodes that are currently selected.
     */
    getSelectedNodes : function()
    {
      var nodes = [ ];

      for (var nodeId in this._selections)
      {
        nodes.push(this._nodeArr[nodeId]);
      }

      return nodes;
    },


    // property apply
    _applyFilter : function(value, old)
    {
      this.setData();
    }
  },

  destruct : function()
  {
    this._rowArr = this._nodeArr = this._nodeRowMap = this._selections =
      this.__tree = this.__tempTreeData = null;
  },

  defer : function(statics)
  {
    // For backward compatibility, ensure the Type values are available from
    // this class as well as from the mixin.
    statics.Type = qx.ui.treevirtual.MTreePrimitive.Type;
  }
});
