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

  statics :
  {
    /* internal reference for all bindings */
    __bindings: {},


    /**
     * The function is responsible for binding a source objects property to
     * a target objects property. Both properties have to have the usual qooxdoo
     * getter and setter. The source property also needs to fire change-events
     * on every change of its value.
     * Please keep in mind, that this binding is unidirectional. If you need
     * a binding in both directions, you have to use two of this bindings.
     *
     * It's also possible to bind some hind of a hierarchy as a source. This
     * means that you can separate the source properties with a dot and bind
     * by that the object referenced to this property chain.
     * Example with an object 'a' which has object 'b' stored in its 'child'
     * property. Object b has a string property named abc:
     * <code>
     * qx.data.SingleValueBinding.bind(a, "child.abc", textfield, "value");
     * </code>
     *
     * As you can see in this example, the abc property of a's b will be bound
     * to the textfield. If now the value of b changed or even the a will get a
     * new b, the binding still shows the right value.
     *
     * @param sourceObject {qx.core.Object} The source of the binding.
     * @param sourcePropertyChain {String} The property chain which represents
     *   the source property.
     * @param targetObject {qx.core.Object} The object which the source should
     *   be bind to.
     * @param targetProperty {String} The property name of the target object.
     * @param options {Map} A map containing the options. See
     *   {@link #bindEventToProperty} for more information.
     *
     * @return {id} Returns the internal id for that binding. This can be used
     *   for referencing the binding or e.g. for removing. This is not an atomic
     *   id so you can't you use it as a hash-map index.
     *
     * @throws {qx.core.AssertionError} If the event is no data event or
     *   there is no property definition for object and property (source and
     *   target).
     */
    bind: function(
      sourceObject, sourcePropertyChain, targetObject, targetProperty, options
    )
    {
      // get the property names
      var propertyNames = sourcePropertyChain.split(".");

      // stuff thats needed to store for the listener function
      var arrayIndexValues =
        this.__checkForArrayInPropertyChain(propertyNames);
      var sources = [];
      var listeners = [];
      var listenerIds = [];
      var eventNames = [];
      var source = sourceObject;

      // go through all property names
      for (var i = 0; i < propertyNames.length; i++) {

        // check for the array
        if (arrayIndexValues[i] !== "") {
          // push the array change event
          eventNames.push("change");
        } else {
          // get the current event Name
          eventNames.push(this.__getEventForProperty(source, propertyNames[i]));
        }

        // save the current source
        sources[i] = source;

        // create a listener
        var listener = qx.lang.Function.bind(function(index, e) {

          // delete all listener after the current one
          for (var j = index + 1; j < propertyNames.length; j++) {
            // remove the old sources
            var source = sources[j];
            sources[j] = null;
            if (!source) {
              continue;
            }

            // remove the listeners
            source.removeListenerById(listenerIds[j]);
          }

          // get the current source
          var source = sources[index];
          // add new once after the current one
          for (var j = index + 1; j < propertyNames.length; j++) {
            // get and store the new source
            if (arrayIndexValues[j - 1] !== "") {
              source = source["get" + qx.lang.String.firstUp(propertyNames[j - 1])](arrayIndexValues[j - 1]);
            } else {
              source = source["get" + qx.lang.String.firstUp(propertyNames[j - 1])]();
            }
            sources[j] = source;
            // reset the target object if no new source could be found
            if (!source) {
              targetObject["reset" + qx.lang.String.firstUp(targetProperty)]();
              break;
            }

            // if its the last property
            if (j == propertyNames.length - 1) {
              // if its an array
              if (source instanceof qx.data.Array) {
                // set the inital value
                var currentValue = source.getItem(arrayIndexValues[j]);
                this.__setInitialValue(
                  currentValue, targetObject, targetProperty, options
                );

                // bind the item event to the new target
                listenerIds[j] = this.__bindEventToProperty(
                  source, eventNames[j], targetObject, targetProperty, options, arrayIndexValues[j]
                );

              } else {
                // bind the last property to the new target
                listenerIds[j] = this.__bindPropertyToProperty(
                  source, propertyNames[j], targetObject, targetProperty, options
                );
              }
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
          // if it is an array, set the initial value and bind the event
          if (arrayIndexValues[i] !== "") {
            // getthe current value
            var itemIndex = arrayIndexValues[i] === "last" ?
              source.length - 1 : arrayIndexValues[i];
            var currentValue = source.getItem(itemIndex);

            // set the initial value
            this.__setInitialValue(currentValue, targetObject, targetProperty, options);

            // bind the event
            listenerIds[i] = this.__bindEventToProperty(
              source, eventNames[i], targetObject, targetProperty, options, arrayIndexValues[i]
            );
          } else {
            // bind the property (incl. setting the inital value)
            listenerIds[i] = this.__bindPropertyToProperty(
              source, propertyNames[i], targetObject, targetProperty, options
            );
          }


        } else {
          // add the chaining listener
          listenerIds[i] = source.addListener(eventNames[i], listener);
        }

        // get and store the next source
        if (arrayIndexValues[i] !== "") {
          source = source["get" + qx.lang.String.firstUp(propertyNames[i])](arrayIndexValues[i]);
        } else {
          source = source["get" + qx.lang.String.firstUp(propertyNames[i])]();
        }
        if (!source) {
          break;
        }
      }

      // create the id map
      var id = {type: "deepBinding", listenerIds: listenerIds, sources: sources};
      // store the bindings
      this.__storeBinding(
        id, sourceObject, sourcePropertyChain, targetObject, targetProperty
      );

      return id;
    },


    /**
     * Set the given value to the target property. This method is used for
     * initially set the value.
     *
     * @param value {var} The value to set.
     * @param targetObject {qx.core.Object} The object which contains the target
     *   property.
     * @param targetProperty {String} The name of the target property in the
     *   target object.
     * @param options {Map} The options map perhaps containing the user defined
     *   converter.
     */
    __setInitialValue: function(value, targetObject, targetProperty, options)
    {
      // convert the initial value
      value = this.__convertValue(
        value, targetObject, targetProperty, options
      );
      targetObject["set" + qx.lang.String.firstUp(targetProperty)](value);
    },


    /**
     * Checks for an array element in the given property names and adapts the
     * arrays to fit the algorithm.
     *
     * @param propertyNames {Array} The array containing the property names.
     *   Attention, this method can chang this parameter!!!
     * @return {Array} An array containing the values of the array properties
     *   corresponding to the property names.
     */
    __checkForArrayInPropertyChain: function(propertyNames) {
      // array for the values of the array properties
      var arrayIndexValues = [];

      // go through all properties and check for array notations
      for (var i = 0; i < propertyNames.length; i++) {
        var name = propertyNames[i];
        // if its an array property in the chain
        if (qx.lang.String.endsWith(name, "]")) {
          // get the inner value of the array notation
          var arrayIndex = name.substring(name.indexOf("[") + 1, name.indexOf("]"));

          // store the property name without the array notation
          propertyNames[i] = name.substring(0, name.indexOf("["));
          // store the values in the array for the current iteration
          arrayIndexValues[i] = "";
          // store the properties for the next iteration (the item of the array)
          arrayIndexValues[i + 1] = arrayIndex;
          propertyNames.splice(i + 1, 0, "item");
          // skip the next iteration. its the array item and its already set
          i++;
        } else {
          arrayIndexValues[i] = "";
        }
      }

      return arrayIndexValues;
    },


    /**
     * This method binds a source property to a target property. The source
     * property needs to be an qooxdoo property and has to have an changeEvent
     * fired on every change. The change Event has to be an
     * {@link qx.event.type.Data} event.
     *
     * @param sourceObject {qx.core.Object} The source of the binding.
     * @param sourceProperty {String} The source property of the source object.
     * @param targetObject {qx.core.Object} The object which the source should
     *   be bind to.
     * @param targetProperty {String} The property name of the target object.
     * @param options {Map} A map containing the options. See
     *   {@link #bindEventToProperty} for more information.
     *
     * @return {id} Returns the internal id for that binding. This can be used
     *   for referencing the binding or e.g. for removing. This is not an atomic
     *   id so you can't you use it as a hash-map index. It's the id which will
     *   be returned b< the {@link qx.core.Object#addListener} method.
     *
     * @throws {qx.core.AssertionError} If the event is no data event or
     *   there is no property definition for object and property (source and
     *   target).
     */
    bindPropertyToProperty : function(sourceObject, sourceProperty, targetObject, targetProperty, options) {
      var id = this.__bindPropertyToProperty(
        sourceObject, sourceProperty, targetObject, targetProperty, options
      );
      // store the binding
      this.__storeBinding(
        id, sourceObject, sourceProperty, targetObject, targetProperty
      );
      return id;
    },


    /**
     * Internal helper method which evaluates the change event name and
     * delegates the creation of the binding to the
     * {@link #__bindEventToProperty} method. This method does not store the
     * binding in the internal reference store so it should NOT be used from
     * outside this class. For an outside usage, use
     * {@link #bindPropertyToProperty}.
     *
     * @param sourceObject {qx.core.Object} The source of the binding.
     * @param sourceProperty {String} The source property of the source object.
     * @param targetObject {qx.core.Object} The object which the source should
     *   be bind to.
     * @param targetProperty {String} The property name of the target object.
     * @param options {Map} A map containing the options. See
     *   {@link #bindEventToProperty} for more information.
     *
     * @return {id} Returns the internal id for that binding. This can be used
     *   for referencing the binding or e.g. for removing. This is not an atomic
     *   id so you can't you use it as a hash-map index. It's the id which will
     *   be returned b< the {@link qx.core.Object#addListener} method.
     *
     * @throws {qx.core.AssertionError} If the event is no data event or
     *   there is no property definition for object and property (source and
     *   target).
     */
    __bindPropertyToProperty : function(
      sourceObject, sourceProperty, targetObject, targetProperty, options
    )
    {
      // get the event name
      var changeEventName = this.__getEventForProperty(sourceObject, sourceProperty);

      // set the initial value
      var currentValue = sourceObject["get" + qx.lang.String.firstUp(sourceProperty)]();
      this.__setInitialValue(currentValue, targetObject, targetProperty, options);

      // delegate to the event binding
      return this.__bindEventToProperty(
        sourceObject, changeEventName, targetObject, targetProperty, options
      );
    },


    /**
     * The method binds a {@link qx.event.type.Data} event to a target property.
     * This could be necessary for "properties" in the framework which
     * are no real properties but do fire an change event. The change event HAS
     * to be a data event!
     * Remember that this binding is one way only!
     * the common way of binding is to bind one property to another or a
     * property chain to another property. To do that, take the {@link #bind}
     * method.
     *
     * @param sourceObject {qx.core.Object} The source of the binding.
     * @param sourceEvent {String} The event of the source object which chould
     *   be the change event in common but has to be an
     *   {@link qx.event.type.Data} event.
     * @param targetObject {qx.core.Object} The object which the source should
     *   be bind to.
     * @param targetProperty {String} The property name of the target object.
     * @param options {Map} A map containing the options.
     *   <li>converter: A converter function which takes one parameter
     *       (the value) and should return the converted value. If no conversion
     *       has been done, the given value should be returned.</li>
     *   <li>onSetOk: A callback function can be given here. This method will be
     *       called if the set of the value was successful.</li>
     *   <li>onSetFail: A callback function can be given here. This method will
     *       be called if the set of the value fails.</li>
     *
     * @return {id} Returns the internal id for that binding. This can be used
     *   for referencing the binding or e.g. for removing. This is not an atomic
     *   id so you can't you use it as a hash-map index. It's the id which will
     *   be returned b< the {@link qx.core.Object#addListener} method.
     *
     * @throws {qx.core.AssertionError} If the event is no data event or
     *   there is no property definition for the target object and target
     *   property.
     */
    bindEventToProperty : function(
      sourceObject, sourceEvent, targetObject, targetProperty, options
    )
    {
      var id = this.__bindEventToProperty(
        sourceObject, sourceEvent, targetObject, targetProperty, options
      );
      this.__storeBinding(
        id, sourceObject, sourceEvent, targetObject, targetProperty
      );
      return id;
    },


    /**
     * Internal helper method which is actually doing all bindings. That means
     * that an event listener will be added to the source object which listens
     * to the given event and invokes an set on the target property on the
     * targetObject.
     * This method does not store the binding in the internal reference store
     * so it should NOT be used from outside this class. For an outside usage,
     * use {@link #bindEventToProperty}.
     *
     * @param sourceObject {qx.core.Object} The source of the binding.
     * @param sourceEvent {String} The event of the source object which could
     *   be the change event in common but has to be an
     *   {@link qx.event.type.Data} event.
     * @param targetObject {qx.core.Object} The object which the source should
     *   be bind to.
     * @param targetProperty {String} The property name of the target object.
     * @param options {Map} A map containing the options. See
     *   {@link #bindEventToProperty} for more information.
     * @param arrayIndex {String} The index of the given array if its an array
     *   to bind.
     *
     * @return {id} Returns the internal id for that binding. This can be used
     *   for referencing the binding or e.g. for removing. This is not an atomic
     *   id so you can't you use it as a hash-map index. It's the id which will
     *   be returned b< the {@link qx.core.Object#addListener} method.
     * @throws {qx.core.AssertionError} If the event is no data event or
     *   there is no property definition for the target object and target
     *   property.
     */
    __bindEventToProperty : function(sourceObject, sourceEvent, targetObject,
      targetProperty, options, arrayIndex)
    {
      // checks
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        // check for the data event
        var eventType = qx.Class.getEventType(
          sourceObject.constructor, sourceEvent
        );
        qx.core.Assert.assertEquals(
          "qx.event.type.Data", eventType, sourceEvent
          + " is not an data (qx.event.type.Data) event on "
          + sourceObject + "."
        );

        // check for the target property
        var propertieDefinition =  qx.Class.getPropertyDefinition(
          targetObject.constructor, targetProperty
        );
        qx.core.Assert.assertNotNull(
          propertieDefinition, targetProperty + " does not exist."
        );
      }

      var bindListener = function(arrayIndex, e) {
        // if an array value is given
        if (arrayIndex !== "") {
          //check if its the "last" value
          if (arrayIndex === "last") {
            arrayIndex = sourceObject.length - 1;
          }
          // get the data of the array
          var data = sourceObject.getItem(arrayIndex);
        } else {
          // get the data out of the event
          var data = e.getData();
        }

        // convert the data if a converter is given
        if (options && options.converter) {
          data = options.converter(data);
        } else {
          // try default conversion
          var propertieDefinition =  qx.Class.getPropertyDefinition(
            targetObject.constructor, targetProperty
          );
          data = qx.data.SingleValueBinding.__defaultConvertion(
            data, propertieDefinition.check
          );
        }

        // try to set the value
        try {
          targetObject["set" + qx.lang.String.firstUp(targetProperty)](data);

          // tell the user that the setter was invoked probably
          if (options && options.onSetOk) {
            options.onSetOk();
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

      // check if an array index is given
      if (!arrayIndex) {
        // if not, signal it a s an empty string
        arrayIndex = "";
      }
      // bind the listener function (make the array index in the listener available)
      bindListener = qx.lang.Function.bind(bindListener, sourceObject, arrayIndex);

      // add the listener
      var id = sourceObject.addListener(sourceEvent, bindListener);

      return id;
    },


    /**
     * This method stores the given value as a binding in the internal structure
     * of all bindings.
     *
     * @param id {id} The listener id of the id for a deeper bingin.
     * @param sourceObject {qx.core.Object} The source Object of the binding.
     * @param sourceEvent {String} The name of the source event.
     * @param targetObject {qx.core.Object} The target object.
     * @param targetProperty {String} The name of the property on the target
     *   object.
     */
    __storeBinding : function(
      id, sourceObject, sourceEvent, targetObject, targetProperty
    )
    {
      // add the listener id to the internal registry
      if (this.__bindings[sourceObject.toHashCode()] === undefined) {
        this.__bindings[sourceObject.toHashCode()] = [];
      }
      this.__bindings[sourceObject.toHashCode()].push(
        [id, sourceObject, sourceEvent, targetObject, targetProperty]
      );
    },


    /**
     * This method takes the given value, checks if the user has given a
     * converter and converts the value to its target type. If no converter is
     * given by the user, the {@link #__defaultConvertion} will try to convert
     * the value.
     *
     * @param value {var} The value which possibly should be converted.
     * @param targetObject {qx.core.Object} The target object.
     * @param targetProperty {String} The property name of the target object.
     * @param options {Map} The options map which can includes the converter.
     *   For a detailed information on the map, take a look at
     *   {@link #bindEventToProperty}.
     *
     * @return {var} The converted value. If no conversion has been done, the
     *   value property will be returned.
     * @throws {qx.core.AssertionError} If there is no property definition
     *   of the given target object and target property.
     */
    __convertValue : function(value, targetObject, targetProperty, options) {
      // do the conversion given by the user
      if (options && options.converter) {
        return options.converter(value);
      // try default conversion
      } else {
        var propertieDefinition = qx.Class.getPropertyDefinition(
          targetObject.constructor, targetProperty
        );
        // check for the existance of the source property
        if (qx.core.Variant.isSet("qx.debug", "on")) {
          qx.core.Assert.assertNotNull(propertieDefinition,
            "No property definition available for " + targetProperty);
        }
        return this.__defaultConvertion(value, propertieDefinition.check);
      }
    },


    /**
     * Helper method which tries to figure out if the given property on the
     * given object does have a change event and if returns the name of it.
     *
     * @param sourceObject {qx.core.Object} The object to check.
     * @param sourceProperty {String} The name of the property.
     *
     * @return {String} The name of the change event.
     * @throws {qx.core.AssertionError} If there is no property definition of
     *   the given object property pair.
     */
    __getEventForProperty : function(sourceObject, sourceProperty) {
      // get the event name
      var propertieDefinition =  qx.Class.getPropertyDefinition(
        sourceObject.constructor, sourceProperty
      );

      // check for the existance of the source property
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        qx.core.Assert.assertNotNull(propertieDefinition,
          "No property definition available for " + sourceProperty);
      }

      return propertieDefinition.event;
    },


    /**
     * Tries to convert the data to the type given in the targetCheck argument.
     *
     * @param data {var} The data to convert.
     * @param targetCheck {String} The value of the check property. That usually
     *   contains the target type.
     */
    __defaultConvertion : function(data, targetCheck) {
      var dataType = typeof data;

      // to integer
      if ((dataType == "number" || dataType == "string") &&
          (targetCheck == "Integer" || targetCheck == "PositiveInteger")) {
        data = parseInt(data);
      }

      // to string
      if ((dataType == "boolean" || dataType == "number") &&
        targetCheck == "String") {
        data = data + "";
      }

      // to float
      if ((dataType == "number" || dataType == "string") &&
        (targetCheck == "Number" || targetCheck == "PositiveNumber")) {
        data = parseFloat(data);
      }

      return data;
    },


    /**
     * Removes the binding with the given id from the given sourceObject. The
     * id hast to be the id returned by any of the bind functions.
     *
     * @param sourceObject {qx.core.Object} The source object of the binding.
     * @param id {id} The id of the binding.
     * @throws {Error} If the binding could not be found.
     */
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


    /**
     * Removes all bindings for the given object.
     *
     * @param object {qx.core.Object} The object of which the bindings should be
     *   removed.
     * @throws {qx.core.AssertionErrro} If the object is not in the internal
     *   registry of the bindings.
     * @throws {Error} If one of the bindings listed internally can not be
     *   removed.
     */
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
        this.removeBindingFromObject(object, bindings[i][0]);
      }
    },


    /**
     * Returns an array which lists all bindings.
     *
     * @param object {qx.core.Object} The object of which the bindings should
     *   be returned.
     *
     * @return {Array} An array of binding informations. Every binding
     *   information is an array itself containing id, sourceObject, sourceEvent,
     *   targetObject and targetProperty in that order.
     */
    getAllBindingsForObject : function(object) {
      // create an empty array if no binding exists
      if (this.__bindings[object.toHashCode()] === undefined) {
        this.__bindings[object.toHashCode()] = [];
      }

      return this.__bindings[object.toHashCode()];
    },


    /**
     * Removes all binding in the whole application. After that not a single
     * binding is left.
     */
    removeAllBindings : function() {
      // go threw all registerd objects
      for (var hash in this.__bindings) {
        var object = qx.core.ObjectRegistry.fromHashCode(hash);
        this.removeAllBindingsForObject(object);
      }
      // reset the bindings map
      this.__bindings = {};
    },


    /**
     * Returns a map containing for every bound object an array of data binding
     * information. The key of the map is the hashcode of the bound objects.
     * Every binding is represented by an array containing id, sourceObject,
     * sourceEvent, targetObject and targetProperty.
     *
     * @return {Map} Map containing all bindings.
     */
    getAllBindings : function() {
      return this.__bindings;
    },


    /**
     * Debug function which shows some valuable information about the given
     * binding in console. For that it uses {@link qx.log.Logger}.
     *
     * @param object {x.core.Object} the source of the binding.
     * @param id {id} The id of the binding.
     */
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


    /**
     * Debug function which shows all bindings in the log console. To get only
     * one binding in the console use {@link #showBindingInLog}
     */
    showAllBindingsInLog : function() {
      // go threw all objects in the registry
      for (var hash in this.__bindings) {
        var object = qx.core.ObjectRegistry.fromHashCode(hash);
        for (var i = 0; i < this.__bindings[hash].length; i++) {
          this.showBindingInLog(object, this.__bindings[hash][i][0]);
        }
      }
    }

  }
});