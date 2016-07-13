/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Mustafa Sak (msak)

************************************************************************ */

/**
 * @ignore(qx.test.ui.tree.virtual.Node)
 * @ignore(qx.test.ui.tree.virtual.NodeDefered)
 * @ignore(qx.test.ui.tree.virtual.Leaf)
 */
qx.Class.define("qx.test.ui.tree.virtual.TreeItem",
{
  extend : qx.test.ui.tree.virtual.AbstractTreeTest,

  construct : function()
  {
    this.base(arguments);


    qx.Class.define("qx.test.ui.tree.virtual.NodeDefered",
    {
      extend : qx.test.ui.tree.virtual.Leaf,

      properties :
      {
        children :
        {
          check : "qx.data.Array",
          event : "changeChildren",
          apply : "_applyEventPropagation",
          nullable : true
        }
      },

      destruct : function()
      {
        if (!qx.core.ObjectRegistry.inShutDown)
        {
          var children = this.getChildren();
          if (children) {
            for (var i = 0; i  < children.getLength(); i++) {
              children.getItem(i).dispose();
            }
            children.dispose();
          }
        }
      }
    });
  },


  members :
  {
    testChildrenSetDeferred : function()
    {
      var that = this;
      var root = new qx.test.ui.tree.virtual.Node("Root node");
      var node = new qx.test.ui.tree.virtual.NodeDefered("Node1");
      root.getChildren().push(node);

      this.tree.setLabelPath("name");
      this.tree.setChildProperty("children");
      this.tree.setModel(root);
      this.flush();

      window.setTimeout(that.resumeHandler(function()
      {
        // add new node
        node.setChildren(new qx.data.Array([new qx.test.ui.tree.virtual.NodeDefered("Node1.1")]));


        // check for event listener
        that.assertTrue(node.hasListener("changeChildren"),
         "There must be a 'changeChildren' event listener!");

        that.assertTrue(node.getChildren().hasListener("changeLength"),
         "There must be a 'changeLength' event listener on children array!");


        // check for open indent
        var widget = that.__getWidgetForm(node);
        that.assertTrue(widget.isOpenable(), "Must be openable!");


        // dispose and check if event listeners are removed
        root.dispose();

        that.assertFalse(node.hasListener("changeChildren"),
         "After disposing, there has not be a 'changeChildren' event listener!");

        that.assertFalse(node.getChildren().hasListener("changeLength"),
         "After disposing, there must not be a 'changeLength' event listener on children array!");
      }), 0);


      // children property not set yet
      this.assertNull(node.getChildren(), "Must be null");
      this.wait(50);
    },


    __getWidgetForm : function(modelItem)
    {
      var widget = null;
      var row = this.tree.getLookupTable().indexOf(modelItem);
      if (row > -1) {
        widget = this.tree._layer.getRenderedCellWidget(row, 0);
      }
      return widget;
    }
  }
});
