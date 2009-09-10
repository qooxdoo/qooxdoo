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

qx.Class.define("qx.test.lang.Array",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    /**
     * Array tests
     *
     */
    testAppend : function()
    {
      this.assertNotUndefined(qx.lang.Array.append);
      var a = [ 1, 2, 3 ];
      qx.lang.Array.append(a, [ 4, 5, 6 ]);

      this.assertJsonEquals(a, [ 1, 2, 3, 4, 5, 6 ]);

      var error = false;

      try {
        qx.lang.Array.append(a, 1);
      } catch(ex) {
        error = true;
      }

      this.assert(error);
    },


    testMinNumeric : function()
    {
      var a = [ -3, -2, -1, 0, 1, 2, 3 ];
      var result = qx.lang.Array.min(a);
      this.assertEquals(-3, result);
    },


    testMaxNumeric : function()
    {
      var a = [ -3, -2, -1, 0, 1, 2, 3 ];
      var result = qx.lang.Array.max(a);
      this.assertEquals(3, result);
    },


    testMinMixed : function()
    {
      var a = [ -3, -2, -1, 0, 1, 2, 3, 'foo', 'bar', undefined, null ];
      var result = qx.lang.Array.min(a);
      this.assertEquals(-3, result);
    },


    testMaxMixed : function()
    {
      var a = [ -3, -2, -1, 0, 1, 2, 3, 'foo', 'bar', undefined, null ];
      var result = qx.lang.Array.max(a);
      this.assertEquals(3, result);
    },


    testMinEmpty : function()
    {
      var a = [ ];
      var result = qx.lang.Array.min(a);
      this.assertEquals(null, result);
    },


    testMaxEmpty : function()
    {
      var a = [ ];
      var result = qx.lang.Array.max(a);
      this.assertEquals(null, result);
    }

  }
});
