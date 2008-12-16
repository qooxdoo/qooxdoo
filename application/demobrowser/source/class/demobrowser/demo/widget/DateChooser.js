/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/* ************************************************************************

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.DateChooser",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // Date chooser
      var container = new qx.ui.container.Composite(new qx.ui.layout.HBox());
      var chooser = new qx.ui.control.DateChooser();
      container.add(chooser);
      this.getRoot().add(container, { left : 20, top: 20});

      // date label
      var label = new qx.ui.basic.Label("select a date");
      this.getRoot().add(label, {left: 20, top: 185});

      // listener for the change event
      chooser.addListener("changeDate", function(e) {
        label.setContent("Change: " + e.getData());
      }, this);

      // listener for the execute event
      chooser.addListener("execute", function(e) {
        var currentDate = chooser.getValue();
        label.setContent("Execute: " + currentDate);
      }, this);

      // set current Date control
      var setDateButton = new qx.ui.form.Button("Set current date");
      setDateButton.setAlignX("center");
      this.getRoot().add(setDateButton, {left: 250, top: 20});
      setDateButton.addListener("execute", function(e) {
        chooser.setDate(new Date());
      });

      // show a specific month
      var setMonthButton = new qx.ui.form.Button("Show January 1981");
      this.getRoot().add(setMonthButton, {left: 250, top: 50});
      setMonthButton.addListener("execute", function(e) {
        chooser.showMonth(0, 1981);
      });

      // reset the selection
      var removeSelectionButton = new qx.ui.form.Button("Remove the selection");
      this.getRoot().add(removeSelectionButton, {left: 250, top: 80});
      removeSelectionButton.addListener("execute", function(e) {
        chooser.setDate(null);
      });

      // set value stuff
      var textField = new qx.ui.form.TextField(new Date().toString());
      textField.setWidth(200);
      this.getRoot().add(textField, {left: 250, top: 110});
      var setValueButton = new qx.ui.form.Button("Set Value");
      this.getRoot().add(setValueButton, {left: 455, top: 109});
      setValueButton.addListener("execute", function(e) {
        chooser.setValue(textField.getValue());
      }, this);

      // Description
      var headerLabel = new qx.ui.basic.Label("Description");
      headerLabel.setFont("bold");
      this.getRoot().add(headerLabel, {left: 400, top: 20});
      this.getRoot().add(new qx.ui.basic.Label("- Use the cursors keys to move the selection."), {left: 400, top: 35});
      this.getRoot().add(new qx.ui.basic.Label("- Page-keys / shift + page-keys switch months/years."), {left: 400, top: 50});
      this.getRoot().add(new qx.ui.basic.Label("- Double-click or enter/space-key will fire an execute event."), {left: 400, top: 65});
      this.getRoot().add(new qx.ui.basic.Label("- Escape will remove the selection."), {left: 400, top: 80});
    }
  }
});
