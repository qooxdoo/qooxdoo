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
  extend : qx.dev.unit.TestCase,

  members :
  {
    testStripSourceMapWriteStreamWholeStream : async function() {
      let ss = new qx.tool.utils.Utils.ToStringWriteStream();
      let ws = new qx.tool.utils.Utils.StripSourceMapTransform();
      ws.pipe(ss);
      await new Promise(resolve => {
        ws.on("finish", () => {
          resolve();
        });
        ws.write("abc\ndef\n//# sourceMappingURL=IApplication.js.map?dt=1587127076441\nghi");
        ws.end();
      });
      this.assertTrue(ss.toString() == "abc\ndef\nghi");
    },

    testStripSourceMapWriteStreamChunked1 : async function() {
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

    testStripSourceMapWriteStreamChunked2 : async function() {
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
    }
  }
});
