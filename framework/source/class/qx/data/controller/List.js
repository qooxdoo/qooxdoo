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
    this.base(arguments, model, target);
    
    // create a default selection array
    this.setSelection(new qx.data.Array());
    
    // create the maps for storing the bindings
    this.__bindingsLabel = {};
    this.__bindingsIcons = {};
    
    // set the label options, if available
    if (labelOptions != undefined) {
      this.setLabelOptions(labelOptions);
    }

    // set the icon options, if available    
    if (iconOptions != undefined) {
      this.setIconOptions(iconOptions);
    }    
    
    // set the label path, if available    
    if (labelPath != undefined) {
      this.setLabelPath(labelPath);      
    }
    
    // set the icon path, if available    
    if (iconPath != undefined) {
      this.setIconPath(iconPath);
    }

    // set the model and the target
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
    /*
    ---------------------------------------------------------------------------
       APPLY METHODS
    ---------------------------------------------------------------------------
    */
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

      // if a selection API is supported
      var sSupport = this.__targetSupportsSingleSelection();
      var mSupport = this.__targetSupportsMultiSelection();
      if (mSupport || sSupport) {
        // add a new selection listener
        this.__selectionListenerId = value.addListener(
          "changeSelection", this.__changeTargetSelection, this
        );        
      }
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
    
    
    /*
    ---------------------------------------------------------------------------
       EVENT HANDLER
    ---------------------------------------------------------------------------
    */    
    __changeSelectionArray: function(e) {
      this.__updateSelection();
    },
        
    
    __changeTargetSelection: function(e) {
      // if __changeSelectionArray is currently working, do nothing
      if (this.__modifingSelection) {
        return;
      }
      
      if (this.__targetSupportsMultiSelection()) {
        // get the selection of the target
        var targetSelection = this.getTarget().getSelection();        
      } else if (this.__targetSupportsSingleSelection()) {
        // get the selection of the target as an array
        var targetSelection = [this.getTarget().getSelected()];
      }  
      
      // go through the target selection
      for (var i = 0; i < targetSelection.length; i++) {
        // get the fitting item
        var item = targetSelection[i].getUserData("model");
        if (!this.getSelection().contains(item)) {
          this.getSelection().push(item);
        }
      }
      
      // get all items selected in the list
      var targetSelectionItems = [];
      for (var i = 0; i < targetSelection.length; i++) {
        targetSelectionItems[i] = targetSelection[i].getUserData("model");
      }
      
      // go through the controller selection
      for (var i = this.getSelection().length - 1; i >= 0; i--) {
        // if the item in the controller selection is not selected in the list
        if (!qx.lang.Array.contains(
          targetSelectionItems, this.getSelection().getItem(i)
        )) {
          // remove the current element
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
      
      // if there are more item
      if (newLength > currentLength) {
        // add the new elements
        for (var j = currentLength; j < newLength; j++) {
          this.__addItem(j);
        }
      // if there are less elements
      } else if (newLength < currentLength) {
        // remove the unnecessary ítems
        for (var j = currentLength; j > newLength; j--) {
          this.__removeItem();
        }
      }      
    },
    
    
    /*
    ---------------------------------------------------------------------------
       ITEM HANDLING
    ---------------------------------------------------------------------------
    */    
    __addItem: function(index) {
      // create a new ListItem
      var listItem = new qx.ui.form.ListItem();
      // store the coresponding model element as user data
      listItem.setUserData("model", this.getModel().getItem(index));
      // set up the binding
      this.__bindListItem(listItem, index);
      // add the ListItem to the target
      this.getTarget().add(listItem);      
    },
    
    
    __removeItem: function() {
      // get the last binding id
      var index = this.getTarget().getChildren().length - 1;
      this.__removeBindingsFrom(index);
      // remove the item
      var oldItem = this.getTarget().removeAt(index);
      oldItem.destroy();
    },    
    
    
    /*
    ---------------------------------------------------------------------------
       BINDING STUFF
    ---------------------------------------------------------------------------
    */
    __bindListItem: function(listItem, index) {
      // create the options for the binding containing the old options
      // including the old onSetOk function
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
      // create the binding
      var id = this.bind(bindPath, listItem, "label", options);
      // save the bindings id
      this.__bindingsLabel[index] = id;
      
      // if the iconPath is set
      if (this.getIconPath() != null) {
        // create the options for the icon path
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
        // create the binding
        id = this.bind(bindPath, listItem, "icon", options);
        // save the binding id
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
    
    
    __removeBindingsFrom: function(index) {
      var id = this.__bindingsLabel[index];
      // delete the reference 
      delete this.__bindingsLabel[index];
      // remove the binding
      this.removeBinding(id);
      // of an icon binding exists
      if (this.__bindingsIcons[index] != undefined) {
        // remove the icon binding
        id = this.__bindingsIcons[index];
        delete this.__bindingsIcons[index];
        this.removeBinding(id);
      }
    },
    
    
    __renewBindings: function(attribute) {
      // ignore, if no target is set (startup)
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
    },    
    
    
    
    /*
    ---------------------------------------------------------------------------
       SELECTION
    ---------------------------------------------------------------------------
    */    
    __updateSelection: function() {
      // mark the change process in a flag
      this.__modifingSelection = true;      
      
      // if its a multi selection target
      if (this.__targetSupportsMultiSelection()) {
        // remove the old selection
        this.getTarget().resetSelection();
        // go through the selection array
        for (var i = 0; i < this.getSelection().length; i++) {
          // select each item
          this.__selectItem(this.getSelection().getItem(i));
        } 
      // if its a single selection target      
      } else if (this.__targetSupportsSingleSelection()) {
        // select the last selected item (old selection will be removed anyway)
        this.__selectItem(
          this.getSelection().getItem(this.getSelection().length - 1)
        );
      }
      
      // reset the changing flag
      this.__modifingSelection = false;       
    },    
    
    
    __targetSupportsMultiSelection: function() {
      var targetClass = this.getTarget().constructor;
      return qx.Class.implementsInterface(targetClass, qx.ui.core.IMultiSelection);
    },
    
    
    __targetSupportsSingleSelection: function() {
      var targetClass = this.getTarget().constructor;      
      return qx.Class.implementsInterface(targetClass, qx.ui.core.ISingleSelection);
    },
    
    
    __selectItem: function(item) {
      // get all list items
      var children = this.getTarget().getChildren();
    
      // go through all children and search for the child to select
      for (var i = 0; i < children.length; i++) {
        if (children[i].getUserData("model") == item) {
          // if the target is multi selection able
          if (this.__targetSupportsMultiSelection()) {            
            // select the item in the target
            this.getTarget().addToSelection(children[i]);
          // if the target is single selection able
          } else if (this.__targetSupportsSingleSelection()) {
            this.getTarget().setSelected(children[i]);
          }
          return;
        }
      }        
    }
        
  }
});
