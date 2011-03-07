qx.Class.define("qx.ui.tree.core.AbstractVirtualTreeItem",
{
  extend : qx.ui.core.Widget,
  type : "abstract",
  include : [qx.ui.form.MModelProperty],
  implement : [qx.ui.form.IModel],


  construct : function(label)
  {
    this.base(arguments);

    if (label != null) {
      this.setLabel(label);
    }
    
    this._setLayout(new qx.ui.layout.HBox());
    this._addWidgets();
  },


  properties :
  {
    indent :
    {
      check : "Integer",
      apply : "_applyIndent",
      themeable : true,
      init : 19
    },

    
    icon :
    {
      check : "String",
      event : "changeLabel",
      apply : "_applyIcon",
      nullable : true,
      themeable : true
    },
    
    
    label :
    {
      check : "String",
      event : "changeLabel",
      apply : "_applyLabel",
      nullable : true
    }
  },


  members :
  {
    __iconAdded : null,
    
    
    __labelAdded : null,
    
    
    _spacer : null,

    
    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */

    
    addWidget : function(widget, options) {
      this._add(widget, options);
    },
    
    
    addSpacer : function()
    {
      if (!this._spacer) {
        this._spacer = new qx.ui.core.Spacer();
      } else {
        this._remove(this._spacer);
      }

      this._add(this._spacer);
    },

    
    addIcon : function()
    {
      var icon = this.getChildControl("icon");

      if (this.__iconAdded) {
        this._remove(icon);
      }

      this._add(icon);
      this.__iconAdded = true;
    },

    
    addLabel : function(text)
    {
      var label = this.getChildControl("label");

      if (this.__labelAdded) {
        this._remove(label);
      }

      if (text != null) {
        this.setLabel(text);
      } else {
        label.setValue(this.getLabel());
      }

      this._add(label);
      this.__labelAdded = true;
    },
    
    
    /*
    ---------------------------------------------------------------------------
      INTERNAL API
    ---------------------------------------------------------------------------
    */
    
    
    // overridden
    syncWidget : function() {
      this._updateIndent();
    },
    
    
    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "label":
          control = new qx.ui.basic.Label(this.getLabel());
          break;

        case "icon":
          control = new qx.ui.basic.Image(this.getIcon());
          break;
      }

      return control || this.base(arguments, id, hash);
    },
    
    
    _addWidgets : function() {
      throw new Error("Abstract method call.");
    },

    
    _updateIndent : function() {
      throw new Error("Abstract method call.");
    },


    _getLevel : function() {
      return this.getUserData("cell.level");
    },
    

    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY METHODS
    ---------------------------------------------------------------------------
    */
    
    
    // property apply
    _applyLabel : function(value, old)
    {
      var label = this.getChildControl("label", true);
      if (label != null) {
        label.setValue(value);
      }
    },

    
    // property apply
    _applyIndent : function(value, old) {
      this._updateIndent();
    },


    // property apply
    _applyIcon : function(value, old)
    {
      var icon = this.getChildControl("icon", true);
      if (icon != null) {
        icon.setSource(value);
      }
    }
  },

  
  destruct : function()
  {
    if (this._spacer != null) {
      this._spacer.dispose();
    }
    
    this._spacer = null;
  }
});