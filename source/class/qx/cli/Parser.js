/* ************************************************************************
 *
 *  Zen [and the art of] CMS
 *
 *  https://zenesis.com
 *
 *  Copyright:
 *    2019-2022 Zenesis Ltd, https://www.zenesis.com
 *
 *  License:
 *    MIT (see LICENSE in project root)
 *
 *  Authors:
 *    John Spackman (john.spackman@zenesis.com, @johnspackman)
 *    Henner Kollmann (Henner.Kollmann@gmx.de, @hkollmann)
 *
 * ************************************************************************ */
qx.Class.define("qx.cli.Parser", {
  extend: qx.core.Object,

  construct(argv, rootCmd) {
    super();
    this.__argv = argv;
    this.__rootCmd = rootCmd;
  },

  members: {
    parse() {
      let argv = this.__argv;
      let cmd = null;
      for (let i = 0; i < argv.length; i++) {
        let arg = argv[0];
        if (arg.startsWith("--")) {
        }
      }
    }
  }
});
