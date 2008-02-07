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

qx.Class.define("testrunner.test.ui.Layout",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testFlex : function()
    {
      var numRuns = 500;

      for (var i=0; i<numRuns; i++)
      {
        var len = Math.round(Math.random() * 20) + 1;
        var flexibles = [];
        var sumWeights = 0;
        var sumPotentials = 0;
        var potentialBackup = [];
        for (var j=0; j<len; j++)
        {
          flexibles[j] = {
            id : j,
            potential : Math.round(Math.random() * 50),
            flex : Math.ceil(Math.random() * 5) // flex range from 1 .. 5
          }
          sumWeights += flexibles[j].flex;
          sumPotentials += flexibles[j].potential;
          potentialBackup[j] = flexibles[j].potential;
        }

        var sum = Math.round(Math.random() * 500);

        var partitions = qx.ui.layout.Util.computeFlexOffsets(flexibles, sum);

        var partSum = 0;
        for (var j=0; j<len; j++) {
          partSum += partitions[j];
        }

        if (sumWeights > 0)
        {
          // check sum
          if (sumPotentials <= sum) {
            this.assertEquals(sumPotentials, partSum, "The sum must not be larger than the sum of all potentials.");
          } else {
            this.assertEquals(sum, partSum, "The sum of the paritions must match the original value.");
          }

          // check restrictions
          for (var j=0; j<len; j++) {
            this.assertTrue(potentialBackup[j] >= partitions[j]);
          }
        }
      }
    },


    /**
     * Test whether flex distributes the value fair concerning the flex factors
     */
    testFlexFairness : function()
    {
      var numRuns = 500;

      for (var i=0; i<numRuns; i++)
      {
        var len = Math.round(Math.random() * 20) + 1;
        var flexibles = [];
        var sumWeights = 0;
        var sumPotentials = 0;
        var potentialBackup = [];
        for (var j=0; j<len; j++)
        {
          flexibles[j] = {
            id : j,
            potential : 32000, // unlimited
            flex : Math.ceil(Math.random() * 5) // flex range from 1 .. 5
          }
          sumWeights += flexibles[j].flex;
          potentialBackup[j] = flexibles[j].potential;
        }

        var sum = Math.round(Math.random() * 500);
        var partitions = qx.ui.layout.Util.computeFlexOffsets(flexibles, sum);

        var partSum = 0;
        for (var j=0; j<len; j++) {
          partSum += partitions[j];
        }

        if (sumWeights > 0) {
          this.assertEquals(sum, partSum, "The sum of the paritions must match the original value.");

          var unit = sum / sumWeights;
          for (var j=0; j<len; j++) {
            var error = partitions[j] - (unit * flexibles[j].flex);
            this.assertTrue(Math.abs(error) <= 1, "The error must be at most one pixel");
          }
        }
      }
    }

  }
});
