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

/* ************************************************************************

#module(treevirtual)

************************************************************************ */

/**
 * A "virtual" tree
 * <p>
 * WARNING: This widget is still in development and the interface to it is
 *          likely to change.  If you choose to use this widget, be aware that
 *          you may need to make manual changes in accordance with interface
 *          changes.
 * </p>
 * <p>
 *   A number of convenience methods are available in the following mixins:
 *   <ul>
 *     <li>{@link qx.ui.treevirtual.MNode}</li>
 *     <li>{@link qx.ui.treevirtual.MFamily}</li>
 *   </ul>
 * </p>
 *
 * @appearance treevirtual-focus-indicator {qx.ui.layout.HorizontalBoxLayout}
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
   *     <dt>dataModel</dt>
   *       <dd>new qx.ui.treevirtual.SimpleTreeDataModel()</dd>
   *     <dt>treeDataCellRenderer</dt>
   *       <dd>new qx.ui.treevirtual.SimpleTreeDataCellRenderer()</dd>
   *     <dt>defaultDataCellRenderer</dt>
   *       <dd>new qx.ui.treevirtual.DefaultDataCellRenderer()</dd>
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

    if (custom.treeColumn === undefined)
    {
      custom.treeColumn = 0;
    }

    if (! custom.dataModel)
    {
      custom.dataModel =
        new qx.ui.treevirtual.SimpleTreeDataModel();
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
    if (typeof(headings) == "string")
    {
      headings = [ headings ];
    }

    custom.dataModel.setColumns(headings);
    custom.dataModel.setTreeColumn(custom.treeColumn);

    // Save a reference to the tree with the data model
    custom.dataModel.setTree(this);

    // Call our superclass constructor
    this.base(arguments, custom.dataModel, custom);

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
    var treeCol = this.getTableModel().getTreeColumn();

    for (var i=0; i<headings.length; i++)
    {
      tcm.setDataCellRenderer(i, i == treeCol ? stdcr : ddcr);
    }

    // Set the data row renderer.
    this.setDataRowRenderer(custom.dataRowRenderer);

    // We need our cell renderer called on selection change, to update the icon
    this.setAlwaysUpdateCells(true);

    // Move the focus with the mouse
    this.setFocusCellOnMouseMove(true);

    // Change focus colors.  Make them less obtrusive.
    this.setRowColors(
      {
        bgcolFocused     : "#f0f0f0",
        bgcolFocusedBlur : "#f0f0f0"
      });

    // Set the cell focus color
    var lightblue = "rgb(" + qx.util.ExtendedColor.toRgb("lightblue") + ")";
    this.setCellFocusAttributes({ backgroundColor : lightblue });

    /*
    // Use this instead, to help determine which does what
    this.setRowColors(
    {
      bgcolFocusedSelected     : "cyan",
      bgcolFocusedSelectedBlur : "green",
      bgcolFocused             : "yellow",
      bgcolFocusedBlur         : "blue",
      bgcolSelected            : "red",
      bgcolSelectedBlur        : "pink",
    });
    */

    // Get the list of pane scrollers
    var scrollers = this._getPaneScrollerArr();

    // For each scroller...
    for (var i=0; i<scrollers.length; i++)
    {
      // ... remove the outline on focus,
      scrollers[i]._focusIndicator.setAppearance("treevirtual-focus-indicator");

      // ... and set the pane scrollers to handle the selection before
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
    "treeOpenWithContent" : "qx.event.type.DataEvent",
    "treeOpenWhileEmpty"  : "qx.event.type.DataEvent",
    "treeClose"           : "qx.event.type.DataEvent",
    "changeSelection"     : "qx.event.type.DataEvent"
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /*
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
     */

    SelectionMode :
    {
      NONE             : qx.ui.table.selection.Model.NO_SELECTION,
      SINGLE           : qx.ui.table.selection.Model.SINGLE_SELECTION,
      SINGLE_INTERVAL  : qx.ui.table.selection.Model.SINGLE_INTERVAL_SELECTION,
      MULTIPLE_INTERVAL: qx.ui.table.selection.Model.MULTIPLE_INTERVAL_SELECTION
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
     * @type member
     * @return {var} TODOC
     */
    getDataModel : function()
    {
      return this.getTableModel();
    },


    /**
     * Set whether lines linking tree children shall be drawn on the tree.
     *
     * @type member
     *
     * @param b {Boolean}
     *   <i>true</i> if tree lines should be shown; <i>false</i> otherwise.
     *
     * @return {void}
     */
    setUseTreeLines : function(b)
    {
      var stdcm = this.getTableModel();
      var treeCol = stdcm.getTreeColumn();
      var dcr = this.getTableColumnModel().getDataCellRenderer(treeCol);
      dcr.setUseTreeLines(b);

      // Inform the listeners
      if (stdcm.hasEventListeners("dataChanged"))
      {
        var data =
        {
          firstRow    : 0,
          lastRow     : stdcm._rowArr.length - 1,
          firstColumn : 0,
          lastColumn  : stdcm.getColumnCount() - 1
        };

        stdcm.dispatchEvent(new qx.event.type.DataEvent("dataChanged", data),
                            true);
      }
    },


    /**
     * Get whether lines linking tree children shall be drawn on the tree.
     *
     * @type member
     *
     * @return {Boolean}
     *   <i>true</i> if tree lines are in use;
     *   <i>false</i> otherwise.
     */
    getUseTreeLines : function()
    {
      var treeCol = this.getTableModel().getTreeColumn();
      var dcr = this.getTableColumnModel().getDataCellRenderer(treeCol);
      return dcr.getUseTreeLines();
    },


    /**
     * Set whether the open/close button should be displayed on a branch,
     * even if the branch has no children.
     *
     * @type member
     *
     * @param b {Boolean}
     *   <i>true</i> if the open/close button should be shown;
     *   <i>false</i> otherwise.
     *
     * @return {void}
     */
    setAlwaysShowOpenCloseSymbol : function(b)
    {
      var stdcm = this.getTableModel();
      var treeCol = stdcm.getTreeColumn();
      var dcr = this.getTableColumnModel().getDataCellRenderer(treeCol);
      dcr.setAlwaysShowOpenCloseSymbol(b);

      // Inform the listeners
      if (stdcm.hasEventListeners("dataChanged"))
      {
        var data =
        {
          firstRow    : 0,
          lastRow     : stdcm._rowArr.length - 1,
          firstColumn : 0,
          lastColumn  : stdcm.getColumnCount() - 1
        };

        stdcm.dispatchEvent(new qx.event.type.DataEvent("dataChanged", data),
                            true);
      }
    },


    /**
     * Set whether drawing of first-level tree-node lines are disabled even
     * if drawing of tree lines is enabled.
     *
     * @type member
     *
     * @param b {Boolean}
     *   <i>true</i> if first-level tree lines should be disabled;
     *   <i>false</i> for normal operation.
     *
     * @return {void}
     */
    setExcludeFirstLevelTreeLines : function(b)
    {
      var stdcm = this.getTableModel();
      var treeCol = stdcm.getTreeColumn();
      var dcr = this.getTableColumnModel().getDataCellRenderer(treeCol);
      dcr.setExcludeFirstLevelTreeLines(b);

      // Inform the listeners
      if (stdcm.hasEventListeners("dataChanged"))
      {
        var data =
        {
          firstRow    : 0,
          lastRow     : stdcm._rowArr.length - 1,
          firstColumn : 0,
          lastColumn  : stdcm.getColumnCount() - 1
        };

        stdcm.dispatchEvent(new qx.event.type.DataEvent("dataChanged", data),
                            true);
      }
    },


    /**
     * Get whether drawing of first-level tree lines should be disabled even
     * if drawing of tree lines is enabled.
     * (See also {@link #getUseTreeLines})
     *
     * @type member
     *
     * @return {Boolean}
     *   <i>true</i> if tree lines are in use;
     *   <i>false</i> otherwise.
     */
    getExcludeFirstLevelTreeLines : function()
    {
      var treeCol = this.getTableModel().getTreeColumn();
      var dcr = this.getTableColumnModel().getDataCellRenderer(treeCol);
      return dcr.getExcludeFirstLevelTreeLines();
    },


    /**
     * Set whether the open/close button should be displayed on a branch,
     * even if the branch has no children.
     *
     * @type member
     *
     * @return {Boolean}
     *   <i>true</i> if tree lines are in use;
     *   <i>false</i> otherwise.
     */
    getAlwaysShowOpenCloseSymbol : function()
    {
      var treeCol = this.getTableModel().getTreeColumn();
      var dcr = this.getTableColumnModel().getDataCellRenderer(treeCol);
      return dcr.getAlwaysShowOpenCloseSymbol();
    },


    /**
     * Set the selection mode.
     *
     * @type member
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
     * @type member
     *
     * @param mode {var} TODOC
     *
     * @return {Integer}
     *   One of the values documented in {@link #setSelectionMode}
     */
    getSelectionMode : function(mode)
    {
      return this.getSelectionModel().getSelectionMode();
    },


    /**
     * Set the attributes used to indicate the cell that has the focus.
     *
     * @type member
     *
     * @param attributes {Map}
     *   The set of attributes that the cell focus indicator should have.
     *   This is in the format required to call the <i>set()</i> method of a
     *   widget, e.g.
     *
     *     { backgroundColor: blue }
     *
     *   If not otherwise specified, the opacity is set to 0.2 so that the
     *   cell data can be seen "through" the cell focus indicator which
     *   overlays it.
     *
     *   For no visible focus indicator, use:
     *
     *     { backgroundColor : "transparent" }
     *
     *   The focus indicator is a box the size of the cell, which overlays
     *   the cell itself.  There is no text in the focus indicator itself,
     *   so it makes no sense to set the color attribute or any other
     *   attribute that affects fonts.
     *
     * @return {void}
     */
    setCellFocusAttributes : function(attributes)
    {
      // Add an opacity attribute so what's below the focus can be seen
      if (!attributes.opacity)
      {
        attributes.opacity = 0.2;
      }

      var scrollers = this._getPaneScrollerArr();

      for (var i=0; i<scrollers.length; i++)
      {
        scrollers[i]._focusIndicator.set(attributes);
      }
    },


    /**
     * Obtain the entire hierarchy of labels from the root down to the
     * specified node.
     *
     * @type member
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
        var node = _this.getTableModel().getData()[nodeId];

        // Add its label to the hierarchy components
        components.unshift(node.label);

        // Call recursively to our parent node.
        addHierarchy(node.parentNodeId);
      }

      addHierarchy(nodeId);
      return components;
    },


    /**
     * Allow setting the tree row colors.
     *
     * @type member
     * @param colors {Map}
     *   The value of each property in the map is a string containing either a
     *   number (e.g. "#518ad3") or color name ("white") representing the
     *   color for that type of display.  The map may contain any or all of
     *   the following properties:
     *      <ul>
     *        <li>bgcolFocusedSelected</li>
     *        <li>bgcolFocusedSelectedBlur</li>
     *        <li>bgcolFocused</li>
     *        <li>bgcolFocusedBlur</li>
     *        <li>bgcolSelected</li>
     *        <li>bgcolSelectedBlur</li>
     *        <li>bgcolEven</li>
     *        <li>bgcolOdd</li>
     *        <li>colSelected</li>
     *        <li>colNormal</li>
     *      </ul>
     * @return {void}
     */
    setRowColors : function(colors)
    {
      this.getDataRowRenderer().setRowColors(colors);
    },


    /**
     * Return the nodes that are currently selected.
     *
     * @type member
     *
     * @return {Array}
     *   An array containing the nodes that are currently selected.
     */
    getSelectedNodes : function()
    {
      return this.getTableModel().getSelectedNodes();
    },


    /**
     * Event handler. Called when a key was pressed.
     *
     * We handle the Enter key to toggle opened/closed tree state.  All
     * other keydown events are passed to our superclass.
     *
     * @type member
     *
     * @param evt {Map}
     *   The event.
     *
     * @return {void}
     */
    _onkeydown : function(evt)
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
            var dm = this.getTableModel();

            var focusedCol = this.getFocusedColumn();
            var treeCol = dm.getTreeColumn();

            if (focusedCol == treeCol)
            {
              // Get the focused node
              var focusedRow = this.getFocusedRow();
              var node = dm.getValue(treeCol, focusedRow);

              if (! node.bHideOpenClose)
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
      else if (modifiers == qx.event.type.DomEvent.CTRL_MASK)
      {
        switch(identifier)
        {
          case "Left":
            // Get the data model
            var dm = this.getTableModel();

            // Get the focused node
            var focusedRow = this.getFocusedRow();
            var treeCol = dm.getTreeColumn();
            var node = dm.getValue(treeCol, focusedRow);

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
            var dm = this.getTableModel();

            // Get the focused node
            var focusedRow = this.getFocusedRow();
            var treeCol = dm.getTreeColumn();
            var node = dm.getValue(treeCol, focusedRow);

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
      else if (modifiers == qx.event.type.DomEvent.SHIFT_MASK)
      {
        switch(identifier)
        {
          case "Left":
            // Get the data model
            var dm = this.getTableModel();

            // Get the focused node
            var focusedRow = this.getFocusedRow();
            var treeCol = dm.getTreeColumn();
            var node = dm.getValue(treeCol, focusedRow);

            // If we're not at the top-level already...
            if (node.parentNodeId)
            {
              // Find out what rendered row our parent node is at
              var rowIndex = dm.getNodeRowMap()[node.parentNodeId];

              // Set the focus to our parent
              this.setFocusedCell(this._focusedCol, rowIndex, true);
            }

            consumed = true;
            break;

          case "Right":
            // Get the data model
            var dm = this.getTableModel();

            // Get the focused node
            var focusedRow = this.getFocusedRow();
            var treeCol = dm.getTreeColumn();
            var node = dm.getValue(treeCol, focusedRow);

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
     * TODOC
     *
     * @type member
     * @param evt {Event} TODOC
     * @return {void}
     */
    _onkeypress : function(evt)
    {
      if (!this.getEnabled())
      {
        return;
      }

      var consumed = false;

      // Handle keys that are independant from the modifiers
      var identifier = evt.getKeyIdentifier();

      switch(identifier)
      {
        // Ignore events we already handled in _onkeydown
        case "Left":
        case "Right":
          consumed = true;
          break;
      }

      if (consumed)
      {
        evt.preventDefault();
        evt.stopPropagation();
      }
      else
      {
        // Let our superclass handle this event
        this.base(arguments, evt);
      }
    },


    /**
     * Event handler. Called when the selection has changed.
     *
     * @type member
     *
     * @param evt {Map}
     *   The event.
     *
     * @return {void}
     */
    _onSelectionChanged : function(evt)
    {
      // Clear the old list of selected nodes
      this.getTableModel()._clearSelections();

      // If selections are allowed, pass an event to our listeners
      if (this.getSelectionMode() !=
          qx.ui.treevirtual.TreeVirtual.SelectionMode.NONE)
      {
        var selectedNodes = this._calculateSelectedNodes();

        // Get the now-focused
        this.createDispatchDataEvent("changeSelection", selectedNodes);
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
     * @type member
     *
     * @return {Array}
     *   An array of nodes matching the set of rows which are selected on the
     *   screen.
     */
    _calculateSelectedNodes : function()
    {
      // Create an array of nodes that are now selected
      var stdcm = this.getTableModel();
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
          node = stdcm.getValue(stdcm.getTreeColumn(), j);
          stdcm.setState(node, { bSelected : true });
          selectedNodes.push(node);
        }
      }

      return selectedNodes;
    },


    /**
     * @type member
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
    },


    /**
     * Set state attributes of a tree node.
     *
     * @type member
     *
     * @deprecated Use {@link qx.ui.treevirtual.MNode.nodeSetState} instead.
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
     * @return {void}
     */
    setState : function(nodeReference, attributes)
    {
      throw new Error("setState() is deprecated: " +
                      "Replace with nodeSetState() in mixin MNode");
    },


    /**
     * Toggle the opened state of the node: if the node is opened, close
     * it; if it is closed, open it.
     *
     * @type member
     *
     * @deprecated
     *    Use {@link qx.ui.treevirtual.MNode.nodeSetOpened} or
     *    {@link qx.ui.treevirtual.MNode.nodeSetOpened} instead.
     *
     * @param nodeReference {Object | Integer}
     *   The node to have its opened/closed state toggled.  The node can be
     *   represented either by the node object, or the node id (as would have
     *   been returned by addBranch(), addLeaf(), etc.)
     *
     * @return {void}
     */
    toggleOpened : function(nodeReference)
    {
      throw new Error("toggleOpened() is deprecated. " +
                      "Replace with nodeToggleOpened() or consider using " +
                      "new method nodeSetOpened(), both in mixin " +
                      "MNode.");
    },


    /**
     * Get the first child of the specified node.
     *
     * @type member
     *
     * @deprecated
     *   Use {@link qx.ui.treevirtual.MFamily.familyGetFirstChild} instead.
     *
     * @param nodeReference {Object | Integer}
     *   The node for which the first child is desired.  The node can be
     *   represented either by the node object, or the node id (as would have
     *   been returned by addBranch(), addLeaf(), etc.)
     *
     * @return {Integer}
     *   The node id of the first child.
     */
    getFirstChild : function(nodeReference)
    {
      throw new Error("getFirstChild is deprecated. " +
                      "Replace with familyGetFirstChild in mixin MFamily");
    },


    /**
     * Get the last child of the specified node.
     *
     * @type member
     *
     * @deprecated
     *   Use {@link qx.ui.treevirtual.MFamily.familyGetLastChild} instead.
     *
     * @param nodeReference {Object | Integer}
     *   The node for which the last child is desired.  The node can be
     *   represented either by the node object, or the node id (as would have
     *   been returned by addBranch(), addLeaf(), etc.)
     *
     * @return {Integer}
     *   The node id of the last child.
     */
    getLastChild : function(nodeReference)
    {
      throw new Error("getLastChild is deprecated. " +
                      "Replace with familyGetLastChild in mixin MFamily");
    },


    /**
     * Get the next sibling of the specified node.
     *
     * @type member
     *
     * @deprecated
     *   Use {@link qx.ui.treevirtual.MFamily.familyGetNextSibling} instead.
     *
     * @param nodeReference {Object | Integer}
     *   The node for which the next sibling is desired.  The node can be
     *   represented either by the node object, or the node id (as would have
     *   been returned by addBranch(), addLeaf(), etc.)
     *
     * @return {Integer}
     *   The node id of the next sibling.
     */
    getNextSibling : function(nodeReference)
    {
      throw new Error("getNextSibling is deprecated. " +
                      "Replace with familyGetNextSibling in mixin MFamily");
    },


    /**
     * Get the previous sibling of the specified node.
     *
     * @type member
     *
     * @deprecated
     *   Use {@link qx.ui.treevirtual.MFamily.familyGetPrevSibling} instead.
     *
     * @param nodeReference {Object | Integer}
     *   The node for which the previous sibling is desired.  The node can be
     *   represented either by the node object, or the node id (as would have
     *   been returned by addBranch(), addLeaf(), etc.)
     *
     * @return {Integer}
     *   The node id of the previous sibling.
     */
    getPrevSibling : function(nodeReference)
    {
      throw new Error("getPrevSibling is deprecated. " +
                      "Replace with familyGetPrevSibling in mixin MFamily");
    }
  }
});
