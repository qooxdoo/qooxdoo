/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

qx.Class.define("qx.test.ui.selection.TreeMultiSelection",
{
  extend : qx.test.ui.selection.AbstractMultiSelectonTest,

  members :
  {
    setUp : function()
    {
      var length = 10;
      this._selection = [];
      this._notInSelection = [];
      this._mode = "multi";

      this._widget = new qx.ui.tree.Tree().set(
      {
        selectionMode: this._mode,
        width : 200,
        height : 400
      });
      this.getRoot().add(this._widget);

      var root = new qx.ui.tree.TreeFolder("Root");
      root.setOpen(true);
      this._widget.setRoot(root);
      this._notInSelection.push(root);

      for (var i = 0; i < length; i++) {
        var folder = new qx.ui.tree.TreeFolder("Folder" + i);
        folder.setOpen(true);
        this._notInSelection.push(folder);
        var file = new qx.ui.tree.TreeFile("File" + i);
        folder.add(file);
        root.add(folder);

        if (i % 2 == 0) {
          this._widget.addToSelection(file);
          this._selection.push(file);
        } else {
          this._notInSelection.push(file);
        }
      }

      this.flush();
    },

    tearDown : function()
    {
      this.base(arguments);
      this._widget.destroy();
      this._widget = null;
      this._selection = null;
      this._notInSelection = null;
      this.flush();
    },

    _getChildren : function()
    {
      if (this._widget != null) {
        return this._widget.getItems();
      } else {
        return [];
      }
    },

    _createTestElement : function(name) {
      return new qx.ui.tree.TreeFile(name);
    }
  }
});