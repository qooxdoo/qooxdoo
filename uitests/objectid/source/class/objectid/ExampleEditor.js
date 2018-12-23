qx.Class.define("objectid.ExampleEditor", {
  extend: qx.core.Object,
  
  members: {
    _createQxObjectImpl: function(id) {
      switch(id) {
      case "container":
        var comp = new qx.ui.container.Composite(new qx.ui.layout.Grid(5, 2));
        
        comp.add(new qx.ui.basic.Label("Title"), { row: 0, column: 0 });
        comp.add(this.getQxObject("cboTitle"), { row: 0, column: 1 });
        
        comp.add(new qx.ui.basic.Label("Name"), { row: 1, column: 0 });
        comp.add(this.getQxObject("edtName"), { row: 1, column: 1 });
        return comp;
        
      case "cboTitle":
        return new qx.ui.form.SelectBox();
        
      case "ctlrTitle":
        var ctlr = new qx.data.controller.List(null, this.getQxObject("cboTitle"), "name");
        return ctlr;
        
      case "edtName":
        return new qx.ui.form.TextField();
      }
      
      return this.base(arguments, id);
    }
  }
});