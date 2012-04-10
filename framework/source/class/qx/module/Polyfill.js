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
    },


    stringTrim : function() {
      if (typeof String.prototype.trim !== "function") {
        String.prototype.trim = function(context) {
          return this.replace(/^\s+|\s+$/g,'');
        };
      }

      if (typeof String.prototype.trimLeft !== "function") {
        String.prototype.trimLeft = function(context) {
          return this.replace(/^\s+/g,'');
        };
      }

      if (typeof String.prototype.trimRight !== "function") {
        String.prototype.trimRight = function(context) {
          return this.replace(/\s+$/g,'');
        };
      }
    }
  },

  defer : function(statics)
  {
    statics.functionBind();
    statics.stringTrim();
  }
});