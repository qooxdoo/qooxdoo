qx.Class.define("twitter.LoginWindow",
{
  extend : qx.ui.window.Window,

  events : {
    "changeLoginData" : "qx.event.type.Data"
  },

  construct : function()
  {
    this.base(arguments, "Login", "twitter/t_small-c.png");
    var layout = new qx.ui.layout.Basic();
    this.setLayout(layout);
    this.setModal(true);

    var form = new qx.ui.form.Form();

    var username = new qx.ui.form.TextField();
    username.setRequired(true);
    form.add(username, "Username", null, "username");

    var password = new qx.ui.form.PasswordField();
    password.setRequired(true);
    form.add(password, "Password", null, "password");

    var controller = new qx.data.controller.Form(null, form);
    controller.createModel();

    var loginbutton = new qx.ui.form.Button("Login");
    form.addButton(loginbutton);
    loginbutton.addListener("execute", function() {
      if (form.validate()) {
        var loginData = {
          username : controller.getModel().getUsername(),
          password : controller.getModel().getPassword()
        };
        this.fireDataEvent("changeLoginData", loginData);
        this.close();
      }
    }, this);

    // add a reset button
    var cancelbutton = new qx.ui.form.Button("Cancel");
    form.addButton(cancelbutton);
    cancelbutton.addListener("execute", function() {
      this.close();
    }, this);

    var renderer = new qx.ui.form.renderer.Single(form);
    this.add(renderer);

  }

});