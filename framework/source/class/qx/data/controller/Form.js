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
 * EXPERIMENTAL!
 *
 * <h2>Form Controller</h2>
 *
 * *General idea*
 *
 * The form controller is responsible for connecting a from with a model. If no
 * model is given, a model can be created. This created form will fit exactly 
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
 * The controller only work if both, a controller and a model are set. 
 * Creating a model will automatically set the created model.
 *
 * *Cross reference*
 *
 * * If you want to bind single values, use {@link qx.data.controller.Object}
 * * If you want to bind a list like widget, use {@link qx.data.controller.List}
 * * If you want to bind a tree widget, use {@link qx.data.controller.Tree}
 */
qx.Class.define("qx.data.controller.Form", 
{
  extend : qx.core.Object,

  /**
   * @param model {qx.core.Object | null} The model to bind the target to. The
   *   given object will be set as {@link #model} property.
   * @param target {qx.ui.form.Form | null} The form which contains the form 
   *   items. The given form will be set as {@link #target} property.
   */
  construct : function(model, target)
  {
    this.base(arguments);
    
    if (model != null) {
      this.setModel(model);
    }
    
    if (target != null) {
      this.setTarget(target);
    }
  },


  properties : 
  {    
    /** Data object containing the data which should be shown in the target. */
    model : 
    {
      check: "qx.core.Object",
      apply: "_applyModel",
      event: "changeModel",
      nullable: true
    },
    
    
    /** The target widget which should show the data. */
    target : 
    {
      check: "qx.ui.form.Form",
      apply: "_applyTarget",
      event: "changeTarget",
      nullable: true,
      init: null
    }
  },


  members :
  {
    __objectController : null,    
    
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
    createModel : function(includeBubbleEvents) {
      var target = this.getTarget();
      
      // throw an error if no target is set
      if (target == null) {
        throw new Error("No target is set.");
      }
      
      var items = target.getItems();
      var data = {};
      for (var name in items) {
        data[name] = null;
      }
      
      var model = qx.data.marshal.Json.createModel(data, includeBubbleEvents);
      this.setModel(model);
      
      return model;
    },
    
    
    // apply method
    _applyTarget : function(value, old) {
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
    _applyModel : function(value, old) {
      // set the model of the object controller if available
      if (this.__objectController != null) {
        this.__objectController.setModel(value);
      }
      
      // do nothing is no target is set
      if (this.getTarget() == null) {
        return;
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
    __setUpBinding : function() {
      // create the object controller
      if (this.__objectController == null) {
        this.__objectController = new qx.data.controller.Object(this.getModel());
      }
      
      // get the form items
      var items = this.getTarget().getItems();
      
      // connect all items
      for (var name in items) {
        var item = items[name];
        // check for all selection widgets
        if (qx.Class.hasInterface(item.constructor, qx.ui.core.ISingleSelection)) {
          var targetProperty = "selection";
        } else {
          // default case is the value property
          var targetProperty = "value";
        }
        this.__objectController.addTarget(item, targetProperty, name, true);
      }
    },
    
    
    /**
     * Internal helper for removing all set up bindings using 
     * {@link qx.data.controller.Object#removeTarget}.
     * 
     * @param oldTarget {qx.ui.form.Form} The form which has been removed.
     */
    __tearDownBinding : function(oldTarget) {
      // do nothing if the object controller has not been created
      if (this.__objectController == null) {
        return;
      }
      
      // get the items
      var items = oldTarget.getItems();
      
      // disconnect all items
      for (var name in items) {
        this.__objectController.removeTarget(items[name], "value", name);
      }
    }

  }
});
