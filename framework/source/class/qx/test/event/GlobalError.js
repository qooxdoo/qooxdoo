/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.event.GlobalError",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    setUp : function()
    {
      qx.core.Setting.set("qx.globalErrorHandling", "on");
      this.errorHandler = qx.event.GlobalError;

      this.called = false;
      this.calledParams = [];
      this.errorHandler.setErrorHandler(this.onError, this);
    },

    tearDown : function ()
    {
      this.errorHandler.setErrorHandler(null);
    },


    onError : function(ex)
    {
      this.assertEquals(1, arguments.length);
      this.called = true;
      this.calledParams.push(ex);
    },


    testSetting : function()
    {
      this.assertEquals("on", qx.core.Setting.get("qx.globalErrorHandling"));
    },


    testObserveMethod : function()
    {
      var fail = function() {
        throw new Error("fail");
      }

      var wrappedFail = this.errorHandler.observeMethod(fail);
      this.assertFalse(this.called);
      wrappedFail();
      this.assertTrue(this.called);
    },


    testDontWarpIfSettingIsOff : function()
    {
      qx.core.Setting.set("qx.globalErrorHandling", "off");

      var fcn = function() {};
      var wrapped = this.errorHandler.observeMethod(fcn);

      this.assertIdentical(fcn, wrapped);
    },


    testWrappedParameterAndReturnValue : function()
    {
      var args = null;

      var fcn = function(a,b,c) {
        var args = [a, b, c];
        return args;
      }

      var wrapped = this.errorHandler.observeMethod(fcn);
      this.assertJsonEquals(
        fcn(1, "2", true),
        wrapped(1, "2", true)
      );
    },


    testObserveMethodButNoHandler : function()
    {
      var fail = function() {
        throw new Error("fail");
      }

      var wrappedFail = this.errorHandler.observeMethod(fail);

      this.errorHandler.setErrorHandler(null, null);
      this.assertException(wrappedFail);

      this.errorHandler.setErrorHandler(this.onError, this);
      wrappedFail();
    },


    testHandlerContext : function()
    {
      var fail = function() {
        throw new Error("fail");
      }

      var self = null;
      var handler = function(ex) {
        self = this;
      }

      this.errorHandler.setErrorHandler(handler, this)
      var wrappedFail = this.errorHandler.observeMethod(fail);

      wrappedFail();
      this.assertEquals(this, self);
    },


    testHandleError : function()
    {
      var error = new Error("New Error");
      this.errorHandler.handleError(error);

      this.assertTrue(this.called);
      this.assertEquals(error, this.calledParams[0]);
    },


    testOnWindowError : function()
    {
      var wasHandled = false;
      var handler = function(ex) { this.resume(function()
      {

        this.assertInstance(ex, qx.core.WindowError);
        this.assertEquals("Doofer Fehler", ex.toString());

        this.assertString(ex.getUri());
        this.assertInteger(ex.getLineNumber());

        this.debug(ex.toString() + " at " + ex.getUri() + ":" + ex.getLineNumber());
        wasHandled = true;
      }, this); }

      this.errorHandler.setErrorHandler(handler, this);

      // callback is NOT wrapped!
      window.setTimeout(function() {
        throw new Error("Doofer Fehler");
      }, 0);

      // Opera and Webkit do not support window.onerror
      // make sure the test fails once they support it
      var self = this;
      window.setTimeout(function()
      {
        if (wasHandled) {
          return;
        }

        self.resume(function()
        {
          if (qx.core.Variant.isSet("qx.client", "opera|webkit")) {
            this.warn("window.onerror is not supported by Opera and Webkit");
          } else {
            this.fail("window.onerror should be supported! Note: this test fails in IE if the debugger is active!");
          }
        }, self);
      }, 100);

      this.wait(500);
    }

    // timer setTimeout/setInterval - OK
    // addNativeListener - OK
    // attachEvent - OK
    // mouse - OK
    // key - OK
    // focus - OK
    // scroll - OK
    // rpc/io - OK
    // load - OK
    // animation - OK
    // iframe - OK
  }
});