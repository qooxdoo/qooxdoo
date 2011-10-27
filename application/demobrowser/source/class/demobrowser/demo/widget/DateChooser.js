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
     * Christian Hagendorn (chris_schmidt)

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

      /* Set locale to english to avoid language mix if browser locale is
       * non-english. */
      qx.locale.Manager.getInstance().setLocale("en");

      // Layout
      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
      var containerTop = new qx.ui.container.Composite(new qx.ui.layout.HBox(20));
      var containerRight = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
      var containerRightTop = new qx.ui.container.Composite(new qx.ui.layout.HBox(20));
      var containerRightBottom = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
      var containerButtons = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
      var containerDescription = new qx.ui.container.Composite(new qx.ui.layout.VBox(2));
      containerRightTop.add(containerButtons);
      containerRightTop.add(containerDescription);
      containerRight.add(containerRightTop);
      containerRight.add(containerRightBottom);
      containerTop.add(containerRight)
      container.add(containerTop);
      this.getRoot().add(container, { left : 20, top: 20});

      // Date chooser
      var chooser = new qx.ui.control.DateChooser();
      containerTop.addBefore(chooser, containerRight);

      // date label
      var label = new qx.ui.basic.Label("select a date");
      container.add(label);

      // listener for the change event
      chooser.addListener("changeValue", function(e) {
        label.setValue("Change: " + e.getData());
      }, this);

      // listener for the execute event
      chooser.addListener("execute", function(e) {
        var currentDate = chooser.getValue();
        label.setValue("Execute: " + currentDate);
      }, this);

      // set current Date control
      var setDateButton = new qx.ui.form.Button("Set current date");
      setDateButton.setAlignX("center");
      containerButtons.add(setDateButton);
      setDateButton.addListener("execute", function(e) {
        chooser.setValue(new Date());
      });

      // show a specific month
      var setMonthButton = new qx.ui.form.Button("Show January 1981");
      containerButtons.add(setMonthButton);
      setMonthButton.addListener("execute", function(e) {
        chooser.showMonth(0, 1981);
      });

      // reset the selection
      var removeSelectionButton = new qx.ui.form.Button("Remove the selection");
      containerButtons.add(removeSelectionButton);
      removeSelectionButton.addListener("execute", function(e) {
        chooser.setValue(null);
      });

      // Description
      var headerLabel = new qx.ui.basic.Label("Description");
      headerLabel.setFont("bold");
      containerDescription.add(headerLabel);
      containerDescription.add(new qx.ui.basic.Label("- Use the cursors keys to move the selection."));
      containerDescription.add(new qx.ui.basic.Label("- Page-keys / shift + page-keys switch months/years."));
      containerDescription.add(new qx.ui.basic.Label("- Double-click or enter/space-key will fire an execute event."));
      containerDescription.add(new qx.ui.basic.Label("- Escape will remove the selection."));
    }
  }
});
