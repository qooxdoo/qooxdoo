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
/* ************************************************************************
#require(qx.lang.normalize.Function)
************************************************************************ */
qx.Class.define("qx.test.lang.normalize.Function",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testBind : function()
    {
      var context = null;
      var result = 0;

      var add = function(a, b)
      {
        context = this;
        return a + b;
      };

      context = null;
      result = add(1, 2);

      // The assertEquals test fails in Safari 3 but is fixed in WebKit nightly
      if (
        qx.core.Environment.get("browser.name") == "safari" &&
        qx.core.Environment.get("browser.version") < 4
      ) {
        this.assertNotEquals(context, window, "This test fails if the issue is "
        + "fixed in Safari 3.");
      } else {
        this.assertEquals(context, window);
      }
      this.assertEquals(3, result);

      context = null;
      var boundAdd = add.bind(this);
      result = boundAdd(1, 3);
      this.assertEquals(context, this);
      this.assertEquals(4, result);

      context = null;
      var addOne = add.bind(this, 1);
      result = addOne(4);
      this.assertEquals(context, this);
      this.assertEquals(5, result);
    },


    testBindWithUndefinedArguments : function()
    {
      var undef;
      var callback = function(undef, arg) {
        this.assertTrue(arg)
      }
      var bound = callback.bind(this, undef, true);
      bound();
    }
  }
});
