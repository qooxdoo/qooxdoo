qx.Class.define("qx.ui.tree.AbstractTreeElement",
{
  extend : qx.ui.core.Widget,
  implement: qx.ui.tree.ITreeElement,


  construct : function()
  {
    this.base(arguments);

    this._layout = new qx.ui.layout.HBox();
    this.setLayout(this._layout);

    this._addWidgets();
  },


  properties :
  {
    open :
    {
      check : "Boolean",
      init : "false",
      event : "changeOpen",
      apply : "_applyOpen"
    },


    selected :
    {
      check : "Boolean",
      init : false,
      apply : "_applySelected",
      event : "changeSelected"
    },


    level :
    {
      check : "Integer",
      init : 0,
      event : "changeLevel",
      apply : "_applyLevel"
    },


    indent :
    {
      check : "Integer",
      init : 15,
      apply : "_applyIndent",
      themeable : true
    },


    tree :
    {
      check : "qx.ui.tree.Tree",
      nullable : true,
      init : null,
      event : "changeTree",
      apply : "_applyTree"
    },


    /** Any URI String supported by qx.ui.basic.Image to display a icon */
    icon :
    {
      check : "String",
      apply : "_applyIcon",
      nullable : true,
      themeable : true
    }
  },

  members :
  {
    _addWidgets : function() {
      throw new Error("Abstract method call.");
    },


    _addSpacer : function()
    {
      this._spacer = new qx.ui.core.Spacer();
      this._layout.add(this._spacer);
    },


    _addOpenButton : function()
    {
      this._open = new qx.ui.tree.FolderOpenButton();
      this._open.addListener("changeOpen", this._onChangeOpen, this);
      this._layout.add(this._open, {align: "middle"});
    },


    _onChangeOpen : function(e) {
      this.setOpen(e.getValue());
    },


    _addIcon : function()
    {
      this._icon = new qx.ui.basic.Image().set({
        appearance: this.getAppearance() + "-icon"
      });
      this._layout.add(this._icon, {align: "middle"});
    },


    _addLabel : function()
    {
      this._label = new qx.ui.basic.Label().set({
        appearance: this.getAppearance() + "-label"
      });
      this._layout.add(this._label, {align: "middle"});
    },


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
      if (this.hasState("selected")) {
        this.activate();
      }
    },


    _applyIcon : function(value, old) {
      this._icon.setSource(value)
    },


    _applyOpen : function(value, old)
    {
      var tree = this.getTree();
      if (tree) {
        tree.setFolderOpened(this, value);
      }
      value ? this.addState("opened") : this.removeState("opened");
    },


    _applySelected : function(value, old) {
    },


    _applyLevel : function(value, old) {
      this._spacer.setWidth(value * this.getIndent());
    },


    _applyIndent : function(value, old) {
      this._spacer.setWidth(this.getLevel() * value);
    },


    _applyTree : function(level) {
    }

  }
});