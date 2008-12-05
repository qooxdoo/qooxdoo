/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * EXPERIMENTAL!!!
 */
qx.Class.define("qx.data.SingleValueBinding", 
{
  extend : qx.core.Object,
  
  
  statics :
  {
    
    __bindings: {},
  
    bind: function(sourceObject, sourcePropertyChain, targetObject, targetProperty, options) {
      // get the property names
      var propertyNames = sourcePropertyChain.split(".");
      
      // store the stuff needed
      var sources = [];
      var listeners = [];
      var listenerIds = [];
      var eventNames = [];
      var source = sourceObject;

      
      // go through all property names
      for (var i = 0; i < propertyNames.length; i++) {
        
        // get the current event Name 
        eventNames.push(this.__getEventForProperty(source, propertyNames[i]));
        
        // save the source
        sources[i] = source;
        
        // create a listener
        var listener = qx.lang.Function.bind(function(index, e) {
        
          qx.log.Logger.debug(index + " " + propertyNames[index]);
          
        
          // delete all listener after the current one
          for (var j = index + 1; j < propertyNames.length; j++) {
            // remove the old sources
            var source = sources[j];
            sources[j] = null;
            if (!source) {
              continue;
            }
            
            // if its the last property
            if (j == propertyNames.length - 1) {
              // remove the binding from the last component
              source.removeListenerById(listenerIds[j]);
            } else {
              // remove the listeners
              source.removeListenerById(listenerIds[j]);
            }
          }
        
          // get the current source
          var source = sources[index];
          // add new once after the current one          
          for (var j = index + 1; j < propertyNames.length; j++) {
            // get and store the new source
            source = source["get" + qx.lang.String.firstUp(propertyNames[j - 1])]();
            sources[j] = source;
            if (!source) {
              targetObject["reset" + qx.lang.String.firstUp(targetProperty)]();
              break;
            }

            // if its the last property
            if (j == propertyNames.length - 1) {
              // bin the last property to the new target
              listenerIds[j] = this.__bindPropertyToProperty(source, propertyNames[j], targetObject, targetProperty, options);
            } else {
              // add a new listener
              listenerIds[j] = source.addListener(eventNames[j], listeners[j]);
            }            
          }          
          
        }, this, i);
        // store the listener for further processing
        listeners.push(listener);
        
        
        
        // check for the last property
        if (i == propertyNames.length -1) {
          // bind the property
          listenerIds[i] = this.__bindPropertyToProperty(source, propertyNames[i], targetObject, targetProperty, options);
        } else {
          // add the chaining listener
          listenerIds[i] = source.addListener(eventNames[i], listener);
        }
        
        
        // get and store the next source
        source = source["get" + qx.lang.String.firstUp(propertyNames[i])]();
        if (!source) {
          break;
        }
      }
      
      // create the id map
      var id = {type: "deepBinding", listenerIds: listenerIds, sources: sources};
      // store the bindings
      this.__storeBinding(id, sourceObject, sourcePropertyChain, targetObject, targetProperty);
      
      return id;
    },
  
    bindPropertyToProperty : function(sourceObject, sourceProperty, targetObject, targetProperty, options) {    
      var id = this.__bindPropertyToProperty(sourceObject, sourceProperty, targetObject, targetProperty, options);
      // store the binding                                     
      this.__storeBinding(id, sourceObject, sourceProperty, targetObject, targetProperty);
      return id;
    },
  
    __bindPropertyToProperty : function(sourceObject, sourceProperty, targetObject, targetProperty, options) {
      // get the event name
      var changeEventName = qx.data.SingleValueBinding.__getEventForProperty(sourceObject, sourceProperty);
      
      // get the initial value
      var currentValue = sourceObject["get" + qx.lang.String.firstUp(sourceProperty)]();
      
      // convert the initial value
      currentValue = this.__convertValue(currentValue, targetObject, targetProperty, options);
      targetObject["set" + qx.lang.String.firstUp(targetProperty)](currentValue);
      
      // delegate to the event binding
      return qx.data.SingleValueBinding.__bindEventToProperty(sourceObject, changeEventName, 
                                                     targetObject, targetProperty, options);
    },
      
      
    bindEventToProperty : function(sourceObject, sourceEvent, targetObject, targetProperty, options) {
      var id = this.__bindEventToProperty(sourceObject, sourceEvent, targetObject, targetProperty, options);
      this.__storeBinding(id, sourceObject, sourceEvent, targetObject, targetProperty);
      return id;
    }, 
    
    
    __bindEventToProperty : function(sourceObject, sourceEvent, targetObject, targetProperty, options) {      
      // checks
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        // check for the data event
        var eventType = qx.Class.getEventType(sourceObject.constructor, sourceEvent);  
        qx.core.Assert.assertEquals("qx.event.type.Data", eventType, sourceEvent + " is not an data (qx.event.type.Data) event on " + sourceObject + ".");  
                
        // check for the target property
        var propertieDefinition =  qx.Class.getPropertyDefinition(targetObject.constructor, targetProperty);
        qx.core.Assert.assertNotNull(propertieDefinition, targetProperty + " does not exist.");      
      }

      var bindListener = function(e) {
        // get the data
        var data = e.getData();

        // convert the data if a converter is given
        if (options && options.converter) {
          data = options.converter(data);
        } else {
          // try default conversion
          var propertieDefinition =  qx.Class.getPropertyDefinition(targetObject.constructor, targetProperty);
          data = qx.data.SingleValueBinding.__defaultConvertion(data, propertieDefinition.check);
        }      

        // try to set the value
        try {
          targetObject["set" + qx.lang.String.firstUp(targetProperty)](data);
                   
          // tell the user that the setter was invoked probably
          if (options && options.onSetOk) {
            options.onSetOk();
          }   
              
          // Widget handling TODO remove
          if (sourceObject instanceof qx.ui.core.Widget) {
            sourceObject.resetShadow();
          }
                            
          } catch (e) {
            if (! (e instanceof qx.core.ValidationError)) {
              throw e;
          }
                
          if (options && options.onSetFail) {
            options.onSetFail(e);
          } else {
            this.warn("Failed so set value " + data + " on " + 
                      targetObject + ". Error message: " + e);
          }               
        }
      }            

      // add the listener
      var id = sourceObject.addListener(sourceEvent, bindListener, sourceObject);
      
      return id;
    },
    
    
    __storeBinding : function(id, sourceObject, sourceEvent, targetObject, targetProperty) {
      // add the listener id to the internal registry
      if (this.__bindings[sourceObject.toHashCode()] === undefined) {
        this.__bindings[sourceObject.toHashCode()] = [];
      }
      this.__bindings[sourceObject.toHashCode()].push([id, sourceObject, sourceEvent, targetObject, targetProperty]);      
    },
               
 
    __convertValue : function(value, targetObject, targetProperty, options) {
      // do the conversion given by the user
      if (options && options.converter) {
        return options.converter(value);
      // try default conversion        
      } else {
        var propertieDefinition = qx.Class.getPropertyDefinition(targetObject.constructor, targetProperty);
        // check for the existance of the source property
        if (qx.core.Variant.isSet("qx.debug", "on")) {
          qx.core.Assert.assertNotNull(propertieDefinition, 
            "No property definition available for " + targetProperty);
        }
        return qx.data.SingleValueBinding.__defaultConvertion(value, propertieDefinition.check);
      }   
    },

    __getEventForProperty : function(sourceObject, sourceProperty) {
      // get the event name
      var propertieDefinition =  qx.Class.getPropertyDefinition(sourceObject.constructor, sourceProperty);
          
      // check for the existance of the source property
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        qx.core.Assert.assertNotNull(propertieDefinition, 
          "No property definition available for " + sourceProperty);
      } 
        
      return propertieDefinition.event;
    }, 
 
      
    __defaultConvertion : function(data, targetCheck) {
      var dataType = typeof data;
          
      // to integer
      if ((dataType == "number" || dataType == "string") && 
          (targetCheck == "Integer" || targetCheck == "PositiveInteger")) {
        data = parseInt(data);
      }
          
      // to string
      if ((dataType == "boolean" || dataType == "number") && targetCheck == "String") {
        data = data + "";
      }
          
      // to float
      if ((dataType == "number" || dataType == "string") && 
          (targetCheck == "Number" || targetCheck == "PositiveNumber")) {
        data = parseFloat(data);
      }
                
      return data;
    },
      
      
    removeBindingFromObject : function(sourceObject, id) {
      // check for a deep binding
      if (id.type == "deepBinding") {
        // go threw all added listeners
        for (var i = 0; i < id.sources.length; i++) {
          // check if a source is available
          if (id.sources[i]) {
            id.sources[i].removeListenerById(id.listenerIds[i]);
          }
        }
      } else {
        // remove the listener
        sourceObject.removeListenerById(id);        
      }

      // remove the id from the internal reference system
      var bindings = this.__bindings[sourceObject.toHashCode()];
      // check if the binding exists
      if (bindings != undefined) {
        for (var i = 0; i < bindings.length; i++) {
          if (bindings[i][0] == id) {
            qx.lang.Array.remove(bindings, bindings[i]);
            return;
          }
        }        
      }
      throw new Error("Binding could not be found!");
    },
      
      
    removeAllBindingsForObject : function(object) {
      // check for the null value
      
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        qx.core.Assert.assertNotNull(object, 
          "Can not remove the bindings for null object!");
      }
      
      // get the bindings
      var bindings = this.__bindings[object.toHashCode()];
      // remove every binding with the removeBindingFromObject function
      for (var i = bindings.length - 1; i >= 0; i--) {
        qx.data.SingleValueBinding.removeBindingFromObject(object, bindings[i][0]);
      }
    },

    
    getAllBindingsForObject : function(object) {
      // create an empty array if no binding exists
      if (this.__bindings[object.toHashCode()] === undefined) {
        this.__bindings[object.toHashCode()] = [];
      }

      return this.__bindings[object.toHashCode()];
    },
    
    
    removeAllBindings : function() {
      // go threw all registerd objects
      for (var hash in this.__bindings) {
        var object = qx.core.ObjectRegistry.fromHashCode(hash);
        qx.data.SingleValueBinding.removeAllBindingsForObject(object);
      }
      // reset the bindings map
      this.__bindings = {};
    },
    
    
    getAllBindings : function() {
      return this.__bindings;
    },

      
    showBindingInLog : function(object, id) {
      var binding;
      // go threw all bindings of the given object
      for (var i = 0; i < this.__bindings[object.toHashCode()].length; i++) {
        // the first array item is the id
        if (this.__bindings[object.toHashCode()][i][0] == id) {
          binding = this.__bindings[object.toHashCode()][i];
          break;
        }
      }
      
      if (binding === undefined) {
        var message = "Binding does not exist!"
      } else {
        var message = "Binding from '" + binding[1] + "' (" + binding[2] + 
                      ") to the object '" + binding[3] + "' ("+ binding[4] + ").";        
      }

      qx.log.Logger.debug(message);
    },
    
    
    showAllBindingsInLog : function() {
      // go threw all objects in the registry
      for (var hash in this.__bindings) {
        var object = qx.core.ObjectRegistry.fromHashCode(hash);
        for (var i = 0; i < this.__bindings[hash].length; i++) {
          qx.data.SingleValueBinding.showBindingInLog(object, this.__bindings[hash][i][0]);
        }
      }
    }    
      
    
  }
});