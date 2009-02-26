qx.Class.define("qx.ui.virtual.form.HtmlList", 
{
  extend : qx.ui.virtual.form.AbstractList,


  construct : function()
  {
    this.base(arguments);

    this.__rowLayer = new qx.ui.virtual.layer.Row("white", "#EEE");
    this.getPane().addLayer(this.__rowLayer);
    this.getPane().addLayer(new qx.ui.virtual.layer.GridLines("horizontal"));
    this.getPane().addLayer(new qx.ui.virtual.layer.GridLines("vertical"));      
    this.__cellLayer = new qx.ui.virtual.layer.HtmlCell(this);
    this.getPane().addLayer(this.__cellLayer);   

    this._defaultCellRenderer = new qx.ui.virtual.cell.Cell();
  },


  members :
  {
    update: function() {
      this.__cellLayer.updateLayerData();
    },


    styleSelectable : function(item, type, wasAdded)
    {
      if (type !== "selected") {
        return;
      }
      if (wasAdded) {
        this.__rowLayer.setDecorator(item, "selected");
      } else {
        this.__rowLayer.setDecorator(item, null);
      }
      this.__cellLayer.updateLayerData();
    },

    
    getCellProperties : function(row, column)
    {
      var states = {};
      if (this._manager.isItemSelected(row)) {
        states.selected = true;
      }      
      return this._getCellRenderer(row).getCellProperties(this._getCellData(row), states);
    }  
  }
});