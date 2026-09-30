/**
 * The real application class; compile.json refers to a misspelled name
 */
qx.Class.define("missingappclass.Application", {
  extend: qx.application.Standalone,

  members: {
    main() {
      super.main();
    }
  }
});
