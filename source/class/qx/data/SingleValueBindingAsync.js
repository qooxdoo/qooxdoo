/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Single-value binding is a core component of the data binding package.
 */
qx.Class.define("qx.data.SingleValueBindingAsync", {
  statics: {
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
     * There is also a possibility of binding an array. Therefore the array
     * {@link qx.data.IListData} is needed because this array has change events
     * which the native does not. Imagine a qooxdoo object a which has a
     * children property containing an array holding more of its own kind.
     * Every object has a name property as a string.
     * <pre>
     * var svb = qx.data.SingleValueBinding;
     * // bind the first child's name of 'a' to a textfield
     * svb.bind(a, "children[0].name", textfield, "value");
     * // bind the last child's name of 'a' to a textfield
     * svb.bind(a, "children[last].name", textfield2, "value");
     * // also deeper bindings are possible
     * svb.bind(a, "children[0].children[0].name", textfield3, "value");
     * </pre>
     *
     * As you can see in this example, the abc property of a's b will be bound
     * to the textfield. If now the value of b changed or even the a will get a
     * new b, the binding still shows the right value.
     *
     * @param {qx.core.Object} sourceObject The source of the binding.
     * @param {String} sourcePropertyChain The property chain which represents
     *   the source property.
     * @param {qx.core.Object} targetObject The object which the source should
     *   be bound to.
     * @param {String} targetPropertyChain The property chain to the target
     *   object.
     * @param {BindingOptions} options A map containing the options.
     *
     * @typedef BindingOptions
     * @property {converter} converter Data converter function. If no conversion has been done, the given value should be returned.
     * e.g. a number to boolean converter
     * <code>function(data, model, source, target) {return data > 100;}</code>
     * @property {onUpdate} onUpdate This callback will be called if the binding was updated successfully.
     * @property {onSetFail} onSetFail A callback function can be given here. This function will
     *       be called if the set of the value fails.
     * @property {string} ignoreConverter A string which will be matched using the current
     *       property chain. If it matches, the converter will not be called.
     * 
     *
     * @callback converter
     * @param {*} data The data to convert
     * @param {*} model The corresponding model object, which is only set in case of the use of an controller.
     * @param {qx.core.Object} source The source object for the binding
     * @param {qx.core.Object} target The target object
     * @returns {*} The converted data
     * 
     * @callback onUpdate
     * @param {qx.core.Object} source The source object for the binding
     * @param {qx.core.Object} target The target object
     * @param {*} data The data
         
     *
     * @returns {qx.data.binding.Binding} Returns the internal id for that binding. This can be used
     *   for referencing the binding or e.g. for removing. This is not an atomic
     *   id so you can't you use it as a hash-map index.
     *
     * @throws {qx.core.AssertionError} If the event is no data event or
     *   there is no property definition for object and property (source and
     *   target).
     */
    bind(sourceObject, sourcePropertyChain, targetObject, targetPropertyChain, options) {
      // check for the arguments
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertObject(sourceObject, "sourceObject");
        qx.core.Assert.assertString(sourcePropertyChain, "sourcePropertyChain");
        qx.core.Assert.assertObject(targetObject, "targetObject");
        qx.core.Assert.assertString(targetPropertyChain, "targetPropertyChain");
      }

      let binding = new qx.data.binding.Binding(sourcePropertyChain, targetPropertyChain, sourceObject, targetObject, options);

      return binding;
    },

    /**
     * Removes the binding with the given id from the given sourceObject. The
     * id has to be the id returned by any of the bind functions.
     *
     * @param sourceObject {qx.core.Object} The source object of the binding.
     * @param id {var} The id of the binding.
     * @throws {Error} If the binding could not be found.
     */
    removeBindingFromObject(sourceObject, binding) {
      binding.dispose();
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
    removeAllBindingsForObject(object) {
      qx.core.Assert.assertNotNull(object, "Null is not possible!");
      qx.data.binding.Binding.getAllBindingsForObject(object).forEach(binding => binding[0].dispose());
    },

    /**
     * Removes all bindings between given objects.
     *
     * @param object {qx.core.Object} The object of which the bindings should be
     *   removed.
     * @param relatedObject {qx.core.Object} The object of which related
     *   bindings should be removed.
     * @throws {qx.core.AssertionError} If the object is not in the internal
     *   registry of the bindings.
     * @throws {Error} If one of the bindings listed internally can not be
     *   removed.
     */
    removeRelatedBindings(object, relatedObject) {
      qx.data.binding.Binding.removeRelatedBindings(object, relatedObject);
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
    getAllBindingsForObject(object) {
      return qx.data.binding.Binding.getAllBindingsForObject(object);
    },

    /**
     * Returns a map containing for every bound object an array of data binding
     * information. The key of the map is the hash code of the bound objects.
     * Every binding is represented by an array containing id, sourceObject,
     * sourceEvent, targetObject and targetProperty.
     *
     * @return {Map} Map containing all bindings.
     */
    getAllBindings() {
      return qx.data.binding.Binding.getAllBindings();
    },

    /**
     * Debug function which shows some valuable information about the given
     * binding in console. For that it uses {@link qx.log.Logger}.
     *
     * @param object {qx.core.Object} the source of the binding.
     * @param id {var} The id of the binding.
     */
    showBindingInLog(object, binding) {
      qx.log.Logger.debug(
        "Binding from '" +
          binding.getSource() +
          "' (" +
          binding.getSourcePath() +
          ") to the object '" +
          binding.getTarget() +
          "' (" +
          binding.getTargetPath() +
          ")."
      );
    },

    /**
     *
     * Internal helper for getting the current set value at the property chain.
     *
     * @param {qx.core.Object} object  The source of the binding.
     * @param {String} propertyChain The property chain which represents
     *   the source property.
     * @return {var?undefined} Returns the set value if defined.
     */
    resolvePropertyChain(object, propertyChain) {
      return qx.data.binding.Binding.resolvePropertyChain(object, propertyChain);
    }
  }
});
