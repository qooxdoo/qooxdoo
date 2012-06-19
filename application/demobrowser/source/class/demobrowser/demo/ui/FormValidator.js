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
     * Martin Wittemann (martinwitemann)

************************************************************************ */

/**
 * @lint ignoreDeprecated(alert)
 * @tag showcase
 */
qx.Class.define("demobrowser.demo.ui.FormValidator",
{
  extend : qx.application.Standalone,

  members :
  {
    main : function()
    {
      this.base(arguments);

      // create a field for a usernamen
      var username = new qx.ui.form.TextField();
      username.setPlaceholder("username");
      username.setWidth(150);
      username.setRequired(true);
      this.getRoot().add(username, {left: 20, top: 70});

      // create a textfield for the email address
      var email = new qx.ui.form.TextField();
      email.setPlaceholder("email address");
      email.setWidth(150);
      this.getRoot().add(email, {left: 20, top: 100});

      // cerate two textfields for a password
      var password1 = new qx.ui.form.TextField();
      password1.setPlaceholder("password");
      password1.setWidth(150);
      this.getRoot().add(password1, {left: 20, top: 130});

      var password2 = new qx.ui.form.TextField();
      password2.setPlaceholder("password");
      password2.setWidth(150);
      this.getRoot().add(password2, {left: 20, top: 160});

      // create a checkbox
      var accepted = new qx.ui.form.CheckBox("Accept");
      accepted.setRequired(true);
      this.getRoot().add(accepted, {left: 20, top: 190});


      // create the form manager
      var manager = new qx.ui.form.validation.Manager();
      // create a validator function
      var passwordLengthValidator = function(value, item) {
        var valid = value != null && value.length > 2;
        if (!valid) {
          item.setInvalidMessage("Please enter a password at with least 3 characters.");
        }
        return valid;
      };

      // create a async validator function
      var userNameValidator = new qx.ui.form.validation.AsyncValidator(
        function(validator, value) {
          // use a timeout instad of a server request (async)
          window.setTimeout(function() {
            if (value == null || value.length == 0) {
              validator.setValid(false, "Server said no!");
            } else {
              validator.setValid(true);
            }
          }, 1000);
        }
      );

      // add the username with a async validator
      manager.add(username, userNameValidator);
      // add the email with a predefined email validator
      manager.add(email, qx.util.Validate.email());
      // add the password fields with the notEmpty validator
      manager.add(password1, passwordLengthValidator);
      manager.add(password2, passwordLengthValidator);
      // add the checkbox (required flag is set)
      manager.add(accepted);

      // add a validator to the manager itself (passwords mut be equal)
      manager.setValidator(function(items) {
        var valid = password1.getValue() == password2.getValue();
        if (!valid) {
          var message = "Passwords must be equal.";
          password1.setInvalidMessage(message);
          password2.setInvalidMessage(message);
          password1.setValid(false);
          password2.setValid(false);
        }
        return valid;
      });

      var send = new qx.ui.form.Button("Send");
      this.getRoot().add(send, {left: 20, top: 215});
      send.addListener("execute", function() {
        // configure the send button
        send.setEnabled(false);
        send.setLabel("Validating...");
        // return type can not be used because of async validation
        manager.validate()
      }, this);


      // add a listener to the form manager for the validation complete
      manager.addListener("complete", function() {
        // configure the send button
        send.setEnabled(true);
        send.setLabel("Send");
        // check the validation status
        if (manager.getValid()) {
          alert("You can send...");
        } else {
          alert(manager.getInvalidMessages().join("\n"));
        }
      }, this);







      /* ***********************************************
       * DESCRIPTIONS
       * ********************************************* */
      // List Selection sync description
      var notEmptyDescription = new qx.ui.basic.Label();
      notEmptyDescription.setRich(true);
      notEmptyDescription.setWidth(400);
      notEmptyDescription.setValue(
        "<b>Client side form validation</b><br/>"
        + "All fields are required. Some by a custom validator, some by a "
        + "predefined validator and some by the required flag."
      );
      this.getRoot().add(notEmptyDescription, {left: 20, top: 10});
    }
  }
});
