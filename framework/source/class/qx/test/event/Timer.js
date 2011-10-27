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

qx.Class.define("qx.test.event.Timer",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    tearDown : function ()
    {
      qx.event.GlobalError.setErrorHandler(null);
    },

    testGlobalErrorHandling : function()
    {
      var fail = function() {
        throw new Error("fail");
      };

      var onError = function() { this.resume(function() {}); };
      qx.event.GlobalError.setErrorHandler(onError, this);

      qx.event.Timer.once(fail, this, 0);
      this.wait(100);
    }
  }
});