/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * <h2>Form Controller</h2>
 *
 * *General idea*
 *
 * The form controller is responsible for connecting a form with a model. If no
 * model is given, a model can be created. This created model will fit exactly
 * to the given form and can be used for serialization. All the connections
 * between the form items and the model are handled by an internal
 * {@link qx.data.controller.Object}.
 *
 * *Features*
 *
 * * Connect a form to a model (bidirectional)
 * * Create a model for a given form
 *
 * *Usage*
 *
 * The controller only works if both a controller and a model are set.
 * Creating a model will automatically set the created model.
 *
 * *Cross reference*
 *
 * * If you want to bind single values, use {@link qx.data.controller.Object}
 * * If you want to bind a list like widget, use {@link qx.data.controller.List}
 * * If you want to bind a tree widget, use {@link qx.data.controller.Tree}
 */
qx.Class.define("qx.data.controller.Form", {
  extend: qx.core.Object,
  implement: [qx.core.IDisposable],

  /**
   * @param model {qx.core.Object | null} The model to bind the target to. The
   *   given object will be set as {@link #model} property.
   * @param target {qx.ui.form.Form | null} The form which contains the form
   *   items. The given form will be set as {@link #target} property.
   * @param selfUpdate {Boolean?false} If set to true, you need to call the
   *   {@link #updateModel} method to get the data in the form to the model.
   *   Otherwise, the data will be synced automatically on every change of
   *   the form.
   */
  construct(model, target, selfUpdate) {
    super();

    this._selfUpdate = !!selfUpdate;
    this.__bindingOptions = {};

    if (model != null) {
      this.setModel(model);
    }

    if (target != null) {
      this.setTarget(target);
    }
  },

  properties: {
    /** Data object containing the data which should be shown in the target. */
    model: {
      check: "qx.core.Object",
      apply: "_applyModel",
      event: "changeModel",
      nullable: true,
      dereference: true
    },

    /** The target widget which should show the data. */
    target: {
      check: "qx.ui.form.Form",
      apply: "_applyTarget",
      event: "changeTarget",
      nullable: true,
      init: null,
      dereference: true
    }
  },

  members: {
    __objectController: null,
    __bindingOptions: null,

    /**
     * Helper method to convert a form item name to camelCase for model property names.
     * This ensures v8 compatibility where property names follow camelCase conventions.
     * For deep binding (names with dots), each part is converted separately.
     *
     * @param name {String} The form item name (may contain dots for deep binding)
     * @return {String} The camelCase converted name
     */
    __convertNameToCamelCase(name) {
      if (!name) {
        return name;
      }

      // For deep binding, split by dot and convert each part
      var parts = name.split(".");
      var convertedParts = parts.map(function (part) {
        return qx.lang.String.firstLow(part);
      });

      return convertedParts.join(".");
    },

    /**
     * The form controller uses for setting up the bindings the fundamental
     * binding layer, the {@link qx.data.SingleValueBinding}. To achieve a
     * binding in both directions, two bindings are needed. With this method,
     * you have the opportunity to set the options used for the bindings.
     *
     * @param name {String} The name of the form item for which the options
     *   should be used.
     * @param model2target {Map} Options map used for the binding from model
     *   to target. The possible options can be found in the
     *   {@link qx.data.SingleValueBinding} class.
     * @param target2model {Map} Options map used for the binding from target
     *   to model. The possible options can be found in the
     *   {@link qx.data.SingleValueBinding} class.
     */
    addBindingOptions(name, model2target, target2model) {
      this.__bindingOptions[name] = [model2target, target2model];

      // return if not both, model and target are given
      if (this.getModel() == null || this.getTarget() == null) {
        return;
      }

      // renew the affected binding
      var item = this.getTarget().getItems()[name];
      var targetProperty = this.__isModelSelectable(item)
        ? "modelSelection[0]"
        : "value";

      // Convert to camelCase for v8 compatibility (issue #10808)
      var modelPropertyName = this.__convertNameToCamelCase(name);

      // remove the binding
      this.__objectController.removeTarget(item, targetProperty, modelPropertyName);
      // set up the new binding with the options
      this.__objectController.addTarget(
        item,
        targetProperty,
        modelPropertyName,
        !this._selfUpdate,
        model2target,
        target2model
      );
    },

    /**
     * Creates and sets a model using the {@link qx.data.marshal.Json} object.
     * Remember that this method can only work if the form is set. The created
     * model will fit exactly that form. Changing the form or adding an item to
     * the form will need a new model creation.
     *
     * @param includeBubbleEvents {Boolean} Whether the model should support
     *   the bubbling of change events or not.
     * @return {qx.core.Object} The created model.
     */
    createModel(includeBubbleEvents) {
      var target = this.getTarget();

      // throw an error if no target is set
      if (target == null) {
        throw new Error("No target is set.");
      }

      var items = target.getItems();
      var data = {};
      var nameMapping = {}; // For collision detection (issue #10808)

      for (var name in items) {
        // Convert to camelCase for v8 compatibility (issue #10808)
        // v8's binding system automatically converts property names to lowercase
        var camelCaseName = this.__convertNameToCamelCase(name);

        // COLLISION DETECTION: Detect if multiple fields map to same camelCase name
        // Example: "Username" and "username" both map to "username"
        if (nameMapping[camelCaseName] && nameMapping[camelCaseName] !== name) {
          throw new Error(
            "Form field naming collision detected (issue #10808): " +
            "Fields '" + nameMapping[camelCaseName] + "' and '" + name + "' " +
            "both convert to the same camelCase property name '" + camelCaseName + "'.\n\n" +
            "This happens when field names differ only in capitalization.\n" +
            "qooxdoo v8's binding system automatically converts property names to lowercase first letter,\n" +
            "which causes both field names to map to the same model property.\n\n" +
            "To fix this issue:\n" +
            "  1. Rename one of the conflicting fields to have a distinct name\n" +
            "  2. Ensure all field names are unique when converted to camelCase\n\n" +
            "Conflicting fields:\n" +
            "  - '" + nameMapping[camelCaseName] + "'\n" +
            "  - '" + name + "'\n" +
            "Both map to model property: '" + camelCaseName + "'"
          );
        }
        nameMapping[camelCaseName] = name;

        var names = camelCaseName.split(".");
        var currentData = data;
        for (var i = 0; i < names.length; i++) {
          // if its the last item
          if (i + 1 == names.length) {
            // check if the target is a selection
            var clazz = items[name].constructor;
            var itemValue = null;
            if (qx.Class.hasInterface(clazz, qx.ui.core.ISingleSelection)) {
              // use the first element of the selection because passed to the
              // marshaler (and its single selection anyway) [BUG #3541]
              itemValue = items[name].getModelSelection().getItem(0) || null;
            } else {
              itemValue = items[name].getValue();
            }
            // call the converter if available [BUG #4382]
            if (this.__bindingOptions[name] && this.__bindingOptions[name][1]) {
              itemValue = this.__bindingOptions[name][1].converter(itemValue);
            }
            currentData[names[i]] = itemValue;
          } else {
            // if its not the last element, check if the object exists
            if (!currentData[names[i]]) {
              currentData[names[i]] = {};
            }
            currentData = currentData[names[i]];
          }
        }
      }

      var model = qx.data.marshal.Json.createModel(data, includeBubbleEvents);
      this.setModel(model);

      return model;
    },

    /**
     * Responsible for syncing the data from entered in the form to the model.
     * Please keep in mind that this method only works if you create the form
     * controller with <code>selfUpdate</code> parameter set to true. Otherwise,
     * this method will do nothing because updates will be synced automatically
     * on every change.
     */
    updateModel() {
      // only do stuff if self update is enabled and a model or target is set
      if (!this._selfUpdate || !this.getModel() || !this.getTarget()) {
        return;
      }

      var items = this.getTarget().getItems();
      for (var name in items) {
        var item = items[name];
        var sourceProperty = this.__isModelSelectable(item)
          ? "modelSelection[0]"
          : "value";

        var options = this.__bindingOptions[name];
        options = options && this.__bindingOptions[name][1];

        // Convert to camelCase for v8 compatibility (issue #10808)
        var modelPropertyName = this.__convertNameToCamelCase(name);

        qx.data.SingleValueBinding.updateTarget(
          item,
          sourceProperty,
          this.getModel(),
          modelPropertyName,
          options
        );
      }
    },

    // apply method
    _applyTarget(value, old) {
      // if an old target is given, remove the binding
      if (old != null) {
        this.__tearDownBinding(old);
      }

      // do nothing if no target is set
      if (this.getModel() == null) {
        return;
      }

      // target and model are available
      if (value != null) {
        this.__setUpBinding();
      }
    },

    // apply method
    _applyModel(value, old) {
      // set the model to null to reset all items before removing them
      if (this.__objectController != null && value == null) {
        this.__objectController.setModel(null);
      }

      // first, get rid off all bindings (avoids wrong data population)
      if (this.__objectController != null && this.getTarget() != null) {
        var items = this.getTarget().getItems();
        for (var name in items) {
          var item = items[name];
          var targetProperty = this.__isModelSelectable(item)
            ? "modelSelection[0]"
            : "value";
          // Convert to camelCase for v8 compatibility (issue #10808)
          var modelPropertyName = this.__convertNameToCamelCase(name);
          this.__objectController.removeTarget(
            item,
            targetProperty,
            modelPropertyName
          );
        }
      }

      // set the model of the object controller if available
      if (this.__objectController != null) {
        this.__objectController.setModel(value);
      }

      // do nothing is no target is set
      if (this.getTarget() == null) {
        return;
      } else {
        // if form was validated with errors and model changes
        // the errors should be cleared see #8977
        this.getTarget().getValidationManager().reset();
      }

      // model and target are available
      if (value != null) {
        this.__setUpBinding();
      }
    },

    /**
     * Internal helper for setting up the bindings using
     * {@link qx.data.controller.Object#addTarget}. All bindings are set
     * up bidirectional.
     */
    __setUpBinding() {
      // create the object controller
      if (this.__objectController == null) {
        this.__objectController = new qx.data.controller.Object(
          this.getModel()
        );
      }

      // get the form items
      var items = this.getTarget().getItems();

      // connect all items
      for (var name in items) {
        var item = items[name];
        var targetProperty = this.__isModelSelectable(item)
          ? "modelSelection[0]"
          : "value";
        var options = this.__bindingOptions[name];

        // Convert to camelCase for v8 compatibility (issue #10808)
        var modelPropertyName = this.__convertNameToCamelCase(name);

        // try to bind all given items in the form
        try {
          if (options == null) {
            this.__objectController.addTarget(
              item,
              targetProperty,
              modelPropertyName,
              !this._selfUpdate
            );
          } else {
            this.__objectController.addTarget(
              item,
              targetProperty,
              modelPropertyName,
              !this._selfUpdate,
              options[0],
              options[1]
            );
          }
          // ignore not working items
        } catch (ex) {
          if (qx.core.Environment.get("qx.debug")) {
            this.warn(
              "Could not bind property " +
                name +
                " of " +
                this.getModel() +
                ":\n" +
                ex.stack
            );
          }
        }
      }
      // make sure the initial values of the model are taken for resetting [BUG #5874]
      this.getTarget().redefineResetter();
    },

    /**
     * Internal helper for removing all set up bindings using
     * {@link qx.data.controller.Object#removeTarget}.
     *
     * @param oldTarget {qx.ui.form.Form} The form which has been removed.
     */
    __tearDownBinding(oldTarget) {
      // do nothing if the object controller has not been created
      if (this.__objectController == null) {
        return;
      }

      // get the items
      var items = oldTarget.getItems();

      // disconnect all items
      for (var name in items) {
        var item = items[name];
        var targetProperty = this.__isModelSelectable(item)
          ? "modelSelection[0]"
          : "value";
        // Convert to camelCase for v8 compatibility (issue #10808)
        var modelPropertyName = this.__convertNameToCamelCase(name);
        this.__objectController.removeTarget(
          item,
          targetProperty,
          modelPropertyName
        );
      }
    },

    /**
     * Returns whether the given item implements
     * {@link qx.ui.core.ISingleSelection} and
     * {@link qx.ui.form.IModelSelection}.
     *
     * @param item {qx.ui.form.IForm} The form item to check.
     *
     * @return {Boolean} true, if given item fits.
     */
    __isModelSelectable(item) {
      return (
        qx.Class.hasInterface(item.constructor, qx.ui.core.ISingleSelection) &&
        qx.Class.hasInterface(item.constructor, qx.ui.form.IModelSelection)
      );
    }
  },

  /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

  destruct() {
    // dispose the object controller because the bindings need to be removed
    if (this.__objectController) {
      this.__objectController.dispose();
    }
  }
});
