qx.Class.define("qx.event.Utils", {
  extend: qx.core.Object,
  
  statics: {
    ABORT: new Object(),
    
    track: qx.core.Environment.select("qx.promise", {
      "true": function(tracker, fn) {
        var value = typeof fn === "function" ? fn() : fn;
        if (value instanceof qx.Promise)
          tracker.promise = value;
      },
      "false": function(tracker, fn) {
        if (typeof fn === "function")
          fn();
      }
    }),
    
    fastThen: qx.core.Environment.select("qx.promise", {
      "true": function(tracker, fn, reject) {
        if (tracker.promise instanceof qx.Promise) {
          tracker.promise = tracker.promise
            .then(function() {
              var tmp = fn();
              if (tmp === qx.event.Utils.ABORT)
                return qx.Promise.reject();
              return tmp;
            });
          if (reject)
            tracker.promise = tracker.promise.catch(reject);
          return tracker.promise;
        } else {
          var tmp = fn();
          if (tmp instanceof qx.Promise) {
            if (reject)
              tmp = tmp.catch(reject);
            tracker.promise = tmp;
          } else if (tmp === qx.event.Utils.ABORT && reject)
            reject();
          return tmp;
        }
      },
      "false": function(tracker, fn, reject) {
        // What about ABORT??
        // What about reject()??
        
        return fn();
      }
    }),

    callListener: function(tracker, listener, context, event) {
      return this.fastThen(tracker, function() {
        var tmp = listener.handler.call(context, event);
        return event.getPropagationStopped() ? qx.event.Utils.ABORT : tmp;
      });
    }    
    
  }
});
