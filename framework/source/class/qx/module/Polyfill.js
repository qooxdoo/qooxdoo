qx.Bootstrap.define("qx.module.Polyfill", {

  statics: {
    
    functionBind : function() {
      // TODO: core.Environment check?
      if (typeof Function.prototype.bind !== "function") {
        Function.prototype.bind = function(context) {
          var args = Array.prototype.slice.call(arguments, 1);
          return qx.Bootstrap.bind.apply(null, [this, context].concat(args));
        };
      }
    }
    
  },
  
  defer : function(statics)
  {
    statics.functionBind();
  }
});