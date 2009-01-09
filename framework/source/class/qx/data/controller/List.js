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


  construct : function(model, target)
  {
    this.base(arguments);
    this.__bindings = {};


    this.setModel(model);
    this.setTarget(target);    
  },
  
  properties : 
  {
    model : 
    {
      check: "qx.data.Array",
      apply: "_applyModel",
      event: "changeModel"
    },
    
    target : 
    {
      apply: "_applyTarget",
      event: "changeTarget"
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
    
    
    _applyTarget: function(value, old) {
      // if there was an old target
      if (old != undefined) {
        // remove all element of the old target
        old.removeAll();
        // remove all bindings
        this.removeAllBindings();
      }
      // add a binding for all elements in the model
      for (var i = 0; i < this.getModel().length; i++) {
        this.__addItem(i);
      }
    },    
        
        
    __changeModelLength: function() {
      // get the length
      var newLength = this.getModel().length;
      var currentLength = this.getTarget().getChildren().length;
      
      if (newLength > currentLength) {
        for (var j = currentLength; j < newLength; j++) {
          this.__addItem(j);
        }
      } else if (newLength < currentLength) {
        for (var j = currentLength; j > newLength; j--) {
          this.__removeItem();
        }
      }      
    },
    
    
    __addItem: function(index) {
      var listItem = new qx.ui.form.ListItem();
      var id = this.bind("model[" + index + "]", listItem, "label");
      this.getTarget().add(listItem);
      
      // save the bindings id
      this.__bindings[index] = id;
    },
    
    
    __removeItem: function() {
      // get the last binding id
      var index = this.getTarget().getChildren().length - 1;
      var id = this.__bindings[index];
      // delete the reference 
      delete this.__bindings[index];
      // remove the binding
      this.removeBinding(id);
      // remove the item
      var oldItem = this.getTarget().removeAt(index);
      oldItem.destroy();
    }
    
    

    
  }
});
