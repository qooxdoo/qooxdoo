qx.Mixin.define("performance.test.MMeasure",
{
  members :
  {
    measureRepeated : function(msg, callback, iterations, displayIterations)
    {
      console.profile(msg);
    
      var i = iterations;
      var start = new Date();
      while (i--) {
        callback();
      }
      var end = new Date();

      console.profileEnd(msg);
      
      var duration = end-start;
      var log = msg + ": " + duration + "ms";
      var iter = displayIterations || iterations;
      
      
      if (iter > 1) {
        log += " / " + (duration / iter) + "ms per iteration";
      }
      
      
      this.debug(log);
    }
  }
})