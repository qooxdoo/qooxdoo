/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-20011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Thomas Herchenroeder (thron7)

************************************************************************ */

qx.Class.define("qx.test.toolchain.VariantOptimization",
{
  extend : qx.dev.unit.TestCase,
  include: qx.dev.unit.MRequirements,

  members :
  {
    setUp : function () {
      this.require(["variantsOptimized"]);  // run the tests only when this code is variant-optimized
    },

    hasVariantsOptimized : function () {
      return qx.core.Environment.get("qx.optimization.variants");
    },

    /*
     * The next tests whether the generator optimized an 'if' statement, so that
     * only the 'then' branch made it into the optimized code.
     */
    "test If code is pruned by the generator": function () {
      var a = 0;
      /*
       * "qx.test.bool_true" and "qx.test.bool_false" are custom environment
       * keys that are set in config.json for the framework's AUT.
       * 
       * Faking "qx.test.bool_true" to temporarily evaluate to false here.
       * (Undone in the "tearDown" method).
       */
      qx.core.Environment._checks["qx.test.bool_true"] = function(){return false;};
      /*
       * The 'if' statement should be optimized by the generator, as the value
       * of "qx.test.bool_true" is known at compile time, so that only "a = 1"
       * makes it into the generated code.
       *
       * If the 'if' is not optimized, the .get call will actually be performed
       * returning 'false' (see above), and the else branch will be executed.
       */
      if (qx.core.Environment.get("qx.test.bool_true")) {
        a = 1;
      } else {
        a = 2;
      }
      // The next will fail if the 'else' branch has been chosen, due to missing
      // or wrong optimization.
      this.assertEquals(1,a);
    },

    "tearDown If code is pruned by the generator" : function () {
      qx.core.Environment._checks["qx.test.bool_true"] = function(){return true;};
    }
  }
});
