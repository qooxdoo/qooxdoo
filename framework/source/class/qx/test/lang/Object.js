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

qx.Class.define("qx.test.lang.Object",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testObject : function() {
      this.assertNotUndefined(qx.lang.Object);
    },


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
    },


    /**
     * Some behavior, which must be consistent in all browsers for some
     * assertions to work.
     */
    testObjectAssertions : function()
    {
      var objConstructor = ({}).constructor;

      this.assertIdentical(({a: 12}).constructor, objConstructor);
      this.assertIdentical(new Object().constructor, objConstructor);

      this.assertNotIdentical(new qx.core.Object().constructor, objConstructor);
      this.assertNotIdentical((1).constructor, objConstructor);
      this.assertNotIdentical(("Juhu").constructor, objConstructor);
      this.assertNotIdentical((/abc/).constructor, objConstructor);
    }
  }
});
