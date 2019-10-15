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

qx.Class.define("qx.test.log.Formatter", {
  extend: qx.dev.unit.TestCase,

  members: {
    testToTextWithObject: function() {
      var time = new Date(1000);
      var obj = new qx.core.Object();
      qx.core.ObjectRegistry.register(obj);
      var entry = {
        time: time,
        offset: 900,
        level: "warn",
        items: [],
        win: window,
        object: obj.$$hash
      };

      var formatter = qx.log.appender.Formatter.getFormatter();
      var text = formatter.toText(entry);
      this.assertEquals("000900 qx.core.Object[" + obj.$$hash + "]:", text);
      obj.dispose();
    },

    testToTextAsDate: function() {
      var time = new Date(2019, 9, 10, 1, 2, 3);
      var obj = new qx.core.Object();
      qx.core.ObjectRegistry.register(obj);
      var entry = {
        time: time,
        offset: 900,
        level: "warn",
        items: [],
        win: window,
        object: obj.$$hash
      };

      var formatter = new qx.log.appender.Formatter().set({ formatTimeAs: "datetime" });
      var text = formatter.toText(entry);
      this.assertEquals("2019-10-10 01:02:03 qx.core.Object[" + obj.$$hash + "]:", text);
      obj.dispose();
    },

    testToTextWithClass: function() {
      var time = new Date(1000);
      var entry = {
        time: time,
        offset: 900,
        level: "warn",
        items: [],
        win: window,
        clazz: qx.core.Object
      };

      var formatter = qx.log.appender.Formatter.getFormatter();
      var text = formatter.toText(entry);
      this.assertEquals("000900 qx.core.Object:", text);
    }

  }
});