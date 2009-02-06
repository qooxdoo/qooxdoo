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
      list.setWidth(800);
      
      // create the controller
      var controller = new qx.data.controller.List(null, list);
      // set the name for the label property
      controller.setLabelPath("text");
      controller.setIconPath("user.profile_image_url");

      var url = "http://twitter.com/statuses/user_timeline/wittemann.json";
      store = new demobrowser.demo.data.store.TwitterStore(url);
      
      // connect the store and the controller
      store.bind("model", controller, "model");
      
      
      


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
