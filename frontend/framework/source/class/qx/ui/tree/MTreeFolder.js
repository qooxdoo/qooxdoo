qx.Mixin.define("qx.ui.tree.MTreeFolder",
{
  construct : function()
  {
    this._children = [];
  },


  members :
  {
    getChildrenContainer : function()
    {
      if (!this._childrenContainer) {
        this._childrenContainer = new qx.ui.core.Widget().set({
          layout : new qx.ui.layout.VBox()
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


    getVBoxLayout : function() {
      return this.getChildrenContainer().getLayout();
    },


    getChildren : function() {
      return this._children;
    },


    hasChildren : function() {
      return this._children ? this._children.length > 0 : false;
    },


    add : function(varargs)
    {
      var layout = this.getVBoxLayout();

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

        if (!hasChildren && this.getParentChildrenContainer()) {
          this.getParentChildrenContainer().getLayout().addAfter(this.getChildrenContainer(), this);
        }

        qx.ui.core.queue.Widget.add(treeItem);
      }
    },


    remove : function(treeItem)
    {
      var layout = this.getVBoxLayout();

      if (treeItem.hasChildren()) {
        layout.remove(treeItem.getChildrenContainer());
      }
      qx.lang.Array.remove(this._children, treeItem);

      treeItem.setParent(null);
      layout.remove(treeItem);
    }

  }
})