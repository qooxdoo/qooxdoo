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
     * Tino Butz (tbtz)

************************************************************************ */

/* ************************************************************************

#asset(mobiletweets/css/styles.css)
#asset(qx/mobile/icon/android/*)
#asset(qx/mobile/icon/ios/*)
#asset(qx/mobile/icon/common/*)

************************************************************************ */

/**
 * This is the main application class of your custom application "mobiletweets"
 */
qx.Class.define("mobiletweets.Application",
{
  extend : qx.application.Mobile,


  properties :
  {
    /** Holds all feeds of a user */
    tweets :
    {
      check : "qx.data.Array",
      nullable : true,
      init : null,
      event : "changeTweets",
      apply : "_applyTweets" // just for logging the data
    },


    /** The current username */
    username :
    {
      check : "String",
      nullable : false,
      init : "",
      event : "changeUsername",
      apply : "_applyUsername" // this method will be called when the property is set
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __inputPage : null,

    /**
     * This method contains the initial application code and gets called
     * during startup of the application
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
        Remove or edit the following code to create your application.
      -------------------------------------------------------------------------
      */

      // Create a manager in mobile device context >> "false"
      var manager = new qx.ui.mobile.page.Manager(false);

      // Create an instance of the Input class and initial show it
      var inputPage = this.__inputPage = new mobiletweets.page.Input();

      // Add page to manager
      manager.addDetail(inputPage);

      // Display inputPage on start
      inputPage.show();

      // Create an instance of the Tweets class and establish data bindings
      var tweetsPage = new mobiletweets.page.Tweets();
      this.bind("tweets", tweetsPage, "tweets");
      this.bind("username", tweetsPage, "title");

      // Add page to manager
      manager.addDetail(tweetsPage);

      // Create an instance of the Tweet class
      var tweetPage = new mobiletweets.page.Tweet();

      // Add page to manager
      manager.addDetail(tweetPage);

      // Load the tweets and show the tweets page
      inputPage.addListener("requestTweet", function(evt) {
        this.setUsername(evt.getData());
        tweetsPage.show();
      }, this);

      // Show the selected tweet
      tweetsPage.addListener("showTweet", function(evt) {
        var index = evt.getData();
        tweetPage.setTweet(this.getTweets().getItem(index));
        tweetPage.show();
      }, this);

      // Return to the Input page
      tweetsPage.addListener("back", function(evt) {
        inputPage.show({reverse:true});
      }, this);

      // Return to the Tweets Page.
      tweetPage.addListener("back", function(evt) {
        tweetsPage.show({reverse:true});
      }, this);
    },


    // property apply
    _applyUsername : function(value, old) {
      this.__loadTweets();
    },

    _applyTweets : function(value, old) {
      // print the loaded data in the console
      this.debug("Tweets: ", qx.lang.Json.stringify(value)); // just display the data
    },


    /**
     * Loads all tweets of the currently set user.
     */
    __loadTweets : function()
    {
      // Public Twitter Tweets API
      var url = "http://twitter.com/statuses/user_timeline/" + this.getUsername() + ".json";
      // Create a new JSONP store instance with the given url
      var store = new qx.data.store.Jsonp(url);
      // Use data binding to bind the "model" property of the store to the "tweets" property
      store.bind("model", this, "tweets");

      // Some error handling
      store.addListener("error", function(evt) {
        qx.ui.mobile.dialog.Manager.getInstance().alert(
          "Error",
          "Error loading the tweets for user " + this.getUsername(),
          this.__showStartPage,
          this,
          "OK"
        );
      }, this);
    },


    /**
     * Shows the input page of the application.
     */
    __showStartPage : function() {
      this.__inputPage.show({reverse:true});
    }
  }
});
