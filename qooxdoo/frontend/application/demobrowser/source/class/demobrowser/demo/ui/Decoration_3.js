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
      qx.theme.manager.Meta.getInstance().setTheme(qx.theme.Contemporary);

      var layout = new qx.ui.layout.Grid();
      layout.setColumnAlign(0, "right", "top");
      layout.setColumnAlign(2, "right", "top");
      layout.setHorizontalSpacing(9);
      layout.setVerticalSpacing(5);
      layout.setColumnWidth(1, 160);
      layout.setColumnWidth(2, 72);
      layout.setColumnWidth(3, 108);


      var container = new qx.ui.core.Widget().set({
        layout: layout,
        decorator: "pane",
        padding: 16,
        backgroundColor: "pane"
      });

      this.getRoot().add(container, 40, 40);

      labels = ["First Name", "Last Name", "City", "Country", "Notes"];
      for (var i=0; i<labels.length; i++) {
        layout.add(new qx.ui.basic.Label(labels[i]).set({
          allowGrowX: false,
          allowShrinkX: false,
          paddingTop: 3
        }), i, 0);
      }

      inputs = ["Helmut", "Schmidt", "Karlsruhe", "Germany"];
      for (var i=0; i<inputs.length; i++) {
        layout.add(new qx.ui.form.TextField(inputs[i]).set({
        }), i, 1);
      }


      // text area
      layout.add(new qx.ui.form.TextArea().set({
        height: 250
      }), 4, 1, {colSpan: 3});


      // radio buttons
      layout.add(new qx.ui.basic.Label("Sex").set({
        allowGrowX: false,
        allowShrinkX: false,
        paddingTop: 3
      }), 0, 2);

      var female = new qx.ui.form.RadioButton("female");
      var male = new qx.ui.form.RadioButton("male");

      var mgr = new qx.ui.core.RadioManager();
      mgr.add(female, male);

      layout.add(female, 0, 3);
      layout.add(male, 1, 3);
      male.setChecked(true);


      // check boxes
      layout.add(new qx.ui.basic.Label("Hobbies").set({
        allowGrowX: false,
        allowShrinkX: false,
        paddingTop: 3
      }), 2, 2);
      layout.add(new qx.ui.form.CheckBox("Reading"), 2, 3);
      layout.add(new qx.ui.form.CheckBox("Swimming").set({
        enabled: false
      }), 3, 3);


      // buttons
      var buttonPane = new qx.ui.core.Widget().set({
        layout: new qx.ui.layout.HBox().set({
          spacing: 4
        }),
        paddingTop: 11
      });
      layout.add(buttonPane, 5, 0, {colSpan: 4});
      buttonPane.getLayout().addSpacer();

      okButton = new qx.ui.form.Button("OK").set({
        minWidth: 80
      });
      okButton.addState("default");
      buttonPane.getLayout().add(okButton);

      cancelButton = new qx.ui.form.Button("Cancel").set({
        minWidth: 80
      });
      buttonPane.getLayout().add(cancelButton);

    }
  }
});