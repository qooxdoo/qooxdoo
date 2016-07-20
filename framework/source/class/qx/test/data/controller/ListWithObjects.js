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
 * @ignore(qx.test.ListWithObject, qx.demo.Parent, qx.demo.Kid)
 */

qx.Class.define("qx.test.data.controller.ListWithObjects",
{
  extend : qx.test.ui.LayoutTestCase,

  construct : function() {
    this.base(arguments);

    // define a test class
    qx.Class.define("qx.test.ListWithObject",
    {
      extend : qx.core.Object,

      properties :
      {
        name : {
          check : "String",
          event : "changeName"
        },

        icon : {
          check : "String",
          init : "Juhu",
          event : "changeIcon"
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


    setUp : function()
    {
      this.__list = new qx.ui.form.List();

      // create the model
      this.__data = [];
      for (var i = 0; i < 5; i++) {
        var obj = new qx.test.ListWithObject();
        obj.setName("name" + i);
        obj.setIcon("icon" + i);
        this.__data.push(obj);
      }
      // create a new array
      this.__model = new qx.data.Array(this.__data);
    },


    tearDown : function()
    {
      this.flush();
      this.__controller.dispose();
      this.__controller = null;
      this.__model.setAutoDisposeItems(true);
      this.__model.dispose();
      this.__model = null;
      this.__data = null;
      this.__list.dispose();
    },


    testRead: function() {
      // create the controller
      this.__controller = new qx.data.controller.List(this.__model, this.__list, "name");

      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i].getName(), label, "Binding " + i + " is wrong!");
      }
    },


    testChangeLablePath: function() {
      // create the controller
      this.__controller = new qx.data.controller.List(this.__model, this.__list, "name");

      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i].getName(), label, "Binding " + i + " is wrong!");
      }

      this.__controller.setLabelPath("icon");

      // check the binding again
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i].getIcon(), label, "Binding " + i + " is wrong!");
      }
    },


    testSelection: function() {
      // create the controller
      this.__controller = new qx.data.controller.List(this.__model, this.__list, "name");

      // select the first object
      this.__list.addToSelection(this.__list.getChildren()[0]);
      // test the selection
      this.assertEquals(this.__model.getItem(0), this.__controller.getSelection().getItem(0), "Selection does not work.");

      // test for the length
      this.assertEquals(1, this.__controller.getSelection().length, "Selection length is wrong.");

      // select the second object
      this.__list.addToSelection(this.__list.getChildren()[1]);
      // test the selection
      this.assertEquals(this.__model.getItem(1), this.__controller.getSelection().getItem(0), "Selection does not work.");
      // test for the length
      this.assertEquals(1, this.__controller.getSelection().length, "Selection length is wrong.");
    },


    testSelectionBackMultiple: function() {
      // create the controller
      this.__controller = new qx.data.controller.List(this.__model, this.__list, "name");

      // select the second and third object
      this.__list.setSelectionMode("multi");

      // add the some elements to the selection
      this.__controller.getSelection().push(this.__model.getItem(1));
      this.__controller.getSelection().push(this.__model.getItem(2));

      // test the selection
      this.assertEquals(this.__model.getItem(1), this.__controller.getSelection().getItem(0), "addToSelection does not work.");
      this.assertEquals(this.__model.getItem(2), this.__controller.getSelection().getItem(1), "addToSelection does not work.");
    },


    testChangeModelSmaller: function() {
      // create the controller
      this.__controller = new qx.data.controller.List(this.__model, this.__list, "name");

      // create the model
      this.__data = [];
      for (var i = 0; i < 2; i++) {
        var obj = new qx.test.ListWithObject();
        obj.setName("name");
        obj.setIcon("icon");
        this.__data.push(obj);
      }
      // create a new array
      this.__model.setAutoDisposeItems(true);
      this.__model.dispose();
      this.__model = new qx.data.Array(this.__data);
      this.__controller.setModel(this.__model);

      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i].getName(), label, "Binding " + i + " is wrong!");
      }
      // check the length
      this.assertEquals(this.__data.length, this.__list.getChildren().length, "Wrong length!");
    },


    testIcon: function() {
      // create the controller
      this.__controller = new qx.data.controller.List(this.__model, this.__list, "name");
      this.__controller.setIconPath("icon");

      // check the label binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i].getName(), label, "Binding " + i + " is wrong!");
      }
      // check the icon binding
      for (var i = 0; i < this.__data.length; i++) {
        var icon = this.__list.getChildren()[i].getIcon();
        this.assertEquals(this.__data[i].getIcon(), icon, "Binding " + i + " is wrong!");
      }
    },


    testChangeIconPath: function() {
      // create the controller
      this.__controller = new qx.data.controller.List(this.__model, this.__list, "name");
      this.__controller.setIconPath("icon");

      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var icon = this.__list.getChildren()[i].getIcon();
        this.assertEquals(this.__data[i].getIcon(), icon, "Binding " + i + " is wrong!");
      }

      this.__controller.setIconPath("name");

      // check the binding again
      for (var i = 0; i < this.__data.length; i++) {
        var icon = this.__list.getChildren()[i].getIcon();
        this.assertEquals(this.__data[i].getName(), icon, "Binding " + i + " is wrong!");
      }
    },


    testConversionLabelAndIcon: function() {
      // create the label options
      var labelOptions = {
        converter: function(value) {
          return "Dr. " + value;
        }
      };
      // create the icon options
      var iconOptions = {
        converter: function(value) {
          return value + ".png";
        }
      };

      // create the controller
      this.__controller = new qx.data.controller.List(this.__model, this.__list, "name");
      this.__controller.setIconPath("icon");
      this.__controller.setLabelOptions(labelOptions);
      this.__controller.setIconOptions(iconOptions);


      // check the label binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals("Dr. " + this.__data[i].getName(), label, "Binding " + i + " is wrong!");
      }

      // check the icon binding
      for (var i = 0; i < this.__data.length; i++) {
        var icon = this.__list.getChildren()[i].getIcon();
        this.assertEquals(this.__data[i].getIcon() + ".png", icon, "Binding " + i + " is wrong!");
      }
    },


    testSetModelLate: function() {
      // create the controller
      this.__controller = new qx.data.controller.List(null, this.__list, "name");

      this.__controller.setModel(this.__model);

      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i].getName(), label, "Binding " + i + " is wrong!");
      }
    },


    testSetTargetLate: function() {
      // create the controller
      this.__controller = new qx.data.controller.List(this.__model, null, "name");

      this.__controller.setTarget(this.__list);

      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i].getName(), label, "Binding " + i + " is wrong!");
      }
    },


    testFilter: function() {
      // create the controller
      this.__controller = new qx.data.controller.List(this.__model, this.__list, "name");
      this.__controller.setIconPath("icon");

      var delegate = {};
      delegate.filter = function(data) {
        return data.getName() == "name2" ? true : false;
      };
      // set the filter
      this.__controller.setDelegate(delegate);

      // check for the length
      this.assertEquals(1, this.__list.getChildren().length, "Too much list items.");

      // check the label binding
      var label = this.__list.getChildren()[0].getLabel();
      this.assertEquals("name2", label, "Label binding is wrong!");
      // check the icon binding
      var icon = this.__list.getChildren()[0].getIcon();
      this.assertEquals("icon2", icon, "Icon binding is wrong!");
    },


    testOnUpdateLabel: function() {
      // create the options map with the converter
      var options = {};
      var flag = false;
      options.onUpdate = function() {
        flag = true;
      };
      // create the controller
      this.__controller = new qx.data.controller.List(this.__model, this.__list, "name");
      this.__controller.setLabelOptions(options);

      // change something to invoke a change of a binding
      this.__data.pop().dispose();
      this.__model.pop().dispose();

      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i].getName(), label, "Binding " + i + " is wrong!");
      }

      // check if the flag is set
      this.assertTrue(flag, "onUpdate not executed");
    },


    // [BUG #2088]
    testDeepSelection : function() {
      qx.Class.define("qx.demo.Kid",
      {
        extend : qx.core.Object,

        properties :
        {
          name :
          {
            check : "String",
            event : "changeName",
            init : null
          }
        }
      });

      qx.Class.define("qx.demo.Parent",
      {
        extend : qx.core.Object,
        construct : function()
        {
          this.base(arguments);
          this.setKid(new qx.demo.Kid());
        },

        properties :
        {
          name :
          {
            check : "String",
            event : "changeName",
            init : null
          },
          kid :
          {
            check : "qx.demo.Kid",
            event : "changeKid"
          }
        }
      });

      var parentA = new qx.demo.Parent();
      parentA.setName("parentA");
      parentA.getKid().setName("kidA");

      var parentB = new qx.demo.Parent();
      parentB.setName("parentB");
      parentB.getKid().setName("kidB");

      var parentC = new qx.demo.Parent();
      parentC.setName("parentC");
      parentC.getKid().setName("kidC");

      var parents = new qx.data.Array();
      parents.push(parentA);
      parents.push(parentB);
      parents.push(parentC);


      this.__controller = new qx.data.controller.List(parents, this.__list, "name");

      this.assertEquals(parentC.getName(), this.__list.getChildren()[2].getModel().getName(), "Wrong model stored before the splice.");

      var temp = parents.splice(parents.indexOf(parentB), 1);
      temp.getItem(0).getKid().dispose();
      temp.setAutoDisposeItems(true);
      temp.dispose();

      this.assertEquals("parentC", this.__list.getChildren()[1].getLabel(), "Wrong name of the parent.");
      this.assertEquals(parentC, this.__list.getChildren()[1].getModel(), "Wrong model stored after the splice.");

      // clean up
      for (var i=0; i<parents.length; i++) {
        parents.getItem(i).getKid().dispose();
      }
      parents.setAutoDisposeItems(true);
      parents.dispose();
    },

    testModelProperty : function()
    {
      // create the controller
      this.__controller = new qx.data.controller.List(null, this.__list, "name");

      // filter only the first item
      var delegate = {};
      delegate.filter = function(data) {
        return data.getName() == "name0" || data.getName() == "name2" ? false : true;
      };
      delegate.bindItem = function(c, item, index) {
        c.bindProperty("", "model", null, item, index);
      };
      // set the filter
      this.__controller.setDelegate(delegate);
      this.__controller.setModel(this.__model);

      this.assertEquals(3, this.__list.getChildren().length);

      // check the binding
      this.assertEquals(this.__model.getItem(1), this.__list.getChildren()[0].getModel());
      this.assertEquals(this.__model.getItem(3), this.__list.getChildren()[1].getModel());
      this.assertEquals(this.__model.getItem(4), this.__list.getChildren()[2].getModel());

      // add another item
      var item = new qx.test.ListWithObject().set({
        name: "name5",
        icon: "icon5"
      });
      this.__model.push(item);
      this.assertEquals(this.__model.getItem(5), this.__list.getChildren()[3].getModel());

      item.dispose();
    },


    testModelPropertyBinding : function()
    {
      // create the controller
      this.__controller = new qx.data.controller.List(null, this.__list, "name");

      // filter only the first item
      var delegate = {};
      delegate.bindItem = function(c, item, index) {
        c.bindProperty("icon", "model", null, item, index);
      };
      // set the filter
      this.__controller.setDelegate(delegate);
      this.__controller.setModel(this.__model);

      // test the right set model properties
      for (var i = 0; i < this.__list.getChildren().length; i++) {
        var child = this.__list.getChildren()[i];
        this.assertEquals("icon" + i, child.getModel());
      };

      // test selection
      this.__controller.getSelection().push("icon1");
      this.assertEquals("icon1", this.__list.getSelection()[0].getModel());
    },


    testModelInConverter: function() {
      // create the controller
      this.__controller = new qx.data.controller.List(this.__model, this.__list, "name");

      this.__controller.setLabelOptions({converter : function (value, model) {
        return model.getIcon();
      }});

      // add a new object after the options are set
      var obj = new qx.test.ListWithObject();
      obj.setName("namex");
      obj.setIcon("iconx");
      this.__model.push(obj);

      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i].getIcon(), label, "Binding " + i + " is wrong!");
      }

      var label = this.__list.getChildren()[this.__data.length].getLabel();
      this.assertEquals("iconx", label, "New binding is wrong!");
    }
  }
});
