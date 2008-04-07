qx.Class.define("qx.ui.tree.AbstractTreeItem",
{
  extend : qx.ui.core.Widget,



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
    open :
    {
      check : "Boolean",
      init : false,
      event : "changeOpen",
      apply : "_applyOpen"
    },


    openSymbolMode :
    {
      check : ["always", "never", "auto"],
      init : "auto",
      event : "changeOpenSymbolMode",
      apply : "_applyOpenSymbolMode"
    },


    selected :
    {
      check : "Boolean",
      init : false,
      apply : "_applySelected",
      event : "changeSelected"
    },


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


    /** Any URI String supported by qx.ui.basic.Image to display a icon */
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
    _addWidgets : function() {
      throw new Error("Abstract method call.");
    },


    getLabelObject : function() {
      return this._label;
    },


    getIconObject : function() {
      return this._icon;
    },


    getTree : function()
    {
      var treeItem = this;
      while (treeItem.getParent()) {
        treeItem = treeItem.getParent();
      }

      var tree = treeItem.getChildrenContainer().getLayoutParent();
      if (tree && tree instanceof qx.ui.tree.Tree) {
        return tree;
      }

      return null;
    },



    /*
    ---------------------------------------------------------------------------
      TREE ITEM CONFIGURATION
    ---------------------------------------------------------------------------
    */

    addWidget : function(widget, options) {
      this._layout.add(widget, options);
    },


    addSpacer : function()
    {
      if (!this._spacer) {
        this._spacer = new qx.ui.core.Spacer();
      } else {
        this._layout.remove(this._spacer);
      }
      this._layout.add(this._spacer);

    },


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


    _onChangeOpen : function(e) {
      this.setOpen(e.getValue());
    },


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

    _applyIcon : function(value, old) {
      this._icon.setSource(value)
    },


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


    _applySelected : function(value, old) {
    },


    /*
    ---------------------------------------------------------------------------
      INDENT HANDLING
    ---------------------------------------------------------------------------
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


    _applyIndent : function(value, old) {
      this._updateIndent();
    },


    getLevel : function()
    {
      var treeItem = this;
      var level = -1;

      while (treeItem)
      {
        treeItem = treeItem.getParent();
        level += 1;
      }

      // don't count the hidden rot node in the tree widget
      return level-1;
    },


    syncWidget : function() {
      this._updateIndent();
    },


    /*
    ---------------------------------------------------------------------------
      CHILDREN CONTAINER
    ---------------------------------------------------------------------------
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


    getParentChildrenContainer : function()
    {
      if (this.getParent()) {
        return this.getParent().getChildrenContainer();
      } else {
        return null;
      }
    },


    /*
    ---------------------------------------------------------------------------
      CHILDREN HANDLING
    ---------------------------------------------------------------------------
    */

    getChildren : function() {
      return this._children;
    },


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


    __recursiveAddToWidgetQueue : function(treeItem)
    {
      var children = treeItem.getItems(true, true, false);
      for (var i=0, l=children.length; i<l; i++) {
        qx.ui.core.queue.Widget.add(children[i]);
      }
    },


    __addChildrenToParent : function()
    {
      if (this.getParentChildrenContainer()) {
        this.getParentChildrenContainer().getLayout().addAfter(this.getChildrenContainer(), this);
      }
    },


    add : function(varargs)
    {
      var layout = this.getChildrenContainer().getLayout();
      var tree = this.getTree();


      for (var i=0, l=arguments.length; i<l; i++)
      {
        var treeItem = arguments[i];

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
          this.__recursiveAddToWidgetQueue(treeItem);
        }
      }
      if (tree) {
        qx.ui.core.queue.Widget.add(this);
      }
    },


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
        this.__recursiveAddToWidgetQueue(treeItem);
        qx.ui.core.queue.Widget.add(this);
      }
    },


    addBefore : function(treeItem, before)
    {
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        this.assert(this._children.indexOf(before) >= 0)
      }

      this.addAt(treeItem, this._children.indexOf(before))
    },


    addAfter : function(treeItem, after)
    {
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        this.assert(this._children.indexOf(after) >= 0)
      }

      this.addAt(treeItem, this._children.indexOf(after)+1)
    },


    addAtBegin : function(treeItem) {
      this.addAt(treeItem, 0);
    },


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


    remove : function(treeItem)
    {
      var layout = this.getChildrenContainer().getLayout();

      if (treeItem.hasChildren()) {
        layout.remove(treeItem.getChildrenContainer());
      }
      qx.lang.Array.remove(this._children, treeItem);

      treeItem.setParent(null);
      layout.remove(treeItem);
      this.__updateSelection();

      qx.ui.core.queue.Widget.add(this);
    },


    removeAt : function(index)
    {
      var item = this._children[index];
      if (item) {
        this.remove(item);
      }
    },


    removeAll : function()
    {
      for (var i=this._children.length-1; i>=0; i--) {
        this.remove(this._children[i]);
      }
    }
  }
});