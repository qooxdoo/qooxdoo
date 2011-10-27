/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

qx.Class.define("qx.test.mobile.form.Slider",
{
  extend : qx.test.mobile.MobileTestCase,

  members :
  {
    testValue : function()
    {
      var slider = new qx.ui.mobile.form.Slider().set({"step": 4});
      this.getRoot().add(slider);

      this.assertEquals(0,slider.getValue());
      slider.nextValue();
      this.assertEquals(4,slider.getValue());
      slider.setValue(11);
      this.assertEquals(11,slider.getValue());
      slider.previousValue();
      this.assertEquals(7,slider.getValue());

      slider.destroy();
    },
    testEnabled : function()
    {
      var slider = new qx.ui.mobile.form.Slider();
      this.getRoot().add(slider);
      slider.setEnabled(false);
      this.assertEquals(false,slider.getEnabled());
      this.assertEquals(true,qx.bom.element.Class.has(slider.getContainerElement(),'disabled'));

      slider.destroy();
    }

  }
});
