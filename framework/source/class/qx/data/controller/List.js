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
  include: qx.data.controller.MSelection,
  

  construct : function(model, target, labelPath, iconPath, labelOptions, iconOptions)
  {
    this.base(arguments);
        
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

    // set the model, if available
    if (model != undefined) {
      this.setModel(model);      
    }

    this.setTarget(target); 
  },
  
  
  properties : 
  {    
    model : 
    {
      check: "qx.data.Array",
      apply: "_applyModel",
      event: "changeModel",
      nullable: true
    },
    
    target : 
    {
      apply: "_applyTarget",
      event: "changeTarget",
      init: null
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
      
      // if a model is set
      if (value != null) {
        // add a new Listener      
        this.__changeModelLengthListenerId = 
          value.addListener("changeLength", this.__changeModelLength, this);
        this.__changeModelListenerID = 
          value.addListener("change", this.__changeModel, this);

        // check for the new length
        this.__changeModelLength();
      }

      // erase the selection if there is something selected
      if (this.getSelection() != undefined && this.getSelection().length > 0) {
        this.getSelection().splice(0, this.getSelection().length);
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
      
      if (this.getModel() != null) {
        // add a binding for all elements in the model
        for (var i = 0; i < this.getModel().length; i++) {
          this.__addItem(i);
        }
      }
      // add a listener for the target change
      this.__addChangeTargetListener(value, old);
    },    
    
    
    /*
    ---------------------------------------------------------------------------
       EVENT HANDLER
    ---------------------------------------------------------------------------
    */    
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
    }
        
  }
});
