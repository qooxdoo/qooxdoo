
/* ************************************************************************
#ignore(qx.test.ListItem)
************************************************************************ */

qx.Class.define("qx.test.data.controller.ListReverse",
{
  extend : qx.test.ui.LayoutTestCase,

  construct : function() {
    this.base(arguments);

    // define a test class
    qx.Class.define("qx.test.ListItem",
    {
      extend : qx.ui.core.Widget,
      implement : [qx.ui.form.IModel],
      include : [qx.ui.form.MModelProperty],

      properties :
      {
        label : {
          check : "String",
          init: "label",
          event : "changeName"
        },

        icon : {
          check : "String",
          init : "icon",
          event : "changeIcon"
        },

        child : {
          check : "qx.test.ListItem",
          event: "changeChild",
          nullable: true
        },

        children : {
          event : "changeChildren",
          nullable: true
        }
      }
    });
  },


  members :
  {
    __list: null,
    __controller: null,
    __data: null,
    __model: null,
    __delegate: null,

    setUp : function()
    {
      this.__list = new qx.ui.form.List();

      // create the model
      this.__data = [];
      for (var i = 0; i < 5; i++) {
        this.__data.push("item" + i);
      }
      // create a new array
      this.__model = new qx.data.Array(this.__data);

      this.__delegate = {
        createItem : function() {
          return new qx.test.ListItem();
        }
      };
      this.__controller = new qx.data.controller.List();
    },


    tearDown : function()
    {
      this.flush();
      this.__controller.dispose();
      this.__controller = null;
      this.__model.dispose();
      this.__model = null;
      this.__data = null;
      this.__list.dispose();
    },


    testStringListModel : function()
    {
      this.__delegate.bindItem = function(controller, item, id) {
        controller.bindProperty("", "label", null, item, id);
        controller.bindPropertyReverse("", "label", null, item, id);
        controller.bindPropertyReverse("", "icon", null, item, id);
      }

      this.__controller.set({
        target: this.__list,
        delegate: this.__delegate,
        iconPath: "",
        model: this.__model
      });

      // check for the binding model --> target
      var items = this.__list.getChildren();
      for (var i = 0; i < items.length; i++) {
        this.__model.setItem(i, "abc" + i);
        this.assertEquals("abc" + i, items[i].getLabel());
      };

      // check for the binding target(label) --> model
      for (var i = 0; i < items.length; i++) {
        items[i].setLabel("affe" + i);
        this.assertEquals(items[i].getLabel(), this.__model.getItem(i));
      }

      // check for the binding target(icon) --> model
      for (var i = 0; i < items.length; i++) {
        items[i].setIcon("AFFE" + i);
        this.assertEquals(items[i].getIcon(), this.__model.getItem(i));
      }

      // invoke a removing and setting of the bindings with the new bindItem
      this.__delegate.bindItem = function(controller, item, id) {
        controller.bindProperty("", "label", null, item, id);
      }
      this.__controller.update();

      // check for the removed binding target(icon) --> model
      for (var i = 0; i < items.length; i++) {
        items[i].setIcon("123-" + i);
        this.assertEquals("AFFE" + i, this.__model.getItem(i));
      }
    },


    testStringListModelInitModelPrior : function()
    {
      this.__delegate.bindItem = function(controller, item, id) {
        controller.bindProperty("", "icon", null, item, id);
        controller.bindPropertyReverse("", "icon", null, item, id);
      }

      this.__controller.set({
        target: this.__list,
        delegate: this.__delegate,
        iconPath: "",
        model: this.__model
      });

      // check for the binding model --> target
      var items = this.__list.getChildren();
      for (var i = 0; i < items.length; i++) {
        this.assertEquals("item" + i, items[i].getIcon());
      };
    },


    testStringListModelInitTargetPrior : function()
    {
      this.__delegate.bindItem = function(controller, item, id) {
        controller.bindPropertyReverse("", "icon", null, item, id);
        controller.bindProperty("", "icon", null, item, id);
      }

      this.__controller.set({
        target: this.__list,
        delegate: this.__delegate,
        iconPath: "",
        model: this.__model
      });

      // check for the binding model --> target
      var items = this.__list.getChildren();
      for (var i = 0; i < items.length; i++) {
        this.assertEquals("icon", items[i].getIcon());
      };
    },


    testStringListModelDeepTarget : function()
    {
      this.__delegate.bindItem = function(controller, item, id) {
        controller.bindProperty("", "child.label", null, item, id);
        controller.bindPropertyReverse("", "child.label", null, item, id);
      }

      this.__delegate.configureItem = function(item) {
        item.setChild(new qx.test.ListItem());
      }

      this.__controller.set({
        target: this.__list,
        delegate: this.__delegate,
        iconPath: "",
        model: this.__model
      });

      // check for the binding model --> target
      var items = this.__list.getChildren();
      for (var i = 0; i < items.length; i++) {
        this.__model.setItem(i, "abc" + i);
        this.assertEquals("abc" + i, items[i].getChild().getLabel());
      };

      // check for the binding target(label) --> model
      for (var i = 0; i < items.length; i++) {
        items[i].getChild().setLabel("affe" + i);
        this.assertEquals(items[i].getChild().getLabel(), this.__model.getItem(i));
      }

      // get rid of the created items
      for (var i = 0; i < items.length; i++) {
        items[i].getChild().dispose();
        items[i].setChild(null);
      };
    },


    testStringListModelArrayTarget : function()
    {
      this.__delegate.bindItem = function(controller, item, id) {
        controller.bindProperty("", "children[0].label", null, item, id);
        controller.bindPropertyReverse("", "children[0].label", null, item, id);
      }

      var childItems = new qx.data.Array(new qx.test.ListItem(), new qx.test.ListItem());
      this.__delegate.configureItem = function(item) {
        item.setChildren(childItems);
      }

      this.__controller.set({
        target: this.__list,
        delegate: this.__delegate,
        iconPath: "",
        model: this.__model
      });

      // check for the binding model --> target
      var items = this.__list.getChildren();
      for (var i = 0; i < items.length; i++) {
        this.__model.setItem(i, "abc" + i);
        this.assertEquals("abc" + i, items[i].getChildren().getItem(0).getLabel());
      };

      // check for the binding target(label) --> model
      for (var i = 0; i < items.length; i++) {
        items[i].getChildren().getItem(0).setLabel("affe" + i);
        this.assertEquals(items[i].getChildren().getItem(0).getLabel(), this.__model.getItem(i));
      }

      // check a change of the array order
      for (var i = 0; i < items.length; i++) {
        items[i].getChildren().reverse();
        this.assertEquals(items[i].getChildren().getItem(0).getLabel(), this.__model.getItem(i));
      }

      // get rid of the created items
      for (var i = 0; i < items.length; i++) {
        if (items[i].getChildren().getItem(0)) {
          items[i].getChildren().getItem(0).dispose();
        }
        items[i].getChildren().setItem(0, null);
        if (items[i].getChildren().getItem(1)) {
          items[i].getChildren().getItem(1).dispose();
        }
        items[i].getChildren().setItem(1, null);
        items[i].setChildren(null);
      };

      childItems.dispose();
    }
  }
});
