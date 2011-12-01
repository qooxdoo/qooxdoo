/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/* ************************************************************************

#asset(twitter/*)

************************************************************************ */

/**
 * This is the main application class of your custom application "twitter"
 */
qx.Class.define("twitter.Application",
{
  extend : qx.application.Standalone,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __loginWindow : null,


    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     *
     * @lint ignoreDeprecated(alert)
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      /*
      -------------------------------------------------------------------------
        Below is your actual application code...
      -------------------------------------------------------------------------
      */


      var main = new twitter.MainWindow();
      main.moveTo(50, 30);
      main.open();

      var service = new twitter.TwitterService();

      // handler after posting a tweet
      service.addListener("postOk", function() {
        main.clearPostMessage();
        service.fetchTweets();
      }, this);

      // reload handling
      main.addListener("reload", function() {
        service.fetchTweets();
      }, this);

      // post handling
      main.addListener("post", function(e) {
        var msg = e.getData();
        service.post(msg);
      }, this);

      // setup list binding
      var list = main.getList();
      list.setItemHeight(68);
      list.setDelegate({
        createItem : function() {
          return new twitter.TweetView();
        },

        bindItem : function(controller, item, id) {
          controller.bindProperty("text", "post", null, item, id);
          controller.bindProperty("user.profile_image_url", "icon", null, item, id);
          controller.bindProperty("created_at", "time", {
            converter: function(data) {
              if (qx.core.Environment.get("browser.name") == "ie") {
                data = Date.parse(data.replace(/( \+)/, " UTC$1"));
              }
              return new Date(data);
            }
          }, item, id);
        },

        configureItem : function(item) {
          item.getChildControl("icon").setWidth(48);
          item.getChildControl("icon").setHeight(48);
          item.getChildControl("icon").setScale(true);
          item.setMinHeight(52);
        }
      });
      service.bind("tweets", list, "model", {
        converter : function(value) {
          return value || new qx.data.Array();
        }
      });

      service.fetchTweets();
    }
  }
});
