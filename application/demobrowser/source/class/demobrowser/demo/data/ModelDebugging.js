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
#ignore(demobrowser.demo.data.store)
************************************************************************ */

/**
 * @tag databinding
 * @tag debugging
 */
qx.Class.define("demobrowser.demo.data.ModelDebugging",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // fetch some data from Twitter
      var store = new demobrowser.demo.data.store.Twitter("wittemann");

      // create an html embed to view the model
      var embed = new qx.ui.embed.Html();
      embed.setBackgroundColor("white");
      embed.setDecorator("main");
      embed.setWidth(500);
      embed.setHeight(200);
      embed.setOverflow("auto", "auto");
      this.getRoot().add(embed, {left: 10, top: 110});

      // after the data has been loaded
      store.addListener("loaded", function() {
        var model = store.getModel();
        // display the model in the log
        this.debug(qx.dev.Debug.debugProperties(model));
        // display the model in an html embed
        embed.setHtml(qx.dev.Debug.debugProperties(model, 10, true));
      }, this);







      /* ***********************************************
       * DESCRIPTIONS
       * ********************************************* */
      // List Selection sync description
      var description = new qx.ui.basic.Label();
      description.setRich(true);
      description.setWidth(500);
      description.setValue(
        "<b>Debugging models</b><br/>"
        + "Every model created by the data stores consists only of qooxdoo "
        + "objects with properties. To see the properties, you can use the "
        + "debugModel function in qx.dev.Debug."
      );
      this.getRoot().add(description, {left: 10, top: 10});
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
   extend : qx.data.store.Jsonp,

   construct : function(user)
   {
     var url = "http://twitter.com/statuses/user_timeline/" + user + ".json";
     this.base(arguments, url);
   }
 });
