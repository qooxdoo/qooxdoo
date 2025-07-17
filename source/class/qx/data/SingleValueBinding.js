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
qx.Class.define("qx.data.SingleValueBinding", {
  statics: {
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

    removeRelatedBindings(object, relatedObject) {
      qx.data.binding.Binding.removeRelatedBindings(object, relatedObject);
    },

    getAllBindingsForObject(object) {
      return qx.data.binding.Binding.getAllBindingsForObject(object);
    },

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

    updateTarget(sourceObject, sourcePropertyChain, targetObject, targetPropertyChain, options) {
      return qx.data.binding.Binding.updateTarget(sourceObject, sourcePropertyChain, targetObject, targetPropertyChain, options);
    },

    resolvePropertyChain(object, propertyChain) {
      return qx.data.binding.Binding.resolvePropertyChain(object, propertyChain);
    }
  }
});
