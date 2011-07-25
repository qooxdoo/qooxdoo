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

      // create and add the list
      var list = new qx.ui.form.List();
      this.getRoot().add(list, {left: 10, top: 80});

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

      this.getRoot().add(item, {left: 120, top: 80});
      this.getRoot().add(addButton, {left: 220, top: 79});
      this.getRoot().add(removeButton, {left: 220, top: 110});

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
      description.setWidth(260);
      description.setValue(
        "<b>Offline data store</b><br/>"
        + "The added data will be keept on reload. Just add or remove strings "
        + "and reload to see the result."
      );
      this.getRoot().add(description, {left: 10, top: 10});
    }
  }
});