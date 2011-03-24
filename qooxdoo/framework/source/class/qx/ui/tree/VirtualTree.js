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
 * EXPERIMENTAL!
 *
 * Virtual tree implementation.
 *
 * The virtual tree can be used to render node and leafs. Nodes and leafs are
 * both items for a tree. The difference between a node and a leaf is that a
 * node has child items, but a leaf not.
 */
qx.Class.define("qx.ui.tree.VirtualTree",
{
  extend : qx.ui.virtual.core.Scroller,
  implement : qx.ui.tree.core.IVirtualTree,
  include : qx.ui.tree.selection.MSelectionHandling,

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
      this.setChildProperty(childProperty)
    }

    if(model != null) {
      this.initModel(model);
    }

    this.initItemHeight();
    this.initOpenMode();

    this.addListener("keypress", this._onKeyPress, this);
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
     * Control whether clicks or double clicks should open or close the clicked
     * item.
     */
    openMode :
    {
      check: ["click", "dblclick", "none"],
      init: "dblclick",
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
    /** {qx.ui.tree.provider.WidgetProvider} Provider for widget rendering. */
    _provider : null,


    /** {qx.ui.virtual.layer.Abstract} Layer which contains the items. */
    _layer : null,


    /**
     * {qx.data.Array} The internal lookup table data structure to get the model item
     * from a row.
     */
    __lookupTable : null,


    /** {Array} HashMap which contains all open nodes. */
    __openNodes : null,


    /**
     * {Array} The internal data structure to get the nesting level from a
     * row.
     */
    __nestingLevel : null,


    /**
     * {qx.util.DeferredCall} Adds this instance to the widget queue on a
     * deferred call.
     */
    __deferredCall : null,


    /** {Integer} Holds the max item width from a rendered widget. */
    __itemWidth : 0,


    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */


    // overridden
    syncWidget : function()
    {
      var firstRow = this._layer.getFirstRow();
      var rowSize = this._layer.getRowSizes().length;

      for (var row = firstRow; row < firstRow + rowSize; row++)
      {
        var widget = this._layer.getRenderedCellWidget(row, 0);
        this.__itemWidth = Math.max(this.__itemWidth, widget.getSizeHint().width);
      }
      var paneWidth = this.getPane().getBounds().width;
      this.getPane().getColumnConfig().setItemSize(0, Math.max(this.__itemWidth, paneWidth));
    },


    // Interface implementation
    openNode : function(node)
    {
      this.__openNode(node);
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
        this.buildLookupTable();
      }
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
      this._initSelection();
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
    },


    // Interface implementation
    getLookupTable : function() {
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
      return qx.Class.hasProperty(item.constructor, this.getChildProperty());
    },


    // Interface implementation
    getLevel : function(row) {
      return this.__nestingLevel[row];
    },


    // Interface implementation
    hasChildren : function(node)
    {
      var children = node.get(this.getChildProperty());
      if (this.isShowLeafs()) {
        return children.length > 0;
      }
      else
      {
        for (var i = 0; i < children.getLength(); i++)
        {
          var child = children.getItem(i);
          if (this.isNode(child)) {
            return true;
          }
        }
      }
      return false;
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

      //"click", "dblclick", "none"
      if (value === "dblclick") {
        pane.addListener("cellDblclick", this._onOpen, this);
      } else if (value === "click") {
        pane.addListener("cellClick", this._onOpen, this);
      }

      if (old === "dblclick") {
        pane.removeListener("cellDblclick", this._onOpen, this);
      } else if (old === "click") {
        pane.removeListener("cellClick", this._onOpen, this);
      }
    },


    // property apply
    _applyHideRoot : function(value, old) {
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

      this.buildLookupTable();
    },


    // property apply
    _applyDelegate : function(value, old)
    {
      this._provider.setDelegate(value);
      this.getPane().fullUpdate();
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
      var propertyName = event.getData().name;
      var index = propertyName.lastIndexOf(".");

      if (index != -1) {
        propertyName = propertyName.substr(index + 1, propertyName.length);
      }

      if (qx.lang.String.startsWith(propertyName, this.getChildProperty())) {
        this.buildLookupTable();
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
     * Event handler to open/close clicked nodes.
     *
     * @param event {qx.ui.virtual.core.CellEvent} The cell click event.
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
              var parent = this.__getParent(item);
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
                if (children.getLength() > 0) {
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
      this.getPane().fullUpdate();
    },


    /*
    ---------------------------------------------------------------------------
      HELPER METHODS
    ---------------------------------------------------------------------------
    */


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

      this.__itemWidth = 0;
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
          var visibleChildren = this.__getVisibleChildrenFrom(root,
            nestedLevel);
          lookupTable = lookupTable.concat(visibleChildren);
        }
      }

      this._provider.removeBindings();
      this.__lookupTable.removeAll();
      this.__lookupTable.append(lookupTable);
      this.__updateSelection();
      this.__updateRowCount();
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
      for (var i = 0; i < children.getLength(); i++)
      {
        var child = children.getItem(i);

        if (this.isNode(child))
        {
          this.__nestingLevel.push(nestedLevel);
          visible.push(child);

          if (this.isNodeOpen(child))
          {
            var visibleChildren = this.__getVisibleChildrenFrom(child,
              nestedLevel);
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
     * Helper method to remove items form the selection which are not in the
     * lookup table.
     */
    __updateSelection : function() {
      var selection = this.getSelection();
      if (selection.getLength() > 0)
      {
        var item = selection.getItem(0);
        if (!this.__lookupTable.contains(item)) {
          selection.remove(item);
        }
      }
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
     */
    __getParent : function(item)
    {
      var index = this.__lookupTable.indexOf(item);
      if (index < 0) {
        return null;
      }

      var level = this.__nestingLevel[index];
      while(index > 0)
      {
        index--;
        var levelBevore = this.__nestingLevel[index];
        if (levelBevore < level) {
          return this.__lookupTable.getItem(index);
        }
      }

      return null;
    }
  },


  destruct : function()
  {
    var pane = this.getPane()
    if (pane != null)
    {
      if (pane.hasListener("cellDblclick")) {
        pane.addListener("cellDblclick", this._onOpen, this);
      } else if (pane.hasListener("cellClick")) {
        pane.removeListener("cellClick", this._onOpen, this);
      }
    }

    this._layer.removeListener("updated", this._onUpdated, this);
    this._layer.destroy();
    this._provider.dispose();
    this.__lookupTable.dispose();

    this._layer = this._provider = this.__lookupTable = this.__openNodes = null;
  }
});
