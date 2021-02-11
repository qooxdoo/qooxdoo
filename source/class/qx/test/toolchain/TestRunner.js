/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

qx.Class.define("qx.test.toolchain.TestRunner",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testAsynchronous: function() {

      qx.event.Timer.once(
        function() {
        this.resume(function() {
          // do nothing
        }, this);
      }, this, 1000);

      this.wait();
    }
  }
});
