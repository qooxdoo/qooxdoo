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
qx.Class.define("qx.test.ui.indicator.Progressbar",
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

      this.__pb = new qx.ui.indicator.Progressbar();
      this.assertIdentical(val, this.__pb.getValue());
      this.assertIdentical(max, this.__pb.getMax());

      //value
      val = 10;
      this.__pb = new qx.ui.indicator.Progressbar(val);
      this.assertIdentical(val, this.__pb.getValue());
      this.assertIdentical(max, this.__pb.getMax());

      //value, max
      max = 120;
      this.__pb = new qx.ui.indicator.Progressbar(val, max);
      this.assertIdentical(val, this.__pb.getValue());
      this.assertIdentical(max, this.__pb.getMax());
    },


    testValue: function() {
      var val = 20;

      this.__pb = new qx.ui.indicator.Progressbar();

      //returns exactly what was set
      this.assertIdentical(val, this.__pb.setValue(val));

      this.assertIdentical(val, this.__pb.getValue());
    },

    testLimitValueToZero: function() {
      this.__pb = new qx.ui.indicator.Progressbar();
      this.__pb.setValue(-20);
      this.assertIdentical(0, this.__pb.getValue());
    },

    testLimitValueToMax: function() {
      this.__pb = new qx.ui.indicator.Progressbar();
      this.__pb.setValue(this.__pb.getMax() + 1);
      this.assertIdentical(this.__pb.getMax(), this.__pb.getValue());
    },


    testMax: function() {
      var max = 200;
      this.__pb = new qx.ui.indicator.Progressbar();
      
      //returns exactly what was set
      this.assertIdentical(max, this.__pb.setMax(max));

      this.assertIdentical(max, this.__pb.getMax());
    },

    testDoNothingIfMaxIsSetToZero: function() {
      this.__pb = new qx.ui.indicator.Progressbar();
      this.__pb.setMax(0);

      //default is 100
      this.assertIdentical(100, this.__pb.getMax());
    },

    testLimitMaxToValue: function() {
      var val = 20;
      this.__pb = new qx.ui.indicator.Progressbar();
      this.__pb.setValue(val);
      this.__pb.setMax(val-1);
      this.assertIdentical(val, this.__pb.getMax());
    },

    testChangeEvent : function() {
      var me = this, val = 10;

      this.__pb = new qx.ui.indicator.Progressbar();
      this.assertEventFired(this.__pb, "change", function() {
        me.__pb.setValue(val);
      }, function(e){
        me.assertIdentical(0, e.getOldData());
        me.assertIdentical(val, e.getData());
      }, "event not fired.");
    },


    testCompleteEvent : function() {
      var me = this, max = this.__pb.getMax();

      this.__pb = new qx.ui.indicator.Progressbar();
      this.assertEventFired(this.__pb, "complete", function() {
        me.__pb.setValue(max);
      }, null, "event not fired.");

      max = 200;
      this.__pb = new qx.ui.indicator.Progressbar(0, max);
      this.assertEventFired(this.__pb, "complete", function() {
        me.__pb.setValue(max);
      }, null, "event not fired.");
    }
  }
});

