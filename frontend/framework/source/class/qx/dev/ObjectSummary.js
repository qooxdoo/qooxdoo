qx.Class.define("qx.dev.ObjectSummary",
{
  statics:
  {
    /**
     * Summary of allocated objects
     *
     * @type static
     * @return {String} summary of allocated objects.
     */
    getInfo : function()
    {
      var vData = {};
      var vCounter = 0;
      var vObject;
      var vDb = qx.core.Object.getDb();

      for (var i=vDb.length - 1; i>=0; i--)
      {
        vObject = vDb[i];

        if (vObject && vObject.__disposed === false)
        {
          if (vData[vObject.classname] == null) {
            vData[vObject.classname] = 1;
          } else {
            vData[vObject.classname]++;
          }

          vCounter++;
        }
      }

      var vArrData = [];

      for (var vClassName in vData)
      {
        vArrData.push(
        {
          classname : vClassName,
          number    : vData[vClassName]
        });
      }

      vArrData.sort(function(a, b) {
        return b.number - a.number;
      });

      var vMsg = "Summary: (" + vCounter + " Objects)\n\n";

      for (var i=0; i<vArrData.length; i++) {
        vMsg += vArrData[i].number + ": " + vArrData[i].classname + "\n";
      }

      return vMsg;
    }
  }
});
