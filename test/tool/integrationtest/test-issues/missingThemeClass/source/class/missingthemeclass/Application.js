/**
 * Application whose theme in compile.json is misspelled
 */
qx.Class.define("missingthemeclass.Application", {
  extend: qx.application.Standalone,

  members: {
    main() {
      super.main();
    }
  }
});
