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


/**
 * <h2>List Controller</h2>
 * 
 * *General idea*
 * The list controller is responsible for synchronizing every list like widget
 * with a data array. It does not matter if the array contains atomic values 
 * like strings of complete objects where one property holds the value for
 * the label and another property holds the icon url. You can even use converts
 * the make the label show a text corresponding to the icon by binding both,
 * label and icon to the same model property and converting one. 
 * 
 * *Features*
 * 
 * * Synchronize the model and the target
 * * Label and icon are bindable
 * * Takes care of the selection
 * * Passes on the options used by the bindings
 * 
 * *Usage*
 * 
 * As model, only {@link qx.data.Array}s do work. The currently supported 
 * targets are 
 * 
 * * {@link qx.ui.form.SelectBox}
 * * {@link qx.ui.form.List}
 * * {@link qx.ui.form.ComboBox}
 * 
 * All the properties like model, target or any property path is bindable. 
 * Especially the model is nice to bind to another selection for example.
 * The controller itself can only work if it has a model and a target set. The
 * rest of the properties may be empty.
 * 
 * *Cross reference*
 * 
 * * If you want to bind single values, use {@link qx.data.controller.Object}
 * * If you want to bind a tree widget, use {@link qx.data.controller.Tree}
 */
qx.Class.define("qx.data.controller.List", 
{
  extend : qx.core.Object,
  include: qx.data.controller.MSelection,
  
  
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */  
  
  /**
   * @param model {qx.data.Array?null} The array containing the data.
   * 
   * @param target {qx.ui.core.Widget?null} The widget which should show the 
   *   ListItems.
   * 
   * @param labelPath {String?null} If the model contains objects, the labelPath
   *   is the path reference to the property in these objects which should be 
   *   shown as label.
   */
  construct : function(model, target, labelPath)
  {
    this.base(arguments);
        
    // create the maps for storing the bindings
    this.__bindingsLabel = {};
    this.__bindingsIcons = {};
       
    if (labelPath != null) {
      this.setLabelPath(labelPath);      
    }
    if (model != null) {
      this.setModel(model);      
    }
    if (target != null) {
      this.setTarget(target);       
    }
  },
  
  
  
  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */  
  
  properties : 
  {    
    /** Data array containing the data which should be shown in the list. */
    model : 
    {
      check: "value instanceof qx.data.Array || value instanceof qx.data.filter.Array",
      apply: "_applyModel",
      event: "changeModel",
      nullable: true
    },
    
    
    /** The target widget which should show the data. */
    target : 
    {
      apply: "_applyTarget",
      event: "changeTarget",
      nullable: true,
      init: null
    },
    
    
    /** 
     * The path to the property which holds the information that should be 
     * shown as a label. This is only needed if objects are stored in the model.
     */
    labelPath : 
    {
      check: "String",
      apply: "_applyLabelPath",
      nullable: true
    },
    
    
    /** 
     * The path to the property which holds the information that should be 
     * shown as a icon. This is only needed if objects are stored in the model 
     * and if the icon should be shown.
     */
    iconPath : 
    {
      check: "String",
      apply: "_applyIconPath",
      nullable: true
    },
    
    
    /** 
     * A map containing the options for the label binding. The possible keys 
     * can be found in the {@link qx.data.SingleValueBinding} documentation.
     */
    labelOptions : 
    {
      apply: "_applyLabelOptions",
      nullable: true
    },
    
    
    /** 
     * A map containing the options for the icon binding. The possible keys 
     * can be found in the {@link qx.data.SingleValueBinding} documentation.
     */    
    iconOptions :
    {
      apply: "_applyIconOptions",
      nullable: true
    }
  },  



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
       APPLY METHODS
    ---------------------------------------------------------------------------
    */
    /**
     * Apply-method which will be called if the icon options has been changed.
     * It invokes a renewing of all set bindings.
     * 
     * @param value {Map|null} The new icon options.
     * @param old {Map|null} The old icon options.
     */
    _applyIconOptions: function(value, old) {
      this.__renewBindings();
    },
    
    
    /**
     * Apply-method which will be called if the label options has been changed.
     * It invokes a renewing of all set bindings.
     * 
     * @param value {Map|null} The new label options.
     * @param old {Map|null} The old label options.
     */
    _applyLabelOptions: function(value, old) {
      this.__renewBindings();
    },
    
    
    /**
     * Apply-method which will be called if the icon path has been changed.
     * It invokes a renewing of all set bindings.
     * 
     * @param value {String|null} The new icon path.
     * @param old {String|null} The old icon path.
     */    
    _applyIconPath: function(value, old) {
      this.__renewBindings();
    },
    
    
    /**
     * Apply-method which will be called if the label path has been changed.
     * It invokes a renewing of all set bindings.
     * 
     * @param value {String|null} The new label path.
     * @param old {String|null} The old label path.
     */    
    _applyLabelPath: function(value, old) {
      this.__renewBindings();
    },
    
    
    /**
     * Apply-method which will be called if the model has been changed. It
     * removes all the listeners from the old model and adds the needed 
     * listeners to the new model. It also invokes the initial filling of the
     * target widgets if there is a target set.
     * 
     * @param value {qx.data.Array|null} The new model array.
     * @param old {qx.data.Array|null} The old model array.
     */
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
        
        // if there is a target
        if (this.getTarget() != null) {
          // update the model references to the models
          for (var i = 0; i < this.getModel().length; i++) {
            var modelNode = this.getModel().getItem(i);
            var listItem = this.getTarget().getChildren()[i];
            listItem.setUserData("model", modelNode);
          }          
        }
      }

      // erase the selection if there is something selected
      if (this.getSelection() != undefined && this.getSelection().length > 0) {
        this.getSelection().splice(0, this.getSelection().length);
      }
    },
    
    
    /**
     * Apply-method which will be called if the target has been changed. 
     * When the target changes, every binding needs to be reseted and the old 
     * target needs to be cleaned up. If there is a model, the target will be 
     * filled with the data of the model.
     * 
     * @param value {qx.ui.core.Widget|null} The new target.
     * @param old {qx.ui.core.Widget|null} The old target.
     */
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
      this._addChangeTargetListener(value, old);
    },    
    
    
    /*
    ---------------------------------------------------------------------------
       EVENT HANDLER
    ---------------------------------------------------------------------------
    */    
    /**
     * Event handler for the change event of the model. If the model changes, 
     * Only the selection needs to be changed. The change of the data will
     * be done by the binding.
     */
    __changeModel: function() {
      // check if something has been removed from the model
      for (var i = this.getSelection().length - 1; i >= 0; i--) {
        if (!this.getModel().contains(this.getSelection().getItem(i))) {
          this.getSelection().splice(i, 1);
        }
      }
      this._updateSelection();
    },
    
        
    /**
     * Event handler for the changeLength of the model. If the length changes
     * of the model, either ListItems need to be removed or added to the target.
     */
    __changeModelLength: function() {
      // only do something if there is a target
      if (this.getTarget() == null) {
        return;
      }
      
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
    /**
     * Internal helper to add ListItems to the target including the creation 
     * of the binding.
     * 
     * @param index {Number} The index of the item to add.
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
    
    
    /**
     * Internal helper to remove ListItems from the target. Also the bidning 
     * will be removed properly.
     */
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
    /**
     * Sets up the binding for the given ListItem and index.
     * 
     * @param listItem {qx.ui.form.ListItem} The internally created and used 
     *   ListItem.
     * @param index {number} The index of the ListItem.
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
    
    
    /**
     * Method which will be called on the invoke of every binding. It takes 
     * care of the selection on the change of the binding.
     * 
     * @param index {number} The index of the current binding.
     * @param sourceObject {var} The source object of the binding.
     * @param targetObject {var} The target object of the binding.
     */
    __onBindingSet: function(index, sourceObject, targetObject) {
      // check for the users onSetOk for the label binding
      if (this.__onSetOkLabel != null) {
        this.__onSetOkLabel();
      }
      
      // update the selection
      this._updateSelection();
      
      // update the reference to the model
      var itemModel = this.getModel().getItem(index);
      targetObject.setUserData("model", itemModel);
    },
    
    
    /**
     * Internal helper method to remove the binding of the given index.
     * 
     * @param index {number} The index of the binding which should be removed.
     */
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
    
    
    /**
     * Internal helper method to renew all set bindings.
     */
    __renewBindings: function() {
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
