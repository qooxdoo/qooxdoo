/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)
     * Hugh Gibson

************************************************************************ */

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
    },


    /**
     * Allocated objects and lists all objects, which have been newly created
     * since the last call of this function.
     *
     * @type static
     * @return {String} summary of allocated objects.
     */
    getNewObjects : function()
    {
      var vData = {};
      var vCounter = 0;
      var vObject;
      var vDb = qx.core.Object.getDb();
      var mHashCode = {};
      var ar;

      for (var i=vDb.length - 1; i>=0; i--)
      {
        vObject = vDb[i];

        if (vObject && vObject.__disposed === false)
        {
          var sClassName = vObject.classname;
          if (vData[sClassName] == null) {
            vData[sClassName] = 1;
          } else {
            vData[sClassName]++;
          }
          ar = mHashCode[sClassName];
          if (ar == null) {
            ar = mHashCode[sClassName] = new Array();
          }
          ar[ar.length] = vObject.toHashCode();
          vCounter++;
        }
      }

      if (! this._m_dObjectList) {
        this._m_dObjectList = {};
      }
      var dMore = {};
      for (var sClassName in vData)
      {
        if (!(sClassName in this._m_dObjectList)) {
          this._m_dObjectList[sClassName] = 0;
        }
        if (this._m_dObjectList[sClassName] >= 0 && this._m_dObjectList[sClassName] < vData[sClassName]) {
          dMore[sClassName] = vData[sClassName] - this._m_dObjectList[sClassName];
        }
      }

      this._m_dObjectList = vData;

      var vArrData = [];
      for (var vClassName in dMore) {
        vArrData.push({
          classname : vClassName,
          number    : dMore[vClassName],
          aHashCode : mHashCode[vClassName]
        });
      }

      vArrData.sort(function(a, b) {
        return b.number - a.number;
      });

      var vMsg = "Summary: (" + vCounter + " Objects)\r\n\r\n";
      for (var i=0; i<vArrData.length; i++)
      {
        vMsg +=
          vArrData[i].number + ": " + vArrData[i].classname +
          " (" + vArrData[i].aHashCode.join(", ") + ")\r\n";
      }
      return vMsg;
    }
  }
});
