/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.test.ui.form.Slider",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    setUp : function() {
      this.__slider = new qx.ui.form.Slider();
      this.__slider.setWidth(100);
      this.getRoot().add(this.__slider);
      this.flush();
    },


    tearDown : function() {
      this.__slider.destroy();
    },


    testKnobPositionAfterBlur : function() {
      this.__slider.setValue(0);
      this.flush();
      var pos0 = this.__slider.getChildControl("knob").getContentElement().getStyle("left");

      this.__slider.setValue(30);
      this.flush();
      var pos30 = this.__slider.getChildControl("knob").getContentElement().getStyle("left");

      this.__slider.focus();
      this.flush();
      var posFocus = this.__slider.getChildControl("knob").getContentElement().getStyle("left");

      this.assertNotEquals(pos0, posFocus);
      this.assertEquals(pos30, posFocus);
    }

  }
});
