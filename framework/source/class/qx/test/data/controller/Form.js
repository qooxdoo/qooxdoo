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
      this.__tf1.destroy();
      this.__tf2.destroy();
      this.__cb.destroy();
    },


    testCreateEmpty : function() {
      // just create the controller
      var c = new qx.data.controller.Form();
      // check the defaults for the properties
      this.assertNull(c.getModel());
      this.assertNull(c.getTarget());
      // distroy the controller
      c.dispose();
    },

    testCreateWithModel : function() {
      // just create the controller
      var c = new qx.data.controller.Form(this.__model);
      // check for the properties
      this.assertEquals(this.__model, c.getModel());
      this.assertNull(c.getTarget());
      // distroy the objects
      c.dispose();
    },

    testCreateWithForm : function() {
      // just create the controller
      var c = new qx.data.controller.Form(null, this.__form);
      // check for the properties
      this.assertEquals(this.__form, c.getTarget());
      this.assertNull(c.getModel());
      // distroy the objects
      c.dispose();
    },

    testCreateWithBoth : function() {
      // just create the controller
      var c = new qx.data.controller.Form(this.__model, this.__form);
      // check for the properties
      this.assertEquals(this.__form, c.getTarget());
      this.assertEquals(this.__model, c.getModel());
      // distroy the objects
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

      // distroy the objects
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
      var model = c.createModel();
      
      // check if the model and the form still have the initial value
      this.assertEquals("A", this.__tf1.getValue());
      this.assertEquals("B", this.__tf2.getValue());
      this.assertTrue(this.__cb.getValue());
      this.assertEquals("A", model.getTf1());
      this.assertEquals("B", model.getTf2());
      this.assertTrue(model.getCb());

      // set values in the form
      this.__tf1.setValue("1");
      this.__tf2.setValue("2");
      this.__cb.setValue(true);

      // check the binding
      this.assertEquals(this.__tf1.getValue(), model.getTf1());
      this.assertEquals(this.__tf2.getValue(), model.getTf2());
      this.assertEquals(this.__cb.getValue(), model.getCb());

      // change the values
      this.__tf1.setValue("11");
      this.__tf2.setValue("21");
      this.__cb.setValue(false);

      // check the binding
      this.assertEquals(this.__tf1.getValue(), model.getTf1());
      this.assertEquals(this.__tf2.getValue(), model.getTf2());
      this.assertEquals(this.__cb.getValue(), model.getCb());

      // change the data in the model
      this.__model.setTf1("a");
      this.__model.setTf2("b");
      this.__model.setCb(true);

      // check the binding
      this.assertEquals(this.__tf1.getValue(), model.getTf1());
      this.assertEquals(this.__tf2.getValue(), model.getTf2());
      this.assertEquals(this.__cb.getValue(), model.getCb());

      // distroy the objects
      c.dispose();
      model.dispose();
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

      // create the controller
      var c = new qx.data.controller.Form(null, this.__form);
      var model = c.createModel();
      
      // check the init value of the model selection
      this.assertEquals("1", model.getSb());

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
        return data && data.substring(1);
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

      // distroy the objects
      c.dispose();      
    }

  }
});
