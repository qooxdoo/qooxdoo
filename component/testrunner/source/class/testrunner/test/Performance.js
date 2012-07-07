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
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * Performance test examples.
 */
qx.Class.define("testrunner.test.Performance",
{
  extend : qx.dev.unit.TestCase,

  include : qx.dev.unit.MMeasure,

  members :
  {
    ITERATIONS : 42,

    testSingle : function()
    {
      var displayIterations = 23;
      var that = this;
      this.measure(

        // descriptive message
        "do one thing",

        // callback containing the code to be measured
        function() {
          // work, work, work...
          that.info("let's pretend we did this " + displayIterations + " times")
        },

        // finalize function (cleanup, etc.) - time spent here is *not* measured
        function() {
          that.info("Finalizing.");
        },

        // number of iterations to show in the results, e.g. the amount of times
        // a loop within the callback is executed
        displayIterations);
    },

    testRepeated : function()
    {
      var that = this;
      this.measureRepeated(

        // descriptive message
        "do some useful stuff " + this.ITERATIONS + " times",

        // callback containing the code to be measured
        function(iteration) {
          // work, work, work...
          that.info(iteration, " iterations left to do");
        },

        // finalize function (cleanup, etc.) - time spent here is *not* measured
        function() {
          that.info("Finalizing.");
        },

        // Amount of times the callback function will be called
        this.ITERATIONS
      );
    }
  }
});