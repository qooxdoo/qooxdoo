
qx.Class.define("qxunit.AssertionError", {
  extend: Error,

  construct: function(comment, failMessage) {
    Error.call(this, failMessage);
    this.setComment(comment || "");
    this.setMessage(failMessage || "");

    this._trace = this.__getStackTrace();
  },

  properties: {
    comment:
    {
      check: "String",
      init: ""
    },

    message: {
      check: "String",
      init: ""
    }

  },

  members: {

    toString: function() {
      return this.getComment() + ": " + this.getMessage();
    },

    getStackTrace : function()
    {
      return this._trace;
    },

    __getStackTrace : qx.core.Variant.select("qx.client",
    {
      "gecko" : function()
      {
        try {
          throw new Error();
        } catch (e) {
          if (e.stack) {
            return this.__beautyStackTrace(e.stack)
          }
        }
        return [];
      },

      "mshtml" : function()
      {
        var trace = [];
        var fcn = arguments.callee.caller;
        var i=0;
        while (fcn)
        {
          var fcnName = this.__getFunctionName(fcn);
          trace.push(fcnName);

          // avoid infinite recursion
          if (fcn.caller == fcn) {
            break;
          }

          fcn = fcn.caller;
        }
        return trace;
      },

      "default" : function()
      {
        return [];
      }
    }),


    __getFunctionName : function(fcn)
    {
      if (fcn.$$original)
      {
        return fcn.classname + ":constructor wrapper";
      }
      if (fcn.wrapper)
      {
        return fcn.wrapper.classname + ":constructor";
      }
      if (fcn.classname)
      {
        return fcn.classname + ":constructor";
      }

      if (fcn.mixin)
      {
        for(var key in fcn.mixin.$$members)
        {
          if (fcn.mixin.$$members[key] == fcn) {
            return fcn.mixin.name + ":" + key;
          }
        }
      }

      if (fcn.self)
      {
        var clazz = fcn.self.constructor;
        if (clazz)
        {
          for(var key in clazz.prototype)
          {
            if (clazz.prototype[key] == fcn) {
              return clazz.classname + ":" + key;
            }
          }
        }
      }

      var fcnReResult = fcn.toString().match(/function(\s*)(\w*)/);
      if (fcnReResult && fcnReResult.length >= 2 && fcnReResult[2]) {
        return fcnReResult[2];
      }
      var fcnReResult = fcn.toString().match(/(function\s*\(.*?\))/);
      if (fcnReResult && fcnReResult.length >= 1 && fcnReResult[1]) {
        return "anonymous: " + fcnReResult[1];
      }

      return 'anonymous';
      //return fcn.toString();
    },


    __beautyStackTrace : function(stack)
    {
      // e.g. "()@http://localhost:8080/webcomponent-test-SNAPSHOT/webcomponent/js/com/ptvag/webcomponent/common/log/Logger:253"
      var lineRe = /@(.+):(\d+)$/gm;
      var hit;
      var trace = [];
      var scriptDir = "/source/class/";

      while ((hit = lineRe.exec(stack)) != null)
      {
        var url = hit[1];
        var jsPos = url.indexOf(scriptDir);
        var className = (jsPos == -1) ? url : url.substring(jsPos + scriptDir.length).replace(/\//g, ".").replace(/\.js$/, "");

        var lineNumber = hit[2];
        trace.push(className + ":" + lineNumber);
      }

      return trace;
    }

  }
});