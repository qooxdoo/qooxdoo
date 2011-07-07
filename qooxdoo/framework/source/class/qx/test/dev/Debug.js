/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

qx.Class.define("qx.test.dev.Debug",
{
  extend : qx.dev.unit.TestCase,
  include : [qx.dev.unit.MRequirements],

  members :
  {
    hasDisposeDebug : function()
    {
      return qx.core.Environment.get("qx.debug.dispose");
    },

    testDisposeProfilingCheckFunction : function()
    {
      this.require(["disposeDebug"]);

      var n = new qx.core.Object();
      var ignoreHash = n.toHashCode();
      var checkFunction = function(object) {
        if (object.toHashCode() == ignoreHash) {
          return false;
        }
        return true;
      }

      var o = new qx.core.Object();
      // no need to call startDisposeProfiling - the Testrunner did that already
      var undisposed = qx.dev.Debug.stopDisposeProfiling(checkFunction);
      this.assertArray(undisposed);
      this.assertEquals(1, undisposed.length);
      this.assertEquals(o, undisposed[0].object);
      var stackOk = false;
      this.assertMatch(undisposed[0].stackTrace.join(" "), this.classname);

      n.dispose();
      o.dispose();
    }
  }
});