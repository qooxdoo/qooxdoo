/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017 Christian Boulanger and others

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Boulanger (info@bibliograph.org, @cboulanger)
     * Henner Kollmann (hkollmann)

************************************************************************ */

const fs = require("fs");
const process = require("process");
const path = require("upath");
const rimraf = require("rimraf");

/**
 * Migrates code to ES6 (partially)
 */
qx.Class.define("qx.tool.cli.commands.Es6ify", {
  extend: qx.tool.cli.commands.Command,
  statics: {
    getYargsCommand: function () {
      return {
        command: "es6ify [file]",
        describe: "help migrate code to ES6",
        builder: {
          verbose: {
            alias: "v",
            describe: "Verbose logging",
          },
        },
      };
    },
  },

  members: {
    async process() {
      await this.base(arguments);
      let ify = new qx.tool.compiler.Es6ify(this.argv.file);
      ify.transform();
    },
  },
});
