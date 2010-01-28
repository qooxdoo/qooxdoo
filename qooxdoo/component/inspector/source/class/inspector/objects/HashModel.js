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
qx.Class.define("inspector.objects.HashModel",
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
      var data = [];
      for (var hash in objects) {
        data.push([hash, objects[hash].classname]);
      }

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
      return ["Hash", "Classname"];
    },


    getName: function() {
      return "by Hash";
    },


    selectionEnabled: function() {
      return true;
    }
  }
});
