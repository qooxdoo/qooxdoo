qx.Class.define("qx.ui.virtual.form.AbstractList", 
{
  extend : qx.ui.virtual.core.Scroller,


  construct : function()
  {
    this.base(arguments, 0, 1, 20, 100);

    this.getPane().addListener("resize", this._onResize, this); 
    
    var self = this;
    var selectionDelegate = {
      isItemSelectable : function(item)
      {
        return self._delegate.isRowSelectable ?
          self._delegate.isRowSelectable(item) :
          true;
      },
      styleSelectable : function(item, type, wasAdded) {
        self._styleSelectable(item, type, wasAdded);
      }        
    }
    
    this._manager = new qx.ui.virtual.selection.Row(
      this.getPane(), selectionDelegate
    );
    this._manager.attachMouseEvents(this.getPane());
    this._manager.attachKeyEvents(this);
    this._manager.set({
      mode: "multi"
    });

    this._manager.addListener("changeSelection", function(e) {
      this.fireDataEvent("changeSelection", e.getData());
    }, this);
  },

  
  events: 
  {
    "changeSelection": "qx.event.type.Data"
  },

  
  properties :
  {
    appearance :
    {
      refine : true,
      init : "list"
    },
    
    rowCount :
    {
      check : "Integer",
      event : "changeRowCount",
      init : 0,
      apply : "_applyRowCount"
    },

    delegate : 
    {
      check : "Object",
      event: "changeDelegate",
      init: null,
      nullable: true,
      apply : "_applyDelegate"
    }
  },

  
  members :
  {
    _defaultCellRenderer : null,
    
    update: function() {
      throw new Error("abstract method");
    },


    _applyRowCount: function(value, old) {
      this.getPane().getRowConfig().setItemCount(value);
    },
    
    
    _applyDelegate : function(value, old) {
      this._delegate = value || {};
    },
    

    _styleSelectable : function(item, type, wasAdded) {
      throw new Error("abstract method");
    },
    
    
    _onResize : function(e) {
      this.getPane().getColumnConfig().setItemSize(0, e.getData().width);
    },
    
    
    _getCellData: function(row) {
      return this._delegate.getCellData ? this._delegate.getCellData(row) : null;
    },
    
    
    _getCellRenderer : function(row)
    {
      return this._delegate.getCellRenderer ?
        this._delegate.getCellRenderer(row) : 
        this._defaultCellRenderer;
    }    
  }
});