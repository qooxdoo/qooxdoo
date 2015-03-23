/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * Virtual tree implementation.
 *
 * The virtual tree can be used to render node and leafs. Nodes and leafs are
 * both items for a tree. The difference between a node and a leaf is that a
 * node has child items, but a leaf not.
 *
 * With the {@link qx.ui.tree.core.IVirtualTreeDelegate} interface it is possible
 * to configure the tree's behavior (item renderer configuration, etc.).
 *
 * Here's an example of how to use the widget:
 * <pre class="javascript">
 * //create the model data
 * var nodes = [];
 * for (var i = 0; i < 2500; i++)
 * {
 *   nodes[i] = {name : "Item " + i};
 *
 *   // if its not the root node
 *   if (i !== 0)
 *   {
 *     // add the children in some random order
 *     var node = nodes[parseInt(Math.random() * i)];
 *
 *     if(node.children == null) {
 *       node.children = [];
 *     }
 *     node.children.push(nodes[i]);
 *   }
 * }
 *
 * // converts the raw nodes to qooxdoo objects
 * nodes = qx.data.marshal.Json.createModel(nodes, true);
 *
 * // creates the tree
 * var tree = new qx.ui.tree.VirtualTree(nodes.getItem(0), "name", "children").set({
 *   width : 200,
 *   height : 400
 * });
 *
 * //log selection changes
 * tree.getSelection().addListener("change", function(e) {
 *   this.debug("Selection: " + tree.getSelection().getItem(0).getName());
 * }, this);
 * </pre>
 */
