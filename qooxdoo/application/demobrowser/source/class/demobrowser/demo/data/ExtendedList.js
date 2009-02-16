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

qx.Class.define("demobrowser.demo.data.ExtendedList", 
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
      
      // create the controller
      var controller = new qx.data.controller.List(null, list);
      
      // create the delegate to change the bindings
      var delegate = {
        configureItem : function(item) {
          item.setPadding(3);
        },
        createItem : function() {
          return new qx.ui.form.CheckBox();
        },
        bindItem : function(item, index) {
          this._bindProperty("name", "label", null, item, index);       
          this._bindProperty("online", "checked", null, item, index);          
        }
      };
      controller.setDelegate(delegate);
      
      controller.setModel(data);
      
      
      
      
      /* ***********************************************
       * Controlls: Do only work on the data array
       * ********************************************* */    
      var statusButton = new qx.ui.form.Button("Online <> Offline");
      statusButton.setWidth(120);
      this.getRoot().add(statusButton, {left: 180, top: 80});
      statusButton.addListener("execute", function() {
        for (var i = 0; i < data.length; i++) {
          data.getItem(i).toggleOnline();
        }
      }, this);      
      
      var logDataButton = new qx.ui.form.Button("Write data to log");
      logDataButton.setWidth(120);
      this.getRoot().add(logDataButton, {left: 180, top: 115});
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
       syncListDescription.setWidth(410);
       syncListDescription.setContent(
         "<b>Displaying objects in a list</b><br/>"
         + "This list display a set of persons in a list. Every person does "
         + "have a name and an emotion, which is displayed with the help of " 
         + " a converter by the icon. The font color shows the online status."
       );
       this.getRoot().add(syncListDescription, {left: 20, top: 10});        
    }
  }
});
