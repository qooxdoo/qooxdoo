/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.event.Timer",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    tearDown : function ()
    {
      qx.event.GlobalError.setErrorHandler(null);
    },

    testGlobalErrorHandling : function()
    {
      var fail = function() {
        throw new Error("fail");
      };

      var onError = function() { this.resume(function() {}); };
      qx.event.GlobalError.setErrorHandler(onError, this);

      qx.event.Timer.once(fail, this, 0);
      this.wait(100);
    },


    /**
     * Test if timer can be started and stopped.
     */
    testStartStop : function()
    {
      var runCount = 0;

      var timer = new qx.event.Timer(50);
      timer.addListener('interval', function() {
        runCount++;
        if (runCount === 2) {
          timer.stop();
        }
      })
      timer.start();

      // 250ms should be sufficient for exactly two runs of an 50ms timer. We
      // don't want to use a shorter interval, because cancellation of the timer
      // via stop() could then become unreliable (timer could fire a third time)
      this.wait(250, function() {
          this.assertFalse(runCount === 0, 'Timer did not fire interval event');
          this.assertFalse(runCount === 1, 'Timer did not fire interval event repeatedly, fired only once');
          this.assertIdentical(2, runCount, 'Timer fired more interval events than expected (could not be stopped after second run)');
        }.bind(this));
    },


    /**
     * Test if newly created timers don't start by default.
     */
    testNoStartByDefault : function()
    {
      var runCount = 0;

      var timer = new qx.event.Timer(1);
      timer.addListener('interval', function() {
        runCount++;
      });

      this.wait(250, function() { // 250ms should be sufficient to detect an (unwanted) start of an 1ms timer
        this.assertIdentical(0, runCount, 'New timer did fire interval event without explicitly being started by calling start() or by setting enabled property to true');
      }.bind(this));
    },


    /**
     * Timer using static method once() should start automatically and fire
     * exactly a single time.
     */
    testStaticOnce : function()
    {
      var runCount = 0;

      qx.event.Timer.once(function() {
        runCount++;
      }, this, 1)

      this.wait(250, function() {
          this.assertIdentical(1, runCount, 'Static method once() is expected to start automatically and to run exactly once');
        }.bind(this));
    }
  }
});
