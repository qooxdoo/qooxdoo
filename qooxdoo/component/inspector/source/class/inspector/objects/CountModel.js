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
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("inspector.objects.CountModel",
{
  extend : qx.core.Object,


  construct : function()
  {
    this.base(arguments);
  },

  members :
  {
    getData: function(win) {
      // get a copy of the objects db
      var objects = win.qx.core.ObjectRegistry.getRegistry();
      var tempData = {};
      for (var hash in objects) {
        if (tempData[objects[hash].classname] == undefined) {
          tempData[objects[hash].classname] = 0;
        }
        tempData[objects[hash].classname]++;
      }

      var data = [];
      for (var classname in tempData) {
        data.push([tempData[classname], classname]);
      }

      data.sort(function(a, b) {
        return a[0] < b[0];
      });

      // get all components of the inspector application
      var components = qx.core.Init.getApplication().getExcludes();

      for (var i = data.length -1; i >= 0; i--) {
        for (var j = 0; j < components.length; j++) {
          if (data[i][0] === components[j].toHashCode()) {
            data.splice(i, 1);
          }
        }
      }

      return data;
    },


    getColumns: function() {
      return ["Count", "Classname"];
    },


    getName: function() {
      return "by Count";
    },


    selectionEnabled: function() {
      return false;
    }
  }
});
