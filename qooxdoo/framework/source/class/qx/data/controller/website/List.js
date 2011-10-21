/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.data.controller.bom.List", 
{
  extend : qx.core.Object,


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
    /** Data array containing the data which should be shown in the list. */
    model :
    {
      check: "qx.data.IListData",
      apply: "_applyModel",
      event: "changeModel",
      nullable: true,
      dereference: true
    },


    /** The target DOM node which should show the data. */
    target :
    {
      apply: "_applyTarget",
      event: "changeTarget",
      nullable: true,
      init: null,
      dereference: true
    },
    
    templateId : 
    {
      apply: "_applyTemplateId",
      event: "changeTemplateId",
      nullable: true,
      init: null
    },


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

    _applyModel : function(value, old) {
      // remove the old listener
      if (old != undefined) {
        if (this.__changeModelListenerId != undefined) {
          old.removeListenerById(this.__changeModelListenerId);
        }
      }

      // if a model is set
      if (value != null) {
        // add a new listener
        this.__changeModelListenerId =
          value.addListener("change", this._update, this);
      } else {
        var target = this.getTarget();
        // if the model is set to null, we should remove all items in the target
        if (target != null) {
          this.__emptyTarget();
        }
      }

      this._update();
    },


    _applyTarget : function(value, old) {
      this._update();
    },


    _applyTemplateId : function(value, old) {
      this._update();
    },


    _applyDelegate : function(value, old) {
      this._update();
    },


    __emptyTarget : function() {
      var target = this.getTarget();
      for (var i= target.children.length -1; i >= 0; i--) {
        var el = target.children[i];
        el.$$model = null;
        qx.dom.Element.remove(el);
      };
    },


    _update : function() {
      var target = this.getTarget();
      var data = qx.util.Serializer.toNativeObject(this.getModel());
      var templateId = this.getTemplateId();

      // only do something if everyhing is given
      if (target == null || data == null || templateId == null) {
        return;
      }

      // empty the target
      this.__emptyTarget();

      var configureItem = this.getDelegate() && this.getDelegate().configureItem;
      // get all items in the model
      for (var i=0; i < data.length; i++) {
        var template = qx.bom.Template.get(templateId, data[i]);
        if (configureItem) {
          configureItem(template);
        }
        template.$$model = this.getModel().getItem(i);
        qx.dom.Element.insertEnd(template, target);
      };
    }
  }
});