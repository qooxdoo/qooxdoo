/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
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
    }
  }
});
