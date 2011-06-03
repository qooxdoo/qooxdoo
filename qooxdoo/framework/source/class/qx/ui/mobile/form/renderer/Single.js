/**
 * Single write docs about it
 */
qx.Class.define("qx.ui.mobile.form.renderer.Single",
{
  
  extend : qx.ui.mobile.form.renderer.AbstractRenderer,
 
  construct : function(form)
  {
    this.base(arguments,form);
  },
  
    
  members :
  {
  
      _getTagName : function()
    {
      return "ul";
    },
    // override
    addItems : function(items, names, title) {
      if(title != null)
      {
        this.__showGroupHeader(title);
      }
      for(var i=0, l=items.length; i<l; i++)
      {
        var row = new qx.ui.mobile.form.Row();
        row.add(new qx.ui.mobile.basic.Label(names[i] ? names[i] : "---"));
        row.add(items[i]);
        this._add(row);
      }
    },

    __showGroupHeader : function(title)
    {
      var row = new qx.ui.mobile.form.Row();
      row.add(new qx.ui.mobile.basic.Label(title));
      this._add(row);
    },
    
    // override
    addButton : function(button) {
        var row = new qx.ui.mobile.form.Row(new qx.ui.mobile.layout.HBox());
        row.add(button, {flex:1});
        this._add(row);
    }
  }
});
