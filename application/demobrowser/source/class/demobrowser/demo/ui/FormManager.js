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
 */
qx.Class.define("demobrowser.demo.ui.FormManager", 
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
      var manager = new qx.ui.form.Manager();
      // create a validator function
      var passwordLengthValidator = function(value, item) {
        var valid = value != null && value.length > 2;
        if (!valid) {
          item.setInvalidMessage("Please enter a password at with least 3 characters.");
        }
        return valid;
      };
      
      // add the username without validator (required flag is set)
      manager.add(username);
      // add the email with a predefined email validator
      manager.add(email, null, qx.util.Validate.email());
      // add the password fields with the notEmpty validator
      manager.add(password1, null, passwordLengthValidator);
      manager.add(password2, null, passwordLengthValidator);
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

      
      // create the buttons for validation and reset
      var send = new qx.ui.form.Button("Send");
      this.getRoot().add(send, {left: 20, top: 215});
      send.addListener("execute", function() {
        if (manager.validate()) {
          alert("You can send...");
        } else {
          alert(manager.getInvalidMessages().join("\n"));
        }
      }, this);
      
      var reset = new qx.ui.form.Button("Reset");
      this.getRoot().add(reset, {left: 80, top: 215});
      reset.addListener("execute", function() {
        manager.reset();
      }, this);
      
      
      
      
      
      
      
      /* ***********************************************
       * DESCRIPTIONS
       * ********************************************* */  
      // List Selection sync description
      var notEmptyDescription = new qx.ui.basic.Label();
      notEmptyDescription.setRich(true);
      notEmptyDescription.setWidth(320);
      notEmptyDescription.setValue(
        "<b>Client side form validation</b><br/>"
        + "All fields are required. Some by a custom validator, some by a " 
        + "predefined validator and some by the required flag."
      );
      this.getRoot().add(notEmptyDescription, {left: 20, top: 10});      
    }
  }
});
