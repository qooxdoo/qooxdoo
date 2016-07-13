/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/* ************************************************************************


************************************************************************ */
/**
 *
 * @asset(qxc/application/datademo/*)
 */

qx.Class.define("qxc.application.datademo.Demo", {
  extend : qx.ui.container.Composite,

  construct : function() {
    this.base(arguments);

    this._createView();
  },

  members : {

    _createView : function()
    {
      this.setLayout(new qx.ui.layout.Canvas());

      var logo = new qx.ui.basic.Image("qxc/application/datademo/identica.png");
      this.add(logo, {left: 10, top: 15});

      // create and add the list
      var list = new qx.ui.form.List();
      this.add(list, {left: 10, top: 175, bottom: 5});
      list.set({
        selectionMode: "one",
        width: 300,
        maxHeight: 400,
        height: 300
      });

      // create the controller
      var controller = new qx.data.controller.List(null, list);
      // set the delegate
      controller.setDelegate(this);

      // set the name for the label property
      controller.setLabelPath("text");

      // set the name for the icon property
      controller.setIconPath("user.profile_image_url");

      // fetch some data from identi.ca
      var url = "qxc/application/datademo/service.js";
      var store = new qx.data.store.Jsonp();
      store.setCallbackName("callback");
      store.setUrl(url);

      // connect the store and the controller
      store.bind("model", controller, "model");

      /* ***********************************************
       * ERROR HANDLING
       * ********************************************* */
      var error = new qx.ui.basic.Label("... service unavailable!");
      error.setTextColor("invalid");
      error.hide();
      this.add(error, {left: 290, top: 145});

      // react on error
      store.addListener("error", function() {
        error.show();
        list.setEnabled(false);
        detailsBox.setEnabled(false);
      }, this);


      /* ***********************************************
       * DETAIL VIEW
       * ********************************************* */
      // details for the current selected tweet
      var detailsBox = new qx.ui.groupbox.GroupBox("Details");
      this.add(detailsBox, {left: 320, top: 156, bottom: 5});
      detailsBox.setWidth(270);
      detailsBox.setHeight(320);
      detailsBox.setAllowGrowY(false);

      detailsBox.setLayout(new qx.ui.layout.Grid(5, 5));

      detailsBox.add(new qx.ui.basic.Label("Name: "), {row: 0, column: 0});
      detailsBox.add(new qx.ui.basic.Label("Location: "), {row: 1, column: 0});
      detailsBox.add(new qx.ui.basic.Label("Message: "), {row: 2, column: 0});

      var name = new qx.ui.basic.Label();
      detailsBox.add(name, {row: 0, column: 1});
      var location = new qx.ui.basic.Label();
      detailsBox.add(location, {row: 1, column: 1});
      var message = new qx.ui.basic.Label();
      message.setRich(true);
      message.setWidth(150);
      message.setSelectable(true);
      detailsBox.add(message, {row: 2, column: 1});

      // create the controller for the detail view
      var detailsController = new qx.data.controller.Object();
      detailsController.addTarget(name, "value", "user.name");
      detailsController.addTarget(location, "value", "user.location");
      detailsController.addTarget(message, "value", "text", false, {
        converter: function(data) {
          var message = data.split(" ");
          for (var i = message.length - 1; i >= 0; i--) {
            if (message[i].indexOf("http") == 0) {
              message[i] = "<a href='" + message[i] + "' target='_blank'>" + message[i] + "</a>";
            }
          };
          return message.join(" ");
        }});
      detailsBox.add(new qx.ui.basic.Label("Avatar: "), {row: 3, column: 0});
      var avatar = new qx.ui.basic.Image();
      detailsBox.add(avatar, {row: 3, column: 1});
      detailsController.addTarget(avatar, "source", "user.profile_image_url");
      // connect the selected model item of the list to the detail view
      controller.bind("selection[0]", detailsController, "model");
    },


    configureItem: function(item) {
      item.setRich(true);
      item.getChildControl("icon").setWidth(48);
      item.getChildControl("icon").setHeight(48);
      item.getChildControl("icon").setScale(true);
    }
  }
});
