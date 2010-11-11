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
qx.Class.define("qx.test.ui.control.Progressbar",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testConstructor: function() {

      //defaults
      var pb = new qx.ui.control.Progressbar();
      this.assertIdentical(pb.getValue(), 0);
      this.assertIdentical(pb.getMax(), 100);

      //value
      var pb = new qx.ui.control.Progressbar(10);
      this.assertIdentical(pb.getValue(), 10);
      this.assertIdentical(pb.getMax(), 100);

      //value, max
      pb = new qx.ui.control.Progressbar(10, 120);
      this.assertIdentical(pb.getValue(), 10);
      this.assertIdentical(pb.getMax(), 120);
    },

    testValue: function() {
      var pb = new qx.ui.control.Progressbar(), val = 20;

      pb.setValue(val);
      this.assertIdentical(pb.getValue(), val);
    },

    testMax: function() {
      var pb = new qx.ui.control.Progressbar(), max = 2000;

      pb.setMax(max);
      this.assertIdentical(pb.getMax(), max);
    },

    testChangeValueEvent : function() {
      var pb = new qx.ui.control.Progressbar(),
          me = this, val = 10;
    
      this.assertEventFired(pb, "changeValue", function() {
        pb.setValue(val);
      }, function(e){
        me.assertIdentical(e.getOldData(), 0);
        me.assertIdentical(e.getData(), val);
      }, "event not fired.");
    },

    testCompleteEvent : function() {
      var pb = new qx.ui.control.Progressbar(), 
          max = pb.getMax();
      this.assertEventFired(pb, "complete", function() {
        pb.setValue(max);
      }, function(e){}, "event not fired.");

      max = 1270;
      pb = new qx.ui.control.Progressbar(0, max);
      this.assertEventFired(pb, "complete", function() {
        pb.setValue(max);
      }, function(e){}, "event not fired.");
    }
  }
});

