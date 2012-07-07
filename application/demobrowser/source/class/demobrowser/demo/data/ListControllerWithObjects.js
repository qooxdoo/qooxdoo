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

#asset(qx/icon/${qx.icontheme}/16/emotes/*)

************************************************************************ */

/**
 * @tag noPlayground
 * @tag databinding
 * tag delegate
 */
qx.Class.define("demobrowser.demo.data.ListControllerWithObjects",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // names
      var names = ["Max", "Jackob", "Tim", "Jack", "Dan", "Dustin", "Karl", "Jim"];
      var emotes = ["embarrassed", "kiss", "plain", "sad", "surprise", "angel"];

      // create the data
      var rawData = [];
      for (var i = 0; i < 20; i++) {
        var person = new demobrowser.demo.data.model.Person();
        person.setName(names[i % names.length]);
        person.setEmote(emotes[i % emotes.length]);
        person.setOnline(i % 3 == 0);
        rawData.push(person);
      }
      var data = new qx.data.Array(rawData);

      // create the widgets
      var list = new qx.ui.form.List();
      list.setWidth(150);

      // add the widgets to the document
      this.getRoot().add(list, {left: 10, top: 80});

      // create the options for the icon
      var iconOptions = {
        converter: function(value) {
          return "icon/16/emotes/face-" + value + ".png";
        }
      };

      // create the controller
      // 1. Parameter: The data as a qx.data.Array
      // 2. Parameter: The list widget
      // 3. Parameter: The path to the property which should be showed in the label
      var controller = new qx.data.controller.List(data, list, "name");
      controller.setIconOptions(iconOptions);
      controller.setIconPath("emote");


      // create the options for the online binding
      var colorOptions = {
        converter : function(data) {
          if (data) {
            return "green";
          } else {
            return "red";
          }
        }
      };

      // create the delegate to change the bindings
      var delegate = {
        bindItem : function(controller, item, id) {
          controller.bindDefaultProperties(item, id);
          // 1. Parameter: The property chain to the data source
          // 2. Parameter: the property name to in the target
          // 3. Parameter: the options for the binding
          // 4. Parameter: the current item (comming in as parameter)
          // 5. Parameter: the current id (comming in as parameter)
          controller.bindProperty("online", "textColor", colorOptions, item, id);
        }
      };
      controller.setDelegate(delegate);


      /* ***********************************************
       * Controlls: Do only work on the data array
       * ********************************************* */
      var makeAllHappy = new qx.ui.form.Button("Make all happy");
      makeAllHappy.setWidth(120);
      this.getRoot().add(makeAllHappy, {left: 180, top: 80});
      makeAllHappy.addListener("execute", function() {
        // go threw the data array
        for (var i = 0; i < data.length; i++) {
          var person = data.getItem(i);
          person.setEmote("smile");
        }
      }, this);

      var statusButton = new qx.ui.form.Button("Online <> Offline");
      statusButton.setWidth(120);
      this.getRoot().add(statusButton, {left: 180, top: 115});
      statusButton.addListener("execute", function() {
        for (var i = 0; i < data.length; i++) {
          data.getItem(i).toggleOnline();
        }
      }, this);

      var logDataButton = new qx.ui.form.Button("Write data to log");
      logDataButton.setWidth(120);
      this.getRoot().add(logDataButton, {left: 180, top: 150});
      logDataButton.addListener("execute", function() {
        // open the console
        qx.log.appender.Console.show();
        // log the data
        this.info(data.toString());
      }, this);










       /* ***********************************************
        * DESCRIPTIONS
        * ********************************************* */
       // List Selection sync description
       var syncListDescription = new qx.ui.basic.Label();
       syncListDescription.setRich(true);
       syncListDescription.setWidth(600);
       syncListDescription.setValue(
         "<b>Displaying objects in a list</b><br/>"
         + "This list display a set of persons in a list. Every person does "
         + "have a name and an emotion, which is displayed with the help of "
         + " a converter by the icon. The font color shows the online status."
       );
       this.getRoot().add(syncListDescription, {left: 10, top: 10});
    }
  }
});
