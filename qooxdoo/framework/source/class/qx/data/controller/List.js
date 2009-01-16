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


  construct : function(model, target, labelPath, iconPath, labelOptions, iconOptions)
  {
    this.base(arguments);
    this.setSelection(new qx.data.Array());
    this.__bindingsLabel = {};
    this.__bindingsIcons = {};
    
    if (labelOptions != undefined) {
      this.setLabelOptions(labelOptions);
    }
    
    if (iconOptions != undefined) {
      this.setIconOptions(iconOptions);
    }    
    
    if (labelPath != undefined) {
      this.setLabelPath(labelPath);      
    }
    
    if (iconPath != undefined) {
      this.setIconPath(iconPath);
    }

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
      event: "changeTarget",
      init: null
    },
    
    selection : 
    {
      check: "qx.data.Array",
      event: "changeSelection",
      apply: "_applySelection"
    },
    
    labelPath : 
    {
      check: "String",
      apply: "_applyLabelPath",
      nullable: true
    },
    
    iconPath : 
    {
      check: "String",
      apply: "_applyIconPath",
      nullable: true
    },
    
    labelOptions : 
    {
      apply: "_applyLabelOptions",
      nullable: true
    },
    
    iconOptions :
    {
      apply: "_applyIconOptions",
      nullable: true
    }
  },  


  members :
  {
    _applyIconOptions: function(value, old) {
      this.__renewBindings();
    },
    
    _applyLabelOptions: function(value, old) {
      this.__renewBindings();
    },
    
    
    _applyIconPath: function(value, old) {
      this.__renewBindings();
    },
    
    
    _applyLabelPath: function(value, old) {
      this.__renewBindings();
    },
    
    
    _applyModel: function(value, old) {
      // remove the old listener
      if (old != undefined) {
        if (this.__changeModelLengthListenerId != undefined) {
          old.removeListenerById(this.__changeModelLengthListenerId);          
        }
        if (this.__changeModelListenerId != undefined) {
          old.removeListenerById(this.__changeModelListenerId);
        }
      }
      
      // add a new Listener
      this.__changeModelLengthListenerId = 
        value.addListener("changeLength", this.__changeModelLength, this);
      this.__changeModelListenerID = 
        value.addListener("change", this.__changeModel, this);
            
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
      this.__updateSelection();
    },
        
    
    __changeTargetSelection: function(e) {
      // if __changeSelectionArray is currently working, do nothing
      if (this.__modifingSelection) {
        return;
      }
      
      // get the selection of the target
      var targetSelection = this.getTarget().getSelection();
      // go through the target selection
      for (var i = 0; i < targetSelection.length; i++) {
        
        // get the fitting item
        var item = targetSelection[i].getUserData("model");
        if (!this.getSelection().contains(item)) {
          this.getSelection().push(item);
        }
      }
      
      var targetSelectionItems = [];
      for (var i = 0; i < targetSelection.length; i++) {
        targetSelectionItems[i] = targetSelection[i].getUserData("model");
      }
      
      for (var i = this.getSelection().length - 1; i >= 0; i--) {
        if (!qx.lang.Array.contains(
          targetSelectionItems, this.getSelection().getItem(i)
        )) {
          //  the current element
          this.getSelection().splice(i, 1);
        }
      }

      // fire the change event manualy
      this.fireDataEvent("changeSelection", this.getSelection());
    },
    
    
    __changeModel: function() {
      // check if something has been removed from the model
      for (var i = this.getSelection().length - 1; i >= 0; i--) {
        if (!this.getModel().contains(this.getSelection().getItem(i))) {
          this.getSelection().splice(i, 1);
        }
      }
      this.__updateSelection();
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
      listItem.setUserData("model", this.getModel().getItem(index));
      this.__bindListItem(listItem, index);
      this.getTarget().add(listItem);      
    },
    
    
    __bindListItem: function(listItem, index) {
 
      var options = qx.lang.Object.copy(this.getLabelOptions());
      if (options != null) {
        this.__onSetOkLabel = options.onSetOk;
        delete options.onSetOk;
      } else {
        options = {};
        this.__onSetOkLabel = null;
      }
      options.onSetOk =  qx.lang.Function.bind(this.__onBindingSet, this, index);



      // build up the path for the binding
      var bindPath = "model[" + index + "]";
      if (this.getLabelPath() != null) {
        bindPath += "." + this.getLabelPath();
      }
      var id = this.bind(bindPath, listItem, "label", options);
      
      // save the bindings id
      this.__bindingsLabel[index] = id;
      
      // if the iconPath is set
      if (this.getIconPath() != null) {
        
        options = qx.lang.Object.copy(this.getIconOptions());
        if (options != null) {
          this.__onSetOkIcon = options.onSetOk;
          delete options.onSetOk;
        } else {
          options = {};
          this.__onSetOkIcon = null;
        }
        options.onSetOk =  qx.lang.Function.bind(this.__onBindingSet, this, index);
        
        // build up the path for the binding
        bindPath = "model[" + index + "]";
        if (this.getIconPath() != null) {
          bindPath += "." + this.getIconPath();
        }
        id = this.bind(bindPath, listItem, "icon", options);
        
        this.__bindingsIcons[index] = id;
      }
    },
    
    
    __onBindingSet: function(index, sourceObject, targetObject, data) {
      // check for the users onSetOk for the label binding
      if (this.__onSetOkLabel != null) {
        this.__onSetOkLabel();
      }
      
      // update the selection
      this.__updateSelection();
      
      // update the reference to the model
      var itemModel = this.getModel().getItem(index);
      targetObject.setUserData("model", itemModel);
    },
    
    
    __removeItem: function() {
      // get the last binding id
      var index = this.getTarget().getChildren().length - 1;
      this.__removeBindingsFrom(index);
      // remove the item
      var oldItem = this.getTarget().removeAt(index);
      oldItem.destroy();
    },
    
    
    __removeBindingsFrom: function(index) {
      var id = this.__bindingsLabel[index];
      // delete the reference 
      delete this.__bindingsLabel[index];
      // remove the binding
      this.removeBinding(id);
      // check for the icon binding
      if (this.__bindingsIcons[index] != undefined) {
        id = this.__bindingsIcons[index];
        delete this.__bindingsIcons[index];
        this.removeBinding(id);
      }
    },
    
    
    __updateSelection: function() {
      // mark the change process in a flag
      this.__modifingSelection = true;      

      // remove the old selection
      this.getTarget().clearSelection();
      // go through the selection array
      for (var i = 0; i < this.getSelection().length; i++) {
        this.__selectItem(this.getSelection().getItem(i));
      }     
      
      // reset the changing flag
      this.__modifingSelection = false;       
    },    
    
    
    __selectItem: function(item) {
      // get the list item
      var children = this.getTarget().getChildren();
      for (var i = 0; i < children.length; i++) {
        if (children[i].getUserData("model") == item) {
          // select the item in the target
          this.getTarget().addToSelection(children[i]);
          return;
        }
      }
    },
    
    
    __renewBindings: function(attribute) {
      // ignore first run
      if (this.getTarget() == null) {
        return;
      }
            
      // get all children of the target
      var listItems = this.getTarget().getChildren();
            
      // go through all items
      for (var i = 0; i < listItems.length; i++) {
        this.__removeBindingsFrom(i);
        // add the new binding
        this.__bindListItem(listItems[i], i);
      }      
    }
    
        
  }
});
