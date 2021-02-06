/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */

/**
 * @require(qx.lang.normalize.String)
 */
qx.Class.define("qx.test.lang.normalize.String",
{
  extend : qx.dev.unit.TestCase,
  include : [qx.dev.unit.MMock],


  members :
  {
    "test trim()" : function ()
    {
      this.assertEquals("y", "   y".trim());
      this.assertEquals("y", "y   ".trim());
      this.assertEquals("y", " y  ".trim());
    },


    "test startsWith()" : function ()
    {
      var str = "To be, or not to be, that is the question.";

      this.assertTrue ( str.startsWith("To be")         ); // true
      this.assertFalse( str.startsWith("not to be")     ); // false
      this.assertTrue ( str.startsWith("not to be", 10) ); // true
    },


    "test endsWith()" : function ()
    {
      var str = "To be, or not to be, that is the question.";

      this.assertTrue ( str.endsWith("question.") ); // true
      this.assertFalse( str.endsWith("to be")     ); // false
      this.assertTrue ( str.endsWith("to be", 19) ); // true

      //
      // Increase test covarage
      //

      // not finite
      this.assertTrue ( str.endsWith("question.", Number.POSITIVE_INFINITY) );
      this.assertFalse( str.endsWith("to be"    , Number.POSITIVE_INFINITY) );
      // float
      this.assertTrue ( str.endsWith("question.", 42.2) );
      this.assertFalse( str.endsWith("to be"    , 42.2) );
      // len > str.length
      this.assertTrue ( str.endsWith("question.", 43) );
      this.assertFalse( str.endsWith("to be"    , 43) );

    }
  }
});
