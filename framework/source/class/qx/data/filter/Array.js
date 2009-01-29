/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.data.filter.Array", 
{
  extend : qx.core.Object,


  construct : function(model, rule)
  {
    this.base(arguments);
    
    this.setFilteredData(new qx.data.Array());
    
    if (rule != null) {
      this.setRule(rule);      
    }
    if (model != null) {
      this.setModel(model);      
    }

  },
  
  
  properties : 
  {
    model : 
    {
      check : "qx.data.Array",
      event : "changeModel",
      apply : "_applyModel",
      init : null,
      nullable: true
    },
    
    filteredData : 
    {
      check : "qx.data.Array",
      event : "changeFilteredData",
      init : null
    },
    
    rule : 
    {
      check : "Function",
      nullable : true,
      apply : "_applyRule",
      init : null
    }
  },

  members :
  {
    _applyRule: function(value, old) {
      this.__update();
    },
    
    _applyModel: function(value, old) {
      // if there is an old model
      if (old != null) {
        // remove the old listeners
        old.removeListenerById(this.__modelChangeListenerId);
        old.removeListenerById(this.__modelChangeLengthListenerId);
      }
      
      // if a new model is set
      if (value != null) {
        // add the new listeners
        this.__modelChangeListenerId = 
          value.addListener("change", this.__changeModel, this);
        this.__modelChangeLengthListenerId = 
          value.addListener("changeLength", this.__changeModelLength, this);        
      }
      // set the filter to make an initial update
      this.__update();
    },
    
    
    __changeModelLength: function(ev) {
      this.__update();
    },
    
    
    __changeModel: function(ev) {
      this.__update();
    },
    
    
    __update: function() {
      var model = this.getModel();
      var filteredData = this.getFilteredData();
      
      // if there is no model set
      if (model == null) {
        // remove everything from the filter data
        if (filteredData != null) {
          filteredData.splice(0, filteredData.length);
        }
        return;
      }
        
      // go trough all model objects
      for (var i = 0; i < model.length; i++) {
        // get the current item
        var modelItem = model.getItem(i);
        // if there is no rule or the rule says the item is in
        if (this.getRule() == null || this.getRule()(modelItem)) {
          // check if its already in
          if (!filteredData.contains(modelItem)) {
            // if not, push it to the filtered data
            filteredData.push(modelItem);
          }
        } else {
          // if the filtered data contains an element not matched by the filter
          if (filteredData.contains(modelItem)) {
            // remove the element
            var index = filteredData.indexOf(modelItem);
            filteredData.splice(index, 1);
          }          
        }
      }
      // remove the stuff not in the model anymore
      for (var i = filteredData.length - 1; i >= 0; i--) {
        if (!model.contains(filteredData.getItem(i))) {
          filteredData.splice(i, 1);
        }
      }
    }
  }
});
