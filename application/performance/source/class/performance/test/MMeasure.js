qx.Mixin.define("performance.test.MMeasure",
{
  members :
  {
    measureRepeated : function(msg, callback, iterations, displayIterations)
    {
      this.measure(
        msg,
        function() {
          var i = iterations;
          while (i--) {
            callback();
          }
        }, 
        displayIterations || iterations
      );
    },
    
    
    measure : function(msg, callback, displayIterations)
    {
      var times = [];
      var renderTimes = []
      var i = 3;
      var renderStart;
      
      window.setTimeout(function() {
        var renderEnd = new Date();
        if (renderStart) {
          renderTimes.push(renderEnd - renderStart);
        }
        
        if (i-- == 0) {
          return finish();
        }
//        i == 1 && console.profile(msg + "/" + i);
  
        var start = new Date();
        callback();
        var end = new Date();
        
//        i == 1 && console.profileEnd(msg + "/" + i);
        
        times.push(end-start);

        renderStart = new Date();
        window.setTimeout(arguments.callee, 0);
      }, 0);
      
      
      var that = this;
      function finish() {
        that.resume(function() {
          that.log(msg, qx.lang.Array.min(times), qx.lang.Array.min(renderTimes), displayIterations);
        });
      }
      
      this.wait(10000);
    },
    
    
    log : function(msg, duration, renderTime, iterations)
    {
      var log = msg + ": " + duration + "ms / render: " + renderTime + "ms"; 
      
      if (iterations > 1) {
        log += " / " + (duration / iterations) + "ms per iteration";
      }

      this.debug(log);
    }
  }
})