/**
 * Single write docs about it
 */
qx.Class.define("qx.ui.mobile.form.renderer.SinglePlaceholder",
{
  
  extend : qx.ui.mobile.form.renderer.Single,
 
  construct : function(form)
  {
    this.base(arguments,form);
  },
  
    
  members :
  {
  
    // override
    addItems : function(items, names, title) {
      if(title != null)
      {
        this.__showGroupHeader(title);
      }
      for(var i=0, l=items.length; i<l; i++)
      {
        var row = new qx.ui.mobile.form.Row();
        if (items[i].setPlaceholder === undefined) {
          throw new Error("Only widgets with placeholders supported.");
        }
        items[i].setPlaceholder(names[i]);
        row.add(items[i]);
        this._add(row);
      }
    }

  }
});
