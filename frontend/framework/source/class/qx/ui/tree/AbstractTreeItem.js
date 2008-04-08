/**
 * The AbstractTreeItem serves as a common superclass for the {@link
 * TreeFile} and {@link TreeFolder} classes.
 *
 * @appearance tree-element
 * @appearance tree-element-icon {qx.legacy.ui.basic.Image}
 * @appearance tree-element-label {qx.legacy.ui.basic.Label}
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

    this._children = [];

    this._layout = new qx.ui.layout.HBox();
    this.setLayout(this._layout);

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
     * The icon to show if the tree item is opened.
     * Any URI String supported by qx.ui.basic.Image.
     **/
    iconOpened :
    {
      check : "String",
      apply : "_applyIcon",
      nullable : true,
      themeable : true
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
     * This method configures the tree item by adding its sub widgets like
     * label, icon, open symbol, ...
     *
     * This method must be overridden by sub classes.
     */
    _addWidgets : function() {
      throw new Error("Abstract method call.");
    },


    /**
     * Returns the tree items's label widget.
     *
     * @return {qx.ui.basic.Label} The label widget
     */
    getLabelObject : function() {
      return this._label;
    },


    /**
     * Returns the tree item's icon widget
     *
     * @return {qx.ui.basic.Icon} The tree item's icon widget.
     */
    getIconObject : function() {
      return this._icon;
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
      this._layout.add(widget, options);
    },


    /**
     * Adds the spacer used to render the indentation to the item's horizontal
     * box layout. If the spacer has been added before, it is removed from its
     * old position and added to the end of the layout.
     */
    addSpacer : function()
    {
      if (!this._spacer) {
        this._spacer = new qx.ui.core.Spacer();
      } else {
        this._layout.remove(this._spacer);
      }
      this._layout.add(this._spacer);

    },


    /**
     * Adds the open button to the item's horizontal box layout. If the open
     * button has been added before, it is removed from its old position and
     * added to the end of the layout.
     */
    addOpenButton : function()
    {
      if (!this._open)
      {
        this._open = new qx.ui.tree.FolderOpenButton();
        this._open.addListener("changeOpen", this._onChangeOpen, this);
        this._open.addListener("resize", this._updateIndent, this);
      }
      else
      {
        this._layout.remove(this._open);
      }

      this._layout.add(this._open, {align: "middle"});
    },


    /**
     * Event handler, which listentes to open state changes of the open button
     *
     * @param e {qx.event.type.Change} The event object
     */
    _onChangeOpen : function(e) {
      this.setOpen(e.getValue());
    },


    /**
     * Adds the icon widget to the item's horizontal box layout. If the icon
     * widget has been added before, it is removed from its old position and
     * added to the end of the layout.
     */
    addIcon : function()
    {
      if (!this._icon)
      {
        this._icon = new qx.ui.basic.Image().set({
          appearance: this.getAppearance() + "-icon"
        });
      }
      else
      {
        this._layout.remove(this._icon);
      }
      this._layout.add(this._icon, {align: "middle"});
    },


    /**
     * Adds the label to the item's horizontal box layout. If the label
     * has been added before, it is removed from its old position and
     * added to the end of the layout.
     *
     * @param label {String?0} The label's contents
     */
    addLabel : function(text)
    {
      if (!this._label)
      {
        this._label = new qx.ui.basic.Label().set({
          appearance: this.getAppearance() + "-label"
        });
      }
      else
      {
        this._layout.remove(this._label);
      }

      if (text) {
        this._label.setContent(text);
      }

      this._layout.add(this._label, {align: "middle"});
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

      if (this._icon) {
        this._icon.addState(state);
      }

      if (this._label) {
        this._label.addState(state);
      }
    },


    // overridden
    removeState : function(state)
    {
      this.base(arguments, state);

      if (this._icon) {
        this._icon.removeState(state);
      }

      if (this._label) {
        this._label.removeState(state);
      }
    },


    /**
     * Called by the selection manager
     */
    handleStateChange : function()
    {
      // TODO: This could directly be done by the selection manager
      if (this.hasState("selected")) {
        this.activate();
      }
    },


    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyIcon : function(value, old) {
      this._icon.setSource(value)
    },


    // property apply
    _applyOpen : function(value, old)
    {
      if (this.hasChildren()) {
        this.getChildrenContainer().setVisibility(value ? "visible" : "excluded");
      }

      if (this._open) {
        this._open.setOpen(value);
      }

      if (this._icon)
      {
        if (value && this.getIconOpened()) {
          this._icon.setSource(this.getIconOpened())
        } else {
          this._icon.setSource(this.getIcon())
        }
      }
      value ? this.addState("opened") : this.removeState("opened");
    },


    /*
    ---------------------------------------------------------------------------
      INDENT HANDLING
    ---------------------------------------------------------------------------
    */

    _applyOpenSymbolMode : function(value, old) {
      this._updateIndent();
    },


    /**
     * Whether the open symbol should be shown
     *
     * @return {Boolean} Whether the open symbol should be shown.
     */
    _shouldShowOpenSymbol : function()
    {
      if (!this._open) {
        return false;
      }

      var openMode = this.getOpenSymbolMode();
      var hasChildren = this.hasChildren();

      var showOpenSymbol =
        openMode == "always" ||
        hasChildren && openMode == "auto";

      return showOpenSymbol;
    },


    _updateIndent : function()
    {
      var openWidth = 0;

      if (this._open)
      {
        if (this._shouldShowOpenSymbol())
        {
          this._open.show();
          openWidth = this._open.getSizeHint().width;
        }
        else
        {
          this._open.exclude();
        }
      }

      this._spacer.setWidth((this.getLevel()+1) * this.getIndent() - openWidth);
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

      // don't count the hidden rot node in the tree widget
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
      if (!this._childrenContainer)
      {
        this._childrenContainer = new qx.ui.core.Widget().set({
          layout : new qx.ui.layout.VBox(),
          visibility : this.isOpen() ? "visible" : "excluded"
        });
      }

      return this._childrenContainer;
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
      return this._children;
    },


    /**
     * Whether the item has any children
     *
     * @return {Boolean} Whether the item has any children.
     */
    hasChildren : function() {
      return this._children ? this._children.length > 0 : false;
    },


    /**
     * Returns all children of the folder.
     *
     * @type member
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
        this.getParentChildrenContainer().getLayout().addAfter(this.getChildrenContainer(), this);
      }
    },


    /**
     * Adds the passed tree items to the end of this item's children list.
     *
     * @param varargs {AbstractTreeItem} variable number of tree items to add
     */
    add : function(varargs)
    {
      var layout = this.getChildrenContainer().getLayout();
      var tree = this.getTree();


      for (var i=0, l=arguments.length; i<l; i++)
      {
        var treeItem = arguments[i];

        var oldParent = treeItem.getParent();
        if (oldParent) {
          oldPrarent.remove(treeItem);
        }

        treeItem.setParent(this);
        var hasChildren = this.hasChildren();

        layout.add(treeItem);

        if (treeItem.hasChildren()) {
          layout.add(treeItem.getChildrenContainer());
        }
        this._children.push(treeItem);

        if (!hasChildren) {
          this.__addChildrenToParent();
        }

       if (tree) {
          treeItem.recursiveAddToWidgetQueue();
        }
      }
      if (tree) {
        qx.ui.core.queue.Widget.add(this);
      }
    },


    /**
     * Adds the tree item to the current item, at the given index.
     *
     * @type member
     * @param treeItem {AbstractTreeItem} new tree item to insert
     * @param index {Integer} position to insert into
     */
    addAt : function(treeItem, index)
    {
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        this.assert(
          index <= this._children.length && index >= 0,
          "Invalid child index: " + index
        );
      }

      if (index == this._children.length)
      {
        this.add(treeItem);
        return;
      }

      var oldParent = treeItem.getParent();
      if (oldParent) {
        oldPrarent.remove(treeItem);
      }

      var layout = this.getChildrenContainer().getLayout();

      treeItem.setParent(this);
      var hasChildren = this.hasChildren();

      var nextItem = this._children[index];
      layout.addBefore(treeItem, nextItem);

      if (treeItem.hasChildren()) {
        layout.addAfter(treeItem.getChildrenContainer(), treeItem);
      }
      qx.lang.Array.insertAt(this._children, treeItem, index);

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
        this.assert(this._children.indexOf(before) >= 0)
      }

      this.addAt(treeItem, this._children.indexOf(before))
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
        this.assert(this._children.indexOf(after) >= 0)
      }

      this.addAt(treeItem, this._children.indexOf(after)+1)
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
     * This function should be called after items are removed from the tree.
     * It removes all items from the current selection, which are no longer
     * part of the tree.
     */
    __updateSelection : function()
    {
      var tree = this.getTree();
      if (!tree) {
        return;
      }

      var selectedItems = tree.getSelectedItems();
      var mgr = tree.getManager();
      for (var i=0,l=selectedItems.length; i<l; i++)
      {
        var treeItem = selectedItems[i];
        if (treeItem.getTree() !== tree) {
          mgr.setItemSelected(treeItem, false);
        }
      }

      if (tree.getSelectedItems().length == 0) {
        mgr.setItemSelected(mgr.getFirst(), true);
      }
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

        var layout = this.getChildrenContainer().getLayout();

        if (treeItem.hasChildren()) {
          layout.remove(treeItem.getChildrenContainer());
        }
        qx.lang.Array.remove(this._children, treeItem);

        treeItem.setParent(null);
        layout.remove(treeItem);
      }

      this.__updateSelection();
      qx.ui.core.queue.Widget.add(this);
    },


    /**
     * Remove the child with the given child index.
     *
     * @param index {Integer} Index of the child to remove
     */
    removeAt : function(index)
    {
      var item = this._children[index];
      if (item) {
        this.remove(item);
      }
    },


    /**
     * Remove all child items from this item.
     */
    removeAll : function()
    {
      for (var i=this._children.length-1; i>=0; i--) {
        this.remove(this._children[i]);
      }
    }
  }
});