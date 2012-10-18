/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */
qx.Class.define("tutorial.tutorial.desktop.Form", 
{
  statics :
  {
    description : "Simple login form with validation", 

    steps: [
      function() {
        var form = new qx.ui.form.Form();

        var userName = new qx.ui.form.TextField();
        form.add(userName, "Name");

        var password = new qx.ui.form.PasswordField();
        form.add(password, "Password");

        this.getRoot().add(
          new qx.ui.form.renderer.Single(form),
          {left: 10, top: 10}
        );
      },


      /**
       * @lint ignoreDeprecated(alert)
       */
      function() {
        var form = new qx.ui.form.Form();

        var userName = new qx.ui.form.TextField();
        form.add(userName, "Name");

        var password = new qx.ui.form.PasswordField();
        form.add(password, "Password");

        var login = new qx.ui.form.Button("Login");
        form.addButton(login);

        this.getRoot().add(
          new qx.ui.form.renderer.Single(form),
          {left: 10, top: 10}
        );

        login.addListener("execute", function() {
          if (form.validate()) {
            alert("send...");
          }
        });
      },


      /**
       * @lint ignoreDeprecated(alert)
       */
      function() {
        var form = new qx.ui.form.Form();

        var userName = new qx.ui.form.TextField();
        userName.setRequired(true);
        form.add(userName, "Name");

        var password = new qx.ui.form.PasswordField();
        password.setInvalidMessage("Password too short.");
        form.add(password, "Password", function(data) {
          return !!(data && data.length >= 6);
        });

        var login = new qx.ui.form.Button("Login");
        form.addButton(login);

        this.getRoot().add(
          new qx.ui.form.renderer.Single(form),
          {left: 10, top: 10}
        );

        login.addListener("execute", function() {
          if (form.validate()) {
            alert("send...");
          }
        });
      }
    ]
  }
});