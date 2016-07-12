/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * <h2>website List Controller</h2>
 *
 * *General idea*
 * The list controller is responsible for synchronizing data given as model
 * to a DOM element. As definition for a single item, templates are used. More
 * details on templates can be found in {@link qx.bom.Template}.
 *
 * *Features*
 *
 * * Synchronize the model and the target
 * * Filtering
 *
 * *Usage*
 *
 * As model, {@link qx.data.Array}s and plain JavaScript Arrays work. As a
 * Target, you have to use a DOM element e.g. a plain DIV element. Make sure
 * you have the template you are referencing in the DOM.
 */
qx.Class.define("qx.data.controller.website.List",
{
  extend : qx.core.Object,

  /**
   * @param model {qx.data.IListData|Array?} The mode which can either be a
   *   native array or a qooxdoo data list. Maps to the model property.
   * @param target {Element?} A DOM element which should is the target for
   *   the generation.
   * @param templateId {String?} The id of the template.
   */
  construct : function(model, target, templateId)
  {
    this.base(arguments);

    if (templateId != null) {
      this.setTemplateId(templateId);
    }
    if (model != null) {
      this.setModel(model);
    }
    if (target != null) {
      this.setTarget(target);
    }
  },


  properties : {
    /** Array containing the data which should be shown in the list. */
    model :
    {
      check: "Array",
      apply: "_applyModel",
      event: "changeModel",
      nullable: true,
      dereference: true
    },


    /** The target DOM node which should show the data. */
    target :
    {
      check: "Element",
      apply: "_applyTarget",
      event: "changeTarget",
      nullable: true,
      init: null,
      dereference: true
    },


    /**
     * The id of the template which should be use. Check out
     * {@link qx.bom.Template} for details on templating.
     */
    templateId :
    {
      apply: "_applyTemplateId",
      event: "changeTemplateId",
      nullable: true,
      init: null
    },


    /**
     * The delegate for the list controller which supports almost all methods
     * documented in {@link qx.data.controller.IControllerDelegate} except
     * <code>bindItem</code>.
     */
    delegate :
    {
      apply: "_applyDelegate",
      event: "changeDelegate",
      init: null,
      nullable: true
    }
  },


  members :
  {
    __changeModelListenerId : null,
    __changeBubbleModelListenerId : null,

    // property apply
    _applyModel : function(value, old) {
      // remove the old listener
      if (old != undefined) {
        if (this.__changeModelListenerId != undefined) {
          old.removeListenerById(this.__changeModelListenerId);
        }
        if (this.__changeBubbleModelListenerId != undefined) {
          old.removeListenerById(this.__changeBubbleModelListenerId);
        }
      }

      // if a model is set
      if (value != null) {
        // only for qooxdoo models
        if (value instanceof qx.core.Object) {
          // add new listeners
          this.__changeModelListenerId =
            value.addListener("change", this.update, this);
          this.__changeBubbleModelListenerId =
            value.addListener("changeBubble", this.update, this);
        }
      } else {
        var target = this.getTarget();
        // if the model is set to null, we should remove all items in the target
        if (target != null) {
          this.__emptyTarget();
        }
      }

      this.update();
    },


    // property apply
    _applyTarget : function(value, old) {
      this.update();
    },


    // property apply
    _applyTemplateId : function(value, old) {
      this.update();
    },


    // property apply
    _applyDelegate : function(value, old) {
      this.update();
    },


    /**
     * Responsible for removing all items from the target element.
     */
    __emptyTarget : function() {
      var target = this.getTarget();
      for (var i= target.children.length -1; i >= 0; i--) {
        var el = target.children[i];
        el.$$model = null;
        qx.dom.Element.remove(el);
      };
      target.innerHTML = "";
    },


    /**
     * This is the main method which will take the data from the model and
     * push it to the target view. If you are using a plain Array as model,
     * you need to call that method every time you want to see the changed model
     * in the view while using {@link qx.data.Array}s will do that
     * automatically for you.
     * This method also attaches to every created DOM element the model object
     * which was used to create it at <code>.$$model</code>.
     */
    update : function() {
      var target = this.getTarget();

      // get the plain data
      var data = this.getModel();
      if (data instanceof qx.core.Object) {
        data = qx.util.Serializer.toNativeObject(this.getModel());
      }
      var templateId = this.getTemplateId();

      // only do something if everything is given
      if (target == null || data == null || templateId == null) {
        return;
      }

      // empty the target
      this.__emptyTarget();

      // delegate methods
      var configureItem = this.getDelegate() && this.getDelegate().configureItem;
      var filter = this.getDelegate() && this.getDelegate().filter;
      var createItem = this.getDelegate() && this.getDelegate().createItem;

      // get all items in the model
      for (var i=0; i < data.length; i++) {
        var entry = data[i];
        // filter delegate
        if (filter && !filter(entry)) {
          continue;
        }

        // special case for printing the content of the array
        if (typeof entry != "object") {
          entry = {"." : data[i]};
        }

        // create the DOM object
        var template;
        if (createItem) {
          template = createItem(data[i]);
        } else {
          template = qx.bom.Template.get(templateId, entry);
        }

        // handling for wrong template IDs
        if (qx.core.Environment.get("qx.debug")) {
          this.assertNotNull(template);
        }

        // configure item
        if (configureItem) {
          configureItem(template);
        }

        // append the model to the dom item
        var model = this.getModel();
        var item = model.getItem ? model.getItem(i) : model[i];
        template.$$model = item;

        qx.dom.Element.insertEnd(template, target);
      };
    }
  }
});
