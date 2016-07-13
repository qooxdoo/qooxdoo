/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

qx.Class.define("qx.test.dev.StackTrace",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    tearDown : function()
    {
      qx.dev.StackTrace.FILENAME_TO_CLASSNAME = null;
      qx.dev.StackTrace.FORMAT_STACKTRACE = null;
    },


    testGetStackTraceFromError : function()
    {
      if (!qx.core.Environment.get("ecmascript.error.stacktrace")) {
        this.skip("Test skipped since the client doesn't provide stack traces");
      }
      var trace = [];
      try {
        throw new Error("Expected exception");
      } catch(ex) {
        trace = qx.dev.StackTrace.getStackTraceFromError(ex);
      }
      qx.core.Assert.assertNotEquals(0, trace.length, "No stack trace information returned!");
    },


    testGetStackTraceFromErrorQx : function()
    {
      if (!qx.core.Environment.get("ecmascript.error.stacktrace")) {
        this.skip("Test skipped since the client doesn't provide stack traces");
      }
      var qxErrorClasses = [qx.type.BaseError, qx.core.GlobalError,
        qx.core.WindowError, qx.dev.unit.RequirementError];
      for (var i=0, l=qxErrorClasses.length; i<l; i++) {
        var cls = qxErrorClasses[i];
        var e;
        if (cls.toString().indexOf("GlobalError") > 0) {
          e = new cls(new Error());
        }
        else {
          e = new cls();
        }
        try {
          throw e;
        }
        catch(ex) {
          var trace = qx.dev.StackTrace.getStackTraceFromError(ex);
          this.assertNotIdentical(0, trace.length, "Didn't get stack trace from " + cls.toString());
        }
      }
    },


    testFilenameConverterDefault : function()
    {
      var ex = new Error("Just a test");
      var stack = qx.dev.StackTrace.getStackTraceFromError(ex);
      for (var i=0, l=stack.length; i<l; i++) {
        this.assertMatch(stack[i], /((?:test\.dev\.StackTrace)|(?:dev\.unit)|(?:testrunner\.js)|(?:tests\.js)|(?:qooxdoo-adapter\.js))/);
      }
    },


    testFilenameConverterCustom : function()
    {
      var converter = function(fileName) {
        this.assertString(fileName);
        return "FOO";
      };

      qx.dev.StackTrace.FILENAME_TO_CLASSNAME = qx.lang.Function.bind(converter, this);
      var ex = new Error("Just a test");
      var stack = qx.dev.StackTrace.getStackTraceFromError(ex);
      for (var i=0, l=stack.length; i<l; i++) {
        this.assertMatch(stack[i], /FOO/);
      }
    },


    testFormatStackTrace : function()
    {
      var formatter = function(trace) {
        this.assertArray(trace);
        for (var i=0, l=trace.length; i<l; i++) {
          trace[i] = "BAR " + trace[i];
        }
        return trace;
      };

      qx.dev.StackTrace.FORMAT_STACKTRACE = qx.lang.Function.bind(formatter, this);
      var ex = new Error("Just a test");
      var stack = qx.dev.StackTrace.getStackTraceFromError(ex);
      for (var i=0, l=stack.length; i<l; i++) {
        this.assertMatch(stack[i], /^BAR/);
      }
    }
  }
});
