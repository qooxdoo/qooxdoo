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
 * @lint ignoreDeprecated(alert)
 * @tag databinding
 * @tag serialization
 */
qx.Class.define("demobrowser.demo.data.FormController",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // create the UI ///////////////////

      // groupbox
      var groupBox = new qx.ui.groupbox.GroupBox("Simple Form");
      groupBox.setLayout(new qx.ui.layout.Canvas());
      this.getRoot().add(groupBox, {left: 10, top: 10});

      // form
      var form = new qx.ui.form.Form();

      // add the form items
      var nameTextfield = new qx.ui.form.TextField();
      nameTextfield.setRequired(true);
      nameTextfield.setWidth(200);
      form.add(nameTextfield, "First Name", null, "firstName");
      form.add(new qx.ui.form.TextField(), "Last Name", null, "lastName");
      form.add(new qx.ui.form.TextField(), "Company");
      form.add(new qx.ui.form.TextField(), "Email");
      form.add(new qx.ui.form.DateField(), "Date");

      // buttons
      var saveButton = new qx.ui.form.Button("Save");
      saveButton.setWidth(70);
      form.addButton(saveButton);
      var cancelButton = new qx.ui.form.Button("Cancel");
      cancelButton.setWidth(70);
      form.addButton(cancelButton);

      // create the view
      groupBox.add(new qx.ui.form.renderer.Single(form));
      ////////////////////////////////////


      // binding /////////////////////////
      var controller = new qx.data.controller.Form(null, form);
      var model = controller.createModel();
      ////////////////////////////////////


      // serialization and reset /////////
      saveButton.addListener("execute", function() {
        if (form.validate()) {
          alert("You are saving: " + qx.util.Serializer.toJson(model));
        }
      }, this);
      cancelButton.addListener("execute", form.reset, form);
      ////////////////////////////////////
    }
  }
});