qx.Class.define("qx.ui.tree.VirtualTree",
{
  extend : qx.ui.virtual.core.Scroller,
  implement : [qx.ui.tree.core.IVirtualTree, qx.data.controller.ISelection],
  include : [
    qx.ui.virtual.selection.MModel,
    qx.ui.core.MContentPadding
  ],

  /**
   * @param model {qx.core.Object?null} The model structure for the tree, for
   *   more details have a look at the 'model' property.
   * @param labelPath {String?null} The name of the label property, for more
   *   details have a look at the 'labelPath' property.
   * @param childProperty {String?null} The name of the child property, for
   *   more details have a look at the 'childProperty' property.
   */
  construct : function(model, labelPath, childProperty)
  {
    this.base(arguments, 0, 1, 20, 100);

    this._init();

    if (labelPath != null) {
      this.setLabelPath(labelPath);
    }

    if (childProperty != null) {
      this.setChildProperty(childProperty);
    }

    if(model != null) {
      this.initModel(model);
    }

    this.initItemHeight();
    this.initOpenMode();

    this.addListener("keypress", this._onKeyPress, this);
  },

  events :
  {
    /**
     * Fired when a node is opened.
     */
    open : "qx.event.type.Data",


    /**
     * Fired when a node is closed.
     */
    close : "qx.event.type.Data"
  },


  properties :
  {
    // overridden
    appearance :
    {
      refine: true,
      init: "virtual-tree"
    },


    // overridden
    focusable :
    {
      refine: true,
      init: true
    },


    // overridden
    width :
    {
      refine : true,
      init : 100
    },


    // overridden
    height :
    {
      refine : true,
      init : 200
    },


    /** Default item height. */
    itemHeight :
    {
      check : "Integer",
      init : 25,
      apply : "_applyRowHeight",
      themeable : true
    },


    /**
     * Control whether tap or double tap should open or close the tapped
     * item.
     */
    openMode :
    {
      check: ["tap", "dbltap", "none"],
      init: "dbltap",
      apply: "_applyOpenMode",
      event: "changeOpenMode",
      themeable: true
    },


    /**
     * Hides *only* the root node, not the node's children when the property is
     * set to <code>true</code>.
     */
    hideRoot :
    {
      check: "Boolean",
      init: false,
      apply:"_applyHideRoot"
    },


    /**
     * Whether top level items should have an open/close button. The top level
     * item item is normally the root item, but when the root is hidden, the
     * root children are the top level items.
     */
    showTopLevelOpenCloseIcons :
    {
      check : "Boolean",
      init : false,
      apply : "_applyShowTopLevelOpenCloseIcons"
    },


    /**
     * Configures the tree to show also the leafs. When the property is set to
     * <code>false</code> *only* the nodes are shown.
     */
    showLeafs :
    {
      check: "Boolean",
      init: true,
      apply: "_applyShowLeafs"
    },


    /**
     * The name of the property, where the children are stored in the model.
     * Instead of the {@link #labelPath} must the child property a direct
     * property form the model instance.
     */
    childProperty :
    {
      check: "String",
      apply: "_applyChildProperty",
      nullable: true
    },


    /**
     * The name of the property, where the value for the tree folders label
     * is stored in the model classes.
     */
    labelPath :
    {
      check: "String",
      apply: "_applyLabelPath",
      nullable: true
    },


    /**
     * The path to the property which holds the information that should be
     * shown as an icon.
     */
    iconPath :
    {
      check: "String",
      apply: "_applyIconPath",
      nullable: true
    },


    /**
     * A map containing the options for the label binding. The possible keys
     * can be found in the {@link qx.data.SingleValueBinding} documentation.
     */
    labelOptions :
    {
      apply: "_applyLabelOptions",
      nullable: true
    },


    /**
     * A map containing the options for the icon binding. The possible keys
     * can be found in the {@link qx.data.SingleValueBinding} documentation.
     */
    iconOptions :
    {
      apply: "_applyIconOptions",
      nullable: true
    },


    /**
     * The model containing the data (nodes and/or leafs) which should be shown
     * in the tree.
     */
    model :
    {
      check : "qx.core.Object",
      apply : "_applyModel",
      event: "changeModel",
      nullable : true,
      deferredInit : true
    },


    /**
     * Delegation object, which can have one or more functions defined by the
     * {@link qx.ui.tree.core.IVirtualTreeDelegate} interface.
     */
    delegate :
    {
      event: "changeDelegate",
      apply: "_applyDelegate",
      init: null,
      nullable: true
    }
  },


  members :
  {
    /** @type {qx.ui.tree.provider.WidgetProvider} Provider for widget rendering. */
    _provider : null,


    /** @type {qx.ui.virtual.layer.Abstract} Layer which contains the items. */
    _layer : null,


    /**
     * @type {qx.data.Array} The internal lookup table data structure to get the model item
     * from a row.
     */
    __lookupTable : null,


    /** @type {Array} HashMap which contains all open nodes. */
    __openNodes : null,


    /**
     * @type {Array} The internal data structure to get the nesting level from a
     * row.
     */
    __nestingLevel : null,


    /**
     * @type {qx.util.DeferredCall} Adds this instance to the widget queue on a
     * deferred call.
     */
    __deferredCall : null,


    /** @type {Integer} Holds the max item width from a rendered widget. */
    _itemWidth : 0,


    /** @type {Array} internal parent chain form the last selected node */
    __parentChain : null,


    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */


    // overridden
    syncWidget : function(jobs)
    {
      var firstRow = this._layer.getFirstRow();
      var rowSize = this._layer.getRowSizes().length;

      for (var row = firstRow; row < firstRow + rowSize; row++)
      {
        var widget = this._layer.getRenderedCellWidget(row, 0);
        if (widget != null) {
          this._itemWidth = Math.max(this._itemWidth, widget.getSizeHint().width);
        }
      }
      var paneWidth = this.getPane().getInnerSize().width;
      this.getPane().getColumnConfig().setItemSize(0, Math.max(this._itemWidth, paneWidth));
    },


    // Interface implementation
    openNode : function(node)
    {
      this.__openNode(node);
      this.buildLookupTable();
    },


    // Interface implementation
    openNodeWithoutScrolling : function(node)
    {
      var autoscroll = this.getAutoScrollIntoView();
      // suspend automatically scrolling selection into view
      this.setAutoScrollIntoView(false);

      this.openNode(node);

      // re set to original value
      this.setAutoScrollIntoView(autoscroll);
    },


    /**
     * Trigger a rebuild from the internal data structure.
     */
    refresh : function() {
      this.buildLookupTable();
    },


    /**
     * Opens the passed node and all his parents. *Note!* The algorithm
     * implements a depth-first search with a complexity: <code>O(n)</code> and
     * <code>n</code> are all model items.
     *
     * @param node {qx.core.Object} Node to open.
     */
    openNodeAndParents : function(node)
    {
      this.__openNodeAndAllParents(this.getModel(), node);
      this.buildLookupTable();
    },


    // Interface implementation
    closeNode : function(node)
    {
      if (qx.lang.Array.contains(this.__openNodes, node))
      {
        qx.lang.Array.remove(this.__openNodes, node);
        this.fireDataEvent("close", node);
        this.buildLookupTable();
      }
    },


    // Interface implementation
    closeNodeWithoutScrolling : function(node)
    {
      var autoscroll = this.getAutoScrollIntoView();
      // suspend automatically scrolling selection into view
      this.setAutoScrollIntoView(false);

      this.closeNode(node);

      // re set to original value
      this.setAutoScrollIntoView(autoscroll);
    },


    // Interface implementation
    isNodeOpen : function(node) {
      return qx.lang.Array.contains(this.__openNodes, node);
    },


    /*
    ---------------------------------------------------------------------------
      INTERNAL API
    ---------------------------------------------------------------------------
    */


    /**
     * Initializes the virtual tree.
     */
    _init : function()
    {
      this.__lookupTable = new qx.data.Array();
      this.__openNodes = [];
      this.__nestingLevel = [];
      this._initLayer();
    },


    /**
     * Initializes the virtual tree layer.
     */
    _initLayer : function()
    {
      this._provider = new qx.ui.tree.provider.WidgetProvider(this);
      this._layer = this._provider.createLayer();
      this._layer.addListener("updated", this._onUpdated, this);
      this.getPane().addLayer(this._layer);
      this.getPane().addListenerOnce("resize", function(e) {
        // apply width to pane on first rendering pass
        // to avoid visible flickering
        this.getPane().getColumnConfig().setItemSize(0, e.getData().width);
      }, this);
    },


    // Interface implementation
    getLookupTable : function() {
      return this.__lookupTable;
    },


    /**
     * Performs a lookup from model index to row.
     *
     * @param index {Number} The index to look at.
     * @return {Number} The row or <code>-1</code>
     *  if the index is not a model index.
     */
    _reverseLookup : function(index) {
      return index;
    },


    /**
     * Returns the model data for the given row.
     *
     * @param row {Integer} row to get data for.
     * @return {var|null} the row's model data.
     */
    _getDataFromRow : function(row) {
      return this.__lookupTable.getItem(row);
    },

    /**
     * Returns the selectable model items.
     *
     * @return {qx.data.Array} The selectable items.
     */
    _getSelectables : function() {
      return this.__lookupTable;
    },


    /**
     * Returns all open nodes.
     *
     * @internal
     * @return {Array} All open nodes.
     */
    getOpenNodes : function() {
      return this.__openNodes;
    },


    // Interface implementation
    isNode : function(item) {
      return qx.ui.tree.core.Util.isNode(item, this.getChildProperty());
    },


    // Interface implementation
    getLevel : function(row) {
      return this.__nestingLevel[row];
    },


    // Interface implementation
    hasChildren : function(node) {
      return qx.ui.tree.core.Util.hasChildren(node, this.getChildProperty(), !this.isShowLeafs());
    },


    /**
     * Returns the element, to which the content padding should be applied.
     *
     * @return {qx.ui.core.Widget} The content padding target.
     */
    _getContentPaddingTarget : function() {
      return this.getPane();
    },


    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY METHODS
    ---------------------------------------------------------------------------
    */


    // property apply
    _applyRowHeight : function(value, old) {
      this.getPane().getRowConfig().setDefaultItemSize(value);
    },


    // property apply
    _applyOpenMode : function(value, old)
    {
      var pane = this.getPane();

      //"tap", "dbltap", "none"
      if (value === "dbltap") {
        pane.addListener("cellDbltap", this._onOpen, this);
      } else if (value === "tap") {
        pane.addListener("cellTap", this._onOpen, this);
      }

      if (old === "dbltap") {
        pane.removeListener("cellDbltap", this._onOpen, this);
      } else if (old === "tap") {
        pane.removeListener("cellTap", this._onOpen, this);
      }
    },


    // property apply
    _applyHideRoot : function(value, old) {
      this.buildLookupTable();
    },


    // property apply
    _applyShowTopLevelOpenCloseIcons : function(value, old) {
      this.buildLookupTable();
    },


    // property apply
    _applyShowLeafs : function(value, old) {
      this.buildLookupTable();
    },


    // property apply
    _applyChildProperty : function(value, old) {
      this._provider.setChildProperty(value);
    },


    // property apply
    _applyLabelPath : function(value, old) {
      this._provider.setLabelPath(value);
    },


    // property apply
    _applyIconPath : function(value, old) {
      this._provider.setIconPath(value);
    },


    // property apply
    _applyLabelOptions : function(value, old) {
      this._provider.setLabelOptions(value);
    },


    // property apply
    _applyIconOptions : function(value, old) {
      this._provider.setIconOptions(value);
    },


    // property apply
    _applyModel : function(value, old)
    {
      this.__openNodes = [];

      if (value != null)
      {
        if (qx.core.Environment.get("qx.debug"))
        {
          if (!qx.Class.hasMixin(value.constructor,
                qx.data.marshal.MEventBubbling))
          {
            this.warn("The model item doesn't support the Mixin 'qx.data." +
              "marshal.MEventBubbling'. Therefore the tree can not update " +
              "the view automatically on model changes.");
          }
        }
        value.addListener("changeBubble", this._onChangeBubble, this);
        this.__openNode(value);
      }

      if (old != null) {
        old.removeListener("changeBubble", this._onChangeBubble, this);
      }

      this.__applyModelChanges();
    },


    // property apply
    _applyDelegate : function(value, old)
    {
      this._provider.setDelegate(value);
      this.buildLookupTable();
    },


    /*
    ---------------------------------------------------------------------------
      EVENT HANDLERS
    ---------------------------------------------------------------------------
    */


    /**
     * Event handler for the changeBubble event. The handler rebuild the lookup
     * table when the child structure changed.
     *
     * @param event {qx.event.type.Data} The data event.
     */
    _onChangeBubble : function(event)
    {
      var data = event.getData();
      var propertyName = data.name;
      var index = propertyName.lastIndexOf(".");

      if (index != -1) {
        propertyName = propertyName.substr(index + 1, propertyName.length);
      }

      // only continue when the effected property is the child property
      if (qx.lang.String.startsWith(propertyName, this.getChildProperty()))
      {
        var item = data.item;

        if (qx.Class.isSubClassOf(item.constructor, qx.data.Array))
        {
          if (index === -1)
          {
            item = this.getModel();
          }
          else
          {
            var propertyChain = data.name.substr(0, index);
            item = qx.data.SingleValueBinding.resolvePropertyChain(this.getModel(), propertyChain);
          }
        }

        if (this.__lookupTable.indexOf(item) != -1) {
          this.__applyModelChanges();
        }
      }
    },


    /**
     * Event handler for the update event.
     *
     * @param event {qx.event.type.Event} The event.
     */
    _onUpdated : function(event)
    {
      if (this.__deferredCall == null) {
        this.__deferredCall = new qx.util.DeferredCall(function() {
          qx.ui.core.queue.Widget.add(this);
        }, this);
      }
      this.__deferredCall.schedule();
    },


    /**
     * Event handler to open/close tapped nodes.
     *
     * @param event {qx.ui.virtual.core.CellEvent} The cell tap event.
     */
    _onOpen : function(event)
    {
      var row = event.getRow();
      var item = this.__lookupTable.getItem(row);

      if (this.isNode(item))
      {
        if (this.isNodeOpen(item)) {
          this.closeNode(item);
        } else {
          this.openNode(item);
        }
      }
    },


    /**
     * Event handler for key press events. Open and close the current selected
     * item on key left and right press. Jump to parent on key left if already
     * closed.
     *
     * @param e {qx.event.type.KeySequence} key event.
     */
    _onKeyPress : function(e)
    {
      var selection = this.getSelection();

      if (selection.getLength() > 0)
      {
        var item = selection.getItem(0);
        var isNode = this.isNode(item);

        switch(e.getKeyIdentifier())
        {
          case "Left":
            if (isNode && this.isNodeOpen(item)) {
              this.closeNode(item);
            } else {
              var parent = this.getParent(item);
              if (parent != null) {
                selection.splice(0, 1, parent);
              }
            }
            break;

          case "Right":
            if (isNode && !this.isNodeOpen(item)) {
              this.openNode(item);
            }
            else
            {
              if (isNode)
              {
                var children = item.get(this.getChildProperty());
                if (children != null && children.getLength() > 0) {
                  selection.splice(0, 1, children.getItem(0));
                }
              }
            }
            break;

          case "Enter":
          case "Space":
            if (!isNode) {
              return;
            }
            if (this.isNodeOpen(item)) {
              this.closeNode(item);
            } else {
              this.openNode(item);
            }
            break;
        }
      }
    },

    /*
    ---------------------------------------------------------------------------
      SELECTION HOOK METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Hook method which is called from the {@link qx.ui.virtual.selection.MModel}.
     * The hook method sets the first visible parent not as new selection when
     * the current selection is empty and the selection mode is one selection.
     *
     * @param newSelection {Array} The newSelection which will be set to the selection manager.
     */
    _beforeApplySelection : function(newSelection)
    {
      if (newSelection.length === 0 &&
          this.getSelectionMode() === "one")
      {
        var visibleParent = this.__getVisibleParent();
        var row = this.getLookupTable().indexOf(visibleParent);

        if (row >= 0) {
          newSelection.push(row);
        }
      }
    },


    /**
     * Hook method which is called from the {@link qx.ui.virtual.selection.MModel}.
     * The hook method builds the parent chain form the current selected item.
     */
    _afterApplySelection : function()
    {
      var selection = this.getSelection();

      if (selection.getLength() > 0 &&
          this.getSelectionMode() === "one") {
        this.__buildParentChain(selection.getItem(0));
      } else {
        this.__parentChain = [];
      }
    },


    /*
    ---------------------------------------------------------------------------
      HELPER METHODS
    ---------------------------------------------------------------------------
    */


    /**
     * Helper method to apply model changes. Normally build the lookup table and
     * apply the default selection.
     */
    __applyModelChanges : function()
    {
      this.buildLookupTable();
      this._applyDefaultSelection();
    },


    /**
     * Helper method to build the internal data structure.
     *
     * @internal
     */
    buildLookupTable : function()
    {
      if (
        this.getModel() != null &&
        (this.getChildProperty() == null || this.getLabelPath() == null)
      )
      {
        throw new Error("Could not build tree, because 'childProperty' and/" +
          "or 'labelPath' is 'null'!");
      }

      this._itemWidth = 0;
      var lookupTable = [];
      this.__nestingLevel = [];
      var nestedLevel = -1;

      var root = this.getModel();
      if (root != null)
      {
        if (!this.isHideRoot())
        {
          nestedLevel++;
          lookupTable.push(root);
          this.__nestingLevel.push(nestedLevel);
        }

        if (this.isNodeOpen(root))
        {
          var visibleChildren = this.__getVisibleChildrenFrom(root, nestedLevel);
          lookupTable = lookupTable.concat(visibleChildren);
        }
      }

      if (!qx.lang.Array.equals(this.__lookupTable.toArray(), lookupTable))
      {
        this._provider.removeBindings();
        this.__lookupTable.removeAll();
        this.__lookupTable.append(lookupTable);
        this.__updateRowCount();
        this._updateSelection();
      }
    },


    /**
     * Helper method to get all visible children form the passed parent node.
     * The algorithm implements a depth-first search with a complexity:
     * <code>O(n)</code> and <code>n</code> are all visible items.
     *
     * @param node {qx.core.Object} The start node to start search.
     * @param nestedLevel {Integer} The nested level from the start node.
     * @return {Array} All visible children form the parent.
     */
    __getVisibleChildrenFrom : function(node, nestedLevel)
    {
      var visible = [];
      nestedLevel++;

      if (!this.isNode(node)) {
        return visible;
      }

      var children = node.get(this.getChildProperty());
      if (children == null) {
        return visible;
      }

      // clone children to keep original model unmodified
      children = children.copy();

      var delegate = this.getDelegate();
      var filter = qx.util.Delegate.getMethod(delegate, "filter");
      var sorter = qx.util.Delegate.getMethod(delegate, "sorter");

      if (sorter != null) {
        children.sort(sorter);
      }

      for (var i = 0; i < children.getLength(); i++)
      {
        var child = children.getItem(i);

        if (filter && !filter(child)) {
          continue;
        }

        if (this.isNode(child))
        {
          this.__nestingLevel.push(nestedLevel);
          visible.push(child);

          if (this.isNodeOpen(child))
          {
            var visibleChildren = this.__getVisibleChildrenFrom(child, nestedLevel);
            visible = visible.concat(visibleChildren);
          }
        }
        else
        {
          if (this.isShowLeafs())
          {
            this.__nestingLevel.push(nestedLevel);
            visible.push(child);
          }
        }
      }

      // dispose children clone
      children.dispose();

      return visible;
    },


    /**
     * Helper method to set the node to the open nodes data structure when it
     * is not included.
     *
     * @param node {qx.core.Object} Node to set to open nodes.
     */
    __openNode : function(node)
    {
      if (!qx.lang.Array.contains(this.__openNodes, node)) {
        this.__openNodes.push(node);
        this.fireDataEvent("open", node);
      }
    },


    /**
     * Helper method to set the target node and all his parents to the open
     * nodes data structure. The algorithm implements a depth-first search with
     * a complexity: <code>O(n)</code> and <code>n</code> are all model items.
     *
     * @param startNode {qx.core.Object} Start (root) node to search.
     * @param targetNode {qx.core.Object} Target node to open (and his parents).
     * @return {Boolean} <code>True</code> when the targetNode and his
     *  parents could opened, <code>false</code> otherwise.
     */
    __openNodeAndAllParents : function(startNode, targetNode)
    {
      if (startNode === targetNode)
      {
        this.__openNode(targetNode);
        return true;
      }

      if (!this.isNode(startNode)) {
        return false;
      }

      var children = startNode.get(this.getChildProperty());
      if (children == null) {
        return false;
      }

      for (var i = 0; i < children.getLength(); i++)
      {
        var child = children.getItem(i);
        var result = this.__openNodeAndAllParents(child, targetNode);

        if (result === true)
        {
          this.__openNode(child);
          return true;
        }
      }

      return false;
    },


    /**
     * Helper method to update the row count.
     */
    __updateRowCount : function()
    {
      this.getPane().getRowConfig().setItemCount(this.__lookupTable.getLength());
      this.getPane().fullUpdate();
    },


    /**
     * Helper method to get the parent node. Node! This only works with leaf and
     * nodes which are in the internal lookup table.
     *
     * @param item {qx.core.Object} Node or leaf to get parent.
     * @return {qx.core.Object|null} The parent note or <code>null</code> when
     *   no parent found.
     *
     * @internal
     */
    getParent : function(item)
    {
      var index = this.__lookupTable.indexOf(item);
      if (index < 0) {
        return null;
      }

      var level = this.__nestingLevel[index];
      while(index > 0)
      {
        index--;
        var levelBefore = this.__nestingLevel[index];
        if (levelBefore < level) {
          return this.__lookupTable.getItem(index);
        }
      }

      return null;
    },


    /**
     * Builds the parent chain form the passed item.
     *
     * @param item {var} Item to build parent chain.
     */
    __buildParentChain : function(item)
    {
      this.__parentChain = [];
      var parent = this.getParent(item);
      while(parent != null)
      {
        this.__parentChain.unshift(parent);
        parent = this.getParent(parent);
      }
    },


    /**
     * Return the first visible parent node from the last selected node.
     *
     * @return {var} The first visible node.
     */
    __getVisibleParent : function()
    {
      if (this.__parentChain == null) {
        return this.getModel();
      }

      var lookupTable = this.getLookupTable();
      var parent = this.__parentChain.pop();

      while(parent != null)
      {
        if (lookupTable.contains(parent)) {
          return parent;
        }
        parent = this.__parentChain.pop();
      }
      return this.getModel();
    }
  },


  destruct : function()
  {
    var pane = this.getPane()
    if (pane != null)
    {
      if (pane.hasListener("cellDbltap")) {
        pane.removeListener("cellDbltap", this._onOpen, this);
      }
      if (pane.hasListener("cellTap")) {
        pane.removeListener("cellTap", this._onOpen, this);
      }
    }

    if (!qx.core.ObjectRegistry.inShutDown && this.__deferredCall != null)
    {
      this.__deferredCall.cancel();
      this.__deferredCall.dispose();
    }

    var model = this.getModel();
    if (model != null) {
      model.removeListener("changeBubble", this._onChangeBubble, this);
    }

    this._layer.removeListener("updated", this._onUpdated, this);
    this._layer.destroy();
    this._provider.dispose();
    this.__lookupTable.dispose();

    this._layer = this._provider = this.__lookupTable = this.__openNodes =
      this.__deferredCall = null;
  }
});
