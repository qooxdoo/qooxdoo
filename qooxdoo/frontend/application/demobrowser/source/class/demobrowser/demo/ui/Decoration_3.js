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
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("demobrowser.demo.ui.Decoration_3",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      qx.theme.manager.Meta.getInstance().setTheme(qx.theme.Modern);

      var layout = new qx.ui.layout.Grid(9, 5);
      layout.setColumnAlign(0, "right", "top");
      layout.setColumnAlign(2, "right", "top");
      layout.setColumnWidth(1, 160);
      layout.setColumnWidth(2, 72);
      layout.setColumnWidth(3, 108);


      var container = new qx.ui.container.Composite(layout).set({
        decorator: "pane",
        padding: 16,
        backgroundColor: "pane"
      });

      this.getRoot().add(container, {left:40, top:40});

      labels = ["First Name", "Last Name", "City", "Country", "Notes"];
      for (var i=0; i<labels.length; i++) {
        container.add(new qx.ui.basic.Label(labels[i]).set({
          allowShrinkX: false,
          paddingTop: 3
        }), {row: i, column : 0});
      }

      inputs = ["John", "Smith", "New York", "USA"];
      for (var i=0; i<inputs.length; i++) {
        container.add(new qx.ui.form.TextField(inputs[i]), {row:i, column:1});
      }


      // text area
      container.add(new qx.ui.form.TextArea().set({
        height: 250
      }), {row:4, column:1, colSpan: 3});


      // radio buttons
      container.add(new qx.ui.basic.Label("Sex").set({
        allowShrinkX: false,
        paddingTop: 3
      }), {row:0, column:2});

      var female = new qx.ui.form.RadioButton("female");
      var male = new qx.ui.form.RadioButton("male");

      var mgr = new qx.ui.core.RadioManager();
      mgr.add(female, male);

      container.add(female, {row:0, column:3});
      container.add(male, {row:1, column:3});
      male.setChecked(true);


      // check boxes
      container.add(new qx.ui.basic.Label("Hobbies").set({
        allowShrinkX: false,
        paddingTop: 3
      }), {row:2, column:2});
      container.add(new qx.ui.form.CheckBox("Reading"), {row:2, column:3});
      container.add(new qx.ui.form.CheckBox("Swimming").set({
        enabled: false
      }), {row:3, column:3});


      // buttons
      var paneLayout = new qx.ui.layout.HBox().set({
        spacing: 4,
        alignX : "right"
      });
      var buttonPane = new qx.ui.container.Composite(paneLayout).set({
        paddingTop: 11
      });
      container.add(buttonPane, {row:5, column: 0, colSpan: 4});

      okButton = new qx.ui.form.Button("OK").set({
        minWidth: 80
      });
      okButton.addState("default");
      buttonPane.add(okButton);

      cancelButton = new qx.ui.form.Button("Cancel").set({
        minWidth: 80
      });
      buttonPane.add(cancelButton);
    }
  }
});