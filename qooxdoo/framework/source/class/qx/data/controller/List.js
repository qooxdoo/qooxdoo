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
    this.setSelection(new qx.data.Array());
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
    },
    
    selection : 
    {
      check: "qx.data.Array",
      event: "changeSelection",
      apply: "_applySelection"
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
      
      // remove the old selection listener
      if (this.__selectionListenerId != undefined && old != undefined) {
        old.removeListenerById(this.__selectionListenerId);
      }
      // add a new selection listener
      this.__selectionListenerId = value.addListener(
        "changeSelection", this.__changeTargetSelection, this
      );
    },    
    
    
    _applySelection: function(value, old) {
      // remove the old listener if necesarry
      if (this._selectionArrayListenerId != undefined && old != undefined) {
        old.removeListenerById(this._selectionArrayListenerId);
      }
      // add a new change listener to the changeArray
      this._selectionArrayListenerId = value.addListener(
        "change", this.__changeSelectionArray, this
      );
    },
    
    
    __changeSelectionArray: function(e) {
      // mark the change process in a flag
      this.__modeifingSelection = true;
      // remove the old selection
      this.getTarget().clearSelection();
      // go through the selection array
      for (var i = 0; i < this.getSelection().length; i++) {
        this.__selectItem(this.getSelection().getItem(i));
      }
      // reset the changing flag
      this.__modeifingSelection = false;
    },
        
    
    __changeTargetSelection: function(e) {
      // if __changeSelectionArray is currently working, do nothing
      if (this.__modeifingSelection) {
        return;
      }
      
      // get the selection of the target
      var targetSelection = this.getTarget().getSelection();
      // go through the target selection
      for (var i = 0; i < targetSelection.length; i++) {
        var item = targetSelection[i].getLabel();
        if (!this.getSelection().contains(item)) {
          this.getSelection().push(item);
        }
      }
      
      var targetSelectionLablels = [];
      for (var i = 0; i < targetSelection.length; i++) {
        targetSelectionLablels[i] = targetSelection[i].getLabel();
      }
      
      for (var i = this.getSelection().length - 1; i >= 0; i--) {
        if (!qx.lang.Array.contains(
          targetSelectionLablels, this.getSelection().getItem(i)
        )) {
          //  the current element
          this.getSelection().splice(i, 1);
        }
      }

      // fire the change event manualy
      this.fireDataEvent("changeSelection", this.getSelection());
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
    },
    
    
    __selectItem: function(item) {
      // get the list item
      var children = this.getTarget().getChildren();
      for (var i = 0; i < children.length; i++) {
        if (children[i].getLabel() == item) {
          var listItem = children[i];
          break;
        }
      }
      
      // select the item in the target
      this.getTarget().addToSelection(listItem);
    },
    
    
    addToSelection: function(item) {
      // save the value to the selection array
      this.getSelection().push(item);
      
      this.__selectItem(item);
    }
    
    
  }
});
