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


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  
  construct : function(model, rule)
  {
    this.base(arguments);
    
    this.__inModelBindingIds = {};
    
    this.__setUpInternalData();
    
    if (rule != null) {
      this.setRule(rule);      
    }
    if (model != null) {
      this.setModel(model);      
    }

  },
  
  
  
  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /**
     * The change event which will be fired if there is a change in the array.
     * The data contains a map with three key value pairs:
     * <li>start: The start index of the change.</li>
     * <li>end: The end index of the change.</li>
     * <li>type: The type of the change as a String. This can be 'add',  
     * 'remove' or 'order'</li>
     * <li>item: The item which has been changed.</li>
     */
    "change" : "qx.event.type.Data",
    
    /**
     * The changeLength event will be fired every time the length of the
     * array changes.
     */
    "changeLength": "qx.event.type.Event"
  },
  
  
  
  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  
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
    
    rule : 
    {
      check : "Function",
      nullable : true,
      apply : "_applyRule",
      init : null
    },
    
    updateProperty : 
    {
      check : "String",
      apply : "_applyUpdateProperty",
      nullable : true,
      init : null
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
    _applyUpdateProperty : function(value, old) {
      var model = this.getModel();
      if (model != null && model.length > 0) {      
        // get the corresponding event name
        var eventName = this.__getEventForProperty(model.getItem(0), value);
        for (var i = 0; i < model.length; i++) {
          this.__removeInModelLitener(model.getItem(i));
          this.__addInModelListener(model.getItem(i), eventName);
        }
      }
      
      this.__update();
    },
    
    
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
    
    
    /*
    ---------------------------------------------------------------------------
       EVENT HANDLER
    ---------------------------------------------------------------------------
    */
    __changeInModel: function(ev) {
      this.__update();
    },
    
    
    __changeModelLength: function(ev) {      
      this.__update();
    },
    
    
    __changeModel: function(ev) {
      var item = ev.getData().item;
      // if there is an item
      if (item != null && this.getUpdateProperty() != null) {
        if (ev.getData().type == "add") {
          var eventName = this.__getEventForProperty(
            item, this.getUpdateProperty()
          );
          this.__addInModelListener(item, eventName);
        } else if (ev.getData().type == "remove") {
          this.__removeInModelLitener(item);
        }
      }      
      this.__update();
    },
    
    
    /*
    ---------------------------------------------------------------------------
       MODEL LISTENER SUPPORT
    ---------------------------------------------------------------------------
    */
    __addInModelListener: function(item, eventName) {
      var id = item.addListener(eventName, this.__changeInModel, this);
      this.__inModelBindingIds[item.toHashCode()] = id;      
    },
    
    
    __removeInModelLitener: function(item) {
      var id = this.__inModelBindingIds[item.toHashCode()];
      if (id != null) {
        item.removeListenerById(id);        
      }
    },
        
    
    __getEventForProperty: function(object, property) {
      // get the event name
      var propertieDefinition =  qx.Class.getPropertyDefinition(
        object.constructor, property
      );

      // check for the existance of the source property
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        qx.core.Assert.assertNotNull(propertieDefinition,
          "No property definition available for " + property);
      }

      return propertieDefinition.event;      
    }, 
    
    
    /*
    ---------------------------------------------------------------------------
       UPDATE
    ---------------------------------------------------------------------------
    */
    __update: function() {
      var model = this.getModel();
      
      // if there is no model set
      if (model == null) {
        // remove everything from the filter data
        if (this.__data != null) {
          this.__data.splice(0, this.__data.length);
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
          if (!this.__data.contains(modelItem)) {
            // if not, push it to the filtered data
            this.__data.push(modelItem);
          }
        } else {
          // if the filtered data contains an element not matched by the filter
          if (this.__data.contains(modelItem)) {
            // remove the element
            var index = this.__data.indexOf(modelItem);
            this.__data.splice(index, 1);
          }          
        }
      }
      // remove the stuff not in the model anymore
      for (var i = this.__data.length - 1; i >= 0; i--) {
        if (!model.contains(this.__data.getItem(i))) {
          this.__data.splice(i, 1);
        }
      }
    },
    
    
    /*
    ---------------------------------------------------------------------------
       ARRAY STUFF
    ---------------------------------------------------------------------------
    */
    
    __setUpInternalData: function() {
      // create the internal data array
      this.__data = new qx.data.Array();
      // create a local length
      this.length = 0;
      // react on length changes
      this.__data.addListener("changeLength", function() {
        this.length = this.__data.length;
        this.fireEvent("changeLength", qx.event.type.Event);      
      }, this);
      // ceact on array changes
      this.__data.addListener("change", function(ev) {
        this.fireDataEvent("change", ev.getData(), null);
      }, this);
    },
    
    
    contains: function(item) {
      return this.__data.contains(item);
    },
    
    
    getItem: function(index) {
      return this.__data.getItem(index);
    },
    
    
    toString: function() {
      return this.__data.toString();
    }
  }
});
