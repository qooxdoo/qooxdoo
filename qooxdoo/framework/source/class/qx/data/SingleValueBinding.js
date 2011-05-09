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
 * The data binding package is still under development so there will be changes
 * to the API. This Features is for testing purpose only.
 */
qx.Class.define("qx.data.SingleValueBinding",
{

  statics :
  {
    /** internal reference for all bindings */
    __bindings: {},


    /**
     * The function is responsible for binding a source objects property to
     * a target objects property. Both properties have to have the usual qooxdoo
     * getter and setter. The source property also needs to fire change-events
     * on every change of its value.
     * Please keep in mind, that this binding is unidirectional. If you need
     * a binding in both directions, you have to use two of this bindings.
     *
     * It's also possible to bind some kind of a hierarchy as a source. This
     * means that you can separate the source properties with a dot and bind
     * by that the object referenced to this property chain.
     * Example with an object 'a' which has object 'b' stored in its 'child'
     * property. Object b has a string property named abc:
     * <pre><code>
     * qx.data.SingleValueBinding.bind(a, "child.abc", textfield, "value");
     * </code></pre>
     * In that case, if the property abc of b changes, the textfield will
     * automatically contain the new value. Also if the child of a changes, the
     * new value (abc of the new child) will be in the textfield.
     *
     * There is also a possibility of binding an array. Therefor the array
     * {@link qx.data.IListData} is needed because this array has change events
     * which the native does not. Imagine a qooxdoo object a which has a
     * children property containing an array holding more of its own kind.
     * Every object has a name property as a string.
     * <pre><code>
     * var svb = qx.data.SingleValueBinding;
     * // bind the first childs name of 'a' to a textfield
     * svb.bind(a, "children[0].name", textfield, "value");
     * // bind the last childs name of 'a' to a textfield
     * svb.bind(a, "children[last].name", textfield2, "value");
     * // also deeper bindinds are possible
     * svb.bind(a, "children[0].children[0].name", textfield3, "value");
     * </code></pre>
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
     * @param targetPropertyChain {String} The property chain to the target
     *   object.
     * @param options {Map?null} A map containing the options.
     *   <li>converter: A converter function which takes four parameters
     *       and should return the converted value. The first parameter is the
     *       data to convert and the second one is the corresponding model
     *       object, which is only set in case of the use of an controller.
     *       The third parameter is the source object for the binding and the
     *       fourth parameter the target object. If no conversion has been
     *       done, the given value should be returned.</li>
     *   <li>onUpdate: A callback function can be given here. This method will be
     *       called if the binding was updated successful. There will be
     *       three parameter you do get in that method call: the source object,
     *       the target object and the data as third parameter.</li>
     *   <li>onSetFail: A callback function can be given here. This method will
     *       be called if the set of the value fails.</li>
     *
     * @return {var} Returns the internal id for that binding. This can be used
     *   for referencing the binding or e.g. for removing. This is not an atomic
     *   id so you can't you use it as a hash-map index.
     *
     * @throws {qx.core.AssertionError} If the event is no data event or
     *   there is no property definition for object and property (source and
     *   target).
     */
    bind : function(
      sourceObject, sourcePropertyChain, targetObject, targetPropertyChain, options
    )
    {
      // set up the target binding
      var targetListenerMap = this.__setUpTargetBinding(
        sourceObject, sourcePropertyChain, targetObject, targetPropertyChain, options
      );

      // get the property names
      var propertyNames = sourcePropertyChain.split(".");

      // stuff that's needed to store for the listener function
      var arrayIndexValues =
        this.__checkForArrayInPropertyChain(propertyNames);
      var sources = [];
      var listeners = [];
      var listenerIds = [];
      var eventNames = [];
      var source = sourceObject;

      // add a try catch to make it possible to remove the listeners of the
      // chain in case the loop breaks after some listeners already added.
      try {
        // go through all property names
        for (var i = 0; i < propertyNames.length; i++) {
          // check for the array
          if (arrayIndexValues[i] !== "") {
            // push the array change event
            eventNames.push("change");
          } else {
            eventNames.push(this.__getEventNameForProperty(source, propertyNames[i]));
          }

          // save the current source
          sources[i] = source;

          // check for the last property
          if (i == propertyNames.length -1) {
            // if it is an array, set the initial value and bind the event
            if (arrayIndexValues[i] !== "") {
              // getthe current value
              var itemIndex = arrayIndexValues[i] === "last" ?
                source.length - 1 : arrayIndexValues[i];
              var currentValue = source.getItem(itemIndex);

              // set the initial value
              this.__setInitialValue(currentValue, targetObject, targetPropertyChain, options, sourceObject);

              // bind the event
              listenerIds[i] = this.__bindEventToProperty(
                source, eventNames[i], targetObject, targetPropertyChain, options, arrayIndexValues[i]
              );
            } else {
              // try to set the initial value
              if (propertyNames[i] != null && source["get" + qx.lang.String.firstUp(propertyNames[i])] != null) {
                var currentValue = source["get" + qx.lang.String.firstUp(propertyNames[i])]();
                this.__setInitialValue(currentValue, targetObject, targetPropertyChain, options, sourceObject);
              }
              // bind the property
              listenerIds[i] = this.__bindEventToProperty(
                source, eventNames[i], targetObject, targetPropertyChain, options
              );
            }

          // if its not the last property
          } else {

            // create the contenxt for the listener
            var context = {
              index: i,
              propertyNames: propertyNames,
              sources: sources,
              listenerIds: listenerIds,
              arrayIndexValues: arrayIndexValues,
              targetObject: targetObject,
              targetPropertyChain: targetPropertyChain,
              options: options,
              listeners: listeners
            };

            // create a listener
            var listener = qx.lang.Function.bind(this.__chainListener, this, context);

            // store the listener for further processing
            listeners.push(listener);

            // add the chaining listener
            listenerIds[i] = source.addListener(eventNames[i], listener);
          }

          // get and store the next source
          if (source["get" + qx.lang.String.firstUp(propertyNames[i])] == null) {
            source = null;
          } else if (arrayIndexValues[i] !== "") {
            source = source["get" + qx.lang.String.firstUp(propertyNames[i])](arrayIndexValues[i]);
          } else {
            source = source["get" + qx.lang.String.firstUp(propertyNames[i])]();
          }
          if (!source) {
            break;
          }
        }

      } catch (ex) {
        // remove the already added listener
        // go threw all added listeners (source)
        for (var i = 0; i < sources.length; i++) {
          // check if a source is available
          if (sources[i] && listenerIds[i]) {
            sources[i].removeListenerById(listenerIds[i]);
          }
        }
        var targets = targetListenerMap.targets;
        var targetIds = targetListenerMap.listenerIds[i];
        // go threw all added listeners (target)
        for (var i = 0; i < targets.length; i++) {
          // check if a target is available
          if (targets[i] && targetIds[i]) {
            targets[i].removeListenerById(targetIds[i]);
          }
        }

        throw ex;
      }

      // create the id map
      var id = {
        type: "deepBinding",
        listenerIds: listenerIds,
        sources: sources,
        targetListenerIds: targetListenerMap.listenerIds,
        targets: targetListenerMap.targets
      };
      // store the bindings
      this.__storeBinding(
        id, sourceObject, sourcePropertyChain, targetObject, targetPropertyChain
      );

      return id;
    },


    /**
     * Event listener for the chaining of the properties.
     *
     * @param context {Map} The current context for the listener.
     */
    __chainListener : function(context)
    {

      // invoke the onUpdate method
      if (context.options && context.options.onUpdate) {
        context.options.onUpdate(
          context.sources[context.index], context.targetObject
        );
      }

      // delete all listener after the current one
      for (var j = context.index + 1; j < context.propertyNames.length; j++) {
        // remove the old sources
        var source = context.sources[j];
        context.sources[j] = null;
        if (!source) {
          continue;
        }

        // remove the listeners
        source.removeListenerById(context.listenerIds[j]);
      }

      // get the current source
      var source = context.sources[context.index];
      // add new once after the current one
      for (var j = context.index + 1; j < context.propertyNames.length; j++) {
        // get and store the new source
        if (context.arrayIndexValues[j - 1] !== "") {
          source = source["get" + qx.lang.String.firstUp(context.propertyNames[j - 1])](context.arrayIndexValues[j - 1]);
        } else {
          source = source["get" + qx.lang.String.firstUp(context.propertyNames[j - 1])]();
        }
        context.sources[j] = source;
        // reset the target object if no new source could be found
        if (!source) {
          this.__resetTargetValue(context.targetObject, context.targetPropertyChain);
          break;
        }

        // if its the last property
        if (j == context.propertyNames.length - 1) {
          // if its an array
          if (qx.Class.implementsInterface(source, qx.data.IListData)) {
            // set the inital value
            var itemIndex = context.arrayIndexValues[j] === "last" ?
              source.length - 1 : context.arrayIndexValues[j];
            var currentValue = source.getItem(itemIndex);
            this.__setInitialValue(
              currentValue, context.targetObject, context.targetPropertyChain, context.options, context.sources[context.index]
            );

            // bind the item event to the new target
            context.listenerIds[j] = this.__bindEventToProperty(
              source, "change", context.targetObject, context.targetPropertyChain, context.options, context.arrayIndexValues[j]
            );

          } else {
            if (context.propertyNames[j] != null && source["get" + qx.lang.String.firstUp(context.propertyNames[j])] != null) {
              var currentValue = source["get" + qx.lang.String.firstUp(context.propertyNames[j])]();
              this.__setInitialValue(currentValue, context.targetObject, context.targetPropertyChain, context.options, context.sources[context.index]);
            }
            var eventName = this.__getEventNameForProperty(source, context.propertyNames[j]);
            // bind the last property to the new target
            context.listenerIds[j] = this.__bindEventToProperty(
              source, eventName, context.targetObject, context.targetPropertyChain, context.options
            );
          }
        } else {
          // check if a listener already created
          if (context.listeners[j] == null) {
            var listener = qx.lang.Function.bind(this.__chainListener, this, context);
            // store the listener for further processing
            context.listeners.push(listener);
          }
          // add a new listener
          if (qx.Class.implementsInterface(source, qx.data.IListData)) {
            var eventName = "change";
          } else {
            var eventName = this.__getEventNameForProperty(source, context.propertyNames[j]);
          }
          context.listenerIds[j] = source.addListener(eventName, context.listeners[j]);
        }
      }
    },


    /**
     * Internal helper for setting up the listening to the changes on the
     * target side of the binding. Only works if the target property is a
     * property chain
     *
     * @param sourceObject {qx.core.Object} The source of the binding.
     * @param sourcePropertyChain {String} The property chain which represents
     *   the source property.
     * @param targetObject {qx.core.Object} The object which the source should
     *   be bind to.
     * @param targetPropertyChain {String} The property name of the target
     *   object.
     * @param options {Map} The options map perhaps containing the user defined
     *   converter.
     * @return {var} A map containing the listener ids and the targets.
     */
    __setUpTargetBinding : function(
      sourceObject, sourcePropertyChain, targetObject, targetPropertyChain, options
    ) {
      // get the property names
      var propertyNames = targetPropertyChain.split(".");

      var arrayIndexValues =
        this.__checkForArrayInPropertyChain(propertyNames);
      var targets = [];
      var listeners = [];
      var listenerIds = [];
      var eventNames = [];
      var target = targetObject;

      // go through all property names
      for (var i = 0; i < propertyNames.length - 1; i++) {
        // check for the array
        if (arrayIndexValues[i] !== "") {
          // push the array change event
          eventNames.push("change");
        } else {
          try {
            eventNames.push(
              this.__getEventNameForProperty(target, propertyNames[i])
            );
          } catch (e) {
            // if the event names could not be terminated,
            // just ignore the target chain listening
            break;
          }
        }

        // save the current source
        targets[i] = target;

        // create a listener
        var listener = function() {
          // delete all listener after the current one
          for (var j = i + 1; j < propertyNames.length - 1; j++) {
            // remove the old sources
            var target = targets[j];
            targets[j] = null;
            if (!target) {
              continue;
            }

            // remove the listeners
            target.removeListenerById(listenerIds[j]);
          }

          // get the current target
          var target = targets[i];
          // add new once after the current one
          for (var j = i + 1; j < propertyNames.length - 1; j++) {

            var firstUpPropName = qx.lang.String.firstUp(propertyNames[j - 1]);
            // get and store the new target
            if (arrayIndexValues[j - 1] !== "") {
              var currentIndex = arrayIndexValues[j - 1] === "last" ?
                target.getLength() - 1 : arrayIndexValues[j - 1];
              target = target["get" + firstUpPropName](currentIndex);
            } else {
              target = target["get" + firstUpPropName]();
            }
            targets[j] = target;

            // check if a listener already created
            if (listeners[j] == null) {
              // store the listener for further processing
              listeners.push(listener);
            }

            // add a new listener
            if (qx.Class.implementsInterface(target, qx.data.IListData)) {
              var eventName = "change";
            } else {
              try {
                var eventName =
                  qx.data.SingleValueBinding.__getEventNameForProperty(
                    target, propertyNames[j]
                  );
              } catch (e) {
                // if the event name could not be terminated,
                // ignore the rest
                break;
              }
            }

            listenerIds[j] = target.addListener(eventName, listeners[j]);
           }

          qx.data.SingleValueBinding.updateTarget(
            sourceObject, sourcePropertyChain, targetObject, targetPropertyChain, options
          );
        };

        // store the listener for further processing
        listeners.push(listener);

        // add the chaining listener
        listenerIds[i] = target.addListener(eventNames[i], listener);

        var firstUpPropName = qx.lang.String.firstUp(propertyNames[i]);
        // get and store the next target
        if (target["get" + firstUpPropName] == null) {
          target = null;
        } else if (arrayIndexValues[i] !== "") {
          target = target["get" + firstUpPropName](arrayIndexValues[i]);
        } else {
          target = target["get" + firstUpPropName]();
        }
        if (!target) {
          break;
        }
      }

      return {listenerIds: listenerIds, targets: targets};
    },


    /**
     * Helper for updating the target. Gets the current set data from the source
     * and set that on the target.
     *
     * @param sourceObject {qx.core.Object} The source of the binding.
     * @param sourcePropertyChain {String} The property chain which represents
     *   the source property.
     * @param targetObject {qx.core.Object} The object which the source should
     *   be bind to.
     * @param targetPropertyChain {String} The property name of the target
     *   object.
     * @param options {Map} The options map perhaps containing the user defined
     *   converter.
     *
     * @internal
     */
    updateTarget : function(
      sourceObject, sourcePropertyChain, targetObject, targetPropertyChain, options
    )
    {
      var value = this.getValueFromObject(sourceObject, sourcePropertyChain);

      // convert the data before setting
      value = qx.data.SingleValueBinding.__convertValue(
        value, targetObject, targetPropertyChain, options, sourceObject
      );

      this.__setTargetValue(targetObject, targetPropertyChain, value);
    },


    /**
     * Internal helper for getting the current set value at the property chain.
     *
     * @param o {qx.core.Object} The source of the binding.
     * @param propertyChain {String} The property chain which represents
     *   the source property.
     * @return {var?undefined} Returns the set value if defined.
     *
     * @internal
     */
    getValueFromObject : function(o, propertyChain) {
      var source = this.__getTargetFromChain(o, propertyChain);

      var value;
      if (source != null) {
        // geht the name of the last property
        var lastProperty = propertyChain.substring(
          propertyChain.lastIndexOf(".") + 1, propertyChain.length
        );

        // check for arrays
        if (lastProperty.charAt(lastProperty.length - 1) == "]") {
          // split up the chain into property and index
          var index = lastProperty.substring(
            lastProperty.lastIndexOf("[") + 1, lastProperty.length - 1
          );
          var prop = lastProperty.substring(0, lastProperty.lastIndexOf("["));

          // get the array
          var sourceArray = source["get" + qx.lang.String.firstUp(prop)]();
          if (index == "last") {
            index = sourceArray.length - 1;
          }
          if (sourceArray != null) {
            value = sourceArray.getItem(index);
          }

        } else {
          // set the given value
          value = source["get" + qx.lang.String.firstUp(lastProperty)]();
        }
      }

      return value;
    },


    /**
     * Tries to return a fitting event name to the given source object and
     * property name. First, it assumes that the propertyname is a real property
     * and therefore it checks the property definition for the event. The second
     * possibility is to check if there is an event with the given name. The
     * third and last possibility checked is if there is an event which is named
     * change + propertyname. If this three possibilities fail, an error will be
     * thrown.
     *
     * @param source {qx.core.Object} The source where the property is stored.
     * @param propertyname {String} The name of the property.
     * @return {String} The name of the corresponding property.
     */
    __getEventNameForProperty : function(source, propertyname)
    {
      // get the current event Name from the property definition
      var eventName = this.__getEventForProperty(source, propertyname);
      // if no event name could be found
      if (eventName == null) {
        // check if the propertyname is the event name
        if (qx.Class.supportsEvent(source.constructor, propertyname)) {
          eventName = propertyname;
        // check if the change + propertyname is the event name
        } else if (qx.Class.supportsEvent(
          source.constructor, "change" + qx.lang.String.firstUp(propertyname))
        ) {
          eventName = "change" + qx.lang.String.firstUp(propertyname);
        } else {
          throw new qx.core.AssertionError(
            "Binding property " + propertyname + " of object " + source +
            " not possible: No event available. "
          );
        }
      }
      return eventName;
    },


    /**
     * Resets the value of the given target after resolving the target property
     * chain.
     *
     * @param targetObject {qx.core.Object} The object where the property chain
     *   starts.
     * @param targetPropertyChain {String} The names of the properties,
     *   separated with a dot.
     */
    __resetTargetValue : function(targetObject, targetPropertyChain)
    {
      // get the last target object of the chain
      var target = this.__getTargetFromChain(targetObject, targetPropertyChain);
      if (target != null) {
        // get the name of the last property
        var lastProperty = targetPropertyChain.substring(
          targetPropertyChain.lastIndexOf(".") + 1, targetPropertyChain.length
        );
        // check for an array and set the value to null
        if (lastProperty.charAt(lastProperty.length - 1) == "]") {
          this.__setTargetValue(targetObject, targetPropertyChain, null);
          return;
        }
        // try to reset the property
        if (target["reset" + qx.lang.String.firstUp(lastProperty)] != undefined) {
          target["reset" + qx.lang.String.firstUp(lastProperty)]();
        } else {
          // fallback if no resetter is given (see bug #2456)
          target["set" + qx.lang.String.firstUp(lastProperty)](null);
        }
      }
    },


    /**
     * Sets the given value to the given target after resolving the
     * target property chain.
     *
     * @param targetObject {qx.core.Object} The object where the property chain
     *   starts.
     * @param targetPropertyChain {String} The names of the properties,
     *   separated with a dot.
     * @param value {var} The value to set.
     */
    __setTargetValue : function(targetObject, targetPropertyChain, value)
    {
      // get the last target object of the chain
      var target = this.__getTargetFromChain(targetObject, targetPropertyChain);
      if (target != null) {
        // geht the name of the last property
        var lastProperty = targetPropertyChain.substring(
          targetPropertyChain.lastIndexOf(".") + 1, targetPropertyChain.length
        );

        // check for arrays
        if (lastProperty.charAt(lastProperty.length - 1) == "]") {
          // split up the chain into property and index
          var index = lastProperty.substring(lastProperty.lastIndexOf("[") + 1, lastProperty.length - 1);
          var prop = lastProperty.substring(0, lastProperty.lastIndexOf("["));

          // get the array
          var targetArray = targetObject;
          if (!qx.Class.implementsInterface(targetArray, qx.data.IListData)) {
            targetArray = target["get" + qx.lang.String.firstUp(prop)]();
          }

          if (index == "last") {
            index = targetArray.length - 1;
          }
          if (targetArray != null) {
            targetArray.setItem(index, value);
          }

        } else {
          // set the given value
          target["set" + qx.lang.String.firstUp(lastProperty)](value);
        }
      }
    },


    /**
     * Helper-Function resolving the object on which the last property of the
     * chain should be set.
     *
     * @param targetObject {qx.core.Object} The object where the property chain
     *   starts.
     * @param targetPropertyChain {String} The names of the properties,
     *   separated with a dot.
     * @return {qx.core.Object | null} The object on which the last property
     *   should be set.
     */
    __getTargetFromChain : function(targetObject, targetPropertyChain)
    {
      var properties = targetPropertyChain.split(".");
      var target = targetObject;
      // ignore the last property
      for (var i = 0; i < properties.length - 1; i++) {
        try {
          var property = properties[i];
          // if there is an array notation
          if (property.indexOf("]") == property.length - 1) {
            var index = property.substring(
              property.indexOf("[") + 1, property.length - 1
            );
            property = property.substring(0, property.indexOf("["));
          }
          // in case there is a property infront of the brackets
          if (property != "") {
            target = target["get" + qx.lang.String.firstUp(property)]();
          }

          // if there is an index, we can be sure its an array
          if (index != null) {
            // check for the 'last' notation
            if (index == "last") {
              index = target.length - 1;
            }
            // get the array item
            target = target.getItem(index);
            index = null;
          }
        } catch (ex) {
          return null;
        }
      }
      return target;
    },


    /**
     * Set the given value to the target property. This method is used for
     * initially set the value.
     *
     * @param value {var} The value to set.
     * @param targetObject {qx.core.Object} The object which contains the target
     *   property.
     * @param targetPropertyChain {String} The name of the target property in the
     *   target object.
     * @param options {Map} The options map perhaps containing the user defined
     *   converter.
     * @param sourceObject {qx.core.Object} The source object of the binding (
     *   used for the onUpdate callback).
     */
    __setInitialValue : function(value, targetObject, targetPropertyChain, options, sourceObject)
    {
      // first convert the initial value
      value = this.__convertValue(
        value, targetObject, targetPropertyChain, options, sourceObject
      );
      // check if the converted value is undefined
      if (value === undefined) {
        this.__resetTargetValue(targetObject, targetPropertyChain);
      }
      // only set the initial value if one is given (may be null)
      if (value !== undefined) {
        try {
          this.__setTargetValue(targetObject, targetPropertyChain, value);

          // tell the user that the setter was invoked probably
          if (options && options.onUpdate) {
            options.onUpdate(sourceObject, targetObject, value);
          }
        } catch (e) {
          if (! (e instanceof qx.core.ValidationError)) {
            throw e;
          }

          if (options && options.onSetFail) {
            options.onSetFail(e);
          } else {
            qx.log.Logger.warn(
              "Failed so set value " + value + " on " + targetObject
               + ". Error message: " + e
            );
          }
        }
      }
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

          // check the arrayIndex
          if (name.indexOf("]") != name.length - 1) {
            throw new Error("Please use only one array at a time: "
              + name + " does not work.");
          }
          if (arrayIndex !== "last") {
            if (arrayIndex == "" || isNaN(parseInt(arrayIndex, 10))) {
              throw new Error("No number or 'last' value hast been given"
                + " in an array binding: " + name + " does not work.");
            }
          }

          // if a property is infront of the array notation
          if (name.indexOf("[") != 0) {
            // store the property name without the array notation
            propertyNames[i] = name.substring(0, name.indexOf("["));
            // store the values in the array for the current iteration
            arrayIndexValues[i] = "";
            // store the properties for the next iteration (the item of the array)
            arrayIndexValues[i + 1] = arrayIndex;
            propertyNames.splice(i + 1, 0, "item");
            // skip the next iteration. its the array item and its already set
            i++;
          // it the array notation is the beginning
          } else {
            // store the array index and override the entry in the property names
            arrayIndexValues[i] = arrayIndex;
            propertyNames.splice(i, 1, "item");
          }

        } else {
          arrayIndexValues[i] = "";
        }
      }

      return arrayIndexValues;
    },


    /**
     * Internal helper method which is actually doing all bindings. That means
     * that an event listener will be added to the source object which listens
     * to the given event and invokes an set on the target property on the
     * targetObject.
     * This method does not store the binding in the internal reference store
     * so it should NOT be used from outside this class. For an outside usage,
     * use {@link #bind}.
     *
     * @param sourceObject {qx.core.Object} The source of the binding.
     * @param sourceEvent {String} The event of the source object which could
     *   be the change event in common but has to be an
     *   {@link qx.event.type.Data} event.
     * @param targetObject {qx.core.Object} The object which the source should
     *   be bind to.
     * @param targetProperty {String} The property name of the target object.
     * @param options {Map} A map containing the options. See
     *   {@link #bind} for more information.
     * @param arrayIndex {String} The index of the given array if its an array
     *   to bind.
     *
     * @return {var} Returns the internal id for that binding. This can be used
     *   for referencing the binding or e.g. for removing. This is not an atomic
     *   id so you can't you use it as a hash-map index. It's the id which will
     *   be returned by the {@link qx.core.Object#addListener} method.
     * @throws {qx.core.AssertionError} If the event is no data event or
     *   there is no property definition for the target object and target
     *   property.
     */
    __bindEventToProperty : function(sourceObject, sourceEvent, targetObject,
      targetProperty, options, arrayIndex)
    {
      // checks
      if (qx.core.Environment.get("qx.debug")) {
        // check for the data event
        var eventType = qx.Class.getEventType(
          sourceObject.constructor, sourceEvent
        );
        qx.core.Assert.assertEquals(
          "qx.event.type.Data", eventType, sourceEvent
          + " is not an data (qx.event.type.Data) event on "
          + sourceObject + "."
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

          // reset the target if the data is not set
          if (data === undefined) {
            qx.data.SingleValueBinding.__resetTargetValue(targetObject, targetProperty);
          }

          // only do something if the curren array has been changed
          var start = e.getData().start;
          var end = e.getData().end;
          if (arrayIndex < start || arrayIndex > end) {
            return;
          }
        } else {
          // get the data out of the event
          var data = e.getData();
        }

        // debug message
        if (qx.core.Environment.get("qx.debug.databinding")) {
          qx.log.Logger.debug("Binding executed from " + sourceObject + " by " +
            sourceEvent + " to " + targetObject + " (" + targetProperty + ")");
          qx.log.Logger.debug("Data before conversion: " + data);
        }

        // convert the data
        data = qx.data.SingleValueBinding.__convertValue(
          data, targetObject, targetProperty, options, sourceObject
        );

        // debug message
        if (qx.core.Environment.get("qx.debug.databinding")) {
          qx.log.Logger.debug("Data after conversion: " + data);
        }

        // try to set the value
        try {
          if (data !== undefined) {
            qx.data.SingleValueBinding.__setTargetValue(targetObject, targetProperty, data);
          } else {
            qx.data.SingleValueBinding.__resetTargetValue(targetObject, targetProperty);
          }

          // tell the user that the setter was invoked probably
          if (options && options.onUpdate) {
            options.onUpdate(sourceObject, targetObject, data);
          }

        } catch (e) {
          if (! (e instanceof qx.core.ValidationError)) {
            throw e;
          }

          if (options && options.onSetFail) {
            options.onSetFail(e);
          } else {
            qx.log.Logger.warn(
              "Failed so set value " + data + " on " + targetObject
               + ". Error message: " + e
            );
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
     * @param id {var} The listener id of the id for a deeper binding.
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
     * given by the user, the {@link #__defaultConversion} will try to convert
     * the value.
     *
     * @param value {var} The value which possibly should be converted.
     * @param targetObject {qx.core.Object} The target object.
     * @param targetPropertyChain {String} The property name of the target object.
     * @param options {Map} The options map which can includes the converter.
     *   For a detailed information on the map, take a look at
     *   {@link #bind}.
     * @param sourceObject {qx.core.Object} The source obejct for the binding.
     *
     * @return {var} The converted value. If no conversion has been done, the
     *   value property will be returned.
     * @throws {qx.core.AssertionError} If there is no property definition
     *   of the given target object and target property.
     */
    __convertValue : function(
      value, targetObject, targetPropertyChain, options, sourceObject
    ) {
      // do the conversion given by the user
      if (options && options.converter) {
        var model;
        if (targetObject.getModel) {
          model = targetObject.getModel();
        }
        return options.converter(value, model, sourceObject, targetObject);
      // try default conversion
      } else {
        var target = this.__getTargetFromChain(targetObject, targetPropertyChain);
        var lastProperty = targetPropertyChain.substring(
          targetPropertyChain.lastIndexOf(".") + 1, targetPropertyChain.length
        );
        // if no target is currently available, return the original value
        if (target == null) {
          return value;
        }

        var propertieDefinition = qx.Class.getPropertyDefinition(
          target.constructor, lastProperty
        );
        var check = propertieDefinition == null ? "" : propertieDefinition.check;
        return this.__defaultConversion(value, check);
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

      if (propertieDefinition == null) {
        return null;
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
    __defaultConversion : function(data, targetCheck) {
      var dataType = qx.lang.Type.getClass(data);

      // to integer
      if ((dataType == "Number" || dataType == "String") &&
          (targetCheck == "Integer" || targetCheck == "PositiveInteger")) {
        data = parseInt(data, 10);
      }

      // to string
      if ((dataType == "Boolean" || dataType == "Number" || dataType == "Date")
        && targetCheck == "String") {
        data = data + "";
      }

      // to float
      if ((dataType == "Number" || dataType == "String") &&
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
     * @param id {var} The id of the binding.
     * @throws {Error} If the binding could not be found.
     */
    removeBindingFromObject : function(sourceObject, id) {
      // check for a deep binding
      if (id.type == "deepBinding") {
        // go threw all added listeners (source)
        for (var i = 0; i < id.sources.length; i++) {
          // check if a source is available
          if (id.sources[i]) {
            id.sources[i].removeListenerById(id.listenerIds[i]);
          }
        }
        // go threw all added listeners (target)
        for (var i = 0; i < id.targets.length; i++) {
          // check if a target is available
          if (id.targets[i]) {
            id.targets[i].removeListenerById(id.targetListenerIds[i]);
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
     * @throws {qx.core.AssertionError} If the object is not in the internal
     *   registry of the bindings.
     * @throws {Error} If one of the bindings listed internally can not be
     *   removed.
     */
    removeAllBindingsForObject : function(object) {
      // check for the null value

      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertNotNull(object,
          "Can not remove the bindings for null object!");
      }

      // get the bindings
      var bindings = this.__bindings[object.toHashCode()];
      if (bindings != undefined)
      {
        // remove every binding with the removeBindingFromObject function
        for (var i = bindings.length - 1; i >= 0; i--) {
          this.removeBindingFromObject(object, bindings[i][0]);
        }
      }
    },


    /**
     * Returns an array which lists all bindings.
     *
     * @param object {qx.core.Object} The object of which the bindings should
     *   be returned.
     *
     * @return {Array} An array of binding informations. Every binding
     *   information is an array itself containing id, sourceObject,
     *   sourceEvent, targetObject and targetProperty in that order.
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
        // check for the object, perhaps its already deleted
        if (object == null) {
          delete this.__bindings[hash];
          continue;
        }
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
     * @param object {qx.core.Object} the source of the binding.
     * @param id {var} The id of the binding.
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