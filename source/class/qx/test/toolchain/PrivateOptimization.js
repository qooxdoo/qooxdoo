/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-20011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

qx.Class.define("qx.test.toolchain.PrivateOptimization",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
  /*
   * The next test tests whether privates are renamed at all.
   */
    testPrivatesRenaming: function() {
      // Can only fail in build version with all optimizations
      this.assertEquals("__te" + "st a", this.__test(), "Variable in a string renamed!");
      this.assertEquals("__te" + "st a test", this.__test() + " test", "Variable in a string renamed!");
    },

    // needed for testPrivatesRenaming
    __test: function() {
      return "__test a";
    }
  }
});
