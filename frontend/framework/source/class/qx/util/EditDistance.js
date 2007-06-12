

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
    levenshteinDistance : function(data1, data2)
    {
      // distance is data1 table with data1.length+1 rows and data2.length+1 columns
      var distance = [];

      // pos1 and pos2 are used to iterate over str1 and str2
      var pos1, pos2, cost;

      for (pos1=0; pos1<=data1.length; pos1++)
      {
        distance[pos1] = [];
        distance[pos1][0] = pos1;
      }

      for (pos2=1; pos2<=data2.length; pos2++) {
        distance[0][pos2] = pos2;
      }

      for (pos1=1; pos1<=data1.length; pos1++)
      {
        for (pos2=1; pos2<=data2.length; pos2++)
        {
          cost = data1[pos1-1] === data2[pos2-1] ? 0 : 1;

          if (distance[pos1] === undefined) {
            distance[pos1] = [];
          }

          distance[pos1][pos2] = Math.min(
            distance[pos1-1][pos2  ] + 1,     // deletion
            distance[pos1  ][pos2-1] + 1,     // insertion
            distance[pos1-1][pos2-1] + cost   // substitution
          );
        }
      }

      return distance;
    },


    computeEditOperations : function(distance, data1, data2, pos1, pos2)
    {
      if (pos1 == 0 && pos2 == 0) {
        return;
      }

      if (pos1 != 0 && distance[pos1][pos2] == distance[pos1-1][pos2] + 1) {
        console.log("loesche " + data1[pos1-1] + ": " + (pos1-1));
        editOperations(distance, data1, data2, pos1-1, pos2);
      } else if (pos2 != 0 && distance[pos1][pos2] == distance[pos1][pos2-1] + 1) {
        console.log("fuege " + data2[pos2-1] + " ein, in: " + (pos1));
        editOperations(distance, data1, data2, pos1, pos2-1);
      } else if (data1[pos1-1]!==data2[pos2-1]) {
        console.log("ersetze " + data1[pos1-1] + " durch " + data2[pos2-1] + ".");
        editOperations(distance, data1, data2, pos1-1, pos2-1)
      } else {
        editOperations(distance, data1, data2, pos1-1, pos2-1)
      }
    }
  }
});
