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

/**
 * This page displays an input form to enter the username to show.
 */
qx.Class.define("mobiletweets.page.Input",
{
  extend : qx.ui.mobile.page.NavigationPage,

  construct : function() {
    this.base(arguments);
    this.setTitle("Twitter Client");
  },


  events : {
    /** Fired when the tweets of a user are requested */
    "requestTweet" : "qx.event.type.Data"
  },


  members : {
    __form : null,
    __input : null,

    // overridden
    _initialize : function()
    {
      this.base(arguments);

      var title = new qx.ui.mobile.form.Title("Please enter a Twitter username");
      this.getContent().add(title);

      var form = this.__form = new qx.ui.mobile.form.Form();

      var input = this.__input = new qx.ui.mobile.form.TextField();
      input.setPlaceholder("Username");
      input.setRequired(true);
      form.add(input, "Username");

      // Add the form to the content of the page, using the SinglePlaceholder to render
      // the form.
      this.getContent().add(new qx.ui.mobile.form.renderer.SinglePlaceholder(form));

      // Create a new button instance and set the title of the button to "Show"
      var button = new qx.ui.mobile.form.Button("Show");
      // Add the "tap" listener to the button
      button.addListener("tap", this._onTap, this);
      // Add the button the content of the page
      this.getContent().add(button);
    },


    /**
     * On Tap handler. Called when the user taps on the input button.
     * @param evt {qx.event.type.Data} the causing event.
     */
    _onTap : function(evt)
    {
      // validate the form
      if (this.__form.validate())
      {
        var username = this.__input.getValue();
        this.fireDataEvent("requestTweet", username);
      }
    }
  }
});