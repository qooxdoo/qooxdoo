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
qx.Class.define("qx.data.controller.List", 
{
  extend : qx.core.Object,


  construct : function(model)
  {
    this.base(arguments);
    this.setModel(model);
    
    this.__targets = [];
    this.__bindings = {};
  },
  
  properties : 
  {
    model : 
    {
      check: "qx.data.Array",
      apply: "_applyModel",
      event: "changeModel"
    }
  },  

  members :
  {
    _applyModel: function(value, old) {
      // remove the old listener
      if (old != undefined && this.__changeModelListenerId != undefined) {
        old.removeListenerById(this.__changeModelListenerId);
      }
      // add a new Listener
      value.addListener("changeLength", this.__changeModelLength, this);
      
      // check for the new length
      if (old != undefined && old.length != value.length) {
        this.__changeModelLength();
      }
    },
        
        
    __changeModelLength: function() {
      var newLength = this.getModel().length;
      for (var i = 0; i < this.__targets.length; i++) {
        var currentLength = this.__targets[i].getChildren().length;
        if (newLength > currentLength) {
          for (var j = currentLength; j < newLength; j++) {
            this.__addItem(j, this.__targets[i]);
          }
        } else if (newLength < currentLength) {
          for (var j = currentLength; j > newLength; j--) {
            this.__removeItem(this.__targets[i]);
          }
        }
      }
    },
    
    
    __addItem: function(index, target) {
      var listItem = new qx.ui.form.ListItem();
      var id = this.bind("model[" + index + "]", listItem, "label");
      target.add(listItem);
      
      // save the bindings id
      if (this.__bindings[target.toHashCode()] == undefined) {
        this.__bindings[target.toHashCode()] = {};
      }
      this.__bindings[target.toHashCode()][index] = id;
    },
    
    
    __removeItem: function(target) {
      // get the last binding id
      var index = target.getChildren().length - 1;
      var id = this.__bindings[target.toHashCode()][index];
      // delete the reference 
      delete this.__bindings[target.toHashCode()][index];
      // remove the binding
      this.removeBinding(id);
      // remove the item
      target.removeAt(index);
    },
    
    
    addTarget: function(target) {
      // add a binding for all elements in the model
      for (var i = 0; i < this.getModel().length; i++) {
        this.__addItem(i, target);
      }
      
      this.__targets.push(target);
    },
    
    
    removeTarget: function(target) {
      // remove all bindings
      var targetHash = target.toHashCode();
      for (var i in this.__bindings[targetHash]) {
        var id = this.__bindings[targetHash][i];
        this.removeBinding(id);
      }
      // delete the target in the internal reference
      delete this.__bindings[targetHash];
      qx.lang.Array.remove(this.__targets, target);
      // remove all items of the target
      target.removeAll();
    }
  }
});
