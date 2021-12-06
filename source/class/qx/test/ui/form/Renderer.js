/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.test.ui.form.Renderer",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    __form : null,
    __b : null,


    setUp : function() {
      this.__form = new qx.ui.form.Form();
      this.__b = new qx.ui.form.Button("a");
      this.__form.addButton(this.__b);
    },

    tearDown : function() {
      this.__form.dispose();
      this.__b.dispose();
    },


    testDisposeSingle : function() {
      var renderer = new qx.ui.form.renderer.Single(this.__form);
      renderer.dispose();

      // check if the button container has been disposed
      this.assertNull(renderer._buttonRow);
      this.assertNotNull(this.__b);
      this.assertFalse(this.__b.isDisposed());
    },


    testDisposeDouble : function() {
      var renderer = new qx.ui.form.renderer.Double(this.__form);
      renderer.dispose();

      // check if the button container has been disposed
      this.assertNull(renderer._buttonRow);
      this.assertNotNull(this.__b);
      this.assertFalse(this.__b.isDisposed());
    },


    __testExclude : function(clazz)
    {
      var text = new qx.ui.form.TextField();
      this.__form.add(text, "test");
      var renderer = new clazz(this.__form);
      var label = renderer._getChildren()[0];

      text.setVisibility("excluded");
      this.assertEquals(text.getVisibility(), label.getVisibility());

      renderer.dispose();
      text.dispose();
    },


    testExcludeSingle : function() {
      this.__testExclude(qx.ui.form.renderer.Single);
    },


    testExcludeDouble : function() {
      this.__testExclude(qx.ui.form.renderer.Double);
    },


    __testBindings : function(clazz)
    {
      // after adding the text field get length of bindings for text field, label, form and renderer

      var text = new qx.ui.form.TextField();
      this.__form.add(text, "test");
      var renderer = new clazz(this.__form);
      var label = renderer._getChildren()[0];

      // text field bindings
      this.assertEquals(2, text.getBindings().length, "Text field should have one binding!");

      // label bindings
      this.assertEquals(2, label.getBindings().length, "Label should have one binding!");

      // text field and label bindings must be equal
      this.assertTrue(qx.lang.Array.equals(text.getBindings(), label.getBindings()), "Text field and label bindings must be equal");

      // dispose renderer must dispose text field, label and its self
      renderer.dispose();
      this.assertTrue(text.isDisposed(), "Disposing renderer should have disposed text field as well.");
      this.assertTrue(label.isDisposed(), "Disposing renderer should have disposed label as well.");
      this.assertTrue(renderer.isDisposed(), "Renderer must be disposed.");

      // text field bindings
      this.assertEquals(0, text.getBindings().length, "Still bindings there!");

      // label bindings
      this.assertEquals(0, label.getBindings().length, "Still bindings there!");
    },


    testBindingsSingle : function() {
      this.__testBindings(qx.ui.form.renderer.Single);
    },


    testBindingsDouble : function() {
      this.__testBindings(qx.ui.form.renderer.Double);
    }
  }
});
