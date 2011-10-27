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

qx.Class.define("demobrowser.demo.widget.RadioButtonGroup",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // using VBox
      var labelVBox = new qx.ui.basic.Label("<strong>Vertical:</strong>");
      labelVBox.setRich(true);
      this.getRoot().add(labelVBox, {left: 10, top: 10});
      var radioButtonGroupVBox = new qx.ui.form.RadioButtonGroup();
      radioButtonGroupVBox.setLayout(new qx.ui.layout.VBox(2));
      this.addButtons(radioButtonGroupVBox, ["Red", "Green", "Blue"]);
      this.getRoot().add(radioButtonGroupVBox, {left: 100, top: 10});

      // using HBox
      var labelHBox = new qx.ui.basic.Label("<strong>Horizontal:</strong>");
      labelHBox.setRich(true);
      this.getRoot().add(labelHBox, {left: 10, top: 70});
      var radioButtonGroupHBox = new qx.ui.form.RadioButtonGroup();
      radioButtonGroupHBox.setLayout(new qx.ui.layout.HBox(5));
      this.addButtons(radioButtonGroupHBox, ["female", "male"]);
      this.getRoot().add(radioButtonGroupHBox, {left: 100, top: 70});

      // using Grid
      var labelGrid = new qx.ui.basic.Label("<strong>Grid:</strong>");
      labelGrid.setRich(true);
      this.getRoot().add(labelGrid, {left: 10, top: 100});
      var radioButtonGroupGrid = new qx.ui.form.RadioButtonGroup();
      radioButtonGroupGrid.setLayout(new qx.ui.layout.Grid(10, 10));
      radioButtonGroupGrid.add(new qx.ui.form.RadioButton("0,1"), {row: 0, column: 1});
      radioButtonGroupGrid.add(new qx.ui.form.RadioButton("1,0"), {row: 1, column: 0});
      radioButtonGroupGrid.add(new qx.ui.form.RadioButton("1,1"), {row: 1, column: 1});
      radioButtonGroupGrid.add(new qx.ui.form.RadioButton("1,2"), {row: 1, column: 2});
      radioButtonGroupGrid.add(new qx.ui.form.RadioButton("2,1"), {row: 2, column: 1});
      this.getRoot().add(radioButtonGroupGrid, {left: 100, top: 100});
    },


    addButtons : function(group, names)
    {
      for (var i = 0; i < names.length; i++) {
        group.add(new qx.ui.form.RadioButton(names[i]));
      }
    }
  }
});
