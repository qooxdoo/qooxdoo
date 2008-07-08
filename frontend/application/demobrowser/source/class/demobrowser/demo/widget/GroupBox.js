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

#asset(qx/icon/${qx.icontheme}/16/apps/accessories-text-editor.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.GroupBox",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function() {
      this.base(arguments);
      // create the main layout
      var mainLayout = new qx.ui.layout.VBox();
      mainLayout.setSpacing(10);

      // add the main layout to a container widget and to the document root
      var container = new qx.ui.container.Composite(mainLayout);
      container.setPadding(20);
      this.getRoot().add(container, {left:0,top:0});



      // create the first group box
      var box1 = new qx.ui.groupbox.GroupBox("Code Assist", "icon/16/apps/accessories-text-editor.png");
      container.add(box1);

      // create and add the content of the first group box
      box1.setLayout(new qx.ui.layout.VBox());
      box1.setPadding(13);
      box1.add(new qx.ui.form.CheckBox("Show debugging content"));
      box1.add(new qx.ui.form.CheckBox("Enable code completion"));
      box1.add(new qx.ui.form.CheckBox("Show debugging console"));




      // create the second group box
      box2 = new qx.ui.groupbox.CheckGroupBox("Expert Settings");
      container.add(box2);

      // create and add the content of the second group box
      box2.setLayout(new qx.ui.layout.HBox());
      var textField = new qx.ui.form.TextField("");
      textField.setWidth(200);
      box2.add(textField);




      // create the third group box
      var radioButton1 = new qx.ui.form.RadioButton("Normal Settings");
      radioButton1.setPaddingLeft(13);
      radioButton1.setPaddingBottom(-10);
      container.add(radioButton1);

      box3 = new qx.ui.groupbox.RadioGroupBox("Advanced Settings");
      container.add(box3);

      var manager = new qx.ui.core.RadioManager();
      manager.add(radioButton1);
      manager.add(box3.getLegendObject());

      // create and add the content of the third group box
      box3.setLayout(new qx.ui.layout.HBox());
      var textField2 = new qx.ui.form.TextField("");
      textField2.setWidth(200);
      box3.add(textField2);
    }
  }
});
