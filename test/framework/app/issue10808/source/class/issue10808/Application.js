/**
 * This is the main application class for testing issue #10808
 *
 * Issue: In v8, the third argument (name) of qx.ui.form.Form.add() must be lowercase,
 * or it generates a binding error when calling createModel().
 * This app demonstrates that the fix allows capitalized names to work correctly.
 *
 * @asset(issue10808/*)
 */
qx.Class.define("issue10808.Application", {
  extend: qx.application.Standalone,

  members: {
    main: function() {
      this.base(arguments);

      if (qx.core.Environment.get("qx.debug")) {
        qx.log.appender.Native;
        qx.log.appender.Console;
      }

      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
      container.setPadding(20);

      // Title
      var title = new qx.ui.basic.Label("Issue #10808: Form.add() with capitalized names");
      title.setFont("bold");
      container.add(title);

      var description = new qx.ui.basic.Label(
        "Before fix: createModel() would fail with capitalized names like 'Username'.\n" +
        "After fix: Names are auto-converted to camelCase (Username -> username)."
      );
      description.setRich(true);
      container.add(description);

      // Create a form with capitalized names (the problematic case)
      var form = new qx.ui.form.Form();
      var usernameField = new qx.ui.form.TextField("testuser");
      var emailField = new qx.ui.form.TextField("test@example.com");
      var passwordField = new qx.ui.form.PasswordField();

      // These capitalized names would cause createModel() to fail before the fix
      form.add(usernameField, "Username", null, "Username");
      form.add(emailField, "Email Address", null, "EmailAddress");
      form.add(passwordField, "Password", null, "PassWord");

      // The critical test: createModel() with capitalized names
      try {
        var controller = new qx.data.controller.Form(null, form);
        var model = controller.createModel();

        // Success!
        var success = new qx.ui.basic.Label("✓ SUCCESS: createModel() worked with capitalized names!");
        success.setTextColor("green");
        success.setFont("bold");
        container.add(success);

        // Show that data binding works
        var info = new qx.ui.basic.Label(
          "Data binding active:\n" +
          "  username = " + model.getUsername() + "\n" +
          "  emailAddress = " + model.getEmailAddress()
        );
        info.setRich(true);
        info.setPaddingLeft(20);
        container.add(info);

      } catch (e) {
        // Failure - this would happen before the fix
        var failure = new qx.ui.basic.Label("✗ FAILED: " + e.message);
        failure.setTextColor("red");
        failure.setFont("bold");
        container.add(failure);
      }

      // Show the form
      container.add(new qx.ui.basic.Label("The Form:").set({
        font: "bold",
        marginTop: 20
      }));

      var renderer = new qx.ui.form.renderer.Single(form);
      container.add(renderer);

      this.getRoot().add(container, { left: 10, top: 10 });
    }
  }
});
