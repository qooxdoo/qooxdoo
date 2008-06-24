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

qx.Class.define("testrunner.test.lang.Object",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    /**
     * Object tests
     *
     * @type member
     * @return {void}
     */
    testObject : function() {
      this.assertNotUndefined(qx.lang.Object);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    testInvert : function()
    {
      this.assertNotUndefined(qx.lang.Object.invert);
      var Obj = qx.lang.Object;

      this.assertJsonEquals(
      {
        a   : "1",
        "2" : "b"
      },
      Obj.invert(
      {
        1 : "a",
        b : 2
      }));
    }
  }
});
