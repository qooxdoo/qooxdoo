/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * @tag noPlayground
 * @tag databinding
 * @tag delegate
 */
qx.Class.define("demobrowser.demo.data.ExtendedTree",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var colors = ["red", "blue", "green", "black", "gray", "yellow"];

      // create the data
      var nodes = [];
      for (var i = 0; i < 50; i++) {
        nodes[i] = new demobrowser.demo.data.model.Node();
        nodes[i].setName("Item " + i);
        nodes[i].setColor(colors[i % 6]);
        // if its not the root node
        if (i != 0) {
          // add the children in some random order
          nodes[parseInt(Math.random() * i)].getChildren().push(nodes[i]);
        }
      }


      // create the tree
      var tree = new qx.ui.tree.Tree();
      this.getRoot().add(tree, {left: 10, top: 80});
      tree.setWidth(250);
      tree.setHeight(300);

      // bind the widget to the data with the controller
      var treeController = new qx.data.controller.Tree(nodes[0], tree, "children");
      treeController.setDelegate({
        bindItem : function(controller, item, id) {
          controller.bindProperty("name", "label", null, item, id);
          controller.bindProperty("color", "textColor", null, item, id);
        }
      });

      // open the root node
      tree.getRoot().setOpen(true);




      /* ***********************************************
       * Controlls: Do only work on the data array
       * ********************************************* */
      var colorButton = new qx.ui.form.Button("all boring black");
      colorButton.setWidth(120);
      this.getRoot().add(colorButton, {left: 280, top: 80});
      colorButton.addListener("execute", function() {
        for (var i = 0; i < nodes.length; i++) {
          nodes[i].setColor("black");
        }
      }, this);

      var logDataButton = new qx.ui.form.Button("Write data to log");
      logDataButton.setWidth(120);
      this.getRoot().add(logDataButton, {left: 280, top: 115});
      logDataButton.addListener("execute", function() {
        // push the data in the consoleListController.html
        this.info(nodes[0].toString());
      }, this);






      /* ***********************************************
       * DESCRIPTIONS
       * ********************************************* */
      var description = new qx.ui.basic.Label();
      description.setRich(true);
      description.setWidth(300);
      description.setValue(
        "<b>A tree configures with bindItem</b><br/>"
        + "The tree has bound its label to the name of the modeln and its "
        + "textColor to some random colors."
      );
      this.getRoot().add(description, {left: 10, top: 10});
    }
  }
});
