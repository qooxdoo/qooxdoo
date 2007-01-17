/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 by Derrell Lipman

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(treevirtual)

************************************************************************ */



/*
 * A simple tree data model used as the table model
 *
 * The object structure of a single node of the tree is:
 *
 * {
 *   type          : qx.ui.treevirtual.Type.LEAF,
 *   parentNodeId  : 23,   // index in _nodeArr of the parent node
 *   labelHtml     : "My Documents",
 *   bSelected     : true, // true if node is selected; false otherwise
 *   expanded      : null, // true (-), false (+), or null (no +/-)
 *   icon          : "images/folder.gif",
 *   iconSelected  : "images/folder_selected.gif",
 *   children      : { },  // each property name is an index into _nodeArr
 *
 *   // The following properties need not (and should not) be set when using
 *   // the methods in this class.  They are automatically calculated.  If,
 *   // on the other hand, the model data is loaded via RemoteTableModel, it
 *   // is the responsibility of the server to ensure that these properties
 *   // are properly set.
 *
 *   level         : 2,    // The indentation level of this tree node
 *
 *   bLastChild    : false // Whether this is the last child of a parent.  It
 *                         // is used to locate the appropriate "tree line"
 *                         // icon, specifically whether it's a terminating or
 *                         // a continuation icon.
 * }
 */
qx.OO.defineClass("qx.ui.treevirtual.SimpleTreeDataModel",
                  qx.ui.table.AbstractTableModel,
function()
{
  qx.ui.table.AbstractTableModel.call(this);

  this._rowArr = [];            // rows, resorted into tree order as necessary
  this._nodeArr = [];           // tree nodes, organized with hierarchy

  this._nodeArr.push(           // the root node, needed to store its children
    {
      expanded  : true,
      children  : { }
    });
});


// overridden
qx.Proto.setEditable = function(editable)
{
  throw new Error("Tree columns can not be made editable");
};


// overridden
qx.Proto.setColumnEditable = function(columnIndex, editable)
{
  throw new Error("Tree columns can not be made editable");
};


// overridden
qx.Proto.isColumnEditable = function(columnIndex)
{
  return false;
};


// overridden
qx.Proto.isColumnSortable = function(columnIndex)
{
  return false;
};


// overridden
qx.Proto.sortByColumn = function(columnIndex, ascending)
{
  throw new Error("Trees can not be sorted by column");
};


qx.Proto.getSortColumnIndex = function()
{
  return -1;
};


qx.Proto.isSortAscending = function()
{
  return true;
};


qx.Proto.getRowCount = function()
{
  return this._rowArr.length;
};


qx.Proto.getValue = function(columnIndex, rowIndex)
{
  if (rowIndex < 0 || rowIndex >= this._rowArr.length)
  {
    throw new Error ("this._rowArr row out of bounds: " +
                     this._rowArr +
                     " (0.." +
                     (this._rowArr.length - 1) + ")");b
  }

  if (columnIndex < 0 || columnIndex >= this._rowArr[rowIndex].length)
  {
    throw new Error ("this._rowArr column out of bounds: " +
                     this._rowArr[rowIndex] +
                     " (0.." +
                     (this._rowArr[rowIndex].length - 1) + ")");
  }

  return this._rowArr[rowIndex][columnIndex];
};


qx.Proto.addNode = function(type,
                            parentNodeId,
                            labelHtml,
                            expanded,
                            icon,
                            iconSelected)
{
  var parentNode;

  // Ensure that if parent was specified, it exists
  if (parentNodeId)
  {
    parentNode = this._nodeArr[parentNodeId];
    if (! parentNode)
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
    // This is a child of the root, so it's level 0
    parentNode = this._nodeArr[0];
    parentNodeId = 0;
  }

  // If this is a file, we don't present expand/contract icon
  if (type == qx.ui.treevirtual.SimpleTreeDataModel.Type.LEAF && expanded)
  {
    throw new Error("Attempt to display a LEAF expanded");
  }

  // Set the data for this node.
  var node =
    {
      type         : type,
      parentNodeId : parentNodeId,
      labelHtml    : labelHtml,
      expanded     : expanded,
      icon         : icon,
      iconSelected : iconSelected,
      children     : { }
    };

  // Determine the node id of this new node
  var nodeId = this._nodeArr.length;

  // Add this node to the array
  this._nodeArr.push(node);

  // Add this node to its parent's child array.  We prefer to use object
  // properties for this rather than pushing the nodeId onto an array because
  // it is very easy to delete a specific object property if a child is
  // deleted, whereas we'd have to search the array to find the node in the
  // non-preferred implementation.
  parentNode.children[nodeId] = true;

  // Return the node id we just added
  return nodeId;
};


/**
 * Sets the whole data en bulk, or notifies the data model that node
 * modifications are complete.
 *
 * @param nodeArr {Array | null}
 *   Pass either an Array of node objects, or null.
 *
 *   If non-null, nodeArr is an array of node objects containing the entire
 *   tree to be displayed.  If loading the whole data en bulk in this way, it
 *   is assumed that the data is correct!  No error checking or validation is
 *   done.  You'd better know what you're doing!  Caveat emptor.
 *
 *   If nodeArr is null, then this call is a notification that the user has
 *   completed building or modifying a tree by issuing a series of calls to
 *   addNode().
 */
qx.Proto.setData = function(nodeArr)
{
  if (nodeArr instanceof Array)
  {
    // Save the user-supplied data.
    this._nodeArr = nodeArr;
  }
  else if (nodeArr !== null)
  {
    throw new Error("Expected array of node objects or null; got " +
                    typeof(nodeArr));
  }

  // Re-render the row array
  this._render();
};


/**
 * Render (or re-render) the tree.  Call this function after having added
 * and/or deleted tree nodes (Files or Folders), or after having made changes
 * to tree (or tree node) options that will cause the tree to be rendered
 * differently.  This function should typically be called after a set of
 * concurrent changes, not after each change.
 */
qx.Proto._render = function()
{
  var _this = this;

  var inorder = function(nodeId, level)
  {
    var child = null;

    // For each child of the specified node...
    for (var childNodeId in _this._nodeArr[nodeId].children)
    {
      // Get the child node
      child = _this._nodeArr[childNodeId];

      // (Re-)assign this node's level
      child.level = level;

      // Assume that this is not a last child.  If it is, we'll reset it later
      child.bLastChild = false;

      // Add this node to the row array
      _this._rowArr.push( [ child ])

      // If this child is expanded, ...
      if (child.expanded)
      {
        // ... then add its children too.
        inorder(childNodeId, level + 1);
      }
    }

    // The most recent child we added is a "last child" for tree lines
    if (child !== null)
    {
      child.bLastChild = true;
    }
  }

  // Reset the row array
  this._rowArr = [];

  // Begin in-order traversal of the tree from the root to regenerate _rowArr
  inorder(0, 0);

  // Inform the listeners
  if (this.hasEventListeners(qx.ui.table.TableModel.EVENT_TYPE_DATA_CHANGED))
  {
    var data =
      {
        firstRow        : 0,
        lastRow         : this._rowArr.length - 1,
        firstColumn     : 0,
        lastColumn      : this.getColumnCount() - 1
      };

    this.dispatchEvent(new qx.event.type.DataEvent(
                         qx.ui.table.TableModel.EVENT_TYPE_DATA_CHANGED,
                         data),
                       true);
  }
};


// We currently support these types of tree nodes
qx.Class.Type = {};
qx.Class.Type.LEAF            = 0;
qx.Class.Type.BRANCH          = 1;

