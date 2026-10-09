/**
 * Minimal server application — exists only so that the compile.json has a
 * non-compiler app, which causes the outer compiler to build the custom-compiler
 * app and then spawn it.  The custom compiler (myproject.CustomCompiler) is what
 * the integration test actually exercises.
 */
qx.Class.define("myproject.Application", {
  extend: qx.application.Basic,

  members: {
    async main() {
      this.info("myproject ready");
    }
  }
});
