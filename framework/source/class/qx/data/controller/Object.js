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



qx.Class.define("qx.data.controller.Object", 
{
  extend : qx.core.Object,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  
  /**
   * @param model {qx.core.Object?null} The model for the model property.
   */
  construct : function(model)
  {
    this.base(arguments);

    // create a map for all created binding ids
    this.__bindings = {};
    
    if (model != null) {
      this.setModel(model);      
    }
  },
  
  
  
  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  
  properties : 
  {
    /** The model object which does have the properties for the binding. */
    model : 
    {
      check: "qx.core.Object",
      event: "changeModel",
      apply: "_applyModel",
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
    /**
     * Apply-method which will be called if a new model has been set.
     * All bindings will be moved to the new model.
     * 
     * @param value {qx.core.Object|null} The new model.
     * @param old {qx.core.Object|null} The old model.
     */
    _applyModel: function(value, old) {
      // add all bindings to the new model
      for (var targetHash in this.__bindings) {
        var bindingsForTarget = this.__bindings[targetHash];
        this.__bindings[targetHash] = [];
        var targetObject = qx.core.ObjectRegistry.fromHashCode(targetHash);
        
        for (var i = 0; i < bindingsForTarget.length; i++) {
          // check for a bidirectional binding
          var bidirectional = false;
          if (bindingsForTarget[i][1] != null) {
            bidirectional = true;
            // remove the old reverse binding
            targetObject.removeBinding(bindingsForTarget[i][1]);
          }
          this.addTarget(
            targetObject, bindingsForTarget[i][2], 
            bindingsForTarget[i][3], bidirectional, 
            bindingsForTarget[i][4], bindingsForTarget[i][5]
          );
        }
      }
    },
    
    
    /**
     * Adds a new target to the controller. After adding the target, the given
     * property of the model will be bound to the targets property.
     * 
     * @param targetObject {qx.core.Object} The object on which the property 
     *   should be bound.
     * 
     * @param targetProperty {String} The property to which the binding should 
     *   go. 
     * 
     * @param sourceProperty {String} The name of the property in the model.
     * 
     * @param bidirectional {Boolean?false} Signals if the binding should also work
     *   in the reverse direction, from the target to source.
     * 
     * @param options {Map?null} The options Map used by the binding from source
     *   to target. The possible options can be found in the 
     *   {@link qx.data.SingleValueBinding} class.
     * 
     * @param reverseOptions {Map?null} The options used by the binding in the 
     *   reverse direction. The possible options can be found in the 
     *   {@link qx.data.SingleValueBinding} class.
     */
    addTarget: function(
      targetObject, targetProperty, sourceProperty, 
      bidirectional, options, reverseOptions
    ) {
      // create the binding
      var id = this.bind(
        "model." + sourceProperty, targetObject, targetProperty, options
      );
      // create the reverse binding if necessary
      var idReverse = null
      if (bidirectional) {
        idReverse = targetObject.bind(
          targetProperty, this.getModel(), sourceProperty, reverseOptions
        );
      }
      
      // save the binding
      var targetHash = targetObject.toHashCode();
      if (this.__bindings[targetHash] == undefined) {
        this.__bindings[targetHash] = [];
      }
      this.__bindings[targetHash].push(
        [id, idReverse, targetProperty, sourceProperty, options, reverseOptions]
      );
    },
    
    
    /**
     * Removes the target identified by the three properties.
     * 
     * @param targetObject {qx.core.Object} The target object on which the 
     *   binding exist.
     * 
     * @param targetProperty {String} The targets property name used by the 
     *   adding of the target.
     * 
     * @param sourceProperty {String} The name of the property of the model.
     */
    removeTarget: function(targetObject, targetProperty, sourceProperty) {
      // check for not fitting targetObjects
      if (!(targetObject instanceof qx.core.Object)) {
        // just do nothing
        return;
      }
      for(var currentHash in this.__bindings) {
        // if the target object is in the internal registry
        if (currentHash === targetObject.toHashCode()) {
          var currentListing = this.__bindings[currentHash];          
          // go threw all listings for the object
          for (var i = 0; i < currentListing.length; i++) {
            // if it is the listing
            if (
              currentListing[i][2] == targetProperty &&
              currentListing[i][3] == sourceProperty
            ) {
              // remove the binding
              var id = currentListing[i][0];
              this.removeBinding(id);
              // check for the reverse binding
              if (currentListing[i][1] != null) {
                targetObject.removeBinding(currentListing[i][1]);
              }
              // delete the entry and return
              currentListing.splice(i, 1);
              return;
            }
          }
          // if the binding is not there, return and do nothing
          return;
        }
      }
    }
  }
});
