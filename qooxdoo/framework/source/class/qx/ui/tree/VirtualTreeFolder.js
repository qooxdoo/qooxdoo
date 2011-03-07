qx.Class.define("qx.ui.tree.VirtualTreeFolder",
{
  extend : qx.ui.tree.core.AbstractVirtualTreeItem,

  
  construct : function(label)
  {
    this.base(arguments, label);

    this.initOpen();
  },

  
  properties :
  {
    // overridden
    appearance :
    {
      init: "virtual-tree-folder",
      refine: true
    },
    
    
    open :
    {
      check: "Boolean",
      event: "changeOpen",
      apply: "_applyOpen",
      init: false
    },
    
    
    openSymbolMode :
    {
      check: ["always", "never", "auto"],
      event: "changeOpenSymbolMode",
      apply: "_applyOpenSymbolMode",
      init: "auto"
    }
  },


  members :
  {
    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */
    
    
    addOpenButton : function() {
      this._add(this.getChildControl("open"));
    },
    
    
    /*
    ---------------------------------------------------------------------------
      INTERNAL API
    ---------------------------------------------------------------------------
    */
    
    
    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "open":
          control = new qx.ui.tree.core.FolderOpenButton(this.getOpen());
          control.addListener("changeOpen", this._onChangeOpen, this);
          control.addListener("resize", this._updateIndent, this);
          break;
      }

      return control || this.base(arguments, id, hash);
    },
    
    
    // overridden
    _addWidgets : function()
    {
      this.addSpacer();
      this.addOpenButton();
      this.addIcon();
      this.addLabel();
    },
    
    
    // overridden
    _updateIndent : function()
    {
      var openWidth = 0;
      var open = this.getChildControl("open", true);

      if (open)
      {
        if (this.__shouldShowOpenButton())
        {
          open.show();

          var openBounds = open.getBounds();
          if (openBounds) {
            openWidth = openBounds.width;
          } else {
            return;
          }
        }
        else
        {
          open.exclude();
        }
      }

      if (this._spacer) {
        this._spacer.setWidth((this._getLevel()+1) * this.getIndent() - openWidth);
      }
    },
    
    
    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */
    
    
    _onChangeOpen : function(e)
    {
      if (this.__isOpenable()) {
        this.setOpen(e.getData());
      }
    },
    
    
    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY METHODS
    ---------------------------------------------------------------------------
    */
    
    
    // property apply
    _applyOpen : function(value, old)
    {
      var open = this.getChildControl("open", true);
      if (open) {
        open.setOpen(value);
      }

      value ? this.addState("opened") : this.removeState("opened");
    },
    
    
    // property apply
    _applyOpenSymbolMode : function(value, old) {
      this._updateIndent();
    },
    
    
    /*
    ---------------------------------------------------------------------------
      HELPER METHODS
    ---------------------------------------------------------------------------
    */
    
    
    __shouldShowOpenButton : function()
    {
      var open = this.getChildControl("open", true);
      if (open == null) {
        return false;
      }

      return this.__isOpenable();
    },
    
    
    __isOpenable : function()
    {
      var openMode = this.getOpenSymbolMode();
      return (
        openMode === "always" ||
        openMode === "auto" && this.__hasChildren()
      );
    },
    
    
    __hasChildren : function() {
      return this.getUserData("cell.children");
    }
  }
});