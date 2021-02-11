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
 * @ignore(qx.test.DummyFormRenderer)
 */

qx.Class.define("qx.test.ui.form.FormManager",
{
  extend : qx.test.ui.LayoutTestCase,
  include : qx.dev.unit.MMock,


  construct : function()
  {
    this.base(arguments);

    // create the test renderer
    qx.Class.define("qx.test.DummyFormRenderer", {
      extend : qx.ui.form.renderer.AbstractRenderer,
      implement : qx.ui.form.renderer.IFormRenderer,

      construct : function(form) {
        this.groups = [];
        this.buttons = [];

        this.base(arguments, form);
      },

      properties : {
        buttons : {},
        groups : {}
      },

      members : {
        addItems : function(items, names, title, itemsOptions, headerOptions) {
          this.groups.push({
            items : items,
            names : names,
            title : title,
            headerOptions : headerOptions,
            options : itemsOptions
          });
        },

        addButton : function(button, options) {
          this.buttons.push({button: button, options: options});
        }
      }
    });
  },

  members :
  {
    __form : null,
    __tf1 : null,
    __tf2 : null,


    setUp : function() {
      this.__form = new qx.ui.form.Form();
      this.__tf1 = new qx.ui.form.TextField();
      this.__tf2 = new qx.ui.form.TextField();
    },


    tearDown : function() {
      this.__tf2.dispose();
      this.__tf1.dispose();
      this.__form.dispose();
    },


    testValidationContext : function()
    {
      var self = this;
      // add the widgets
      this.__form.add(this.__tf2, "TF2", function() {
        self.assertEquals(1, this.a);
      }, null, {a: 1});

      this.__form.validate();
    },


    testAddTwo : function() {
      // add the widgets
      this.__form.add(this.__tf1, "TF1");
      this.__form.add(this.__tf2, "TF2");

      // get the view
      var view = new qx.test.DummyFormRenderer(this.__form);

      // check the items
      this.assertEquals(view.groups[0].items[0], this.__tf1);
      this.assertEquals(view.groups[0].items[1], this.__tf2);

      // check the names
      this.assertEquals(view.groups[0].names[0], "TF1");
      this.assertEquals(view.groups[0].names[1], "TF2");
      view.dispose();
    },


    testRemove : function() {
      // add the widgets
      this.__form.add(this.__tf1, "TF1");
      this.__form.add(this.__tf2, "TF2");

      // get the view
      var view = new qx.test.DummyFormRenderer(this.__form);

      // check the items
      this.assertEquals(view.groups[0].items[0], this.__tf1);
      this.assertEquals(view.groups[0].items[1], this.__tf2);
      view.dispose();

      // remove twice to see if the remove is reported correctly
      this.assertTrue(this.__form.remove(this.__tf1));
      this.assertFalse(this.__form.remove(this.__tf1));

      // get the view
      var view = new qx.test.DummyFormRenderer(this.__form);

      // check the items
      this.assertEquals(view.groups[0].items[0], this.__tf2);
      view.dispose();

    },


    testAddTwoWithValidator : function() {
      // add the widgets
      this.__tf1.setRequired(true);
      this.__form.add(this.__tf1, "TF1");
      this.__form.add(this.__tf2, "TF2", qx.util.Validate.email());

      // validation should fail
      this.assertFalse(this.__form.validate());
      this.assertFalse(this.__tf1.getValid());
      this.assertFalse(this.__tf2.getValid());

      // correct the values
      this.__tf1.setValue("a");
      this.__tf2.setValue("ab@cd.ef");

      // validation should be ok
      this.assertTrue(this.__form.validate());
      this.assertTrue(this.__tf1.getValid());
      this.assertTrue(this.__tf2.getValid());

      // check the validation manager itself
      this.assertTrue(this.__form.getValidationManager().validate());
    },


    testAddTwoWithHeader : function() {
      this.__form.addGroupHeader("affe");

      // add the widgets
      this.__form.add(this.__tf1, "TF1");
      this.__form.add(this.__tf2, "TF2");

      // get the view
      var view = new qx.test.DummyFormRenderer(this.__form);

      // check the items
      this.assertEquals(view.groups[0].items[0], this.__tf1);
      this.assertEquals(view.groups[0].items[1], this.__tf2);

      // check the names
      this.assertEquals(view.groups[0].names[0], "TF1");
      this.assertEquals(view.groups[0].names[1], "TF2");

      // check the title
      this.assertEquals("affe", view.groups[0].title);
      view.dispose();
    },


    testRemoveHeader : function() {
      this.__form.addGroupHeader("affe0");
      this.__form.add(this.__tf1, "TF1");

      this.__form.addGroupHeader("affe1");
      this.__form.add(this.__tf2, "TF2");

      // get the view
      var view = new qx.test.DummyFormRenderer(this.__form);

      // check the items
      this.assertEquals(view.groups[0].items[0], this.__tf1);
      this.assertEquals(view.groups[1].items[0], this.__tf2);

      // check the title
      this.assertEquals("affe0", view.groups[0].title);
      this.assertEquals("affe1", view.groups[1].title);
      view.dispose();

      // remove twice to see if the remove is reported correctly
      this.assertTrue(this.__form.removeGroupHeader("affe1"));
      this.assertFalse(this.__form.removeGroupHeader("affe1"));

      // get the view
      var view = new qx.test.DummyFormRenderer(this.__form);

      // check the items
      this.assertEquals(view.groups[0].items[0], this.__tf1);
      this.assertEquals(view.groups[0].items[1], this.__tf2);
      this.assertEquals("affe0", view.groups[0].title);
      view.dispose();
    },



    testAddTwoWithTwoGroups : function() {
      this.__form.addGroupHeader("affe");
      this.__form.add(this.__tf1, "TF1");
      this.__form.addGroupHeader("affee");
      this.__form.add(this.__tf2, "TF2");

      // get the view
      var view = new qx.test.DummyFormRenderer(this.__form);

      // check the items
      this.assertEquals(view.groups[0].items[0], this.__tf1);
      this.assertEquals(view.groups[1].items[0], this.__tf2);

      // check the names
      this.assertEquals(view.groups[0].names[0], "TF1");
      this.assertEquals(view.groups[1].names[0], "TF2");

      // check the title
      this.assertEquals("affe", view.groups[0].title);
      this.assertEquals("affee", view.groups[1].title);
      view.dispose();
    },


    testAddTwoButtons : function() {
      var b1 = new qx.ui.form.Button();
      var b2 = new qx.ui.form.RepeatButton();

      this.__form.addButton(b1);
      this.__form.addButton(b2);

      // get the view
      var view = new qx.test.DummyFormRenderer(this.__form);

      // check the buttons
      this.assertEquals(b1, view.buttons[0].button);
      this.assertEquals(b2, view.buttons[1].button);

      b2.dispose();
      b1.dispose();
      view.dispose();
    },


    testRemoveButton : function() {
      var b1 = new qx.ui.form.Button();
      var b2 = new qx.ui.form.RepeatButton();

      this.__form.addButton(b1);
      this.__form.addButton(b2);

      // get the view
      var view = new qx.test.DummyFormRenderer(this.__form);

      // check the buttons
      this.assertEquals(b1, view.buttons[0].button);
      this.assertEquals(b2, view.buttons[1].button);
      view.dispose();

      // remove twice to see if the remove is reported correctly
      this.assertTrue(this.__form.removeButton(b1));
      this.assertFalse(this.__form.removeButton(b1));

      // get the view
      var view = new qx.test.DummyFormRenderer(this.__form);

      // check the button
      this.assertEquals(b2, view.buttons[0].button);

      view.dispose();
      b2.dispose();
      b1.dispose();
    },


    testAddTwoWithButtons : function() {
      var b1 = new qx.ui.form.Button();
      var b2 = new qx.ui.form.RepeatButton();

      // add the widgets
      this.__form.add(this.__tf1, "TF1");
      this.__form.addButton(b1);
      this.__form.add(this.__tf2, "TF2");
      this.__form.addButton(b2);

      // get the view
      var view = new qx.test.DummyFormRenderer(this.__form);

      // check the items
      this.assertEquals(view.groups[0].items[0], this.__tf1);
      this.assertEquals(view.groups[0].items[1], this.__tf2);

      // check the names
      this.assertEquals(view.groups[0].names[0], "TF1");
      this.assertEquals(view.groups[0].names[1], "TF2");

      // check the buttons
      this.assertEquals(b1, view.buttons[0].button);
      this.assertEquals(b2, view.buttons[1].button);

      b2.dispose();
      b1.dispose();
      view.dispose();
    },


    testAddTwoWithOptions: function(){
      // add the widgets
      this.__form.add(this.__tf1, "TF1", null, "tf1", null, {a:1});
      this.__form.add(this.__tf2, "TF2", null, "tf2", null, {a:2});

      // get the view
      var view = new qx.test.DummyFormRenderer(this.__form);

      // check the items
      this.assertEquals(1, view.groups[0].options[0].a);
      this.assertEquals(2, view.groups[0].options[1].a);
      view.dispose();
    },


    testAddTwoWithButtonsOptions : function() {
      var b1 = new qx.ui.form.Button();
      var b2 = new qx.ui.form.RepeatButton();

      // add the widgets
      this.__form.add(this.__tf1, "TF1");
      this.__form.addButton(b1, {a: 1});
      this.__form.add(this.__tf2, "TF2");
      this.__form.addButton(b2, {a: 2});

      // get the view
      var view = new qx.test.DummyFormRenderer(this.__form);

      // check the buttons options
      this.assertEquals(1, view.buttons[0].options.a);
      this.assertEquals(2, view.buttons[1].options.a);

      b2.dispose();
      b1.dispose();
      view.dispose();
    },


    testAddTwoWithHeaderOptions: function(){
      this.__form.addGroupHeader("affe", {a:1});
      this.__form.add(this.__tf1, "TF1");
      this.__form.addGroupHeader("affee", {a:2});
      this.__form.add(this.__tf2, "TF2");

      // get the view
      var view = new qx.test.DummyFormRenderer(this.__form);

      // check the title
      this.assertEquals(1, view.groups[0].headerOptions.a);
      this.assertEquals(2, view.groups[1].headerOptions.a);
      view.dispose();
    },


    testResetter : function() {
      // set the init values of the textfields
      this.__tf1.setValue("aaaa");
      this.__tf2.setValue("bbbb");

      // add the widgets
      this.__form.add(this.__tf1, "TF1");
      this.__form.add(this.__tf2, "TF2");

      // set some other values
      this.__tf1.setValue("111");
      this.__tf2.setValue("222");

      this.__form.reset();

      // check
      this.assertEquals("aaaa", this.__tf1.getValue());
      this.assertEquals("bbbb", this.__tf2.getValue());
    },


    testAll : function() {
      var widgets = [];
      widgets.push(new qx.ui.control.DateChooser());
      widgets.push(new qx.ui.form.CheckBox());
      widgets.push(new qx.ui.form.ComboBox());
      widgets.push(new qx.ui.form.DateField());
      widgets.push(new qx.ui.form.List());
      widgets.push(new qx.ui.form.PasswordField());
      widgets.push(new qx.ui.form.RadioButton());
      widgets.push(new qx.ui.form.SelectBox());
      widgets.push(new qx.ui.form.Slider());
      widgets.push(new qx.ui.form.Spinner());
      widgets.push(new qx.ui.form.TextArea());
      widgets.push(new qx.ui.form.TextField());
      widgets.push(new qx.ui.groupbox.CheckGroupBox());
      widgets.push(new qx.ui.form.RadioButtonGroup());
      widgets.push(new qx.ui.groupbox.RadioGroupBox());

      // add all
      for (var i = 0; i < widgets.length; i++) {
        this.__form.add(widgets[i], "name" + i);
      }

      // reset
      this.__form.reset();

      // validate
      this.assertTrue(this.__form.validate());

      // get rid of the widgets
      for (var i = 0; i < widgets.length; i++) {
        widgets[i].dispose();
      }
    },


    testGetItems : function() {
      // add the widgets
      this.__form.add(this.__tf1, "TF1", null, "a");
      this.__form.add(this.__tf2, "TF2", null, "b");

      var items = this.__form.getItems();

      this.assertEquals(items.a, this.__tf1);
      this.assertEquals(items.b, this.__tf2);
    },


    testGetItemsFallback : function() {
      // add the widgets
      this.__form.add(this.__tf1, "TF1");
      this.__form.add(this.__tf2, "T F 2");

      var items = this.__form.getItems();

      this.assertEquals(items.TF1, this.__tf1);
      this.assertEquals(items.TF2, this.__tf2);
    },


    testGetItemsMixedWithGroups : function() {
      // add the widgets
      this.__form.add(this.__tf1, "TF1");
      this.__form.add(this.__tf2, "TF2", null, "b");
      this.__form.addGroupHeader("x");
      var tf3 = new qx.ui.form.TextField();
      this.__form.add(tf3, "TF3");

      var items = this.__form.getItems();

      this.assertEquals(items.TF1, this.__tf1);
      this.assertEquals(items.b, this.__tf2);
      this.assertEquals(items.TF3, tf3);

      tf3.destroy();
    },


    testRedefineResetter : function()
    {
      // just call the method and check if its not throwing an error
      // all other stuff is tested in the resetter unit tests
      this.__form.redefineResetter();
    },


    testEvent : function() {
      var handler = this.spy();
      this.__form.addListener("change", handler);
      this.__form.add(this.__tf1, "TF1");
      this.assertCalledOnce(handler);

      this.__form.addGroupHeader("GROUP");
      this.assertCalledTwice(handler);

      this.__form.add(this.__tf2, "TF2");
      this.assertEquals(3, handler.callCount);

      this.__form.remove(this.__tf1);
      this.assertEquals(4, handler.callCount);

      this.__form.removeGroupHeader("GROUP");
      this.assertEquals(5, handler.callCount);

      var b = new qx.ui.form.Button();
      this.__form.addButton(b);
      this.assertEquals(6, handler.callCount);

      this.__form.removeButton(b);
      this.assertEquals(7, handler.callCount);

      b.dispose();
    },


    testSingleRenderer : function()
    {
      var b1 = new qx.ui.form.Button();

      // add the widgets
      this.__form.addGroupHeader("header");
      this.__form.add(this.__tf1, "TF1");
      this.__form.addButton(b1);

      // just check if the renderer is created without an error
      (new qx.ui.form.renderer.Single(this.__form)).dispose();

      b1.dispose();
    },

    testSinglePlaceholderRenderer : function()
    {
      var b1 = new qx.ui.form.Button();

      // add the widgets
      this.__form.addGroupHeader("header");
      this.__form.add(this.__tf1, "TF1");
      this.__form.addButton(b1);

      // just check if the renderer is created without an error
      (new qx.ui.form.renderer.SinglePlaceholder(this.__form)).dispose();

      b1.dispose();
    },

    testDoubleRenderer : function()
    {
      var b1 = new qx.ui.form.Button();

      // add the widgets
      this.__form.addGroupHeader("header");
      this.__form.add(this.__tf1, "TF1");
      this.__form.addButton(b1);

      // just check if the renderer is created without an error
      (new qx.ui.form.renderer.Double(this.__form)).dispose();

      b1.dispose();
    },

    testGetItem : function()
    {
      var f1 = new qx.ui.form.TextField();
      var f2 = new qx.ui.form.TextField();
      var f3 = new qx.ui.form.TextField();
      this.__form.add(f1, "a");
      this.__form.add(f2, "c");
      this.__form.add(f3, "label", null, "x");
      this.assertIdentical(f1, this.__form.getItem("a"));
      this.assertNull(this.__form.getItem("b"));
      this.assertIdentical(f2, this.__form.getItem("c"));
      this.assertNull(this.__form.getItem("label"));
      this.assertIdentical(f3, this.__form.getItem("x"));
      [f1, f2, f3].forEach(function(o) {o.dispose();});
    }

  }
});
