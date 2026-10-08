/* ************************************************************************
 *
 *    test-browserify-literal - Tests the warning for require() with a non-string literal
 *
 * ************************************************************************/

/**
 * Test application that calls require() with a number, which the compiler cannot bundle.
 *
 * @ignore(require)
 */
/* global require */
qx.Class.define("testliteral.Application", {
  extend: qx.application.Basic,

  members: {
    main() {
      this.base(arguments);
      require(42);
    }
  }
});
