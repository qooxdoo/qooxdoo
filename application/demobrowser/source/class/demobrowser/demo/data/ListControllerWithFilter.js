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

/**
 * @tag databinding
 * @tag filter
 */
qx.Class.define("demobrowser.demo.data.ListControllerWithFilter",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // create the data
      var rawData = [];
      for (var i = 0; i < 8; i++) {
        rawData.push(i);
      }
      var data = new qx.data.Array(rawData);

      // create the widgets
      var list = new qx.ui.form.List();

      // add the widgets to the document
      this.getRoot().add(list, {left: 10, top: 80});



      // create the controller
      var controller = new qx.data.controller.List(data, list);

      // create the delegates for the filter
      var delegateOdd = {};
      delegateOdd.filter = function(data) {
        return parseInt(data) % 2 == 1;
      };
      var delegateEven = {};
      delegateEven.filter = function(data) {
        return parseInt(data) % 2 == 0;
      };

      var filterNameLabel = new qx.ui.basic.Label("init");
      this.getRoot().add(filterNameLabel, {left: 10, top: 290});
      var options = {
        converter: function(data) {
          if (data == delegateEven) {
            return "Show only even numbers."
          } else if (data == delegateOdd) {
            return "Show only odd numbers."
          }
          return "Show all numbers."
        }
      };
      controller.bind("delegate", filterNameLabel, "value", options);





      /* ***********************************************
       * Controlls: Do only work on the data array
       * ********************************************* */
      var addItemButton = new qx.ui.form.Button("Add an item");
      addItemButton.setWidth(120);
      this.getRoot().add(addItemButton, {left: 130, top: 80});
      addItemButton.addListener("execute", function() {
        data.push(data.length);
      }, this);

      var removeItemButton = new qx.ui.form.Button("Remove an item");
      removeItemButton.setWidth(120);
      this.getRoot().add(removeItemButton, {left: 130, top: 115});
      removeItemButton.addListener("execute", function() {
        data.pop();
      }, this);

      var logDataButton = new qx.ui.form.Button("Write data to log");
      logDataButton.setWidth(120);
      this.getRoot().add(logDataButton, {left: 130, top: 150});
      logDataButton.addListener("execute", function() {
        // open the console
        qx.log.appender.Console.show();
        // push the data in the console
        this.info(data.toString());
      }, this);

      var changeFilterButton = new qx.ui.form.Button("Odd / Even filter");
      changeFilterButton.setWidth(120);
      this.getRoot().add(changeFilterButton, {left: 130, top: 185});
      changeFilterButton.addListener("execute", function() {
        controller.getDelegate() == delegateOdd ? controller.setDelegate(delegateEven) : controller.setDelegate(delegateOdd);
      }, this);

      var removeFilterButton = new qx.ui.form.Button("Remove filter");
      removeFilterButton.setWidth(120);
      this.getRoot().add(removeFilterButton, {left: 130, top: 220});
      removeFilterButton.addListener("execute", function() {
        controller.setDelegate(null);
      }, this);

      var reverseButton = new qx.ui.form.Button("Reverse order");
      reverseButton.setWidth(120);
      this.getRoot().add(reverseButton, {left: 130, top: 255});
      reverseButton.addListener("execute", function() {
        data.reverse();
      }, this);













       /* ***********************************************
        * DESCRIPTIONS
        * ********************************************* */
       // List Selection sync description
       var description = new qx.ui.basic.Label();
       description.setRich(true);
       description.setWidth(200);
       description.setValue(
         "<b>Filtered List</b><br/>"
         + "List showing numbered items, bound to a data array."
       );
       this.getRoot().add(description, {left: 20, top: 10});
    }
  }
});
