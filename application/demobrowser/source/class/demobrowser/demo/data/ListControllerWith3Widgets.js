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
 */
qx.Class.define("demobrowser.demo.data.ListControllerWith3Widgets",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // create the data
      var rawData = [];
      for (var i = 0; i < 30; i++) {
        rawData.push("Item " + i);
      }
      var data = new qx.data.Array(rawData);

      // create the widgets
      var list = new qx.ui.form.List();
      var selectBox = new qx.ui.form.SelectBox();
      var comboBox = new qx.ui.form.ComboBox();

      // add the widgets to the document
      this.getRoot().add(list, {left: 10, top: 80});
      list.setSelectionMode("multi");
      this.getRoot().add(selectBox, {left: 120, top: 80});
      this.getRoot().add(comboBox, {left: 250, top: 80});


      // create the controller
      var controller1 = new qx.data.controller.List(data, list);
      var controller2 = new qx.data.controller.List(data, selectBox);
      new qx.data.controller.List(data, comboBox);

      // sync the selections of the list and the selectbox
      controller2.setSelection(controller1.getSelection());


      /* ***********************************************
       * Controlls: Do only work on the data array
       * ********************************************* */
      var addItemButton = new qx.ui.form.Button("Add an item");
      addItemButton.setWidth(120);
      this.getRoot().add(addItemButton, {left: 380, top: 80});
      addItemButton.addListener("execute", function() {
        data.push("Item " + data.length);
      }, this);

      var removeItemButton = new qx.ui.form.Button("Remove an item");
      removeItemButton.setWidth(120);
      this.getRoot().add(removeItemButton, {left: 380, top: 115});
      removeItemButton.addListener("execute", function() {
        data.pop();
      }, this);

      var logDataButton = new qx.ui.form.Button("Write data to log");
      logDataButton.setWidth(120);
      this.getRoot().add(logDataButton, {left: 380, top: 150});
      logDataButton.addListener("execute", function() {
        // open the console
        qx.log.appender.Console.show();
        // push the data in the console
        this.info(data.toString());
      }, this);










       /* ***********************************************
        * DESCRIPTIONS
        * ********************************************* */
       // List Description
       var listDescription = new qx.ui.basic.Label();
       listDescription.setRich(true);
       listDescription.setWidth(100);
       listDescription.setValue("<b>List</b><br/>");
       this.getRoot().add(listDescription, {left: 20, top: 10});

       // SelectBox Description
       var selectBoxDescription = new qx.ui.basic.Label();
       selectBoxDescription.setRich(true);
       selectBoxDescription.setWidth(100);
       selectBoxDescription.setValue("<b>SelectBox</b>");
       this.getRoot().add(selectBoxDescription, {left: 130, top: 10});

       // ComboBox Description
       var comboBoxDescription = new qx.ui.basic.Label();
       comboBoxDescription.setRich(true);
       comboBoxDescription.setWidth(100);
       comboBoxDescription.setValue("<b>ComboBox</b><br/>");
       this.getRoot().add(comboBoxDescription, {left: 260, top: 10});

       // Common Description
       var commonDescription = new qx.ui.basic.Label();
       commonDescription.setRich(true);
       commonDescription.setWidth(360);
       commonDescription.setValue(
         "All 3 widgets share the same data model. The List and the SelectBox "
         + "also share the same selection."
        );
       this.getRoot().add(commonDescription, {left: 20, top: 30});


    }
  }
});
