/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

/**
 * Tests which port `qx serve` (and `qx test`) listens on
 */
qx.Class.define("qx.test.tool.cli.ServeListenPort", {
  extend: qx.dev.unit.TestCase,

  members: {
    async __getListenPort(args, config) {
      let cmd = await qx.tool.compiler.cli.commands.Serve.createCliCommand();
      cmd.parseRoot(["serve", ...args]);
      let { argv } = cmd.getValues();
      return qx.tool.compiler.cli.commands.Serve.getListenPort(argv, config);
    },

    async testDefaultPort() {
      this.assertEquals(8080, await this.__getListenPort([], {}));
    },

    async testConfigPort() {
      this.assertEquals(18841, await this.__getListenPort([], { serve: { listenPort: 18841 } }));
    },

    async testFlagBeatsConfig() {
      let config = { serve: { listenPort: 18841 } };
      this.assertEquals(18842, await this.__getListenPort(["--listen-port", "18842"], config));
      this.assertEquals(18843, await this.__getListenPort(["-p", "18843"], config));
    }
  }
});
