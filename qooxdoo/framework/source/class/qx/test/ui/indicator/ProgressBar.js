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
qx.Class.define("qx.test.ui.indicator.ProgressBar",
{
  extend : qx.dev.unit.TestCase,


  members :
  {
    __pb : null,


    tearDown : function() {
      this.__pb.destroy();
    },


    testConstructor: function() {
      //defaults
      var val = 0, max = 100;

      this.__pb = new qx.ui.indicator.ProgressBar();
      this.assertIdentical(val, this.__pb.getValue());
      this.assertIdentical(max, this.__pb.getMaximum());

      //value
      val = 10;
      this.__pb.dispose();
      this.__pb = new qx.ui.indicator.ProgressBar(val);
      this.assertIdentical(val, this.__pb.getValue());
      this.assertIdentical(max, this.__pb.getMaximum());

      //value, max
      max = 120;
      this.__pb.dispose();
      this.__pb = new qx.ui.indicator.ProgressBar(val, max);
      this.assertIdentical(val, this.__pb.getValue());
      this.assertIdentical(max, this.__pb.getMaximum());

      //limit value to max
      this.__pb.dispose();
      this.__pb = new qx.ui.indicator.ProgressBar(1200, 1000);
      this.assertIdentical(1000, this.__pb.getValue());
      this.assertIdentical(1000, this.__pb.getMaximum());
    },


    testValue: function() {
      var val = 20;

      this.__pb = new qx.ui.indicator.ProgressBar();

      //returns exactly what was set
      this.assertIdentical(val, this.__pb.setValue(val));

      this.assertIdentical(val, this.__pb.getValue());
    },

    testLimitValueToZero: function() {
      this.__pb = new qx.ui.indicator.ProgressBar();
      this.__pb.setValue(-20);
      this.assertIdentical(0, this.__pb.getValue());
    },

    testLimitValueToMaximum: function() {
      this.__pb = new qx.ui.indicator.ProgressBar();
      this.__pb.setValue(this.__pb.getMaximum() + 1);
      this.assertIdentical(this.__pb.getMaximum(), this.__pb.getValue());
    },


    testMaximum: function() {
      var max = 200;
      this.__pb = new qx.ui.indicator.ProgressBar();

      //returns exactly what was set
      this.assertIdentical(max, this.__pb.setMaximum(max));

      this.assertIdentical(max, this.__pb.getMaximum());
    },

    testDoNothingIfMaximumIsSetToZero: function() {
      this.__pb = new qx.ui.indicator.ProgressBar();
      this.__pb.setMaximum(0);

      //default is 100
      this.assertIdentical(100, this.__pb.getMaximum());
    },

    testLimitMaximumToValue: function() {
      var val = 20;
      this.__pb = new qx.ui.indicator.ProgressBar();
      this.__pb.setValue(val);
      this.__pb.setMaximum(val-1);
      this.assertIdentical(val, this.__pb.getMaximum());
    },

    testChangeEvent : function() {
      var that = this, val = 10;

      this.__pb = new qx.ui.indicator.ProgressBar();
      this.assertEventFired(this.__pb, "change", function() {
        that.__pb.setValue(val);
      }, function(e){
        that.assertIdentical(0, e.getOldData());
        that.assertIdentical(val, e.getData());
      }, "event not fired.");
    },


    testCompleteEvent : function() {
      var that = this, max = this.__pb.getMaximum();

      this.__pb = new qx.ui.indicator.ProgressBar();
      this.assertEventFired(this.__pb, "complete", function() {
        that.__pb.setValue(max);
      }, null, "event not fired.");

      max = 200;
      this.__pb.dispose();
      this.__pb = new qx.ui.indicator.ProgressBar(0, max);
      this.assertEventFired(this.__pb, "complete", function() {
        that.__pb.setValue(max);
      }, null, "event not fired.");
    },

    testCompleteEventFiresOnTime: function() {
      var that = this, max = 200;

      this.__pb = new qx.ui.indicator.ProgressBar(0, max);

      this.assertEventNotFired(this.__pb, "complete", function() {
        that.__pb.setValue(max-1);
      }, null, "event fired.");

      this.assertEventFired(this.__pb, "complete", function() {
        that.__pb.setValue(max);
      }, null, "event not fired.");
    }
  }
});

