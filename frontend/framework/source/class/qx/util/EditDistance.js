

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Class to implement different edit distance ideas.
 *
 * {@link http://en.wikipedia.org/wiki/Edit_distance}
 * {@link http://en.wikipedia.org/wiki/Levenshtein_distance}
 * {@link http://ad.informatik.uni-freiburg.de/lehre/ws9900/algorithmentheorie/vorlesung/folien/dynamische-programmierung-2/dynamische-programmierung-2.pdf}
 */
qx.Class.define("qx.util.EditDistance",
{
  statics :
  {
    OPERATION_DELETE : 1,
    OPERATION_INSERT : 2,
    OPERATION_REPLACE : 3,

    computeLevenshteinDistance : function(dataA, dataB)
    {
      // distance is dataA table with dataA.length+1 rows and dataB.length+1 columns
      var distance = [];

      // posA and posB are used to iterate over str1 and str2
      var posA, posB, cost;

      for (posA=0; posA<=dataA.length; posA++)
      {
        distance[posA] = [];
        distance[posA][0] = posA;
      }

      for (posB=1; posB<=dataB.length; posB++) {
        distance[0][posB] = posB;
      }

      for (posA=1; posA<=dataA.length; posA++)
      {
        for (posB=1; posB<=dataB.length; posB++)
        {
          cost = dataA[posA-1] === dataB[posB-1] ? 0 : 1;

          if (distance[posA] === undefined) {
            distance[posA] = [];
          }

          distance[posA][posB] = Math.min(
            distance[posA-1][posB  ] + 1,     // deletion
            distance[posA  ][posB-1] + 1,     // insertion
            distance[posA-1][posB-1] + cost   // substitution
          );
        }
      }

      return distance;
    },


    computeEditOperations : function(distance, dataA, dataB)
    {
      var jobs = [];
      var posA = dataA.length;
      var posB = dataB.length;

      if (posA===0)
      {
        // insert from begin to end
        // reverted order than in all other cases for optimal performance
        for (var i=0; i<posB; i++) {
          jobs.push({ operation : this.OPERATION_INSERT, pos : i, old : null, value : dataB[i] });
        }

        return jobs;
      }

      if (posB===0)
      {
        // remove from end to begin
        for (var i=posA-1; i>=0; i--) {
          jobs.push({ operation : this.OPERATION_DELETE, pos : i, old : dataA[i], value : null });
        }

        return jobs;
      }

      while(posA !== 0 || posB !== 0)
      {
        if (posA != 0 && distance[posA][posB] == distance[posA-1][posB] + 1)
        {
          // console.log("delete " + dataA[posA-1] + ": " + (posA-1));
          jobs.push({ operation : this.OPERATION_DELETE, pos : posA-1, old : dataA[posA-1], value : null });

          posA-=1;
        }
        else if (posB != 0 && distance[posA][posB] == distance[posA][posB-1] + 1)
        {
          // console.log("insert " + dataB[posB-1] + " ein, in: " + (posA));
          jobs.push({ operation : this.OPERATION_INSERT, pos : posA, old : null, value : dataB[posB-1] });

          posB-=1;
        }
        else
        {
          if (dataA[posA-1]!==dataB[posB-1])
          {
            // console.log("replace " + dataA[posA-1] + " durch " + dataB[posB-1] + ".");
            jobs.push({ operation : this.OPERATION_REPLACE, pos : posA-1, old : dataA[posA-1], value : dataB[posB-1] });
          }

          posA-=1;
          posB-=1;
        }
      }

      return jobs;
    },


    getEditOperations : function(dataA, dataB)
    {
      var distance = this.computeLevenshteinDistance(dataA, dataB);
      var oper = this.computeEditOperations(distance, dataA, dataB);

      return oper;
    },


    testString : function(strA, strB)
    {
      var oper = this.getEditOperations(strA, strB);

      arr = qx.lang.String.splitCharacters(strA);

      for (var i=0; i<oper.length; i++)
      {
        job = oper[i];

        switch(job.operation)
        {
          case this.OPERATION_DELETE:
            qx.lang.Array.removeAt(arr, job.pos);
            break;

          case this.OPERATION_REPLACE:
            arr[job.pos] = job.value;
            break;

          case this.OPERATION_INSERT:
            qx.lang.Array.insertAt(arr, job.value, job.pos);
            break;
        }
      }

      result = arr.join("");

      if (result !== strB) {
        return console.error("Implementation could not transform: " + strA + " to " + strB + "! Result was: " + result);
      }

      console.debug("Successfully transformed: " + strA + " to " + strB + ".");
    }
  }
});
