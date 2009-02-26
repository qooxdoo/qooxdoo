qx.Class.define("demobrowser.demo.virtual.messenger.Controller", 
{
  extend : qx.ui.virtual.form.VirtualListController,
  
  construct : function(model, target) 
  {
    this.base(arguments, model, target);
    
    this.__groupCell = new demobrowser.demo.virtual.messenger.GroupCell();
    this.__buddyCell = new demobrowser.demo.virtual.messenger.BuddyCell();
    
    this.__groups = {};
    this.__groupedData = [];
  },
  
  members : 
  {
    getCellRenderer: function(row)
    {
      if (this.__groups[row]) {
        return this.__groupCell
      } else {
        return this.__buddyCell;
      }
    },

    isRowSelectable : function(row) {
      return this.__groups[row] ? false : true;
    },
    
    _visualizeGrouping : function(groups)
    {
      var target = this.getTarget();
      if (target)
      {        
        for (var row in this.__groups) 
        {
          var row = parseInt(row);
          if (!groups[row]) {
            target.unstyleGroup(row);
          }
        }        
        for (var row in groups) 
        {
          var row = parseInt(row);
          if (!this.__groups[row]) {
            target.styleGroup(row);
          }
        }
      }
      this.__groups = groups;      
    },
    

    _updateGrouping : function()
    {
      var model = this.getModel();
      
      this.__groupedData = [];
      var groups = [];
      
      if (model && model.length > 0) 
      {
        this.__groupedData = model.getArray();
        this.__groupedData.sort(function(a, b) 
        {
          var groupA = a.getGroup();
          var groupB = b.getGroup();
          
          if (groupA == groupB) {
            return a.getName() < b.getName() ? -1 : 1;
          }
          
          return groupA > groupB ? -1 : 1;
        });
        
        var groups = [];
        var firstItem = this.__groupedData[0];
        var group = new demobrowser.demo.virtual.messenger.GroupSeparator().set({
          name : firstItem.getGroup(),
          index : 0
        });
        this.__groupedData.unshift(group);
        groups[0] = group;
        
        var i=1;
        do
        {
          var item = this.__groupedData[i];
          if (item.getGroup() !== group.getName()) 
          {
            var group = new demobrowser.demo.virtual.messenger.GroupSeparator().set({
              name : item.getGroup(),
              index : i
            });
            qx.lang.Array.insertAt(this.__groupedData, group, i);
            groups[i] = group;
            i++;
          }
          i ++;
        } while (i<this.__groupedData.length);
      }      

      this._visualizeGrouping(groups);
    },
    
    _applyModel: function(value, old)
    {
      this.base(arguments, value, old);
      
      this._updateGrouping();
      this._syncRowCount();
    },
    
    _syncRowCount: function() {
      this.getTarget().setRowCount(this.__groupedData.length);
    },
    
    getCellData: function(row) {
      return this.__groupedData[row] || "";
    }     
  }
});