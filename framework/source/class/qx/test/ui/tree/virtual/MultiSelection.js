/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

qx.Class.define("qx.test.ui.tree.virtual.MultiSelection",
{
  extend : qx.test.ui.tree.virtual.AbstractTreeTest,

  members :
  {
    setUp : function()
    {
      this.base(arguments);

      this.tree.setSelectionMode("multi");
    },

    testSelection : function()
    {
      var root = this.createModelAndSetModel(2);
      var selection = this.tree.getSelection();
      selection.push(root);
      selection.push(root.getChildren().getItem(0));
      selection.push(root.getChildren().getItem(1));

      // check selection on tree
      this.assertEquals(3, this.tree.getSelection().getLength(), "On Tree");
      var expectedSelection = new qx.data.Array(
      [
        root,
        root.getChildren().getItem(0),
        root.getChildren().getItem(1)
      ]);
      this.assertDataArrayEquals(selection, expectedSelection, "On Tree");
      expectedSelection.dispose();

      // check selection on manager
      var selectionFromManager = this.tree._manager.getSelection();
      for (var i = 0; i < selectionFromManager.length; i++) {
        selectionFromManager[i] = this.tree._getDataFromRow(selectionFromManager[i]);
      }
      this.assertEquals(3, selectionFromManager.length, "On selection manager");
      expectedSelection = new qx.data.Array(selectionFromManager);
      this.assertDataArrayEquals(selection, expectedSelection, "On selection manager");
      expectedSelection.dispose();
    },

    testSelectionByUserInteraction : function()
    {
      var root = this.createModelAndSetModel(2);
      var selection = this.tree.getSelection();
      this.tree._manager.replaceSelection([1, 3, 5]);

      // check selection on manager
      var selectionFromManager = this.tree._manager.getSelection();
      for (var i = 0; i < selectionFromManager.length; i++) {
        selectionFromManager[i] = this.tree._getDataFromRow(selectionFromManager[i]);
      }
      this.assertEquals(3, selectionFromManager.length, "On selection manager");
      var expectedSelection = new qx.data.Array(selectionFromManager);
      this.assertTrue(selection.equals(expectedSelection), "On selection manager");
      expectedSelection.dispose();

      // check selection on tree
      expectedSelection = new qx.data.Array(
      [
        root.getChildren().getItem(0),
        root.getChildren().getItem(2),
        root.getChildren().getItem(4)
      ]);
      this.assertEquals(3, selection.getLength(), "On Tree");
      this.assertDataArrayEquals(selection, expectedSelection, "On Tree");
      expectedSelection.dispose();
    },

    testSelectionEventByUserInteraction : function()
    {
      var root = this.createModelAndSetModel(2);
      var selection = this.tree.getSelection();

      var self = this;
      this.assertEventFired(selection, "change",
        function()
        {
          self.tree._manager.replaceSelection([1, 3, 5]);
        },
        function(e)
        {
          // check selection on manager
          var selectionFromManager = self.tree._manager.getSelection();
          for (var i = 0; i < selectionFromManager.length; i++) {
            selectionFromManager[i] = self.tree._getDataFromRow(selectionFromManager[i]);
          }
          self.assertEquals(3, selectionFromManager.length, "On selection manager");
          var expectedSelection = new qx.data.Array(selectionFromManager);
          self.assertDataArrayEquals(selection, expectedSelection, "On selection manager");
          expectedSelection.dispose();

          // check selection on tree
          self.assertEquals(3, selection.getLength(), "On Tree");
          expectedSelection = new qx.data.Array(
          [
            root.getChildren().getItem(0),
            root.getChildren().getItem(2),
            root.getChildren().getItem(4)
          ]);
          self.assertDataArrayEquals(selection, expectedSelection, "On Tree");
          expectedSelection.dispose();
        }
      );
    },

    testSelectionAfterCloseParentNode : function()
    {
      var root = this.createModelAndSetModel(3);

      var parent = root.getChildren().getItem(1);
      this.tree.openNode(root.getChildren().getItem(1));

      var selection = this.tree.getSelection();
      selection.push(root);
      selection.push(root.getChildren().getItem(0));
      selection.push(parent.getChildren().getItem(1));
      selection.push(parent.getChildren().getItem(3));
      selection.push(parent.getChildren().getItem(5));
      selection.push(parent.getChildren().getItem(6));
      selection.push(root.getChildren().getItem(2));

      // check selection before close parent
      this.assertEquals(7, this.tree.getSelection().getLength(), "On Tree");
      this.assertEquals(7, this.tree._manager.getSelection().length, "On selection manager");

      this.tree.closeNode(parent);

      // check selection on tree
      this.assertEquals(3, this.tree.getSelection().getLength(), "On Tree");
      var expectedSelection = new qx.data.Array(
      [
        root,
        root.getChildren().getItem(0),
        root.getChildren().getItem(2)
      ]);
      this.assertDataArrayEquals(selection, expectedSelection, "On Tree");
      expectedSelection.dispose();

      // check selection on manager
      var selectionFromManager = this.tree._manager.getSelection();
      for (var i = 0; i < selectionFromManager.length; i++) {
        selectionFromManager[i] = this.tree._getDataFromRow(selectionFromManager[i]);
      }
      this.assertEquals(3, selectionFromManager.length, "On selection manager");
      expectedSelection = new qx.data.Array(selectionFromManager);
      this.assertDataArrayEquals(selection, expectedSelection, "On selection manager");
      expectedSelection.dispose();
    }
  }
});
