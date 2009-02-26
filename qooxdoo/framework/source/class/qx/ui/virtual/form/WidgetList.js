qx.Class.define("qx.ui.virtual.form.WidgetList", 
{
  extend : qx.ui.virtual.form.AbstractList,


  construct : function()
  {
    this.base(arguments, 0, 1, 20, 100);
    
    this.__cellLayer = new qx.ui.virtual.layer.WidgetCell(this);
    this.getPane().addLayer(this.__cellLayer); 
    
    this._defaultCellRenderer = qx.ui.virtual.form.ListItemCell.getInstance();
  },

  
  members :
  {
    update: function() {
      this.__cellLayer.updateLayerData();
    },
    
    
    _styleSelectable : function(item, type, wasAdded) 
    {
      if (type !== "selected") {
        return;
      }

      var widgets = this.__cellLayer.getChildren();
      for (var i=0; i<widgets.length; i++)
      {
        var widget = widgets[i];
        var cellRow = widget.getUserData("cell.row");
        
        if (item !== cellRow) {
          continue;
        }
        
        var cell = this._getCellRenderer(item);
        
        if (wasAdded) {
          cell.updateStates(widget, {selected: 1});
        } else {
          cell.updateStates(widget, {});
        }        
      }
    },     
    
    
    getCellWidget : function(row, column)
    {     
      var data = this._getCellData(row);

      if (!data) {
        return null;
      }
                 
      var states = {};
      if (this._manager.isItemSelected(row)) {
        states.selected = true;
      }
      
      var cell = this._getCellRenderer(row);      
      var widget = cell.getCellWidget(data, states);
      widget.setUserData("cell.row", row);
      widget.setUserData("cell.renderer", cell);

      return widget;
    },
    
    
    poolCellWidget : function(widget)
    {
      var cellRenderer = widget.getUserData("cell.renderer");
      cellRenderer.pool(widget);
    }   
  }
});