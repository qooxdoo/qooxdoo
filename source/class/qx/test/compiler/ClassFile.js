/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Henner Kollmann

************************************************************************ */

qx.Class.define("qx.test.compiler.ClassFile", {
  extend: qx.dev.unit.TestCase,

  construct() {
    this.__lib = new qx.tool.compiler.app.Library();
    this.__analyser = new qx.tool.compiler.Analyser();
    this.__analyser.setOutputDir("tmp/unittest");
    this.__lib.setRootDir(".");
    this.__lib.setSourcePath("unittest/compiler");
    this.__lib.getSourceFileExtension = () => ".js";
  },

  members: {
    async "test issue 633"() {
      var classFile = new qx.tool.compiler.ClassFile(
        this.__analyser,
        "classIssue633",
        this.__lib
      );

      await qx.tool.utils.Promisify.call(cb => classFile.load(cb));
      var dbClassInfo = {};
      classFile.writeDbInfo(dbClassInfo);
      this.assert(!dbClassInfo.unresolved);
    },

    async "test issue 519"() {
      var classFile = new qx.tool.compiler.ClassFile(
        this.__analyser,
        "classIssue519",
        this.__lib
      );

      await qx.tool.utils.Promisify.call(cb => classFile.load(cb));
      var dbClassInfo = {};
      classFile.writeDbInfo(dbClassInfo);
      this.assert(!dbClassInfo.unresolved);
    },

    async "test issue 524"() {
      var classFile = new qx.tool.compiler.ClassFile(
        this.__analyser,
        "classIssue524",
        this.__lib
      );

      await qx.tool.utils.Promisify.call(cb => classFile.load(cb));
      var dbClassInfo = {};
      classFile.writeDbInfo(dbClassInfo);
      this.assert(!dbClassInfo.unresolved);
    },

    async "test issue 726"() {
      var classFile = new qx.tool.compiler.ClassFile(
        this.__analyser,
        "classIssue726",
        this.__lib
      );

      await qx.tool.utils.Promisify.call(cb => classFile.load(cb));
      var dbClassInfo = {};
      classFile.writeDbInfo(dbClassInfo);
      this.assert(!dbClassInfo.unresolved);
    },

    __lib: null,
    __analyser: null
  }
});
