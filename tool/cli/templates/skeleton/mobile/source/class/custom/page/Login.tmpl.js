/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/**
 * TODO: needs documentation
 */
qx.Class.define("${namespace}.page.Login",
{
  extend : qx.ui.mobile.page.NavigationPage,

  construct : function()
  {
    this.base(arguments);
    this.setTitle("Login");
  },


  members :
  {
    __form: null,


    // overridden
    _initialize: function() {
      this.base(arguments);

      // Username
      var user = new qx.ui.mobile.form.TextField();
      user.setRequired(true);

      // Password
      var pwd = new qx.ui.mobile.form.PasswordField();
      pwd.setRequired(true);

      // Login Button
      var loginButton = new qx.ui.mobile.form.Button("Login");
      loginButton.addListener("tap", this._onButtonTap, this);

      var loginForm = this.__form = new qx.ui.mobile.form.Form();
      loginForm.add(user, "Username");
      loginForm.add(pwd, "Password");

      // Use form renderer
      this.getContent().add(new qx.ui.mobile.form.renderer.Single(loginForm));
      this.getContent().add(loginButton);
    },


    /**
     * Event handler for <code>tap</code> on the login button.
     */
    _onButtonTap: function() {
      // use form validation
      if (this.__form.validate()) {
        qx.core.Init.getApplication().getRouting().executeGet("/overview");
      }
    }
  }

});
