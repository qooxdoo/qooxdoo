/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

qx.Class.define("qx.test.dev.StackTrace",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testGetStackTraceFromError : function()
    {
      var trace = [];
      try {
        throw new Error("Expected exception");
      } catch(ex) {
        trace = qx.dev.StackTrace.getStackTraceFromError(ex);
      }
      if (qx.core.Environment.get("engine.name") == "mshtml") {
        // Can't get stack trace for IE
        qx.core.Assert.assertEquals(0, trace.length, "Got stack trace information for IE!");
      } else {
        qx.core.Assert.assertNotEquals(0, trace.length, "No stack trace information returned!");
      }
    }
  }
});