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
 * A "virtual" tree
 * <p>
 *   A number of convenience methods are available in the following mixins:
 *   <ul>
 *     <li>{@link qx.ui.treevirtual.MNode}</li>
 *     <li>{@link qx.ui.treevirtual.MFamily}</li>
 *   </ul>
 * </p>
 */
qx.Class.define("qx.ui.treevirtual.TreeVirtual",
{
  extend : qx.ui.table.Table,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param headings {Array | String}
   *   An array containing a list of strings, one for each column, representing
   *   the headings for each column.  As a special case, if only one column is
   *   to exist, the string representing its heading need not be enclosed in an
   *   array.
   *
   * @param custom {Map ? null}
   *   A map provided (typically) by subclasses, to override the various
   *   supplemental classes allocated within this constructor.  For normal
   *   usage, this parameter may be omitted.  Each property must be an object
   *   instance or a function which returns an object instance, as indicated by
   *   the defaults listed here:
   *
   *   <dl>
   *     <dt>initiallyHiddenColumns</dt>
   *       <dd>
   *         {Array?}
   *         A list of column numbers that should be initially invisible. Any
   *         column not mentioned will be initially visible, and if no array
   *         is provided, all columns will be initially visible.
   *       </dd>
   *     <dt>dataModel</dt>
   *       <dd>new qx.ui.treevirtual.SimpleTreeDataModel()</dd>
   *     <dt>treeDataCellRenderer</dt>
   *       <dd>
   *         Instance of {@link qx.ui.treevirtual.SimpleTreeDataCellRenderer}.
   *         Custom data cell renderer for the tree column.
   *       </dd>
   *     <dt>treeColumn</dt>
   *       <dd>
   *         The column number in which the tree is to reside, i.e., which
   *         column uses the SimpleTreeDataCellRenderer or a subclass of it.
   *       </dd>
   *     <dt>defaultDataCellRenderer</dt>
   *       <dd>
   *         Instance of {@link qx.ui.treevirtual.DefaultDataCellRenderer}.
   *         Custom data cell renderer for all columns other than the tree
   *         column.
   *       </dd>
   *     <dt>dataRowRenderer</dt>
   *       <dd>new qx.ui.treevirtual.SimpleTreeDataRowRenderer()</dd>
   *     <dt>selectionManager</dt>
   *       <dd><pre class='javascript'>
   *         function(obj)
   *         {
   *           return new qx.ui.treevirtual.SelectionManager(obj);
   *         }
   *       </pre></dd>
   *     <dt>tableColumnModel</dt>
   *       <dd><pre class='javascript'>
   *         function(obj)
   *         {
   *           return new qx.ui.table.columnmodel.Resize(obj);
   *         }
   *       </pre></dd>
   *   </dl>
   */
  construct : function(headings, custom)
  {
    //
    // Allocate default objects if custom objects are not specified
    //
    if (! custom)
    {
      custom = { };
    }

    if (! custom.dataModel)
    {
      custom.dataModel =
        new qx.ui.treevirtual.SimpleTreeDataModel();
    }

    if (custom.treeColumn === undefined)
    {
      custom.treeColumn = 0;
      custom.dataModel.setTreeColumn(custom.treeColumn);
    }

    if (! custom.treeDataCellRenderer)
    {
      custom.treeDataCellRenderer =
        new qx.ui.treevirtual.SimpleTreeDataCellRenderer();
    }

    if (! custom.defaultDataCellRenderer)
    {
      custom.defaultDataCellRenderer =
        new qx.ui.treevirtual.DefaultDataCellRenderer();
    }

    if (! custom.dataRowRenderer)
    {
      custom.dataRowRenderer =
        new qx.ui.treevirtual.SimpleTreeDataRowRenderer();
    }

    if (! custom.selectionManager)
    {
      custom.selectionManager =
        function(obj)
        {
          return new qx.ui.treevirtual.SelectionManager(obj);
        };
    }

    if (! custom.tableColumnModel)
    {
      custom.tableColumnModel =
        function(obj)
        {
          return new qx.ui.table.columnmodel.Resize(obj);
        };
    }

    // Specify the column headings.  We accept a single string (one single
    // column) or an array of strings (one or more columns).
    if (qx.lang.Type.isString(headings)) {
      headings = [ headings ];
    }

    custom.dataModel.setColumns(headings);
    custom.dataModel.setTreeColumn(custom.treeColumn);

    // Save a reference to the tree with the data model
    custom.dataModel.setTree(this);

    // Call our superclass constructor
    this.base(arguments, custom.dataModel, custom);

    // Arrange to redisplay edited data following editing
    this.addListener("dataEdited",
                     function(e)
                     {
                       this.getDataModel().setData();
                     },
                     this);

    // By default, present the column visibility button only if there are
    // multiple columns.
    this.setColumnVisibilityButtonVisible(headings.length > 1);

    // Set sizes
    this.setRowHeight(16);
    this.setMetaColumnCounts(headings.length > 1 ? [ 1, -1 ] : [ 1 ]);

    // Overflow on trees is always hidden.  The internal elements scroll.
    this.setOverflow("hidden");

    // Set the data cell render.  We use the SimpleTreeDataCellRenderer for the
    // tree column, and our DefaultDataCellRenderer for all other columns.
    var stdcr = custom.treeDataCellRenderer;
    var ddcr = custom.defaultDataCellRenderer;
    var tcm = this.getTableColumnModel();
    var treeCol = this.getDataModel().getTreeColumn();

    for (var i=0; i<headings.length; i++)
    {
      tcm.setDataCellRenderer(i, i == treeCol ? stdcr : ddcr);
    }

    // Set the data row renderer.
    this.setDataRowRenderer(custom.dataRowRenderer);

    // Move the focus with the mouse.  This controls the ROW focus indicator.
    this.setFocusCellOnMouseMove(true);

    // In a tree we don't typically want a visible cell focus indicator
    this.setShowCellFocusIndicator(false);

    // Get the list of pane scrollers
    var scrollers = this._getPaneScrollerArr();

    // For each scroller...
    for (var i=0; i<scrollers.length; i++)
    {
      // Set the pane scrollers to handle the selection before
      // displaying the focus, so we can manipulate the selected icon.
      scrollers[i].setSelectBeforeFocus(true);
    }
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /**
     * Fired when a tree branch which already has content is opened.
     *
     * Event data: the node object from the data model (of the node
     * being opened) as described in
     * {@link qx.ui.treevirtual.SimpleTreeDataModel}
     */
    "treeOpenWithContent" : "qx.event.type.Data",

    /**
     * Fired when an empty tree branch is opened.
     *
     * Event data: the node object from the data model (of the node
     * being opened) as described in
     * {@link qx.ui.treevirtual.SimpleTreeDataModel}
     */
    "treeOpenWhileEmpty"  : "qx.event.type.Data",

    /**
     * Fired when a tree branch is closed.
     *
     * Event data: the node object from the data model (of the node
     * being closed) as described in
     * {@link qx.ui.treevirtual.SimpleTreeDataModel}
     */
    "treeClose"           : "qx.event.type.Data",

    /**
     * Fired when the selected rows change.
     *
     * Event data: An array of node objects (the selected rows' nodes)
     * from the data model.  Each node object is described in
     * {@link qx.ui.treevirtual.SimpleTreeDataModel}
     */
    "changeSelection"     : "qx.event.type.Data"
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Selection Modes {int}
     *
     *   NONE
     *     Nothing can ever be selected.
     *
     *   SINGLE
     *     Allow only one selected item.
     *
     *   SINGLE_INTERVAL
     *     Allow one contiguous interval of selected items.
     *
     *   MULTIPLE_INTERVAL
     *     Allow any set of selected items, whether contiguous or not.
     *
     *   MULTIPLE_INTERVAL_TOGGLE
     *     Like MULTIPLE_INTERVAL, but clicking on an item toggles its selection state.
     */
    SelectionMode :
    {
      NONE :
        qx.ui.table.selection.Model.NO_SELECTION,
      SINGLE :
        qx.ui.table.selection.Model.SINGLE_SELECTION,
      SINGLE_INTERVAL :
        qx.ui.table.selection.Model.SINGLE_INTERVAL_SELECTION,
      MULTIPLE_INTERVAL :
        qx.ui.table.selection.Model.MULTIPLE_INTERVAL_SELECTION,
      MULTIPLE_INTERVAL_TOGGLE :
        qx.ui.table.selection.Model.MULTIPLE_INTERVAL_SELECTION_TOGGLE
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Whether a click on the open/close button should also cause selection of
     * the row.
     */
    openCloseClickSelectsRow :
    {
      check : "Boolean",
      init : false
    },

    appearance :
    {
      refine : true,
      init : "treevirtual"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Return the data model for this tree.
     *
     * @return {qx.ui.table.ITableModel} The data model.
     */
    getDataModel : function()
    {
      return this.getTableModel();
    },


    /**
     * Set whether lines linking tree children shall be drawn on the tree.
     * Note that not all themes support tree lines.  As of the time of this
     * writing, the Classic theme supports tree lines (and uses +/- icons
     * which lend themselves to tree lines), while the Modern theme, which
     * uses right-facing and downward-facing arrows instead of +/-, does not.
     *
     * @param b {Boolean}
     *   <i>true</i> if tree lines should be shown; <i>false</i> otherwise.
     *
     * @return {void}
     */
    setUseTreeLines : function(b)
    {
      var dataModel = this.getDataModel();
      var treeCol = dataModel.getTreeColumn();
      var dcr = this.getTableColumnModel().getDataCellRenderer(treeCol);
      dcr.setUseTreeLines(b);

      // Inform the listeners
      if (dataModel.hasListener("dataChanged"))
      {
        var data =
        {
          firstRow    : 0,
          lastRow     : dataModel.getRowCount() - 1,
          firstColumn : 0,
          lastColumn  : dataModel.getColumnCount() - 1
        };

        dataModel.fireDataEvent("dataChanged", data);
      }
    },


    /**
     * Get whether lines linking tree children shall be drawn on the tree.
     *
     * @return {Boolean}
     *   <i>true</i> if tree lines are in use;
     *   <i>false</i> otherwise.
     */
    getUseTreeLines : function()
    {
      var treeCol = this.getDataModel().getTreeColumn();
      var dcr = this.getTableColumnModel().getDataCellRenderer(treeCol);
      return dcr.getUseTreeLines();
    },


    /**
     * Set whether the open/close button should be displayed on a branch,
     * even if the branch has no children.
     *
     * @param b {Boolean}
     *   <i>true</i> if the open/close button should be shown;
     *   <i>false</i> otherwise.
     *
     * @return {void}
     */
    setAlwaysShowOpenCloseSymbol : function(b)
    {
      var dataModel = this.getDataModel();
      var treeCol = dataModel.getTreeColumn();
      var dcr = this.getTableColumnModel().getDataCellRenderer(treeCol);
      dcr.setAlwaysShowOpenCloseSymbol(b);

      // Inform the listeners
      if (dataModel.hasListener("dataChanged"))
      {
        var data =
        {
          firstRow    : 0,
          lastRow     : dataModel.getRowCount() - 1,
          firstColumn : 0,
          lastColumn  : dataModel.getColumnCount() - 1
        };

        dataModel.fireDataEvent("dataChanged", data);
      }
    },


    /**
     * Set whether drawing of first-level tree-node lines are disabled even
     * if drawing of tree lines is enabled.
     *
     * @param b {Boolean}
     *   <i>true</i> if first-level tree lines should be disabled;
     *   <i>false</i> for normal operation.
     *
     * @return {void}
     */
    setExcludeFirstLevelTreeLines : function(b)
    {
      var dataModel = this.getDataModel();
      var treeCol = dataModel.getTreeColumn();
      var dcr = this.getTableColumnModel().getDataCellRenderer(treeCol);
      dcr.setExcludeFirstLevelTreeLines(b);

      // Inform the listeners
      if (dataModel.hasListener("dataChanged"))
      {
        var data =
        {
          firstRow    : 0,
          lastRow     : dataModel.getRowCount() - 1,
          firstColumn : 0,
          lastColumn  : dataModel.getColumnCount() - 1
        };

        dataModel.fireDataEvent("dataChanged", data);
      }
    },


    /**
     * Get whether drawing of first-level tree lines should be disabled even
     * if drawing of tree lines is enabled.
     * (See also {@link #getUseTreeLines})
     *
     * @return {Boolean}
     *   <i>true</i> if tree lines are in use;
     *   <i>false</i> otherwise.
     */
    getExcludeFirstLevelTreeLines : function()
    {
      var treeCol = this.getDataModel().getTreeColumn();
      var dcr = this.getTableColumnModel().getDataCellRenderer(treeCol);
      return dcr.getExcludeFirstLevelTreeLines();
    },


    /**
     * Set whether the open/close button should be displayed on a branch,
     * even if the branch has no children.
     *
     * @return {Boolean}
     *   <i>true</i> if tree lines are in use;
     *   <i>false</i> otherwise.
     */
    getAlwaysShowOpenCloseSymbol : function()
    {
      var treeCol = this.getDataModel().getTreeColumn();
      var dcr = this.getTableColumnModel().getDataCellRenderer(treeCol);
      return dcr.getAlwaysShowOpenCloseSymbol();
    },


    /**
     * Set the selection mode.
     *
     * @param mode {Integer}
     *   The selection mode to be used.  It may be any of:
     *     <pre>
     *       qx.ui.treevirtual.TreeVirtual.SelectionMode.NONE:
     *          Nothing can ever be selected.
     *
     *       qx.ui.treevirtual.TreeVirtual.SelectionMode.SINGLE
     *          Allow only one selected item.
     *
     *       qx.ui.treevirtual.TreeVirtual.SelectionMode.SINGLE_INTERVAL
     *          Allow one contiguous interval of selected items.
     *
     *       qx.ui.treevirtual.TreeVirtual.SelectionMode.MULTIPLE_INTERVAL
     *          Allow any selected items, whether contiguous or not.
     *     </pre>
     *
     * @return {void}
     */
    setSelectionMode : function(mode)
    {
      this.getSelectionModel().setSelectionMode(mode);
    },


    /**
     * Get the selection mode currently in use.
     *
     * @return {Integer}
     *   One of the values documented in {@link #setSelectionMode}
     */
    getSelectionMode : function()
    {
      return this.getSelectionModel().getSelectionMode();
    },


    /**
     * Obtain the entire hierarchy of labels from the root down to the
     * specified node.
     *
     * @param nodeReference {Object | Integer}
     *   The node for which the hierarchy is desired.  The node can be
     *   represented either by the node object, or the node id (as would have
     *   been returned by addBranch(), addLeaf(), etc.)
     *
     * @return {Array}
     *   The returned array contains one string for each label in the
     *   hierarchy of the node specified by the parameter.  Element 0 of the
     *   array contains the label of the root node, element 1 contains the
     *   label of the node immediately below root in the specified node's
     *   hierarchy, etc., down to the last element in the array contain the
     *   label of the node referenced by the parameter.
     */
    getHierarchy : function(nodeReference)
    {
      var _this = this;
      var components = [];
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

      function addHierarchy(nodeId)
      {
        // If we're at the root...
        if (! nodeId)
        {
          // ... then we're done
          return ;
        }

        // Get the requested node
        var node = _this.getDataModel().getData()[nodeId];

        // Add its label to the hierarchy components
        components.unshift(node.label);

        // Call recursively to our parent node.
        addHierarchy(node.parentNodeId);
      }

      addHierarchy(nodeId);
      return components;
    },


    /**
     * Return the nodes that are currently selected.
     *
     * @return {Array}
     *   An array containing the nodes that are currently selected.
     */
    getSelectedNodes : function()
    {
      return this.getDataModel().getSelectedNodes();
    },


    /**
     * Event handler. Called when a key was pressed.
     *
     * We handle the Enter key to toggle opened/closed tree state.  All
     * other keydown events are passed to our superclass.
     *
     * @param evt {Map}
     *   The event.
     *
     * @return {void}
     */
    _onKeyPress : function(evt)
    {
      if (!this.getEnabled())
      {
        return;
      }

      var identifier = evt.getKeyIdentifier();

      var consumed = false;
      var modifiers = evt.getModifiers();

      if (modifiers == 0)
      {
        switch(identifier)
        {
          case "Enter":
            // Get the data model
            var dm = this.getDataModel();

            var focusedCol = this.getFocusedColumn();
            var treeCol = dm.getTreeColumn();

            if (focusedCol == treeCol)
            {
              // Get the focused node
              var focusedRow = this.getFocusedRow();
              var node = dm.getNode(focusedRow);

              if (! node.bHideOpenClose &&
                  node.type != qx.ui.treevirtual.SimpleTreeDataModel.Type.LEAF)
              {
                dm.setState(node, { bOpened : ! node.bOpened });
              }

              consumed = true;
            }
            break;

          case "Left":
            this.moveFocusedCell(-1, 0);
            break;

          case "Right":
            this.moveFocusedCell(1, 0);
            break;
        }
      }
      else if (modifiers == qx.event.type.Dom.CTRL_MASK)
      {
        switch(identifier)
        {
          case "Left":
            // Get the data model
            var dm = this.getDataModel();

            // Get the focused node
            var focusedRow = this.getFocusedRow();
            var treeCol = dm.getTreeColumn();
            var node = dm.getNode(focusedRow);

            // If it's an open branch and open/close is allowed...
            if ((node.type ==
                 qx.ui.treevirtual.SimpleTreeDataModel.Type.BRANCH) &&
                ! node.bHideOpenClose &&
                node.bOpened)
            {
              // ... then close it
              dm.setState(node, { bOpened : ! node.bOpened });
            }

            // Reset the focus to the current node
            this.setFocusedCell(treeCol, focusedRow, true);

            consumed = true;
            break;

          case "Right":
            // Get the data model
            var dm = this.getDataModel();

            // Get the focused node
            focusedRow = this.getFocusedRow();
            treeCol = dm.getTreeColumn();
            node = dm.getNode(focusedRow);

            // If it's a closed branch and open/close is allowed...
            if ((node.type ==
                 qx.ui.treevirtual.SimpleTreeDataModel.Type.BRANCH) &&
                ! node.bHideOpenClose &&
                ! node.bOpened)
            {
              // ... then open it
              dm.setState(node, { bOpened : ! node.bOpened });
            }

            // Reset the focus to the current node
            this.setFocusedCell(treeCol, focusedRow, true);

            consumed = true;
            break;
        }
      }
      else if (modifiers == qx.event.type.Dom.SHIFT_MASK)
      {
        switch(identifier)
        {
          case "Left":
            // Get the data model
            var dm = this.getDataModel();

            // Get the focused node
            var focusedRow = this.getFocusedRow();
            var treeCol = dm.getTreeColumn();
            var node = dm.getNode(focusedRow);

            // If we're not at the top-level already...
            if (node.parentNodeId)
            {
              // Find out what rendered row our parent node is at
              var rowIndex = dm.getRowFromNodeId(node.parentNodeId);

              // Set the focus to our parent
              this.setFocusedCell(this._focusedCol, rowIndex, true);
            }

            consumed = true;
            break;

          case "Right":
            // Get the data model
            var dm = this.getDataModel();

            // Get the focused node
            focusedRow = this.getFocusedRow();
            treeCol = dm.getTreeColumn();
            node = dm.getNode(focusedRow);

            // If we're on a branch and open/close is allowed...
            if ((node.type ==
                 qx.ui.treevirtual.SimpleTreeDataModel.Type.BRANCH) &&
                ! node.bHideOpenClose)
            {
              // ... then first ensure the branch is open
              if (! node.bOpened)
              {
                dm.setState(node, { bOpened : ! node.bOpened });
              }

              // If this node has children...
              if (node.children.length > 0)
              {
                // ... then move the focus to the first child
                this.moveFocusedCell(0, 1);
              }
            }

            consumed = true;
            break;
        }
      }

      // Was this one of our events that we handled?
      if (consumed)
      {
        // Yup.  Don't propagate it.
        evt.preventDefault();
        evt.stopPropagation();
      }
      else
      {
        // It's not one of ours.  Let our superclass handle this event
        this.base(arguments, evt);
      }
    },


    /**
     * Event handler. Called when the selection has changed.
     *
     * @param evt {Map}
     *   The event.
     *
     * @return {void}
     */
    _onSelectionChanged : function(evt)
    {
      // Clear the old list of selected nodes
      this.getDataModel()._clearSelections();

      // If selections are allowed, pass an event to our listeners
      if (this.getSelectionMode() !=
          qx.ui.treevirtual.TreeVirtual.SelectionMode.NONE)
      {
        var selectedNodes = this._calculateSelectedNodes();

        // Get the now-focused
        this.fireDataEvent("changeSelection", selectedNodes);
      }

      // Call the superclass method
      this.base(arguments, evt);
    },


    /**
     * Calculate and return the set of nodes which are currently selected by
     * the user, on the screen.  In the process of calculating which nodes
     * are selected, the nodes corresponding to the selected rows on the
     * screen are marked as selected by setting their <i>bSelected</i>
     * property to true, and all previously-selected nodes have their
     * <i>bSelected</i> property reset to false.
     *
     * @return {Array}
     *   An array of nodes matching the set of rows which are selected on the
     *   screen.
     */
    _calculateSelectedNodes : function()
    {
      // Create an array of nodes that are now selected
      var stdcm = this.getDataModel();
      var selectedRanges = this.getSelectionModel().getSelectedRanges();
      var selectedNodes = [];
      var node;

      for (var i=0;
           i<selectedRanges.length;
           i++)
      {
        for (var j=selectedRanges[i].minIndex;
             j<=selectedRanges[i].maxIndex;
             j++)
        {
          node = stdcm.getNode(j);
          stdcm.setState(node, { bSelected : true });
          selectedNodes.push(node);
        }
      }

      return selectedNodes;
    },


    /**
     * Set the overflow mode.
     *
     * @param s {String}
     *   Overflow mode.  The only allowable mode is "hidden".
     *
     * @return {void}
     *
     * @throws {Error}
     *   Error if tree overflow mode is other than "hidden"
     */
    setOverflow : function(s)
    {
      if (s != "hidden")
      {
        throw new Error("Tree overflow must be hidden.  " +
                        "The internal elements of it will scroll.");
      }
    }
  }
});
