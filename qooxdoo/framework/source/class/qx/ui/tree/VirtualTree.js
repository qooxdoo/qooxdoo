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
     * Whether the Root should have an open/close button.
     */
    rootOpenClose :
    {
      check: "Boolean",
      init: false,
      apply: "_applyRootOpenClose"
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
    }
  },


  members :
  {
    /** {qx.ui.tree.provider.WidgetProvider} Provider for widget rendering. */
    _provider : null,


    /** {qx.ui.virtual.layer.Abstract} Layer which contains the items. */
    _layer : null,


    /**
     * {Array} The internal lookup table data structure to get the model item
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


    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */


    /**
     * Opens the passed node.
     *
     * @param node {qx.core.Object} Node to open.
     */
    openNode : function(node)
    {
      this.__openNode(node);
      this.__buildLookupTable();
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
      this.__buildLookupTable();
    },


    /**
     * Closes the passed node.
     *
     * @param node {qx.core.Object} Node to close.
     */
    closeNode : function(node)
    {
      if (qx.lang.Array.contains(this.__openNodes, node))
      {
        qx.lang.Array.remove(this.__openNodes, node);
        this.__buildLookupTable();
      }
    },


    /**
     * Return whether the node is opened or closed.
     *
     * @param node {qx.core.Object} Node to check.
     * @return {Boolean} Returns <code>true</code> when the node is opened,
     *   <code>false</code> otherwise.
     */
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
      this.__lookupTable = [];
      this.__openNodes = [];
      this.__nestingLevel = [];
      this._initLayer();

      this.getPane().addListener("resize", this._onResize, this);
    },


    /**
     * Initializes the virtual tree layer.
     */
    _initLayer : function()
    {
      this._provider = new qx.ui.tree.provider.WidgetProvider(this);
      this._layer = this._provider.createLayer();
      this.getPane().addLayer(this._layer);
    },


    /**
     * Returns the internal data structure. The Array index is the row and the
     * value is the model item.
     *
     * @internal
     * @return {Array} The internal data structure.
     */
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


    /**
     * Returns if the passed item is a note or a leaf.
     *
     * @internal
     * @param item {qx.core.Object} Item to check.
     * @return {Boolean} <code>True</code> when item is a node,
     *   </code>false</code> when item is a leaf.
     */
    isNode : function(item) {
      return qx.Class.hasProperty(item.constructor, this.getChildProperty());
    },


    /**
     * Returns the row's nesting level.
     *
     * @param row {Integer} The row to get the nesting level.
     * @return {Integer} The row's nesting level or <code>null</code>.
     */
    getLevel : function(row) {
      return this.__nestingLevel[row];
    },


    /**
     * Return whether the node has visible children or not.
     * 
     * @internal
     * @param node {qx.core.Object} Node to check.
     * @return {Boolean} <code>True</code> when the node has visible children,
     *   <code>false</code> otherwise.
     */
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
    _applyOpenMode : function(value, old) {
      this._provider.setOpenMode(value);
    },


    // property apply
    _applyHideRoot : function(value, old) {
      this.__buildLookupTable();
    },


    // property apply
    _applyRootOpenClose : function(value, old) {
      this._provider.setRootOpenClose(value);
    },


    // property apply
    _applyShowLeafs : function(value, old) {
      this.__buildLookupTable();
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
    _applyModel : function(value, old)
    {
      this.__openNodes = [];

      if (value != null)
      {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (!qx.Class.hasMixin(value.constructor,
                qx.data.marshal.MEventBubbling))
          {
            this.warn("The model item doesn't support the Mixin 'qx.data." +
              "marshal.MEventBubbling'. Therefore the tree can not update " +
              "the view automatically on model changes.");
          }
        }
        value.addListener("changeBubble", this.__buildLookupTable, this);
        this.__openNode(value);
      }

      if (old != null) {
        old.removeListener("changeBubble", this.__buildLookupTable, this);
      }

      this.__buildLookupTable();
    },


    /*
    ---------------------------------------------------------------------------
      EVENT HANDLERS
    ---------------------------------------------------------------------------
    */


    /**
     * Event handler for the resize event.
     *
     * @param event {qx.event.type.Data} The resize event.
     */
    _onResize : function(event) {
      this.getPane().getColumnConfig().setItemSize(0, event.getData().width);
    },


    /*
    ---------------------------------------------------------------------------
      HELPER METHODS
    ---------------------------------------------------------------------------
    */


    /**
     * Helper method to build the internal data structure.
     */
    __buildLookupTable : function()
    {
      if (this.getChildProperty() == null || this.getLabelPath() == null)
      {
        throw new Error("Could not build tree, because 'childProperty' and/" +
          "or 'labelPath' is 'null'!");
      }

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

      this.__lookupTable = lookupTable;
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
     * Helper method to update the row count.
     */
    __updateRowCount : function()
    {
      this.getPane().getRowConfig().setItemCount(this.getLookupTable().length);
      this.getPane().fullUpdate();
    }
  },


  destruct : function()
  {
    this._layer.destroy();
    this._provider.dispose();

    this._layer = this._provider = this.__lookupTable = this.__openNodes = null;
  }
});
