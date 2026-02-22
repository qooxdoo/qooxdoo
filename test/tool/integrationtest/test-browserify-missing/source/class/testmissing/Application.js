/* ************************************************************************
 *
 *    test-browserify-missing - Tests graceful handling of missing npm modules
 *
 * ************************************************************************/

/**
 * Test application that require()s a package that is intentionally not installed.
 * The bundler should produce a warning but still create the bundle.
 *
 * @ignore(require)
 */
/* global require */
const missingPkg = require('nonexistent-qx-test-pkg');

qx.Class.define("testmissing.Application", {
  extend: qx.application.Basic,

  members: {
    main() {
      this.base(arguments);
      // missingPkg will be an empty object ({}) from the stub
      this.info("Missing module resolved to: " + JSON.stringify(missingPkg));
    }
  }
});
