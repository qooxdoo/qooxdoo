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
        console.log("lösche " + data1[pos1-1] + ": " + (pos1-1));
        editOperations(distance, data1, data2, pos1-1, pos2);
      } else if (pos2 != 0 && distance[pos1][pos2] == distance[pos1][pos2-1] + 1) {
        console.log("füge " + data2[pos2-1] + " ein, in: " + (pos1));
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
