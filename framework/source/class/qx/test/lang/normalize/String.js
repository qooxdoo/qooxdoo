/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
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
    }
  }
});
