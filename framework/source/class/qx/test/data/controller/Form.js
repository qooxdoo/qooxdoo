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
qx.Class.define("qx.test.data.controller.Form",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    __form : null,
    __tf1 : null,
    __tf2 : null,
    __cb : null,
    __model : null,

    setUp : function() {
      // create the objects
      this.__form = new qx.ui.form.Form();
      this.__tf1 = new qx.ui.form.TextField();
      this.__tf2 = new qx.ui.form.TextField("init");
      this.__cb = new qx.ui.form.CheckBox();
      this.__model = qx.data.marshal.Json.createModel({tf1: null, tf2: null, cb: null});

      // build the form
      this.__form.add(this.__tf1, "label1", null, "tf1");
      this.__form.add(this.__tf2, "label2", null, "tf2");
      this.__form.add(this.__cb, "label3", null, "cb");
    },

    tearDown : function() {
      this.__form.dispose();
      this.__model.dispose();
      this.__tf1.dispose();
      this.__tf2.destroy();
      this.__cb.destroy();
    },


    testSetModelNull : function() {
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


    testInitialResetter : function() {
      // create the controller which set the initial values and
      // saves them for resetting
      var c = new qx.data.controller.Form(this.__model, this.__form);

      this.__tf2.setValue("affe");
      this.__form.reset();
      this.assertEquals(null, this.__tf2.getValue());

      c.dispose();
    },


    testUnidirectionalDeep: function() {
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


    testUnidirectionalSelectionOptions: function(){
      // just create the controller
      var c = new qx.data.controller.Form(this.__model, this.__form, true);

      var sb = new qx.ui.form.SelectBox();
      var i1 = new qx.ui.form.ListItem("a").set({model: "a"});
      var i2 = new qx.ui.form.ListItem("b").set({model: "b"});
      sb.add(i1);
      sb.add(i2);

      this.__form.add(sb, "Sb");
      c.setModel(null);
      c.addBindingOptions("Sb",
        {converter : function(data) { return data && data.substr(0, 1);}},
        {converter : function(data) { return data + "-item";}}
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


    testUnidirectionalOptions: function(){
      // just create the controller
      var c = new qx.data.controller.Form(this.__model, this.__form, true);

      c.addBindingOptions("tf1",
        {converter : function(data) { return data && data.substr(0, data.length - 1);}},
        {converter : function(data) { return data + "a";}}
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


    testUnidirectionalSelection: function(){
      // just create the controller
      var c = new qx.data.controller.Form(this.__model, this.__form, true);

      var sb = new qx.ui.form.SelectBox();
      var i1 = new qx.ui.form.ListItem("a").set({model: "a"});
      var i2 = new qx.ui.form.ListItem("b").set({model: "b"});
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


    testUnidirectional: function(){
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


    testCreateEmpty : function() {
      // just create the controller
      var c = new qx.data.controller.Form();
      // check the defaults for the properties
      this.assertNull(c.getModel());
      this.assertNull(c.getTarget());
      // destroy the controller
      c.dispose();
    },

    testCreateWithModel : function() {
      // just create the controller
      var c = new qx.data.controller.Form(this.__model);
      // check for the properties
      this.assertEquals(this.__model, c.getModel());
      this.assertNull(c.getTarget());
      // destroy the objects
      c.dispose();
    },

    testCreateWithForm : function() {
      // just create the controller
      var c = new qx.data.controller.Form(null, this.__form);
      // check for the properties
      this.assertEquals(this.__form, c.getTarget());
      this.assertNull(c.getModel());
      // destroy the objects
      c.dispose();
    },

    testCreateWithBoth : function() {
      // just create the controller
      var c = new qx.data.controller.Form(this.__model, this.__form);
      // check for the properties
      this.assertEquals(this.__form, c.getTarget());
      this.assertEquals(this.__model, c.getModel());
      // destroy the objects
      c.dispose();
    },

    testBindingCreate : function() {
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


    testBindingChangeModel : function() {
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

      var model2 = qx.data.marshal.Json.createModel({tf1: null, tf2: null, cb: null});

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


    testBindingChangeForm : function() {
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


    testBindingDeep : function() {
      // a - b - cb
      // |   \
      // tf1  c
      //       \
      //        tf2
      var data = {a: {tf1: null}, b:{c: {tf2: null}}, cb: null};
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


    testBindingModelSelection : function() {
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

      var model = qx.data.marshal.Json.createModel({tf1: null, tf2: null, cb: null, sb: null});

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


    testModelCreation : function() {
      // set some initial values in the form
      this.__tf1.setValue("A");
      this.__tf2.setValue("B");
      this.__cb.setValue(true);

      // create the controller
      var c = new qx.data.controller.Form(null, this.__form);
      c.addBindingOptions("tf1",
        {converter : function(data) {
          return data && data.substr(0, 1);
        }},
        {converter : function(data) {
          return data + "-";
        }}
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


    testModelCreationDeep : function() {
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


    testModelCreationWithList : function() {
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


    testModelCreationSpecialCaracter : function() {
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


    testModelCreationWithListController : function()
    {
      // create a select box
      var selectBox = new qx.ui.form.SelectBox();
      var listModel = qx.data.marshal.Json.createModel([{name: "a"}, {name: "b"}]);
      var listController = new qx.data.controller.List(listModel, selectBox, "name");

      // add the selectBox to the form
      this.__form.add(selectBox, "sb");

      // select something which is not the default selection
      listController.getSelection().setItem(0, listModel.getItem(1));

      // create the controller
      var c = new qx.data.controller.Form(null, this.__form);
      var model = c.createModel();

      // check the init value of the model selection
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


    testModelCreationWithModelSelection : function() {
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


    testRemoveTarget : function() {
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

      var model = qx.data.marshal.Json.createModel({tf1: null, tf2: null, cb: null, sb: null});

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


    testOptions : function()
    {
      // create the controller
      var c = new qx.data.controller.Form(this.__model, this.__form);

      // add the options
      var tf2model = {converter : function(data) {
        return "X" + data;
      }};
      var model2tf = {converter : function(data) {
        return data && data.substring(1);
      }};
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


    testConnectionWithListControllerSelection : function() {
      // generate fake data
      var data = [{name: "a", age: 1}, {name: "b", age: 2}, {name: "c", age: 3}];
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

      for (var i=0; i<model.length; i++) {
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


    testDispose : function() {
      // just create the controller
      var c = new qx.data.controller.Form(this.__model, this.__form);
      // destroy the objects
      c.dispose();

      // check if the bindings has been removed
      this.__model.setTf1("AFFE");
      this.assertNotEquals("AFFE", this.__tf1.getValue());
    },


    testBindingCreateMissingOne : function() {
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
    }
  }
});
