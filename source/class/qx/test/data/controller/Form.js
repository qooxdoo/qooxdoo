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
qx.Class.define("qx.test.data.controller.Form", {
  extend: qx.dev.unit.TestCase,

  members: {
    __form: null,
    __tf1: null,
    __tf2: null,
    __cb: null,
    __model: null,

    setUp() {
      // create the objects
      this.__form = new qx.ui.form.Form();
      this.__tf1 = new qx.ui.form.TextField();
      this.__tf2 = new qx.ui.form.TextField("init");
      this.__cb = new qx.ui.form.CheckBox();
      this.__model = qx.data.marshal.Json.createModel({
        tf1: null,
        tf2: null,
        cb: null
      });

      // build the form
      this.__form.add(this.__tf1, "label1", null, "tf1");
      this.__form.add(this.__tf2, "label2", null, "tf2");
      this.__form.add(this.__cb, "label3", null, "cb");
    },

    tearDown() {
      this.__form.dispose();
      this.__model.dispose();
      this.__tf1.dispose();
      this.__tf2.destroy();
      this.__cb.destroy();
    },

    testSetModelNull() {
      var c = new qx.data.controller.Form(this.__model, this.__form);

      // set some values
      this.__tf1.setValue("1111");
      this.__tf2.setValue("2222");
      this.__cb.setValue(true);

      // set model to null
      c.setModel(null);

      // all values should be null as well
      this.assertNull(this.__tf1.getValue());
      this.assertNull(this.__tf2.getValue());
      this.assertFalse(this.__cb.getValue());

      c.dispose();
    },

    testInitialResetter() {
      // create the controller which set the initial values and
      // saves them for resetting
      var c = new qx.data.controller.Form(this.__model, this.__form);

      this.__tf2.setValue("affe");
      this.__form.reset();
      this.assertEquals(null, this.__tf2.getValue());

      c.dispose();
    },

    testUnidirectionalDeep() {
      this.__form.dispose();
      this.__form = new qx.ui.form.Form();

      this.__form.add(this.__tf1, "label1", null, "a.tf1");
      this.__form.add(this.__tf2, "label2", null, "a.tf2");
      // just create the controller
      var c = new qx.data.controller.Form(null, this.__form, true);
      var model = c.createModel();
      // check if the binding from the model to the view works
      model.getA().setTf1("affe");
      this.assertEquals("affe", this.__tf1.getValue());

      // check if the other direction does not work
      this.__tf2.setValue("affee");
      this.assertEquals("init", model.getA().getTf2());

      // use the commit method
      c.updateModel();
      this.assertEquals("affee", model.getA().getTf2());

      // destroy the controller
      c.dispose();
      model.dispose();
    },

    testUnidirectionalSelectionOptions() {
      // just create the controller
      var c = new qx.data.controller.Form(this.__model, this.__form, true);

      var sb = new qx.ui.form.SelectBox();
      var i1 = new qx.ui.form.ListItem("a").set({ model: "a" });
      var i2 = new qx.ui.form.ListItem("b").set({ model: "b" });
      sb.add(i1);
      sb.add(i2);

      this.__form.add(sb, "Sb");
      c.setModel(null);
      c.addBindingOptions(
        "Sb",
        {
          converter(data) {
            return data && data.substr(0, 1);
          }
        },

        {
          converter(data) {
            return data + "-item";
          }
        }
      );

      var m = c.createModel();

      // check that the init value is set
      this.assertEquals("a-item", m.getSb());

      sb.setSelection([i2]);
      this.assertEquals("a-item", m.getSb());

      c.updateModel();
      this.assertEquals("b-item", m.getSb());

      // destroy
      sb.dispose();
      c.dispose();
      m.dispose();
    },

    testUnidirectionalOptions() {
      // just create the controller
      var c = new qx.data.controller.Form(this.__model, this.__form, true);

      c.addBindingOptions(
        "tf1",
        {
          converter(data) {
            return data && data.substr(0, data.length - 1);
          }
        },

        {
          converter(data) {
            return data + "a";
          }
        }
      );

      // check if the other direction does not work
      this.__tf1.setValue("affe");
      this.assertEquals(null, this.__model.getTf1());

      // use the commit method
      c.updateModel();
      this.assertEquals("affea", this.__model.getTf1());

      // destroy the controller
      c.dispose();
    },

    testUnidirectionalSelection() {
      // just create the controller
      var c = new qx.data.controller.Form(this.__model, this.__form, true);

      var sb = new qx.ui.form.SelectBox();
      var i1 = new qx.ui.form.ListItem("a").set({ model: "a" });
      var i2 = new qx.ui.form.ListItem("b").set({ model: "b" });
      sb.add(i1);
      sb.add(i2);

      this.__form.add(sb, "Sb");
      var m = c.createModel();

      // check that the init value is set
      this.assertEquals("a", m.getSb());

      sb.setSelection([i2]);
      this.assertEquals("a", m.getSb());

      c.updateModel();
      this.assertEquals("b", m.getSb());

      // destroy
      sb.dispose();
      c.dispose();
      m.dispose();
    },

    testUnidirectional() {
      // just create the controller
      var c = new qx.data.controller.Form(this.__model, this.__form, true);

      // check if the binding from the model to the view works
      this.__model.setTf1("affe");
      this.assertEquals("affe", this.__tf1.getValue());

      // check if the other direction does not work
      this.__tf2.setValue("affee");
      this.assertEquals(null, this.__model.getTf2());

      // use the commit method
      c.updateModel();
      this.assertEquals("affee", this.__model.getTf2());

      // destroy the controller
      c.dispose();
    },

    testCreateEmpty() {
      // just create the controller
      var c = new qx.data.controller.Form();
      // check the defaults for the properties
      this.assertNull(c.getModel());
      this.assertNull(c.getTarget());
      // destroy the controller
      c.dispose();
    },

    testCreateWithModel() {
      // just create the controller
      var c = new qx.data.controller.Form(this.__model);
      // check for the properties
      this.assertEquals(this.__model, c.getModel());
      this.assertNull(c.getTarget());
      // destroy the objects
      c.dispose();
    },

    testCreateWithForm() {
      // just create the controller
      var c = new qx.data.controller.Form(null, this.__form);
      // check for the properties
      this.assertEquals(this.__form, c.getTarget());
      this.assertNull(c.getModel());
      // destroy the objects
      c.dispose();
    },

    testCreateWithBoth() {
      // just create the controller
      var c = new qx.data.controller.Form(this.__model, this.__form);
      // check for the properties
      this.assertEquals(this.__form, c.getTarget());
      this.assertEquals(this.__model, c.getModel());
      // destroy the objects
      c.dispose();
    },

    testBindingCreate() {
      // create the controller
      var c = new qx.data.controller.Form(this.__model, this.__form);

      // set values in the form
      this.__tf1.setValue("1");
      this.__tf2.setValue("2");
      this.__cb.setValue(true);

      // check the binding
      this.assertEquals(this.__tf1.getValue(), this.__model.getTf1());
      this.assertEquals(this.__tf2.getValue(), this.__model.getTf2());
      this.assertEquals(this.__cb.getValue(), this.__model.getCb());

      // change the values
      this.__tf1.setValue("11");
      this.__tf2.setValue("21");
      this.__cb.setValue(false);

      // check the binding
      this.assertEquals(this.__tf1.getValue(), this.__model.getTf1());
      this.assertEquals(this.__tf2.getValue(), this.__model.getTf2());
      this.assertEquals(this.__cb.getValue(), this.__model.getCb());

      // change the data in the model
      this.__model.setTf1("a");
      this.__model.setTf2("b");
      this.__model.setCb(true);

      // check the binding
      this.assertEquals(this.__tf1.getValue(), this.__model.getTf1());
      this.assertEquals(this.__tf2.getValue(), this.__model.getTf2());
      this.assertEquals(this.__cb.getValue(), this.__model.getCb());

      // destroy the objects
      c.dispose();
    },

    testBindingChangeModel() {
      // create the controller
      var c = new qx.data.controller.Form(this.__model, this.__form);

      // set values in the form
      this.__tf1.setValue("1");
      this.__tf2.setValue("2");
      this.__cb.setValue(true);

      // check the binding
      this.assertEquals(this.__tf1.getValue(), this.__model.getTf1());
      this.assertEquals(this.__tf2.getValue(), this.__model.getTf2());
      this.assertEquals(this.__cb.getValue(), this.__model.getCb());

      var model2 = qx.data.marshal.Json.createModel({
        tf1: null,
        tf2: null,
        cb: null
      });

      c.setModel(model2);

      // set values in the form
      this.__tf1.setValue("11");
      this.__tf2.setValue("22");
      this.__cb.setValue(false);

      // check the new model
      this.assertEquals(this.__tf1.getValue(), model2.getTf1());
      this.assertEquals(this.__tf2.getValue(), model2.getTf2());
      this.assertEquals(this.__cb.getValue(), model2.getCb());

      // check the old model
      this.assertEquals("1", this.__model.getTf1());
      this.assertEquals("2", this.__model.getTf2());
      this.assertEquals(true, this.__model.getCb());

      model2.dispose();
      c.dispose();
    },

    testBindingChangeForm() {
      // create the controller
      var c = new qx.data.controller.Form(this.__model, this.__form);

      // set values in the form
      this.__tf1.setValue("1");
      this.__tf2.setValue("2");
      this.__cb.setValue(true);

      // check the binding
      this.assertEquals(this.__tf1.getValue(), this.__model.getTf1());
      this.assertEquals(this.__tf2.getValue(), this.__model.getTf2());
      this.assertEquals(this.__cb.getValue(), this.__model.getCb());

      // create a new form
      var form = new qx.ui.form.Form();
      var tf1 = new qx.ui.form.TextField();
      var tf2 = new qx.ui.form.TextField("init");
      var cb = new qx.ui.form.CheckBox();
      form.add(tf1, "tf1");
      form.add(tf2, "tf2");
      form.add(cb, "cb");

      c.setTarget(form);

      // set the values in the new form
      tf1.setValue("11");
      tf2.setValue("22");
      cb.setValue(false);

      // check the binding
      this.assertEquals(tf1.getValue(), this.__model.getTf1());
      this.assertEquals(tf2.getValue(), this.__model.getTf2());
      this.assertEquals(cb.getValue(), this.__model.getCb());

      // check the old from
      this.assertEquals(this.__tf1.getValue(), "1");
      this.assertEquals(this.__tf2.getValue(), "2");
      this.assertEquals(this.__cb.getValue(), true);

      form.dispose();
      tf1.destroy();
      tf2.destroy();
      cb.destroy();
      c.dispose();
    },

    testBindingDeep() {
      // a - b - cb
      // |   \
      // tf1  c
      //       \
      //        tf2
      var data = { a: { tf1: null }, b: { c: { tf2: null } }, cb: null };
      var model = qx.data.marshal.Json.createModel(data);

      // create the form
      var form = new qx.ui.form.Form();
      var tf1 = new qx.ui.form.TextField();
      var tf2 = new qx.ui.form.TextField();
      var cb = new qx.ui.form.CheckBox();

      // add the form incl. deep binding instructions
      form.add(tf1, "label1", null, "a.tf1");
      form.add(tf2, "label2", null, "b.c.tf2");
      form.add(cb, "label3", null, "cb");

      // create the controller
      var c = new qx.data.controller.Form(model, form);

      // set the values in the model
      model.getA().setTf1("1");
      model.getB().getC().setTf2("2");
      model.setCb(true);

      // check the binding
      this.assertEquals(tf1.getValue(), model.getA().getTf1());
      this.assertEquals(tf2.getValue(), model.getB().getC().getTf2());
      this.assertEquals(cb.getValue(), model.getCb());

      // set the values in the form items
      tf1.setValue("11");
      tf2.setValue("22");
      cb.setValue(false);

      // check the binding
      this.assertEquals(tf1.getValue(), model.getA().getTf1());
      this.assertEquals(tf2.getValue(), model.getB().getC().getTf2());
      this.assertEquals(cb.getValue(), model.getCb());

      c.dispose();
      model.dispose();
      form.dispose();
      tf1.destroy();
      tf2.destroy();
      cb.destroy();
    },

    testBindingModelSelection() {
      // create a select box
      var selectBox = new qx.ui.form.SelectBox();
      var i1 = new qx.ui.form.ListItem("a");
      i1.setModel("1");
      var i2 = new qx.ui.form.ListItem("b");
      i2.setModel("2");
      selectBox.add(i1);
      selectBox.add(i2);

      // add the selectBox to the form
      this.__form.add(selectBox, "sb");

      var model = qx.data.marshal.Json.createModel({
        tf1: null,
        tf2: null,
        cb: null,
        sb: null
      });

      // create the controller
      var c = new qx.data.controller.Form(model, this.__form);

      // set the selection
      selectBox.setSelection([i1]);

      // check the selection
      this.assertEquals(selectBox.getSelection()[0].getModel(), model.getSb());

      // set the model
      model.setSb("2");

      // check the selection
      this.assertEquals(selectBox.getSelection()[0].getModel(), model.getSb());

      c.dispose();
      model.dispose();
      i2.destroy();
      i1.destroy();
      selectBox.destroy();
    },

    testModelCreation() {
      // set some initial values in the form
      this.__tf1.setValue("A");
      this.__tf2.setValue("B");
      this.__cb.setValue(true);

      // create the controller
      var c = new qx.data.controller.Form(null, this.__form);
      c.addBindingOptions(
        "tf1",
        {
          converter(data) {
            return data && data.substr(0, 1);
          }
        },

        {
          converter(data) {
            return data + "-";
          }
        }
      );

      var model = c.createModel();

      // check if the model and the form still have the initial value
      this.assertEquals("A", this.__tf1.getValue());
      this.assertEquals("B", this.__tf2.getValue());
      this.assertTrue(this.__cb.getValue());
      this.assertEquals("A-", model.getTf1());
      this.assertEquals("B", model.getTf2());
      this.assertTrue(model.getCb());

      // set values in the form
      this.__tf1.setValue("1");
      this.__tf2.setValue("2");
      this.__cb.setValue(true);

      // check the binding
      this.assertEquals(this.__tf1.getValue() + "-", model.getTf1());
      this.assertEquals(this.__tf2.getValue(), model.getTf2());
      this.assertEquals(this.__cb.getValue(), model.getCb());

      // change the values
      this.__tf1.setValue("11");
      this.__tf2.setValue("21");
      this.__cb.setValue(false);

      // check the binding
      this.assertEquals(this.__tf1.getValue() + "-", model.getTf1());
      this.assertEquals(this.__tf2.getValue(), model.getTf2());
      this.assertEquals(this.__cb.getValue(), model.getCb());

      // change the data in the model
      this.__model.setTf1("a");
      this.__model.setTf2("b");
      this.__model.setCb(true);

      // check the binding
      this.assertEquals(this.__tf1.getValue() + "-", model.getTf1());
      this.assertEquals(this.__tf2.getValue(), model.getTf2());
      this.assertEquals(this.__cb.getValue(), model.getCb());

      // destroy the objects
      c.dispose();
      model.dispose();
    },

    testModelCreationDeep() {
      var form = new qx.ui.form.Form();
      var tf1 = new qx.ui.form.TextField("A");
      var tf2 = new qx.ui.form.TextField("B");

      form.add(tf1, null, null, "a.b1");
      form.add(tf2, null, null, "a.b2.c");

      var controller = new qx.data.controller.Form(null, form);
      var model = controller.createModel(true);

      // check if the creation worked
      this.assertEquals("A", model.getA().getB1());
      this.assertEquals("B", model.getA().getB2().getC());

      model.dispose();
      controller.dispose();
      tf1.destroy();
      tf2.destroy();
      form.dispose();
    },

    testModelCreationWithList() {
      var form = new qx.ui.form.Form();
      var list = new qx.ui.form.List();
      var i1 = new qx.ui.form.ListItem("A");
      var i2 = new qx.ui.form.ListItem("B");
      list.add(i1);
      list.add(i2);

      i1.setModel("A");
      i2.setModel("B");

      list.setSelection([]);

      form.add(list, "list");

      var controller = new qx.data.controller.Form(null, form);
      var model = controller.createModel();

      // check if the creation worked
      this.assertNull(model.getList());
      list.setSelection([i1]);
      this.assertEquals("A", model.getList());

      model.dispose();
      controller.dispose();
      list.destroy();
      i1.destroy();
      i2.destroy();
      form.dispose();
    },

    testModelCreationSpecialCaracter() {
      var form = new qx.ui.form.Form();
      var tf1 = new qx.ui.form.TextField("A");

      form.add(tf1, "a&b-c+d*e/f|g!h i.,:?;!~+-*/%{}()[]<>=^&|@/\\");

      var controller = new qx.data.controller.Form(null, form);
      var model = controller.createModel(true);

      // check if the creation worked
      this.assertEquals("A", model.getAbcdefghi());

      model.dispose();
      controller.dispose();
      tf1.destroy();
      form.dispose();
    },

    testModelCreationWithListController() {
      // create a select box
      var selectBox = new qx.ui.form.SelectBox();
      var listModel = qx.data.marshal.Json.createModel([{ name: "a" }, { name: "b" }]);

      var listController = new qx.data.controller.List(listModel, selectBox, "name");

      // add the selectBox to the form
      this.__form.add(selectBox, "sb");

      // select something which is not the default selection
      listController.getSelection().setItem(0, listModel.getItem(1));

      // create the controller
      var c = new qx.data.controller.Form(null, this.__form);
      var model = c.createModel();

      // check the init value of the model selection

      // This test is BROKEN: `model` is based on the initial values of the
      // form. The listController has nothing to do with the form yet. The
      // initial value will be the first item in the `listModel` list, which
      // is 'a', item 0, not 'b', item 1. This *should* and now does throw
      // an error. The question is, why didn't it throw an error previously?
      // What is causing the difference in behavior?
      this.assertEquals(listModel.getItem(1), model.getSb());

      // set the selection
      listController.getSelection().setItem(0, listModel.getItem(0));

      // check the selection
      this.assertEquals(selectBox.getSelection()[0].getModel(), model.getSb());

      // set the model
      model.setSb(listModel.getItem(1));

      // check the selection
      this.assertEquals(selectBox.getSelection()[0].getModel(), model.getSb());

      c.dispose();
      listController.dispose();
      listModel.dispose();
      model.dispose();
      selectBox.destroy();
    },

    testModelCreationWithModelSelection() {
      // create a select box
      var selectBox = new qx.ui.form.SelectBox();
      var i1 = new qx.ui.form.ListItem("a");
      i1.setModel("1");
      var i2 = new qx.ui.form.ListItem("b");
      i2.setModel("2");
      selectBox.add(i1);
      selectBox.add(i2);
      selectBox.setSelection([i1]);

      // add the selectBox to the form
      this.__form.add(selectBox, "sb");

      // select something which is not the default selection
      selectBox.setSelection([i2]);

      // create the controller
      var c = new qx.data.controller.Form(null, this.__form);
      var model = c.createModel();

      // check the init value of the model selection
      this.assertEquals("2", model.getSb());

      // set the selection
      selectBox.setSelection([i1]);

      // check the selection
      this.assertEquals(selectBox.getSelection()[0].getModel(), model.getSb());

      // set the model
      model.setSb("2");

      // check the selection
      this.assertEquals(selectBox.getSelection()[0].getModel(), model.getSb());

      c.dispose();
      model.dispose();
      i2.destroy();
      i1.destroy();
      selectBox.destroy();
    },

    testRemoveTarget() {
      // create a select box
      var selectBox = new qx.ui.form.SelectBox();
      var i1 = new qx.ui.form.ListItem("a");
      i1.setModel("1");
      var i2 = new qx.ui.form.ListItem("b");
      i2.setModel("2");
      selectBox.add(i1);
      selectBox.add(i2);

      // add the selectBox to the form
      this.__form.add(selectBox, "sb");
      this.__form.add(this.__tf1, "tf1");

      var model = qx.data.marshal.Json.createModel({
        tf1: null,
        tf2: null,
        cb: null,
        sb: null
      });

      // create the controller
      var c = new qx.data.controller.Form(model, this.__form);

      // set the selection
      selectBox.setSelection([i1]);

      // check the selection
      this.assertEquals(selectBox.getSelection()[0].getModel(), model.getSb());

      // set the model
      model.setSb("2");

      // check the selection
      this.assertEquals(selectBox.getSelection()[0].getModel(), model.getSb());

      // check the textfield
      this.assertEquals(this.__tf1.getValue(), model.getTf1());
      // change the values
      this.__tf1.setValue("11");
      // check the binding
      this.assertEquals(this.__tf1.getValue(), model.getTf1());

      // change the data in the model
      model.setTf1("a");

      // check the binding
      this.assertEquals(this.__tf1.getValue(), model.getTf1());

      // remove the target
      c.setTarget(null);

      // change the values in the model
      model.setTf1("affe");
      model.setSb("1");

      // check the form items
      this.assertEquals("a", this.__tf1.getValue());
      this.assertEquals("2", selectBox.getSelection()[0].getModel());

      // change the values in the items
      this.__tf1.setValue("viele affen");
      selectBox.setSelection([i1]);

      // check the model
      this.assertEquals("affe", model.getTf1());
      this.assertEquals("1", model.getSb());

      c.dispose();
      model.dispose();
      i2.destroy();
      i1.destroy();
      selectBox.destroy();
    },

    testOptions() {
      // create the controller
      var c = new qx.data.controller.Form(this.__model, this.__form);

      // add the options
      var tf2model = {
        converter(data) {
          return "X" + data;
        }
      };

      var model2tf = {
        converter(data) {
          return data && data.substring(1);
        }
      };

      c.addBindingOptions("tf1", model2tf, tf2model);

      // set values in the form
      this.__tf1.setValue("1");
      this.__tf2.setValue("2");

      // check the binding
      this.assertEquals("X" + this.__tf1.getValue(), this.__model.getTf1());
      this.assertEquals(this.__tf2.getValue(), this.__model.getTf2());

      // change the values
      this.__tf1.setValue("11");
      this.__tf2.setValue("21");

      // check the binding
      this.assertEquals("X" + this.__tf1.getValue(), this.__model.getTf1());
      this.assertEquals(this.__tf2.getValue(), this.__model.getTf2());

      // change the data in the model
      this.__model.setTf1("Xa");
      this.__model.setTf2("b");

      // check the binding
      this.assertEquals(this.__tf1.getValue(), this.__model.getTf1().substring(1));

      this.assertEquals(this.__tf2.getValue(), this.__model.getTf2());

      // destroy the objects
      c.dispose();
    },

    testConnectionWithListControllerSelection() {
      // generate fake data
      var data = [
        { name: "a", age: 1 },
        { name: "b", age: 2 },
        { name: "c", age: 3 }
      ];

      var model = qx.data.marshal.Json.createModel(data);

      // list
      var list = new qx.ui.form.List();
      var listController = new qx.data.controller.List(model, list, "name");

      // form
      var form = new qx.ui.form.Form();
      var tf = new qx.ui.form.TextField();
      var sp = new qx.ui.form.Spinner();
      form.add(tf, "Name", null, "name");
      form.add(sp, "Age", null, "age");
      var formController = new qx.data.controller.Form(null, form);

      // connection
      listController.bind("selection[0]", formController, "model");

      // select the first item
      var listItems = list.getSelectables();
      formController.setModel(listItems[0].getModel());
      list.setSelection([listItems[0]]);

      // check if the model is still the same
      this.assertEquals("a", model.getItem(0).getName());
      this.assertEquals("b", model.getItem(1).getName());
      this.assertEquals("c", model.getItem(2).getName());
      this.assertEquals(1, model.getItem(0).getAge());
      this.assertEquals(2, model.getItem(1).getAge());
      this.assertEquals(3, model.getItem(2).getAge());

      // select the second item
      var listItems = list.getSelectables();
      list.setSelection([listItems[1]]);

      // check if the model is still the same
      this.assertEquals("a", model.getItem(0).getName());
      this.assertEquals("b", model.getItem(1).getName());
      this.assertEquals("c", model.getItem(2).getName());
      this.assertEquals(1, model.getItem(0).getAge());
      this.assertEquals(2, model.getItem(1).getAge());
      this.assertEquals(3, model.getItem(2).getAge());

      // select the first item again
      var listItems = list.getSelectables();
      list.setSelection([listItems[0]]);

      // check if the model is still the same
      this.assertEquals("a", model.getItem(0).getName());
      this.assertEquals("b", model.getItem(1).getName());
      this.assertEquals("c", model.getItem(2).getName());
      this.assertEquals(1, model.getItem(0).getAge());
      this.assertEquals(2, model.getItem(1).getAge());
      this.assertEquals(3, model.getItem(2).getAge());

      for (var i = 0; i < model.length; i++) {
        model.getItem(i).dispose();
      }
      model.dispose();
      list.dispose();
      listController.dispose();
      form.dispose();
      formController.dispose();
      tf.dispose();
      sp.dispose();
    },

    testDispose() {
      // just create the controller
      var c = new qx.data.controller.Form(this.__model, this.__form);
      // destroy the objects
      c.dispose();

      // check if the bindings has been removed
      this.__model.setTf1("AFFE");
      this.assertNotEquals("AFFE", this.__tf1.getValue());
    },

    testBindingCreateMissingOne() {
      // add an unknown item
      var tf = new qx.ui.form.TextField();
      this.__form.add(tf, "Unknown");

      // create the controller
      var c = new qx.data.controller.Form(this.__model, this.__form);

      // set values in the form
      this.__tf1.setValue("1");
      this.__tf2.setValue("2");
      this.__cb.setValue(true);

      // check the binding
      this.assertEquals(this.__tf1.getValue(), this.__model.getTf1());
      this.assertEquals(this.__tf2.getValue(), this.__model.getTf2());
      this.assertEquals(this.__cb.getValue(), this.__model.getCb());

      // destroy the objects
      tf.destroy();
      c.dispose();
    },

    testCamelCaseConversion() {
      // Test for issue #10808: Verify camelCase conversion works correctly
      // v8's binding system requires lowercase-first property names
      this.__form.dispose();
      this.__form = new qx.ui.form.Form();

      var usernameField = new qx.ui.form.TextField();
      var emailField = new qx.ui.form.TextField();
      var passwordField = new qx.ui.form.PasswordField();

      // Add fields with capitalized names
      this.__form.add(usernameField, "Username", null, "Username");
      this.__form.add(emailField, "Email", null, "EmailAddress");
      this.__form.add(passwordField, "Password", null, "PassWord");

      // Create controller and model
      var c = new qx.data.controller.Form(null, this.__form);
      var model = c.createModel();

      // WITH conversion: property names should be camelCase (lowercase first letter)
      this.assertFunction(model.getUsername, "getUsername() should exist (camelCase)");
      this.assertFunction(model.getEmailAddress, "getEmailAddress() should exist (camelCase)");
      this.assertFunction(model.getPassWord, "getPassWord() should exist (camelCase)");

      // Test data binding: set values via model (using camelCase)
      model.setUsername("testuser");
      model.setEmailAddress("test@example.com");
      model.setPassWord("secret123");

      // Verify values are bound to form fields
      this.assertEquals("testuser", usernameField.getValue());
      this.assertEquals("test@example.com", emailField.getValue());
      this.assertEquals("secret123", passwordField.getValue());

      // Test reverse binding: set values in form
      usernameField.setValue("newuser");
      emailField.setValue("new@example.com");
      passwordField.setValue("newpass");

      // Verify values are reflected in model (camelCase properties)
      this.assertEquals("newuser", model.getUsername());
      this.assertEquals("new@example.com", model.getEmailAddress());
      this.assertEquals("newpass", model.getPassWord());

      // Cleanup
      usernameField.dispose();
      emailField.dispose();
      passwordField.dispose();
      c.dispose();
      model.dispose();
    },

    testGetItemAfterCamelCaseConversion() {
      // Test for issue #10808 (goldim's concern): getItem() should work with original name
      this.__form.dispose();
      this.__form = new qx.ui.form.Form();

      var field = new qx.ui.form.TextField();

      // Add field with explicit capitalized name
      this.__form.add(field, "My Field", null, "Username");

      // getItem() SHOULD work with the original name provided
      this.assertIdentical(
        field,
        this.__form.getItem("Username"),
        "getItem() should work with original provided name"
      );

      // Create model and verify binding works with camelCase
      var c = new qx.data.controller.Form(null, this.__form);
      var model = c.createModel();

      // Model SHOULD have camelCase property (for v8 compatibility)
      this.assertFunction(model.getUsername, "model should have getUsername()");

      // Set value through model
      model.setUsername("testvalue");
      this.assertEquals(
        "testvalue",
        field.getValue(),
        "Value should be bound from model to field"
      );

      // Set value through field
      field.setValue("fieldvalue");
      this.assertEquals(
        "fieldvalue",
        model.getUsername(),
        "Value should be bound from field to model"
      );

      field.dispose();
      c.dispose();
      model.dispose();
    },

    testLabelGeneratedNameNotConverted() {
      // Test for issue #10808 (goldim's concern): label-based names should NOT be converted
      this.__form.dispose();
      this.__form = new qx.ui.form.Form();

      var field1 = new qx.ui.form.TextField();
      var field2 = new qx.ui.form.TextField();

      // Add fields WITHOUT explicit names - names will be generated from labels
      this.__form.add(field1, "Username");
      this.__form.add(field2, "Email Address");

      // Label-generated names should NOT be converted
      this.assertIdentical(
        field1,
        this.__form.getItem("Username"),
        "getItem() with label-generated name should work"
      );
      this.assertIdentical(
        field2,
        this.__form.getItem("EmailAddress"),
        "getItem() with label-generated name (spaces removed) should work"
      );

      // Create model
      var c = new qx.data.controller.Form(null, this.__form);
      var model = c.createModel();

      // Model should have properties matching the label-generated names (NOT converted)
      this.assertFunction(model.getUsername, "model should have getUsername()");
      this.assertFunction(
        model.getEmailAddress,
        "model should have getEmailAddress()"
      );

      // Verify binding works with label-generated names
      model.setUsername("user1");
      model.setEmailAddress("user@test.com");

      this.assertEquals("user1", field1.getValue());
      this.assertEquals("user@test.com", field2.getValue());

      field1.dispose();
      field2.dispose();
      c.dispose();
      model.dispose();
    },

    testMixedExplicitAndLabelGeneratedNames() {
      // Test combining explicit names and label-generated names
      this.__form.dispose();
      this.__form = new qx.ui.form.Form();

      var explicitField = new qx.ui.form.TextField();
      var labelField = new qx.ui.form.TextField();

      // Explicit name provided (will be converted to camelCase for data binding)
      this.__form.add(explicitField, "Some Label", null, "FirstName");
      // Label-generated name (stays as-is)
      this.__form.add(labelField, "LastName");

      // Both should work with getItem() using their stored names
      this.assertIdentical(
        explicitField,
        this.__form.getItem("FirstName"),
        "getItem() should work with explicit name"
      );
      this.assertIdentical(
        labelField,
        this.__form.getItem("LastName"),
        "getItem() should work with label-generated name"
      );

      // Create model
      var c = new qx.data.controller.Form(null, this.__form);
      var model = c.createModel();

      // Model should have camelCase properties for data binding
      this.assertFunction(
        model.getFirstName,
        "Model should have getFirstName()"
      );
      this.assertFunction(
        model.getLastName,
        "Model should have getLastName()"
      );

      // Test binding for both
      model.setFirstName("John");
      model.setLastName("Doe");

      this.assertEquals("John", explicitField.getValue());
      this.assertEquals("Doe", labelField.getValue());

      // Test reverse binding
      explicitField.setValue("Jane");
      labelField.setValue("Smith");

      this.assertEquals("Jane", model.getFirstName());
      this.assertEquals("Smith", model.getLastName());

      explicitField.dispose();
      labelField.dispose();
      c.dispose();
      model.dispose();
    },

    testCollisionDetection() {
      // Test for issue #10808: Collision detection with camelCase conversion
      // "Username" and "username" both convert to "username" - should throw error
      this.__form.dispose();
      this.__form = new qx.ui.form.Form();

      var field1 = new qx.ui.form.TextField();
      var field2 = new qx.ui.form.TextField();

      // Add two fields that differ only in first letter capitalization
      this.__form.add(field1, "User 1", null, "Username");
      this.__form.add(field2, "User 2", null, "username");

      // Create controller
      var c = new qx.data.controller.Form(null, this.__form);

      // WITH conversion: both "Username" and "username" map to "username"
      // This should throw a collision detection error
      this.assertException(
        function () {
          c.createModel();
        },
        Error,
        /Form field naming collision detected.*issue #10808/,
        "Should throw collision error when Username and username both exist"
      );

      // Cleanup
      field1.dispose();
      field2.dispose();
      c.dispose();
    }
  }
});
