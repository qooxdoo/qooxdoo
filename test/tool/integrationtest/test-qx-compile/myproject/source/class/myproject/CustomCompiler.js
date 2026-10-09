/* ************************************************************************

   Test custom compiler for verifying --clean argument forwarding behaviour.

   This class is compiled by the outer qx compiler and then spawned as the
   inner (custom) compiler.  In start() it records the argv it received so
   that integration tests can assert that --clean was NOT forwarded.

************************************************************************ */

const fs = require("fs");
const path = require("path");

/**
 * Minimal custom compiler implementation used by the test-qx-compile integration
 * test.  It does not perform any real compilation; it simply writes its argv
 * to a JSON file so the test runner can inspect which flags were forwarded by
 * the outer compiler.
 */
qx.Class.define("myproject.CustomCompiler", {
  extend: qx.tool.compiler.Compiler,

  members: {
    async start() {
      // Write the received argv to a well-known file relative to cwd so the
      // integration test can read it and verify --clean was not forwarded.
      const outFile = path.resolve(process.cwd(), "custom-compiler-argv.json");
      fs.writeFileSync(outFile, JSON.stringify(process.argv));
    },

    async stop() {},

    async getMakers() {
      return [];
    }
  }
});
