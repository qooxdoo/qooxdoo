/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Measures JavaScript execution and rendering time for singular or repeated
 * operations.
 */
qx.Mixin.define("qx.dev.unit.MMeasure",
{
  members :
  {
    /**
     * Repeatedly runs code and measures execution and rendering times
     *
     * @param msg {String} Description of the measured operation
     * @param callback {Function} Callback containing the code to be measured
     * @param finalize {Function} Finalize function called once after measuring,
     * e.g. for cleanup. Will not be measured.
     * @param iterations {Number} Number of times to execute the callback
     * @param displayIterations {Number?} Iterations to be displayed instead of
     * <code>iterations</code>
     */
    measureRepeated : function(msg, callback, finalize, iterations, displayIterations)
    {
      this.measure(
        msg,
        function() {
          var i = iterations;
          while (i--) {
            callback(i);
          }
        },
        finalize,
        displayIterations || iterations
      );
    },

    /**
     * Repeatedly runs code for a given amount of time and measures completed
     * iterations
     *
     * @param msg {String} Description of the measured operation
     * @param prepare {Function} A function that will be called before every
     * iteration. Its execution time is not included in the measurement
     * @param callback {Function} Callback containing the code to be measured.
     * Must return the number of completed iterations.
     * @param finalize {Function} Finalize function called once after measuring,
     * e.g. for cleanup. Will not be measured.
     * @param time {Number} Amount of time in milliseconds
     */
    measureIterations : function(msg, prepare, callback, finalize, time)
    {
      this.measure(
        msg,
        function() {
          var i = 0;
          var testTime = 0;
          while (testTime < time) {
            if (prepare) {
              prepare();
            }
            var startIter = Date.now();
            callback(i);
            testTime += Date.now() - startIter;
            i++;
          }
          return i;
        },
        finalize,
        null,
        time
      );
    },


    /**
     * Executes a given callback function once and measures JavaScript execution
     * and rendering time
     *
     * @param msg {String} Description of the measured operation
     * @param callback {Function} Callback containing the code to be measured
     * @param finalize {Function} Finalize function called once after measuring,
     * e.g. for cleanup. Will not be measured.
     * @param displayIterations {Number?} Iterations to be displayed instead of
     * <code>iterations</code>
     * @param maxTime {Number?} Maximum amount of time the test will run. Only used
     * for {@link #measureIterations}. If undefined, the test will be aborted after
     * ten seconds.
     */
    measure : function(msg, callback, finalize, displayIterations, maxTime)
    {
      // profiling
      var profilingEnabled;
      try {
        profilingEnabled = window.top.qx.core.Init.getApplication().runner.view.getNativeProfiling();
      } catch(ex) {
        profilingEnabled = false;
      }

      var profilingActive = (profilingEnabled && console &&
        console.profile && typeof console.profile == "function" &&
        console.profileEnd && typeof console.profileEnd == "function"
      );

      if (profilingActive) {
        console.profile(msg);
      }

      var start = Date.now();
      var iterations = callback();
      var end = Date.now();

      // profiling
      if (profilingActive) {
        console.profileEnd(msg);
      }

      var time = end-start;

      var renderStart = Date.now();

      var self = this;
      setTimeout(function() { self.resume(function()
      {
        var renderTime = Date.now() - renderStart;
        self.log(
          msg,
          iterations || displayIterations,
          maxTime || time,
          renderTime
        );
        finalize.call(self);
      }); }, 0);

      this.wait(maxTime ? maxTime + 5000 : 10000);
    },


    /**
     * Logs a single measurement result
     *
     * @param msg {String} Description of the measured operation
     * @param iterations {Number} Number of iterations
     * @param ownTime {Number} JavaScript execution time in ms
     * @param renderTime {Number} Dom rendering time in ms
     */
    log : function(msg, iterations, ownTime, renderTime)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.debug([msg, "Iterations: " + iterations, "Time: " + ownTime + "ms",
          "Render time: " + renderTime + "ms"].join("; "));
      }

      throw new qx.dev.unit.MeasurementResult(msg, iterations, ownTime, renderTime);
    }
  }
});
