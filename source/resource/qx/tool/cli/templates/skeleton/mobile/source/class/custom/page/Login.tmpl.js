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

  construct()
  {
    super();
    this.setTitle("Login");
  },


  members :
  {
    __form: null,


    // overridden
    _initialize() {
      super._initialize();

      // Username
      const user = new qx.ui.mobile.form.TextField();
      user.setRequired(true);

      // Password
      const pwd = new qx.ui.mobile.form.PasswordField();
      pwd.setRequired(true);

      // Login Button
      const loginButton = new qx.ui.mobile.form.Button("Login");
      loginButton.addListener("tap", this._onButtonTap, this);

      const loginForm = this.__form = new qx.ui.mobile.form.Form();
      loginForm.add(user, "Username");
      loginForm.add(pwd, "Password");

      // Use form renderer
      this.getContent().add(new qx.ui.mobile.form.renderer.Single(loginForm));
      this.getContent().add(loginButton);
    },


    /**
     * Event handler for <code>tap</code> on the login button.
     */
    _onButtonTap() {
      // use form validation
      if (this.__form.validate()) {
        qx.core.Init.getApplication().getRouting().executeGet("/overview");
      }
    }
  }

});
