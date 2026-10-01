/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Henner Kollmann 

************************************************************************ */

qx.Class.define("qx.test.tool.utils.Utils", {
  extend: qx.dev.unit.TestCase,

  members: {
    async testStripSourceMapWriteStreamWholeStream() {
      let ss = new qx.tool.utils.Utils.ToStringWriteStream();
      let ws = new qx.tool.utils.Utils.StripSourceMapTransform();
      ws.pipe(ss);
      await new Promise(resolve => {
        ws.on("finish", () => {
          resolve();
        });
        ws.write(
          "abc\ndef\n//# sourceMappingURL=IApplication.js.map?dt=1587127076441\nghi"
        );

        ws.end();
      });
      this.assertTrue(ss.toString() == "abc\ndef\nghi");
    },

    async testStripSourceMapWriteStreamChunked1() {
      let ss = new qx.tool.utils.Utils.ToStringWriteStream();
      let ws = new qx.tool.utils.Utils.StripSourceMapTransform();
      ws.pipe(ss);

      await new Promise(resolve => {
        ws.on("finish", () => {
          resolve();
        });
        ws.write("abc\ndef\n//# source");
        ws.write("MappingURL=IApplication.js.map?dt=1587127076441\nghi\njkl");
        ws.end();
      });
      this.assertTrue(ss.toString() == "abc\ndef\nghi\njkl");
    },

    async testStripSourceMapWriteStreamChunked2() {
      let ss = new qx.tool.utils.Utils.ToStringWriteStream();
      let ws = new qx.tool.utils.Utils.StripSourceMapTransform();
      ws.pipe(ss);

      await new Promise(resolve => {
        ws.on("finish", () => {
          resolve();
        });
        ws.write("abc\ndef\n//# source");
        ws.write("MappingURL=IApplication.js.map?dt=1587127076441");
        ws.write("\nghi");
        ws.end();
      });
      this.assertTrue(ss.toString() == "abc\ndef\nghi");
    },

    async testRunCommandLinesAcrossChunks() {
      // Writes a line in two chunks, then a last line without a line break
      let script = [
        'process.stdout.write("ok 1 - first\\nno");',
        'setTimeout(() => process.stdout.write("t ok 2 - second\\n"), 200);',
        'setTimeout(() => process.stdout.write("last"), 400);'
      ].join("");
      let lines = [];
      let result = await qx.tool.utils.Utils.runCommand({
        cwd: process.cwd(),
        cmd: process.execPath,
        args: ["-e", script],
        log: line => lines.push(line)
      });
      this.assertEquals(0, result.exitCode);
      this.assertArrayEquals(["ok 1 - first", "not ok 2 - second", "last"], lines);
      this.assertEquals("ok 1 - first\nnot ok 2 - second\nlast", result.output);
    },

    async testRunCommandOptionsAmongArgs() {
      let lines = [];
      let options = { log: line => lines.push(line) };
      let result = await qx.tool.utils.Utils.runCommand(
        process.cwd(),
        process.execPath,
        "-e",
        'console.log("hello")',
        options
      );

      this.assertEquals(0, result.exitCode);
      this.assertArrayEquals(["hello"], lines);
      this.assertUndefined(options.cmd, "the options of the caller must not be changed");
    },

    async testRunCommandKeepsOptionsObject() {
      let options = { cwd: process.cwd(), cmd: process.execPath, args: ["-e", ""] };
      let result = await qx.tool.utils.Utils.runCommand(options);
      this.assertEquals(0, result.exitCode);
      this.assertUndefined(options.log, "the options of the caller must not be changed");
      this.assertUndefined(options.error, "the options of the caller must not be changed");
    }
  }
});
