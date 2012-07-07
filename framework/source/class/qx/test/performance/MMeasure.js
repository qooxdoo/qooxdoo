/**
 * @deprecated since 2.0
 */
qx.Mixin.define("qx.test.performance.MMeasure",
{
  construct : function()
  {
    qx.log.Logger.deprecatedMixinWarning(qx.test.performance.MMeasure,
      "Please use qx.dev.unit.MMeasure instead.");
  },

  members :
  {
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


    measure : function(msg, callback, finalize, displayIterations)
    {
      // profiling
      var profilingEnabled = window.top.qx.core.Init.getApplication().runner.view.getProfile();

      var profilingActive = (profilingEnabled &&
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
          "Iterations: " + displayIterations,
          "Time: " + time + "ms",
          "Render time: " + renderTime + "ms"
        );
        finalize.call(self);
      }); }, 0);

      this.wait(10000);
    },


    log : function(msg, iterations, ownTime, renderTime)
    {
      var runnerView = window.top.qx.core.Init.getApplication().runner.view;
      if (runnerView.logMeasurement) {
        runnerView.logMeasurement(this.classname, msg, iterations, ownTime, renderTime)
      }
      this.debug([msg, iterations, ownTime, renderTime].join("; "));
    }
  }
})