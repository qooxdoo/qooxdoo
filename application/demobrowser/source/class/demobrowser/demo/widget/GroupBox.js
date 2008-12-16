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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/16/apps/utilities-text-editor.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.GroupBox",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // create the main layout
      var mainLayout = new qx.ui.layout.VBox();
      mainLayout.setSpacing(20);

      // add the main layout to a container widget and to the document root
      var container = new qx.ui.container.Composite(mainLayout);
      container.setPadding(20);
      this.getRoot().add(container, {left:0,top:0});



      // create the first group box
      var box1 = new qx.ui.groupbox.GroupBox("Code Assist", "icon/16/apps/utilities-text-editor.png");
      container.add(box1);

      box1.setLayout(new qx.ui.layout.VBox());
      box1.add(new qx.ui.form.CheckBox("Show debugging content"));
      box1.add(new qx.ui.form.CheckBox("Enable code completion"));
      box1.add(new qx.ui.form.CheckBox("Show debugging console"));




      // create the second group box
      box2 = new qx.ui.groupbox.CheckGroupBox("Expert Settings");
      container.add(box2);

      box2.setLayout(new qx.ui.layout.HBox(12));

      var label2 = new qx.ui.basic.Label("Option #1");
      box2.add(label2);

      var textField2 = new qx.ui.form.TextField("");
      box2.add(textField2);




      // create the third group box
      var box3Helper = new qx.ui.container.Composite(new qx.ui.layout.VBox(4));
      container.add(box3Helper);

      var radioButton1 = new qx.ui.form.RadioButton("Default Settings");
      radioButton1.setMarginLeft(4);
      box3Helper.add(radioButton1);

      var radioButton2 = new qx.ui.form.RadioButton("Custom Settings");
      radioButton2.setMarginLeft(4);
      box3Helper.add(radioButton2);

      box3 = new qx.ui.groupbox.RadioGroupBox("Advanced Settings");
      box3.setLayout(new qx.ui.layout.HBox(12));
      box3Helper.add(box3);

      var manager = new qx.ui.form.RadioGroup(radioButton1, radioButton2, box3);

      var label3 = new qx.ui.basic.Label("Option #1");
      box3.add(label3);

      var textField3 = new qx.ui.form.TextField("");
      box3.add(textField3);
    }
  }
});
