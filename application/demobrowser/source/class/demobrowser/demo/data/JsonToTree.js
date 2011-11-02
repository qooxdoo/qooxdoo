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

/* ************************************************************************

#asset(demobrowser/demo/data/tree.json)
#asset(qx/icon/${qx.icontheme}/16/mimetypes/*)

************************************************************************ */

/**
 * @tag databinding
 */
qx.Class.define("demobrowser.demo.data.JsonToTree",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // create and add the tree
      var tree = new qx.ui.tree.Tree();
      this.getRoot().add(tree, {left: 10, top: 80});
      tree.setWidth(200);
      tree.setHeight(300);

      // create the controller
      var controller = new qx.data.controller.Tree(null, tree, "kids", "name");

      // create the data store
      var url = qx.util.ResourceManager.getInstance().toUri("demobrowser/demo/data/tree.json");
      var store = new qx.data.store.Json(url);

      // create the status label
      var status = new qx.ui.basic.Label("Loading...");
      this.getRoot().add(status, {left: 220, top: 80});

      // connect the store and the controller
      store.bind("model", controller, "model");

      // bind the status label
      store.bind("state", status, "value");

      // show the data in the list when loaded
      store.addListener("loaded", function(ev) {
        tree.getRoot().setOpen(true);
      }, this);





      /* ***********************************************
       * DESCRIPTIONS
       * ********************************************* */
      var description = new qx.ui.basic.Label();
      description.setRich(true);
      description.setWidth(260);
      description.setValue(
        "<b>Tree bound to data in a json file</b><br/>"
        + "Loading the json file <a href='" + url +"' target='_blank'>"
        + "tree.json</a> and bind the items to the tree widget."
      );
      this.getRoot().add(description, {left: 10, top: 10});

    }
  }
});
