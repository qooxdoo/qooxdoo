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
qx.Class.define("demobrowser.demo.data.SearchAsYouType", 
{
  extend : qx.application.Standalone,

  members :
  {    
    main: function()
    {
      this.base(arguments);
      
      // create some stuff for the list items
      var names = [
        "Bart", "Lisa", "Homer", "Marge", "Moe", 
        "Smithers", "Nelson", "Flanders", "Maggy", "Skinner"
      ];
      
      // create the data
      var rawData = [];
      for (var i = 0; i < 60; i++) {
        rawData.push(names[i % 10] + " " + i);
      }
      var data = new qx.data.Array(rawData);


      // create the textfield
      var textfield = new qx.ui.form.TextField();
      this.getRoot().add(textfield, {top: 70, left: 10});
      
      // create the list
      var list = new qx.ui.form.List();

      // add the widgets to the document
      this.getRoot().add(list, {left: 10, top: 100});

      // create the controller
      var controller = new qx.data.controller.List(data, list);

      // create the filter
      var filter = function(field, data) {
        return data.search(field.getValue()) != -1;
      }
      // make the search string available in filter function
      filter = qx.lang.Function.bind(filter, this, textfield);
      
      // set the filter
      controller.setFilter(filter);


      // get the timer instance
      var timer = qx.util.TimerManager.getInstance();
      var timerId = null;
      
      // make every input in the textfield update the controller
      textfield.addListener("input", function() {
        // check for the old listener
        if (timerId != null) {
          // stop the old one
          timer.stop(timerId);
          timerId = null;
        }
        // start a new listener to update the view
        timerId = timer.start(function() {
          controller.update();          
          timerId = null;
        }, 0, this, null, 200);
      }, this);





      /* ***********************************************
       * DESCRIPTIONS
       * ********************************************* */  
      // List Selection sync description
      var description = new qx.ui.basic.Label();
      description.setRich(true);
      description.setWidth(200);
      description.setContent(
        "<b>Search As You Type List</b><br/>"
        + "Type a name and the list will show only the fitting results."
      );
      this.getRoot().add(description, {left: 20, top: 10});         
    }
  }
});
