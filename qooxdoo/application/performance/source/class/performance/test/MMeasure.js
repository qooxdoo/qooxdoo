/* ************************************************************************

#require performance.test.RunnerPatch

************************************************************************ */
qx.Mixin.define("performance.test.MMeasure",
{
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
      if (performance.test.RunnerPatch.ENABLE_PROFILE) {
        console.profile(msg);
      }

      var start = new Date();
      callback();
      var end = new Date();

      // profiling
      if (performance.test.RunnerPatch.ENABLE_PROFILE) {
        console.profileEnd(msg);
      }

      var time = end-start;

      var renderStart = new Date();

      var self = this;
      setTimeout(function() { self.resume(function()
      {
        var renderTime = new Date() - renderStart;
        self.log(msg, displayIterations, time, renderTime);
        finalize.call(self);
      }); }, 0);

      this.wait(10000);
    },


    log : function(msg, iterations, ownTime, renderTime)
    {
      var app = this.getRunnerApplication ? this.getRunnerApplication() : qx.core.Init.getApplication();
      if (app.logMeasurement) {
        app.logMeasurement(this.classname, msg, iterations, ownTime, renderTime)
      }
      this.debug([msg, iterations, ownTime, renderTime].join("; "));
    }
  }
})