/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * @require(qx.lang.normalize.Error)
 */
qx.Class.define("qx.test.lang.normalize.Error",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testToString : function()
    {
      var msg = "Dummer Fehler";
      var error = new Error(msg);
      this.assertTrue(qx.lang.String.contains(error.toString(), msg));
    }
  }
});
