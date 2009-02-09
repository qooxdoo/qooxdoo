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
      this.getRoot().add(list, {left: 10, top: 80});
      list.setWidth(300);
      
      // create the controller
      var controller = new qx.data.controller.List(null, list);

      // set the name for the label property
      controller.setLabelPath("text");
      // set the name for the icon property
      controller.setIconPath("user.profile_image_url");

      var url = "http://twitter.com/statuses/user_timeline/wittemann.json";
      var store = new demobrowser.demo.data.store.TwitterStore(url);
      
      // connect the store and the controller
      store.bind("model", controller, "model");
      
      
      // details for the current selected tweet
      var detailsBox = new qx.ui.groupbox.GroupBox("Details");
      this.getRoot().add(detailsBox, {left: 320, top: 60});
      detailsBox.setWidth(300);
      detailsBox.setHeight(220);
      
      detailsBox.setLayout(new qx.ui.layout.Grid());
      
      detailsBox.add(new qx.ui.basic.Label("Name: "), {row: 0, column: 0});
      detailsBox.add(new qx.ui.basic.Label("Location: "), {row: 1, column: 0});
      detailsBox.add(new qx.ui.basic.Label("Message: "), {row: 2, column: 0});
      detailsBox.add(new qx.ui.basic.Label("Postet with: "), {row: 3, column: 0});
      detailsBox.add(new qx.ui.basic.Label("Avatar: "), {row: 4, column: 0});   
      
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
      var avatar = new qx.ui.basic.Image();
      detailsBox.add(avatar, {row: 4, column: 1});
      
      // create the controller for the detail view
      var detailsController = new qx.data.controller.Object();
      detailsController.addTarget(name, "content", "user.name");
      detailsController.addTarget(location, "content", "user.location");
      detailsController.addTarget(message, "content", "text");
      detailsController.addTarget(posted, "content", "source");
      detailsController.addTarget(avatar, "source", "user.profile_image_url");
      // connect thze selected model item of the list to the detail view
      controller.bind("selection[0]", detailsController, "model");
      
      
      
      

      /* ***********************************************
       * DESCRIPTIONS
       * ********************************************* */  
      var description = new qx.ui.basic.Label();
      description.setRich(true);
      description.setWidth(260);
      description.setContent(
        "<b>Twitter messages from Martin Wittemann</b><br/>"
        + "Created a twitter store which fetches the last 20 posts of "
        + "<a href='http://twitter.com/wittemann' target='_blank'>@wittemann</a>."
      );
      this.getRoot().add(description, {left: 10, top: 10});   
            
    }
  }
});
