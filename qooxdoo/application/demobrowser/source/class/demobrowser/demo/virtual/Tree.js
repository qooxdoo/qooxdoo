/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

qx.Class.define("demobrowser.demo.virtual.Tree",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var tree = this.getTree();
      this.getRoot().add(tree, {top: 20, left: 20});
    },


    getTree : function()
    {
      var junk = [];
      for (var i = 0; i < 30; i++) {
        junk.push(new demobrowser.demo.virtual.model.File("Junk #" + i));
      }
      
      var model = new demobrowser.demo.virtual.model.Folder(
        "root",
        [
          new demobrowser.demo.virtual.model.Folder(
            "Desktop",
            [
              new demobrowser.demo.virtual.model.Folder("Files"),
              new demobrowser.demo.virtual.model.Folder("Workspace", 
                [
                  new demobrowser.demo.virtual.model.File("Windows (C:)"),
                  new demobrowser.demo.virtual.model.File("Documents (D:)")
                ]
              ),
              new demobrowser.demo.virtual.model.Folder("Network"),
              new demobrowser.demo.virtual.model.Folder("Trash")
            ]
          ),
          new demobrowser.demo.virtual.model.Folder(
            "Inbox",
            [
              new demobrowser.demo.virtual.model.Folder("Presets"),
              new demobrowser.demo.virtual.model.Folder("Sent"),
              new demobrowser.demo.virtual.model.Folder("Trash", junk),
              new demobrowser.demo.virtual.model.Folder("Data"),
              new demobrowser.demo.virtual.model.Folder("Edit")
            ]
          )
        ]
      );
      
      var tree = new qx.ui.tree.VirtualTree(model).set({
        width : 200,
        height : 400
      });

      // Opens the 'Desktop' node
      tree.openNode(model.children[0]);

      return tree;
    },


    createModel : function()
    {
    }
  }
});
