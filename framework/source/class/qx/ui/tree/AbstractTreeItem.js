/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * The AbstractTreeItem serves as a common superclass for the {@link
 * TreeFile} and {@link TreeFolder} classes.
 */
qx.Class.define("qx.ui.tree.AbstractTreeItem",
{
  extend : qx.ui.core.Widget,
  type : "abstract",



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.__children = [];

    this._setLayout(new qx.ui.layout.HBox());
    this._addWidgets();

    this.initOpen();
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Whether the tree item is opened.
     */
    open :
    {
      check : "Boolean",
      init : false,
      event : "changeOpen",
      apply : "_applyOpen"
    },


    /**
     * Controls, when to show the open symbol. If the mode is "auto" , the open
     * symbol is shown only if the item has child items.
     */
    openSymbolMode :
    {
      check : ["always", "never", "auto"],
      init : "auto",
      event : "changeOpenSymbolMode",
      apply : "_applyOpenSymbolMode"
    },


    /**
     * The number of piel to indent the tree item for each level.
     */
    indent :
    {
      check : "Integer",
      init : 19,
      apply : "_applyIndent",
      themeable : true
    },


    /**
     * The parent tree folder.
     */
    parent :
    {
      check : "qx.ui.tree.AbstractTreeItem",
      nullable : true
    },


    /**
     * Any URI String supported by qx.ui.basic.Image to display a icon
     **/
    icon :
    {
      check : "String",
      apply : "_applyIcon",
      nullable : true,
      themeable : true
    },


    /**
     * The label/caption/text
     */
    label :
    {
      check : "String",
      apply : "_applyLabel",
      init : "",
      dispose : true
    }
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __children : null,
    __childrenContainer : null,
    __labelAdded : null,
    __iconAdded : null,
    __spacer : null,


    /**
     * This method configures the tree item by adding its sub widgets like
     * label, icon, open symbol, ...
     *
     * This method must be overridden by sub classes.
     */
    _addWidgets : function() {
      throw new Error("Abstract method call.");
    },


    // overridden
    _createChildControlImpl : function(id)
    {
      var control;

      switch(id)
      {
        case "label":
          control = new qx.ui.basic.Label().set({
            appearance: this.getAppearance() + "-label",
            alignY: "middle"
          });
          break;

        case "icon":
          control = new qx.ui.basic.Image().set({
            appearance: this.getAppearance() + "-icon",
            alignY: "middle"
          });
          break;

        case "open":
          control = new qx.ui.tree.FolderOpenButton().set({
            alignY: "middle"
          });
          control.addListener("changeOpen", this._onChangeOpen, this);
          control.addListener("resize", this._updateIndent, this);
          break;
      }

      return control || this.base(arguments, id);
    },


    /**
     * Returns the tree the tree item is connected to. If the item is not part of
     * a tree <code>null</code> will be returned.
     *
     * @return {qx.ui.tree.Tree|null} The item's tree or <code>null</code>.
     */
    getTree : function()
    {
      var treeItem = this;
      while (treeItem.getParent()) {
        treeItem = treeItem.getParent();
      }

      var tree = treeItem.getLayoutParent() ? treeItem.getLayoutParent().getLayoutParent() : 0;
      if (tree && tree instanceof qx.ui.core.ScrollPane) {
        return tree.getLayoutParent();
      }
      return null;
    },





    /*
    ---------------------------------------------------------------------------
      TREE ITEM CONFIGURATION
    ---------------------------------------------------------------------------
    */

    /**
     * Adds a sub widget to the tree item's horizontal box layout.
     *
     * @param widget {qx.ui.core.Widget} The widget to add
     * @param options {Map?null} The (optional) layout options to use for the widget
     */
    addWidget : function(widget, options) {
      this._add(widget, options);
    },


    /**
     * Adds the spacer used to render the indentation to the item's horizontal
     * box layout. If the spacer has been added before, it is removed from its
     * old position and added to the end of the layout.
     */
    addSpacer : function()
    {
      if (!this.__spacer) {
        this.__spacer = new qx.ui.core.Spacer();
      } else {
        this._remove(this.__spacer);
      }

      this._add(this.__spacer);
    },


    /**
     * Adds the open button to the item's horizontal box layout. If the open
     * button has been added before, it is removed from its old position and
     * added to the end of the layout.
     */
    addOpenButton : function() {
      this._add(this._getChildControl("open"));
    },


    /**
     * Event handler, which listentes to open state changes of the open button
     *
     * @param e {qx.event.type.Data} The event object
     */
    _onChangeOpen : function(e)
    {
      if (this.isOpenable()) {
        this.setOpen(e.getData());
      }
    },


    /**
     * Adds the icon widget to the item's horizontal box layout. If the icon
     * widget has been added before, it is removed from its old position and
     * added to the end of the layout.
     */
    addIcon : function()
    {
      var icon = this._getChildControl("icon");

      if (this.__iconAdded) {
        this._remove(icon);
      }

      this._add(icon);
      this.__iconAdded = true;
    },


    /**
     * Adds the label to the item's horizontal box layout. If the label
     * has been added before, it is removed from its old position and
     * added to the end of the layout.
     *
     * @param text {String?0} The label's contents
     */
    addLabel : function(text)
    {
      var label = this._getChildControl("label");

      if (this.__labelAdded) {
        this._remove(label);
      }

      if (text) {
        this.setLabel(text);
      } else {
        label.setContent(this.getLabel());
      }

      this._add(label);
      this.__labelAdded = true;
    },


    /*
    ---------------------------------------------------------------------------
      STATE HANDLING
    ---------------------------------------------------------------------------
    */

    // overridden
    addState : function(state)
    {
      this.base(arguments, state);

      var children = this._getChildren();
      for (var i=0,l=children.length; i<l; i++)
      {
        var child = children[i];
        if (child.addState) {
          children[i].addState(state);
        }
      }
    },


    // overridden
    removeState : function(state)
    {
      this.base(arguments, state);

      var children = this._getChildren();
      for (var i=0,l=children.length; i<l; i++)
      {
        var child = children[i];
        if (child.addState) {
          children[i].removeState(state);
        }
      }
    },


    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyIcon : function(value, old) {
      this._getChildControl("icon").setSource(value);
    },


    // property apply
    _applyLabel : function(value, old) {
      this._getChildControl("label").setContent(value);
    },


    // property apply
    _applyOpen : function(value, old)
    {
      if (this.hasChildren()) {
        this.getChildrenContainer().setVisibility(value ? "visible" : "excluded");
      }

      var open = this._getChildControl("open", true);
      if (open) {
        open.setOpen(value);
      }

      value ? this.addState("opened") : this.removeState("opened");
    },


    /*
    ---------------------------------------------------------------------------
      INDENT HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Whether the tree item can be opened.
     *
     * @return {Boolean} Whether the tree item can be opened.
     */
    isOpenable : function()
    {
      var openMode = this.getOpenSymbolMode();
      return (
        openMode === "always" ||
        openMode === "auto" && this.hasChildren()
      );
    },


    /**
     * Whether the open symbol should be shown
     *
     * @return {Boolean} Whether the open symbol should be shown.
     */
    _shouldShowOpenSymbol : function()
    {
      var open = this._getChildControl("open", true);
      if (!open) {
        return false;
      }

      var tree = this.getTree();
      if (!tree.getRootOpenClose())
      {
        if (tree.getHideRoot())
        {
          if (tree.getRoot() == this.getParent()) {
            return false;
          }
        }
        else
        {
          if (tree.getRoot() == this) {
            return false;
          }
        }
      }

      return this.isOpenable();
    },


    // property apply
    _applyOpenSymbolMode : function(value, old) {
      this._updateIndent();
    },


    /**
     * Update the indentation of the tree item.
     */
    _updateIndent : function()
    {
      if (!this.getTree()) {
        return;
      }

      var openWidth = 0;
      var open = this._getChildControl("open", true);

      if (open)
      {
        if (this._shouldShowOpenSymbol())
        {
          open.show();
          openWidth = open.getSizeHint().width;
        }
        else
        {
          open.exclude();
        }
      }

      this.__spacer.setWidth((this.getLevel()+1) * this.getIndent() - openWidth);
    },


    // property apply
    _applyIndent : function(value, old) {
      this._updateIndent();
    },


    /**
     * Computes the item's nesting level. If the item is not part of a tree
     * this function will return <code>null</code>.
     *
     * @return {Integer|null} The item's nesting level or <code>null</code>.
     */
    getLevel : function()
    {
      var tree = this.getTree();
      if (!tree) {
        return;
      }

      var treeItem = this;
      var level = -1;

      while (treeItem)
      {
        treeItem = treeItem.getParent();
        level += 1;
      }

      // don't count the hidden root node in the tree widget
      if (tree.getHideRoot()) {
        level -= 1;
      }

      if (!tree.getRootOpenClose()) {
        level -= 1;
      }

      return level;
    },


    // overridden
    syncWidget : function() {
      this._updateIndent();
    },


    /*
    ---------------------------------------------------------------------------
      CHILDREN CONTAINER
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the widget, which atcs as container for the child items.
     * This widget must have a vertical box layout.
     *
     * @return {qx.ui.core.Widget} The children container
     */
    getChildrenContainer : function()
    {
      if (!this.__childrenContainer)
      {
        this.__childrenContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
          visibility : this.isOpen() ? "visible" : "excluded"
        });
      }

      return this.__childrenContainer;
    },


    /**
     * Get the children container of the item's parent. This function will return
     * <code>null</code>, if the item does not have a parent or is not the root
     * item.
     *
     * @return {qx.ui.core.Widget} The parent's children container.
     */
    getParentChildrenContainer : function()
    {
      if (this.getParent()) {
        return this.getParent().getChildrenContainer();
      } else if (this.getLayoutParent()) {
        return this.getLayoutParent();
      } else {
        return null;
      }
    },


    /*
    ---------------------------------------------------------------------------
      CHILDREN HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Get all child items.
     *
     * Note: Don't modifiy the returned array, since this function does not
     * return a copy!
     *
     * @return {AbstractTreeItem[]} An array of all child items.
     */
    getChildren : function() {
      return this.__children;
    },


    /**
     * Whether the item has any children
     *
     * @return {Boolean} Whether the item has any children.
     */
    hasChildren : function() {
      return this.__children ? this.__children.length > 0 : false;
    },


    /**
     * Returns all children of the folder.
     *
     * @param recursive {Boolean ? true} whether children of subfolder should be
     *     included
     * @param invisible {Boolean ? true} whether invisible children should be
     *     included
     * @param ignoreFirst {Boolean ? true} Whether the current treeItem should
     *     be excluded from the list.
     * @return {AbstractTreeItem[]} list of children
     */
    getItems : function(recursive, invisible, ignoreFirst)
    {
      if (ignoreFirst !== false) {
        var items = [];
      } else {
        var items = [this];
      }

      var addChildren =
        this.hasChildren() &&
        (invisible !== false || this.isOpen())

      if (addChildren)
      {
        var children = this.getChildren();
        if (recursive === false)
        {
          items = items.concat(children);
        }
        else
        {
          for (var i=0, chl=children.length; i<chl; i++) {
            items = items.concat(children[i].getItems(recursive, invisible, false));
          }
        }
      }
      return items;
    },


    /**
     * Adds this item and recursively all sub items to the widget queue to
     * update the indentation.
     *
     * @internal
     */
    recursiveAddToWidgetQueue : function()
    {
      var children = this.getItems(true, true, false);
      for (var i=0, l=children.length; i<l; i++) {
        qx.ui.core.queue.Widget.add(children[i]);
      }
    },


    /**
     * Adds the item's children container the the parent's children container.
     */
    __addChildrenToParent : function()
    {
      if (this.getParentChildrenContainer()) {
        this.getParentChildrenContainer()._addAfter(this.getChildrenContainer(), this);
      }
    },


    /**
     * Adds the passed tree items to the end of this item's children list.
     *
     * @param varargs {AbstractTreeItem} variable number of tree items to add
     */
    add : function(varargs)
    {
      var container = this.getChildrenContainer();
      var tree = this.getTree();


      for (var i=0, l=arguments.length; i<l; i++)
      {
        var treeItem = arguments[i];

        var oldParent = treeItem.getParent();
        if (oldParent) {
          oldParent.remove(treeItem);
        }

        treeItem.setParent(this);
        var hasChildren = this.hasChildren();

        container.add(treeItem);

        if (treeItem.hasChildren()) {
          container.add(treeItem.getChildrenContainer());
        }
        this.__children.push(treeItem);

        if (!hasChildren) {
          this.__addChildrenToParent();
        }

        if (tree)
        {
          treeItem.recursiveAddToWidgetQueue();
          tree.fireNonBubblingEvent("addItem", qx.event.type.Data, [treeItem]);
        }
      }
      if (tree) {
        qx.ui.core.queue.Widget.add(this);
      }
    },


    /**
     * Adds the tree item to the current item, at the given index.
     *
     * @param treeItem {AbstractTreeItem} new tree item to insert
     * @param index {Integer} position to insert into
     */
    addAt : function(treeItem, index)
    {
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        this.assert(
          index <= this.__children.length && index >= 0,
          "Invalid child index: " + index
        );
      }

      if (index == this.__children.length)
      {
        this.add(treeItem);
        return;
      }

      var oldParent = treeItem.getParent();
      if (oldParent) {
        oldParent.remove(treeItem);
      }

      var container = this.getChildrenContainer();

      treeItem.setParent(this);
      var hasChildren = this.hasChildren();

      var nextItem = this.__children[index];
      container.addBefore(treeItem, nextItem);

      if (treeItem.hasChildren()) {
        container.addAfter(treeItem.getChildrenContainer(), treeItem);
      }
      qx.lang.Array.insertAt(this.__children, treeItem, index);

      if (!hasChildren) {
        this.__addChildrenToParent();
      }

      if (this.getTree())
      {
        treeItem.recursiveAddToWidgetQueue();
        qx.ui.core.queue.Widget.add(this);
      }
    },


    /**
     * Add a tree item to this item before the existing child <code>before</code>.
     *
     * @param treeItem {AbstractTreeItem} tree item to add
     * @param before {AbstractTreeItem} existing child to add the item before
     */
    addBefore : function(treeItem, before)
    {
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        this.assert(this.__children.indexOf(before) >= 0)
      }

      this.addAt(treeItem, this.__children.indexOf(before))
    },


    /**
     * Add a tree item to this item after the existing child <code>before</code>.
     *
     * @param treeItem {AbstractTreeItem} tree item to add
     * @param after {AbstractTreeItem} existing child to add the item after
     */
    addAfter : function(treeItem, after)
    {
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        this.assert(this.__children.indexOf(after) >= 0)
      }

      this.addAt(treeItem, this.__children.indexOf(after)+1)
    },


    /**
     * Add a tree item as the first child of this item.
     *
     * @param treeItem {AbstractTreeItem} tree item to add
     */
    addAtBegin : function(treeItem) {
      this.addAt(treeItem, 0);
    },


    /**
     * Removes the passed tree items from this item.
     *
     * @param varargs {AbstractTreeItem} variable number of tree items to remove
     */
    remove : function(varargs)
    {
      for (var i=0, l=arguments.length; i<l; i++)
      {
        var treeItem = arguments[i];
        if (this.__children.indexOf(treeItem) == -1) {
          this.warn("Cannot remove treeitem '"+treeItem+"'. It is not a child of this tree item.");
          return;
        }

        var container = this.getChildrenContainer();

        if (treeItem.hasChildren()) {
          container.remove(treeItem.getChildrenContainer());
        }
        qx.lang.Array.remove(this.__children, treeItem);

        treeItem.setParent(null);
        container.remove(treeItem);
      }

      var tree = this.getTree();
      if (tree) {
        tree.fireNonBubblingEvent("addItem", qx.event.type.Data, [treeItem]);
      }

      qx.ui.core.queue.Widget.add(this);
    },


    /**
     * Remove the child with the given child index.
     *
     * @param index {Integer} Index of the child to remove
     */
    removeAt : function(index)
    {
      var item = this.__children[index];
      if (item) {
        this.remove(item);
      }
    },


    /**
     * Remove all child items from this item.
     */
    removeAll : function()
    {
      for (var i=this.__children.length-1; i>=0; i--) {
        this.remove(this.__children[i]);
      }
    }
  },





  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeArray("__children");
    this._disposeObjects("__spacer", "__childrenContainer");
  }
});