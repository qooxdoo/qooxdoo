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

qx.Class.define("qx.test.log.Util",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testToTextWithObject : function()
    {
      var time = new Date(1000);
      var obj = new qx.core.Object();
      var entry =
      {
        time : time,
        offset : 900,
        level: "warn",
        items: [],
        win: window,
        object: obj.$$hash
      };

      var text = qx.log.appender.Util.toText(entry);
      this.assertEquals(
        "000900 qx.core.Object[" + obj.$$hash + "]:",
        text
      );
      obj.dispose();
    },


    testToTextWithClass : function()
    {
      var time = new Date(1000);
      var entry =
      {
        time : time,
        offset : 900,
        level: "warn",
        items: [],
        win: window,
        clazz: qx.core.Object
      };

      var text = qx.log.appender.Util.toText(entry);
      this.assertEquals(
        "000900 qx.core.Object:",
        text
      )
    }

  }
})