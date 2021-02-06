/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.log.Logger",
{
  extend : qx.dev.unit.TestCase,

  statics : {
    TEST_CONSTANT: "abc"
  },

  members :
  {
    setUp : function()
    {
      this.__initialLogLevel = qx.log.Logger.getLevel();
    },

    tearDown : function()
    {
      qx.log.Logger.setLevel(this.__initialLogLevel);
    },

    __testLogException : function(exception)
    {
      var appender = new qx.log.appender.RingBuffer();

      qx.log.Logger.setLevel("debug");
      qx.log.Logger.clear();
      qx.log.Logger.register(appender);

      qx.log.Logger.debug(exception);

      var events = appender.getAllLogEvents();
      this.assertEquals(1, events.length);

      if (qx.core.Environment.get("ecmascript.error.stacktrace")) {
        if (exception instanceof Error || qx.core.Environment.get("engine.name") !== "gecko") {
          this.assert(events[0].items[0].trace.length > 0);
        }
      }

      qx.log.Logger.unregister(appender);
    },

    testLogException : function()
    {
      var exception = this.newException();
      this.__testLogException(exception);
    },

    testLogDOMException : function()
    {
      var exception = this.newDOMException();
      this.__testLogException(exception);
    },


    testKonstantDeprecation : function()
    {
      // call the method to see if its not throwing an error
      qx.log.Logger.deprecatedConstantWarning(
        qx.test.log.Logger, "TEST_CONSTANT"
      );

      this.assertEquals("abc", qx.test.log.Logger.TEST_CONSTANT);
    },


    /**
     * @ignore(test.DisposableObject)
     */
    testContextObject : function() {
      var appender = new qx.log.appender.RingBuffer();

      qx.log.Logger.setLevel("debug");
      qx.log.Logger.clear();
      qx.log.Logger.register(appender);

      qx.Class.define("test.DisposableObject", {
        extend: qx.core.Object,
        implement: qx.core.IDisposable
      });

      var obj = new qx.core.Object();
      var dispObj = new test.DisposableObject();
      qx.log.Logger.debug(qx.core.Object, "m1");
      qx.log.Logger.debug(obj, "m2");
      qx.log.Logger.debug(qxWeb(), "m3");
      qx.log.Logger.debug(dispObj, "m4");


      var events = appender.getAllLogEvents();
      this.assertEquals(qx.core.Object, events[0].clazz);
      this.assertEquals(qx.core.Object, events[1].clazz);
      this.assertEquals(qxWeb, events[2].clazz);
      this.assertEquals(dispObj.toHashCode(), events[3].object);

      qx.log.Logger.unregister(appender);
      dispObj.dispose();
      qx.Class.undefine("test.DisposableObject");
    },


    newException : function()
    {
      var exc;
      try {
        throw new Error();
      } catch (e) {
        exc = e;
      }
      return exc;
    },

    newDOMException : function()
    {
      var exc;
      try {
        document.body.appendChild(null);
      } catch (e) {
        exc = e;
      }
      return exc;
    }
  }
});
