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

qx.Class.define("qx.test.lang.Function",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testGetCaller : function()
    {
      var self = this;
      var fcn = arguments.callee;

      function f1(caller) {

        if(qx.bom.client.Engine.OPERA && qx.bom.client.Engine.VERSION < 9.6)
        {
          qx.log.Logger.warn("This test is skipped in Opera < 9.6.");
          return ;
        }

        self.assertIdentical(caller, qx.lang.Function.getCaller(arguments), "Wrong caller.");
      }

      function f2() {
        f1(f2);
      }

      f2();
      f1(fcn);
    },


    testFunctionWrap : function()
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
      if (qx.bom.client.Engine.WEBKIT) {
        this.assertNotEquals(context, window, "It is expected this test fails" +
          " if you use the WebKit nightly, Chrome or the issue is fixed in Safari 3.");
      } else {
        this.assertEquals(context, window);
      }
      this.assertEquals(3, result);

      context = null;
      var boundAdd = qx.lang.Function.bind(add, this);
      result = boundAdd(1, 3);
      this.assertEquals(context, this);
      this.assertEquals(4, result);

      context = null;
      var addOne = qx.lang.Function.bind(add, this, 1);
      result = addOne(4);
      this.assertEquals(context, this);
      this.assertEquals(5, result);
    }
  }
});
