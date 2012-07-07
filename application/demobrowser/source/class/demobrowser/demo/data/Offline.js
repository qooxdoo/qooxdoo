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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * @tag databinding
 */
qx.Class.define("demobrowser.demo.data.Offline",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // show a warning if html5 local storage is not supported
      if (!qx.core.Environment.get("html.storage.local")) {
        var label = new qx.ui.basic.Label("Offline storage (local) not supported.");
        this.getRoot().add(label, {left: 30, top: 30});
        return;
      }

      // content container which holds the demo in a grid
      var content = new qx.ui.container.Composite();
      var grid = new qx.ui.layout.Grid();
      grid.setSpacing(10);
      content.setLayout(grid);
      this.getRoot().add(content, {left: 10, top: 80});

      // create and add the list
      var list = new qx.ui.form.List();
      content.add(list, {row: 0, column: 0, rowSpan: 2});

      // create the controller
      var controller = new qx.data.controller.List(null, list);

      // create the offline store
      var store = new qx.data.store.Offline("qx-offline-demo");

      // check if the model needs to be initialized
      if (store.getModel() == null) {
        // create a empty model
        var model = qx.data.marshal.Json.createModel(["initial entry"]);
        store.setModel(model)
      }

      // connect the store and the controller
      store.bind("model", controller, "model");



      /* ***********************************************
       * CONTROLS
       * ********************************************* */
      var addButton = new qx.ui.form.Button("Add item");
      var removeButton = new qx.ui.form.Button("Remove item");
      var item = new qx.ui.form.TextField();
      item.setValue("item " + store.getModel().length);

      content.add(item, {row: 0, column: 1, rowSpan: 2});
      content.add(addButton, {row: 0, column: 2});
      content.add(removeButton, {row: 1, column: 2});

      // prevent growing of the buttons in the grid
      addButton.setAllowGrowY(false);
      removeButton.setAllowGrowY(false);

      // align the buttons top
      grid.setRowFlex(1, 1);

      // add handler
      addButton.addListener("execute", function() {
        store.getModel().push(item.getValue());
        item.setValue("item " + store.getModel().length);
      }, this);

      // remove handler
      removeButton.addListener("execute", function() {
        store.getModel().remove(controller.getSelection().getItem(0));
      }, this);



      /* ***********************************************
       * DESCRIPTIONS
       * ********************************************* */
      var description = new qx.ui.basic.Label();
      description.setRich(true);
      description.setWidth(300);
      description.setValue(
        "<b>Offline data store</b><br/>"
        + "The added data will be keept on reload. Just add or remove strings "
        + "and reload to see the result."
      );
      this.getRoot().add(description, {left: 10, top: 10});
    }
  }
});