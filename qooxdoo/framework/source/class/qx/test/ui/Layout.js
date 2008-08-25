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

qx.Class.define("qx.test.ui.Layout",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testFlex : function()
    {
      var numRuns = 500;

      for (var run=0; run<numRuns; run++)
      {
        var len = Math.round(Math.random() * 20) + 1;
        var sumMin = 0;
        var sumMax = 0;
        var sumValue = 0;
        var flexibles = {};

        for (var j=0; j<len; j++)
        {
          var min = Math.round(Math.random() * 20);
          var max = min + Math.round(Math.random() * 50) + 1;
          var value = min + Math.round(Math.random() * (max - min));

          sumMax += max;
          sumMin += min;
          sumValue += value;

          flexibles[j] = {
            min: min,
            value: value,
            max: max,
            flex : Math.ceil(Math.random() * 5) // flex range from 1 .. 5
          }
        }

        var availWidth = Math.round(Math.random() * 500);

        var result = qx.ui.layout.Util.computeFlexOffsets(flexibles, availWidth, sumValue);

        // check sum
        var sum = 0;
        for (var i in result)
        {
          var newSize = flexibles[i].value + result[i].offset;

          sum += newSize;
          this.assert(flexibles[i].min <= newSize);
          this.assert(flexibles[i].max >= newSize);
        }

        if (availWidth !== sum) {
          this.assert(sum == sumMin || sum == sumMax);
        } else {
          this.assertEquals(availWidth, sum);
        }
      }
    },


    /**
     * Test whether flex distributes the value fair concerning the flex factors
     */
    testFlexFairness : function()
    {
      var numRuns = 500;

      for (var run=0; run<numRuns; run++)
      {
        var len = Math.round(Math.random() * 20) + 1;
        var sumMin = 0;
        var sumMax = 0;
        var sumValue = 0;
        var sumWeights = 0;
        var flexibles = {};

        for (var j=0; j<len; j++)
        {
          var min = 0;
          var max = 32000;
          var value = Math.round(Math.random() * 20);

          sumMax += max;
          sumMin += min;
          sumValue += value;

          flexibles[j] = {
            min: min,
            value: value,
            max: max,
            flex : 1 + Math.ceil(Math.random() * 5) // flex range from 1 .. 5
          }
          sumWeights += flexibles[j].flex;
        }

        var availWidth = sumValue + Math.round(Math.random() * 100);
        var result = qx.ui.layout.Util.computeFlexOffsets(flexibles, availWidth, sumValue);

        var offsets = 0;
        for (var i in result) {
          offsets += result[i].offset;
        }

        if (sumWeights > 0)
        {
          var unit = offsets / sumWeights;
          for (var j in result)
          {
            var error = result[j].offset - (unit * flexibles[j].flex);
            this.assertTrue(Math.abs(error) <= 1, "The error must be at most one pixel!");
          }
        }
      }
    }
  }
});
