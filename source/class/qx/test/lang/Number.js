/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Markus Bader (mbgonicus)

************************************************************************ */

qx.Class.define("qx.test.lang.Number",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testEquals : function() {
      this.assertNotUndefined(qx.lang.Number);
      this.assertFunction(qx.lang.Number.equals);

      // Check integers
      this.assertTrue(qx.lang.Number.equals(1, 1));
      this.assertFalse(qx.lang.Number.equals(1, 0));

      // Check floats
      this.assertTrue(qx.lang.Number.equals(1.5, 1.5));
      this.assertTrue(qx.lang.Number.equals(0.1 + 0.2, 0.3));
      this.assertFalse(qx.lang.Number.equals(1.5, 1.500000001));
    }
  }
});
