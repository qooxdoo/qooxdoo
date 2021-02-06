/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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
      var slider = new qx.ui.mobile.form.Slider().set({"step": 4.5});
      this.getRoot().add(slider);

      this.assertEquals(0,slider.getValue());
      this.assertEquals(0,qx.bom.element.Dataset.get(slider._getKnobElement(),"value"));
      this.assertEquals(0,qx.bom.element.Dataset.get(slider._getKnobElement(),"percent"));

      this.assertEventFired(slider, "changeValue", function() {
        slider.nextValue();
      }, function(evt) {
        this.assertEquals(4.5, evt.getData());
      }.bind(this));

      this.assertEventFired(slider, "changeValue", function() {
        slider.setValue(11);
      }, function(evt) {
        this.assertEquals(11, evt.getData());
      }.bind(this));

      this.assertEventFired(slider, "changeValue", function() {
        slider.previousValue();
      }, function(evt) {
        this.assertEquals(6.5, evt.getData());
      }.bind(this));

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
