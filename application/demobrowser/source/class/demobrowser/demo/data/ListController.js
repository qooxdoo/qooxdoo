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
 * @tag selection
 */
qx.Class.define("demobrowser.demo.data.ListController",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // create the data
      var rawData = [];
      for (var i = 0; i < 10; i++) {
        rawData.push("Item " + i);
      }
      var data = new qx.data.Array(rawData);

      // create the widgets
      var list1 = new qx.ui.form.List();
      list1.setSelectionMode("multi");
      var list2 = new qx.ui.form.List();
      list2.setSelectionMode("multi");
      var list3 = new qx.ui.form.List();

      // add the widgets to the document
      this.getRoot().add(list1, {left: 10, top: 110});
      this.getRoot().add(list2, {left: 130, top: 110});
      this.getRoot().add(list3, {left: 250, top: 110});


      // create the controller
      var controller1 = new qx.data.controller.List(data, list1);
      var controller2 = new qx.data.controller.List(data, list2);
      var controller3 = new qx.data.controller.List(
        controller1.getSelection(), list3
      );

      // synchronize the selection
      controller2.setSelection(controller1.getSelection());

      // create a label for the selection
      var selectedLabel = new qx.ui.basic.Label("");
      this.getRoot().add(selectedLabel, {left: 370, top: 110});
      // bind the label with single value binding to the current selection
      controller3.bind("selection[0]", selectedLabel, "value");
      // style the textfield
      selectedLabel.setWidth(120);
      selectedLabel.setDecorator("main");
      selectedLabel.setBackgroundColor("white");


      /* ***********************************************
       * Controlls: Do only work on the data array
       * ********************************************* */
      var addItemButton = new qx.ui.form.Button("Add an item");
      addItemButton.setWidth(120);
      this.getRoot().add(addItemButton, {left: 370, top: 140});
      addItemButton.addListener("execute", function() {
        data.push("Item " + data.length);
      }, this);

      var removeItemButton = new qx.ui.form.Button("Remove an item");
      removeItemButton.setWidth(120);
      this.getRoot().add(removeItemButton, {left: 370, top: 175});
      removeItemButton.addListener("execute", function() {
        data.pop();
      }, this);

      var logDataButton = new qx.ui.form.Button("Write data to log");
      logDataButton.setWidth(120);
      this.getRoot().add(logDataButton, {left: 370, top: 210});
      logDataButton.addListener("execute", function() {
        // open the console
        qx.log.appender.Console.show();
        // push the data in the console
        this.info(data.toString());
      }, this);










      /* ***********************************************
       * DESCRIPTIONS
       * ********************************************* */
      // List Selection sync description
      var syncListDescription = new qx.ui.basic.Label();
      syncListDescription.setRich(true);
      syncListDescription.setWidth(200);
      syncListDescription.setValue(
        "<b>Multi selection List</b><br/>"
        + "Bound to the same data and share the selection."
      );
      this.getRoot().add(syncListDescription, {left: 20, top: 10});

      // List Selection description
      var selectionListDescription = new qx.ui.basic.Label();
      selectionListDescription.setRich(true);
      selectionListDescription.setWidth(100);
      selectionListDescription.setValue(
        "<b>Selection List</b><br/>"
        + "Bound to the selection of the list to the left."
      );
      this.getRoot().add(selectionListDescription, {left: 260, top: 10});

      // Label Selection description
      var selectionLabelDescription = new qx.ui.basic.Label();
      selectionLabelDescription.setRich(true);
      selectionLabelDescription.setWidth(100);
      selectionLabelDescription.setValue(
        "<b>Selection Label</b><br/>"
        + "Bound to the selection of the list to the left."
      );
      this.getRoot().add(selectionLabelDescription, {left: 380, top: 10});
    }
  }
});
