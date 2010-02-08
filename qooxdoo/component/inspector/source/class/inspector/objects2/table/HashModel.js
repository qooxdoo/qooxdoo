/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Christian Schmidt (chris_schmidt)

************************************************************************ */
qx.Class.define("inspector.objects2.table.HashModel",
{
  extend : inspector.objects2.table.AbstractModel,


  construct : function(model)
  {
    this.base(arguments, model, ["Hash", "Classname"]);
  },

  members :
  {
    _getData : function()
    {
      var objects = this.__model.getObjects();
      var data = [];
      for (var i = 0; i < objects.length; i++) {
        var object = objects[i];
        data.push([object.toHashCode(), object.classname]);
      }

      return data;
    }
  }
});
