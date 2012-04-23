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
qx.Class.define("demobrowser.demo.ui.MultiPageForm",
{
  extend : qx.application.Standalone,

  members :
  {
    /**
     * @lint ignoreDeprecated(alert)
     */
    main : function() {
      this.base(arguments);

      // create the ui ///////////////////////

      // create the stack for the multi page view
      var stack = new qx.ui.container.Stack();
      this.getRoot().add(stack, {left: 10, top: 10});

      // page 1
      var grid1 = new qx.ui.layout.Grid();
      grid1.setSpacing(5);
      var page1 = new qx.ui.container.Composite(grid1);
      stack.add(page1);

      // name
      var nameLabel = new qx.ui.basic.Label("Name:");
      page1.add(nameLabel, {row: 0, column: 0});
      var name = new qx.ui.form.TextField();
      name.setRequired(true);
      page1.add(name, {row: 0, column: 1});

      // password
      var passwordLabel = new qx.ui.basic.Label("Password:");
      page1.add(passwordLabel, {row: 1, column: 0});
      var password = new qx.ui.form.PasswordField();
      password.setRequired(true);
      page1.add(password, {row: 1, column: 1});

      // nextbutton
      var nextButton = new qx.ui.form.Button("next");
      page1.add(nextButton, {row: 2, column: 1});
      nextButton.addListener("execute", stack.next, stack);

      // page 2
      var grid2 = new qx.ui.layout.Grid();
      grid2.setSpacing(5);
      var page2 = new qx.ui.container.Composite(grid2);
      stack.add(page2);

      // email
      var emailLabel = new qx.ui.basic.Label("Email:");
      page2.add(emailLabel, {row: 0, column: 0});
      var email = new qx.ui.form.TextField();
      page2.add(email, {row: 0, column: 1});

      // birth date
      var birthDateLabel = new qx.ui.basic.Label("Birthdate:");
      page2.add(birthDateLabel, {row: 1, column: 0});
      var birthDate = new qx.ui.form.DateField();
      birthDate.setRequired(true);
      page2.add(birthDate, {row: 1, column: 1});

      //backbutton
      var backButton = new qx.ui.form.Button("back");
      page2.add(backButton, {row: 2, column: 0});
      backButton.addListener("execute", stack.previous, stack);

      // submit
      var submitButton = new qx.ui.form.Button("submit");
      submitButton
      page2.add(submitButton, {row: 2, column: 1});

      ////////////////////////////////////////


      // serialization ///////////////////////

      // create the data model
      var skeleton = {name: null, password: null, email: null, birthdate: null};
      var model = qx.data.marshal.Json.createModel(skeleton, true);

      // create the controller and connect all fields
      var controller = new qx.data.controller.Object(model);
      controller.addTarget(name, "value", "name", true);
      controller.addTarget(password, "value", "password", true);
      controller.addTarget(email, "value", "email", true);
      controller.addTarget(birthDate, "value", "birthdate", true);

      // invoke the serialization
      submitButton.addListener("execute", function() {
        alert(qx.util.Serializer.toUriParameter(model));
      }, this);
      ////////////////////////////////////////


      // validation //////////////////////////

      // manager and connections
      var validator = new qx.ui.form.validation.Manager();
      validator.add(name);
      validator.add(password);
      validator.add(email, qx.util.Validate.email());
      validator.add(birthDate);

      // validate on every change of the model
      model.addListener("changeBubble", function(e) {
        validator.validate();
      }, this);

      // invoke the inital validate
      validator.validate();

      // switch the submit button on and off
      validator.bind("valid", submitButton, "enabled");

      ////////////////////////////////////////


    }
  }
});
