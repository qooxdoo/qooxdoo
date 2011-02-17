qx.Class.define("qx.ui.tree.core.FolderOpenButton",
{
  extend : qx.ui.basic.Image,
  include : qx.ui.core.MExecutable,

  construct : function(open)
  {
    this.base(arguments);

    if (open != null) {
      this.setOpen(open);
    } else {
      this.initOpen();
    }

    this.addListener("click", this._onClick);
    this.addListener("mousedown", this._stopPropagation, this);
    this.addListener("mouseup", this._stopPropagation, this);
  },

  properties :
  {
    open :
    {
      check : "Boolean",
      init : false,
      event : "changeOpen",
      apply : "_applyOpen"
    }
  },

  members :
  {
    _applyOpen : function(value, old)
    {
      value ? this.addState("opened") : this.removeState("opened");
      this.execute();
    },

    _stopPropagation : function(e) {
      e.stopPropagation();
    },

    _onClick : function(e)
    {
      this.toggleOpen();
      e.stopPropagation();
    }
  }
});
