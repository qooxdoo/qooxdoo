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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("showcase.page.databinding.Content",
{
  extend : showcase.AbstractContent,
  
  construct : function(page) {
    this.base(arguments, page);
    
    this.setView(this.__createView());
  },
    
  
  members :
  {
    __createView : function() 
    {
      var view = new qx.ui.container.Composite(new qx.ui.layout.Canvas());

      var logo = new qx.ui.basic.Image("showcase/databinding/twitter_logo_outline.png");
      view.add(logo, {left: 10, top: 15});
      
      // create and add the list
      var list = new qx.ui.form.List();
      view.add(list, {left: 10, top: 135, bottom: 5});
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
      var url = "http://twitter.com/statuses/user_timeline/1and1.json";
      var store = new qx.data.store.Jsonp(url, null, "callback");

      // connect the store and the controller
      store.bind("model", controller, "model");



      /* ***********************************************
       * CONTROLS
       * ********************************************* */
       var controlsBox = new qx.ui.container.Composite(new qx.ui.layout.HBox(5));
       controlsBox.set({
         width: 300
       });
       var friendsButton = new qx.ui.form.Button("Friends");
       controlsBox.add(friendsButton);
       friendsButton.addListener("execute", function() {
         store.setUrl("http://twitter.com/statuses/friends_timeline.json");
       }, this);

       controlsBox.add(new qx.ui.core.Spacer(), {flex: 1});

       // create the user textfield and button
       var userName = new qx.ui.form.TextField("1and1");
       userName.setPlaceholder("username");
       controlsBox.add(userName);
       var userButton = new qx.ui.form.Button("Show");
       controlsBox.add(userButton);
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
       view.add(controlsBox, {left: 10, top: 105});
       


      /* ***********************************************
       * DETAIL VIEW
       * ********************************************* */
      // details for the current selected tweet
      var detailsBox = new qx.ui.groupbox.GroupBox("Details");
      view.add(detailsBox, {left: 320, top: 116, bottom: 5});
      detailsBox.setWidth(270);
      detailsBox.setHeight(220);
      detailsBox.setAllowGrowY(false);

      detailsBox.setLayout(new qx.ui.layout.Grid(0, 5));

      detailsBox.add(new qx.ui.basic.Label("Name: "), {row: 0, column: 0});
      detailsBox.add(new qx.ui.basic.Label("Location: "), {row: 1, column: 0});
      detailsBox.add(new qx.ui.basic.Label("Message: "), {row: 2, column: 0});
      detailsBox.add(new qx.ui.basic.Label("Posted with: "), {row: 3, column: 0});

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
      
      return view;
    },
    
    
    configureItem: function(item) {
      item.setRich(true);
      item.getChildControl("icon").setWidth(50);
      item.getChildControl("icon").setHeight(50);
      item.getChildControl("icon").setScale(true);
    }    
  }
});