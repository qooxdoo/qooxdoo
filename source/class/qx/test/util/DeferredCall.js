/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.util.DeferredCall",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testGlobalErrorHandling : function()
    {
      var fail = function() {
        throw new Error("fail");
      };

      var onError = function() { this.resume(function() {
        qx.event.GlobalError.setErrorHandler(null, null);
      }); };

      var deferredCall = new qx.util.DeferredCall(fail, this);
      qx.event.GlobalError.setErrorHandler(onError, this);

      deferredCall.schedule();
      this.wait(1000, function() {
        qx.event.GlobalError.setErrorHandler(null, null);
        throw new qx.core.AssertionError(
          "Asynchronous Test Error",
          "Timeout reached before resume() was called."
        );
      });
    }
  }
});
