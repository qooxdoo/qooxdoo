/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
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
     * Executes a given callback function once and measures JavaScript execution
     * and rendering time
     *
     * @param msg {String} Description of the measured operation
     * @param callback {Function} Callback containing the code to be measured
     * @param finalize {Function} Finalize function called once after measuring,
     * e.g. for cleanup. Will not be measured.
     * @param displayIterations {Number?} Iterations to be displayed instead of
     * <code>iterations</code>
     */
    measure : function(msg, callback, finalize, displayIterations)
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

      var start = new Date();
      callback();
      var end = new Date();

      // profiling
      if (profilingActive) {
        console.profileEnd(msg);
      }

      var time = end-start;

      var renderStart = new Date();

      var self = this;
      setTimeout(function() { self.resume(function()
      {
        var renderTime = new Date() - renderStart;
        self.log(
          msg,
          displayIterations,
          time,
          renderTime
        );
        finalize.call(self);
      }); }, 0);

      this.wait(10000);
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
