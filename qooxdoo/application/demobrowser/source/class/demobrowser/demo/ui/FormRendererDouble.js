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
 */
qx.Class.define("demobrowser.demo.ui.FormRendererDouble",
{
  extend : qx.application.Standalone,

  members :
  {
    main : function()
    {
      this.base(arguments);

      // create the form
      var form = new qx.ui.form.Form();

      // add the first headline
      form.addGroupHeader("Registration");

      // add usernamne
      var userName = new qx.ui.form.TextField();
      userName.setRequired(true);
      form.add(userName, "Name");
      // add password
      var password = new qx.ui.form.PasswordField();
      password.setRequired(true);
      form.add(password, "Password");
      // add a save checkbox
      form.add(new qx.ui.form.CheckBox(), "Save?");

      // add the second header
      form.addGroupHeader("Personal Information");

      // add some additional widgets
      form.add(new qx.ui.form.Spinner(), "Age");
      form.add(new qx.ui.form.TextField(), "Country");
      var radioGroup = new qx.ui.form.RadioButtonGroup();
      radioGroup.add(new qx.ui.form.RadioButton("Male"));
      radioGroup.add(new qx.ui.form.RadioButton("Female"));
      form.add(radioGroup, "Gender");
      form.add(new qx.ui.form.TextArea(), "Bio");

      // send button with validation
      var sendButton = new qx.ui.form.Button("Send");
      sendButton.addListener("execute", function() {
        if (form.validate()) {
          alert("send...");
        }
      }, this);
      form.addButton(sendButton);

      // reset button
      var resetButton = new qx.ui.form.Button("Reset");
      resetButton.addListener("execute", function() {
        form.reset();
      }, this);
      form.addButton(resetButton);

      // create the form and add it to the document
      var formView = new qx.ui.form.renderer.Double(form);
      this.getRoot().add(formView, {left: 10, top: 10});
    }
  }
});
