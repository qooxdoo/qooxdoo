/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.log.RingBuffer",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testLog : function()
    {
      var appender = new qx.log.appender.RingBuffer();

      qx.log.Logger.clear();
      qx.log.Logger.register(appender);
      qx.log.Logger.debug("test");

      var events = appender.getAllLogEvents();
      this.assertEquals(1, events.length);
      this.assertEquals("test", events[0].items[0].text);

      qx.log.Logger.unregister(appender);
    },


    testExceedMaxMessages : function()
    {
      var appender = new qx.log.appender.RingBuffer(2);

      for (var i=0; i<10; i++) {
        appender.process({index: i});
      }

      var events = appender.getAllLogEvents();
      this.assertEquals(2, events.length);
      this.assertEquals(8, events[0].index);
      this.assertEquals(9, events[1].index);
    },


    testRetrieveLogEvents : function()
    {
      var appender = new qx.log.appender.RingBuffer(6);

      for (var i=0; i<10; i++)
      {
        var event = {
          index: i
        }
        appender.process(event);
      }

      var events = appender.retrieveLogEvents(5);
      this.assertEquals(5, events.length);
      this.assertEquals(5, events[0].index);
      this.assertEquals(9, events[4].index);
    },


    testClearHistory : function()
    {
      var appender = new qx.log.appender.RingBuffer();
      appender.process({});
      this.assertEquals(1, appender.getAllLogEvents().length);

      appender.clearHistory();
      this.assertEquals(0, appender.getAllLogEvents().length);
    }
  }
})