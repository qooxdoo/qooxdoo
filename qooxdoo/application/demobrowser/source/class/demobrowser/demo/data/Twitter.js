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

#tag(databinding)
#tag(list controller)
#tag(object controller)
#tag(store)

************************************************************************ */
qx.Class.define("demobrowser.demo.data.Twitter",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // create and add the list
      var list = new qx.ui.form.List();
      this.getRoot().add(list, {left: 10, top: 85});
      list.setWidth(300);

      // create the controller
      var controller = new qx.data.controller.List(null, list);
      // set the delegate
      controller.setDelegate(this);

      // set the name for the label property
      controller.setLabelPath("text");

      // set the name for the icon property
      if (!qx.core.Variant.isSet("qx.client", "mshtml")) {
        controller.setIconPath("user.profile_image_url");
      }


      // fetch some data from Twitter
      var store = new demobrowser.demo.data.store.Twitter("wittemann");

      // connect the store and the controller
      store.bind("model", controller, "model");



      /* ***********************************************
       * CONTROLS
       * ********************************************* */
       var friendsButton = new qx.ui.form.Button("Friends");
       this.getRoot().add(friendsButton, {left: 10, top: 55});
       friendsButton.addListener("execute", function() {
         store.setUrl("http://twitter.com/statuses/friends_timeline.json");
       }, this);

       // create the user textfield and button
       var userButton = new qx.ui.form.Button("User");
       this.getRoot().add(userButton, {left: 90, top: 55});
       var userName = new qx.ui.form.TextField("wittemann");
       this.getRoot().add(userName, {left: 140, top: 55});
       userButton.addListener("execute", function() {
         var url = "http://twitter.com/statuses/user_timeline/" + userName.getValue() + ".json"
         if (store.getUrl() == url) {
           store.reload();
         } else {
           store.setUrl(url);
         }
       }, this);
       userName.addListener("keydown", function(ev) {
         if (ev.getKeyIdentifier() == "Enter") {
           userButton.execute();
         }
       }, this);




      /* ***********************************************
       * DETAIL VIEW
       * ********************************************* */
      // details for the current selected tweet
      var detailsBox = new qx.ui.groupbox.GroupBox("Details");
      this.getRoot().add(detailsBox, {left: 320, top: 60});
      detailsBox.setWidth(300);
      detailsBox.setHeight(220);

      detailsBox.setLayout(new qx.ui.layout.Grid(0, 5));

      detailsBox.add(new qx.ui.basic.Label("Name: "), {row: 0, column: 0});
      detailsBox.add(new qx.ui.basic.Label("Location: "), {row: 1, column: 0});
      detailsBox.add(new qx.ui.basic.Label("Message: "), {row: 2, column: 0});
      detailsBox.add(new qx.ui.basic.Label("Postet with: "), {row: 3, column: 0});

      var name = new qx.ui.basic.Label();
      detailsBox.add(name, {row: 0, column: 1});
      var location = new qx.ui.basic.Label();
      detailsBox.add(location, {row: 1, column: 1});
      var message = new qx.ui.basic.Label();
      message.setRich(true);
      message.setWidth(150);
      detailsBox.add(message, {row: 2, column: 1});
      var posted = new qx.ui.basic.Label();
      posted.setRich(true);
      detailsBox.add(posted, {row: 3, column: 1});

      // create the controller for the detail view
      var detailsController = new qx.data.controller.Object();
      detailsController.addTarget(name, "value", "user.name");
      detailsController.addTarget(location, "value", "user.location");
      detailsController.addTarget(message, "value", "text");
      detailsController.addTarget(posted, "value", "source");
      if (!qx.core.Variant.isSet("qx.client", "mshtml")) {
        detailsBox.add(new qx.ui.basic.Label("Avatar: "), {row: 4, column: 0});
        var avatar = new qx.ui.basic.Image();
        detailsBox.add(avatar, {row: 4, column: 1});
        detailsController.addTarget(avatar, "source", "user.profile_image_url");
      }
      // connect the selected model item of the list to the detail view
      controller.bind("selection[0]", detailsController, "model");





      /* ***********************************************
       * HEADLINE
       * ********************************************* */
      var headline = new qx.ui.basic.Label();
      headline.setRich(true);
      headline.setWidth(260);
      headline.setValue(
        "<span style='font-size: 20px'>Twitter</span>"
      );
      this.getRoot().add(headline, {left: 10, top: 10});


      var tweetThis = new qx.ui.basic.Label();
      tweetThis.setRich(true);
      tweetThis.setWidth(260);
      tweetThis.setValue(
        "<span style='font-size: 13px'>" +
        "<a target='_blank' href='http://twitter.com/home?status=Check%20out%20the%20%23qooxdoo%20twitter%20demo%20at%20http://bit.ly/Mc4Of'>Tweet This</a></span>"
      );
      this.getRoot().add(tweetThis, {left: 10, top: 290});
    },


    configureItem: function(item) {
      item.setRich(true);
      item.getChildControl("icon").setWidth(50);
      item.getChildControl("icon").setHeight(50);
      item.getChildControl("icon").setScale(true);
    }
  }
});





/*
 * PLEASE NOTE:
 * For demonstration purposes the following class is added to the same file as
 * the application class. For a regular qooxdoo application each class must live
 * in a file of its own. You may neglect any warnings when generating this demo.
 */

qx.Class.define("demobrowser.demo.data.store.Twitter",
{
  extend : qx.data.store.Json,

  statics : {
    saveResult: function(result) {
      this.__result = result;
    }
  },

  construct : function(user)
  {
    var url = "http://twitter.com/statuses/user_timeline/" + user + ".json";
    this.base(arguments, url);
  },

  members :
  {
    _createRequest: function(url) {
      var loader = new qx.io2.ScriptLoader();
      url += "?callback=demobrowser.demo.data.store.Twitter.saveResult";
      loader.load(url, function(data) {
        this.__loaded();
      }, this);
    },


    __loaded: function() {
      var data = demobrowser.demo.data.store.Twitter.__result;

      if (data == undefined) {
        this.setState("failed");
        return;
      }

      // create the class
      this._marshaler.toClass(data);
      // set the initial data
      this.setModel(this._marshaler.toModel(data));

      // fire complete event
      this.fireDataEvent("loaded", this.getModel());
    }
  }
});
