/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * John Spackman (john.spackman@zenesis.com)

 ************************************************************************ */

/**
 * @ignore(my.TestLogger)
 */
qx.Class.define("qx.test.log.Filters", {
  extend: qx.dev.unit.TestCase,

  members: {
    testFilters: function() {
      qx.log.appender.Native;

      var Logger = qx.log.Logger;
      qx.Class.define("my.TestLogger", {
        statics: {
          count: 0,
          process: function(entry) {
            this.count++;
            var args = qx.log.appender.Util.toText(entry);
            (console[entry.level] || console.log).call(console, "TestLogger: " + args);
          }
        }
      });

      Logger.addFilter("afdemo", "qx.log.appender.Native");
      Logger.addFilter(/^test-level/, "my.TestLogger", "warn");

      var TestLogger = my.TestLogger;
      qx.log.Logger.register(TestLogger);

      TestLogger.count = 0;

      this.trace("Trace Test");
      this.debug("Debug Test");
      this.warn("Warn Test");
      this.error("Error Test");
      this.info("Info Test");

      Logger.trace("test-level", "Trace Test");
      Logger.debug("test-level", "Debug Test");
      Logger.info("test-level", "Info Test");
      Logger.warn("test-level", "Warn Test");
      Logger.error("test-level", "Error Test");
      qx.core.Assert.assertEquals(2, TestLogger.count);

      qx.log.Logger.unregister(TestLogger);
      qx.log.Logger.resetFilters();
    }
  }
});
