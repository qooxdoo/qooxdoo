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
     * Adrian Olaru (adrianolaru)

************************************************************************ */
qx.Class.define("qx.test.ui.form.Slider",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    __slider: null,

    tearDown : function()
    {
      this.__slider.destroy();
    },

    testDefaultSize: function() {
      var size = 100;
      this.__slider = new qx.ui.form.Slider();
      this.assertIdentical(size, this.__slider.getWidth());

      this.__slider = new qx.ui.form.Slider("vertical");
      this.assertIdentical(size, this.__slider.getHeight());
    }
  }
});
