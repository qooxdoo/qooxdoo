/* ************************************************************************
 *
 *    test-browserify - Test application for Browserify/esbuild bundling
 *
 * ************************************************************************/

/**
 * Test application that uses require() to load npm modules
 *
 * @ignore(require)
 */
/* global require */
const { v4: uuidv4 } = require('uuid');

qx.Class.define("testbrowserify.Application", {
  extend: qx.application.Basic,

  members: {
    /**
     * Main method - tests that uuid module works correctly
     */
    main() {
      // Call super class
      this.base(arguments);

      // Enable logging
      if (qx.core.Environment.get("qx.debug")) {
        qx.log.appender.Native;
        qx.log.appender.Console;
      }

      this.info("Testing Browserify/esbuild bundling with uuid module...");

      // Test 1: Generate UUIDs
      const id1 = uuidv4();
      const id2 = uuidv4();

      this.info("UUID 1: " + id1);
      this.info("UUID 2: " + id2);

      // Test 2: Validate UUID format (v4 format)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      if (!uuidRegex.test(id1)) {
        throw new Error("UUID 1 has invalid format: " + id1);
      }

      if (!uuidRegex.test(id2)) {
        throw new Error("UUID 2 has invalid format: " + id2);
      }

      // Test 3: Ensure uniqueness
      if (id1 === id2) {
        throw new Error("UUIDs should be unique but got: " + id1);
      }

      // Test 4: Check length
      if (id1.length !== 36 || id2.length !== 36) {
        throw new Error("UUID should be 36 characters long");
      }

      this.info("✓ All tests passed!");
      this.info("✓ Browserify/esbuild successfully bundled uuid module");

      // Set success flag for automated testing
      window.BROWSERIFY_TEST_SUCCESS = true;
    }
  }
});
