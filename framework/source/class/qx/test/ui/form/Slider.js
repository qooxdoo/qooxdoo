/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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
    },


    testInitOrientation : function() {
      var newSlider1 = new qx.ui.form.Slider();
      this.assertIdentical(newSlider1.getOrientation(), "horizontal");

      var newSlider2 = new qx.ui.form.Slider("horizontal");
      this.assertIdentical(newSlider2.getOrientation(), "horizontal");

      var newSlider3 = new qx.ui.form.Slider("vertical");
      this.assertIdentical(newSlider3.getOrientation(), "vertical");
    },


    testSlideMethods : function() {
      var min = this.__slider.getMinimum();
      var max = this.__slider.getMaximum();

      this.__slider.slideToBegin();
      this.assertIdentical(this.__slider.getValue(), min);

      this.__slider.slideToEnd();
      this.assertIdentical(this.__slider.getValue(), max);

      var singleStep = this.__slider.getSingleStep();

      var before = this.__slider.getValue();
      this.__slider.slideForward();
      this.assertIdentical(this.__slider.getValue(), Math.min(before + singleStep, max));

      before = this.__slider.getValue();
      this.__slider.slideBack();
      this.assertIdentical(this.__slider.getValue(), Math.max(before - singleStep, min));

      var pageStep = this.__slider.getPageStep();

      before = this.__slider.getValue();
      this.__slider.slidePageForward();
      this.assertIdentical(this.__slider.getValue(), Math.min(before + pageStep, max));

      before = this.__slider.getValue();
      this.__slider.slidePageBack();
      this.assertIdentical(this.__slider.getValue(), Math.max(before - pageStep, min));
    }
  }
});
