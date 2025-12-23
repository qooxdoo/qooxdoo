qx.Class.define("qxl.test8.FormTest", {
  extend: qx.ui.form.Form,

  members: {
    buildForm() {
      // These form.add() calls have uppercase names that should be detected by migration
      let userField = new qx.ui.form.TextField();
      this.add(userField, "Username", null, "Username");

      let passField = new qx.ui.form.PasswordField();
      this.add(passField, "Password", null, "Password");

      let rememberCheckbox = new qx.ui.form.CheckBox();
      this.add(rememberCheckbox, "Remember Me", null, "RememberMe");
    }
  }
});
