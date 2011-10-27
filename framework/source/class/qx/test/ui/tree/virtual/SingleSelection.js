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
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

qx.Class.define("qx.test.ui.tree.virtual.SingleSelection",
{
  extend : qx.test.ui.tree.virtual.AbstractTreeTest,

  members :
  {
    testSelection : function()
    {
      var root = this.createModelAndSetModel(2);
      var selection = this.tree.getSelection();
      selection.push(root);

      // check selection from list
      this.assertEquals(1, this.tree.getSelection().getLength(), "On Tree");
      this.assertEquals(root, selection.getItem(0), "On Tree");

      // check selection from manager
      var row = this.tree._manager.getSelectedItem();
      this.assertEquals(0, row);
    },


    testInvalidSelection : function()
    {
      var root = this.createModelAndSetModel(2);
      var selection = this.tree.getSelection();
      selection.push(root);
      selection.push(root.getChildren().getItem(0));

      // check selection from list
      this.assertEquals(1, this.tree.getSelection().getLength(), "On Tree");
      this.assertEquals(root.getChildren().getItem(0), selection.getItem(0), "On Tree");

      // check selection from manager
      var selection = this.tree._manager.getSelection();
      this.assertEquals(1, selection.length);
      this.assertEquals(1, selection[0]);
    },


    testSelectionByUserInteraction : function()
    {
      var root = this.createModelAndSetModel(2);
      var selection = this.tree.getSelection();

      this.tree._manager.selectItem(2);

      this.assertEquals(1, selection.getLength());
      this.assertEquals(root.getChildren().getItem(1), selection.getItem(0));
      this.assertEquals(2, this.tree._manager.getSelectedItem());
    },


    testSelectionEventByUserInteraction : function()
    {
      var root = this.createModelAndSetModel(2);
      var selection = this.tree.getSelection();

      var that = this;
      this.assertEventFired(selection, "change",
        function() {
          that.tree._manager.selectItem(2);
        },
        function(e)
        {
          that.assertEquals(1, selection.getLength());
          that.assertEquals(root.getChildren().getItem(1), selection.getItem(0));
          that.assertEquals(2, that.tree._manager.getSelectedItem());
        }
      );
    },


    testSelectionWithClosedNode : function()
    {
      var root = this.createModelAndSetModel(2);
      var selection = this.tree.getSelection();

      var parent = root.getChildren().getItem(0);
      var itemToSelect = parent.getChildren().getItem(2);
      this.tree.openNode(parent);
      selection.push(itemToSelect);

      // check selection from tree
      this.assertEquals(1, selection.getLength(), "On Tree");
      this.assertEquals(itemToSelect, selection.getItem(0), "On Tree");

      // check selection from manager
      var selectionOnManager = this.tree._manager.getSelection();
      this.assertEquals(1, selectionOnManager.length);
      this.assertEquals(this.tree.getLookupTable().indexOf(itemToSelect), selectionOnManager[0]);

      this.tree.closeNode(parent);
      var selectionOnManager = this.tree._manager.getSelection();
      this.assertEquals(0, selection.getLength(), "Selection not reset on Tree");
      this.assertEquals(0, selectionOnManager.length, "Selection not reset on manager");
    },


    testRemoveItem : function()
    {
      var root = this.createModelAndSetModel(2);
      var selection = this.tree.getSelection();

      var parent = root.getChildren().getItem(0);
      var itemToSelect = parent.getChildren().getItem(2);
      this.tree.openNode(parent);
      selection.push(itemToSelect);

      // check selection from tree before remove item
      this.assertEquals(1, selection.getLength(), "On Tree (setup)");
      this.assertEquals(itemToSelect, selection.getItem(0), "On Tree (setup)");

      // remove selected item
      parent.getChildren().removeAt(2).dispose();

      // check selection from list
      this.assertEquals(0, selection.getLength(), "On Tree");

      // check selection from manager
      var selectionOnManager = this.tree._manager.getSelection();
      this.assertEquals(0, selectionOnManager.length, "On Manager");
    }
  }
});
