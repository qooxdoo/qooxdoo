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


  construct : function(model)
  {
    this.base(arguments);
    this.setModel(model);
    
    this.__bindings = {};
  },
  
  properties : 
  {
    model : 
    {
      check: "qx.core.Object",
      apply: "_applyModel"
    }
  },

  members :
  {
    
    _applyModel: function(value, old) {
      // remove all bindings from the former model
      if (old != undefined) {
        old.removeAllBindings();
      }
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
          this.setTarget(targetObject, bindingsForTarget[i][2], bindingsForTarget[i][3], bidirectional);
        }
      }
    },
    
    
    setTarget: function(targetObject, targetProperty, sourceProperty, bidirectional) {
      // create the binding
      var id = this.getModel().bind(sourceProperty, targetObject, targetProperty);
      // create the reverse binding if necessary
      var idReverse = null
      if (bidirectional) {
        idReverse = targetObject.bind(targetProperty, this.getModel(), sourceProperty);
      }
      
      // save the binding
      var targetHash = targetObject.toHashCode();
      if (this.__bindings[targetHash] == undefined) {
        this.__bindings[targetHash] = [];
      }
      this.__bindings[targetHash].push([id, idReverse, targetProperty, sourceProperty]);
    },
    
    
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
              this.getModel().removeBinding(id);
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
