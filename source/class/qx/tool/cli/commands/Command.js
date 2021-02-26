/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017-2021 Zenesis Ltd

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com, @johnspackman)
     * Christian Boulanger (info@bibliograph.org, @cboulanger)

************************************************************************ */
const path = require("path");
const fsp = require("fs").promises;
const process = require("process");

/**
 * Base class for commands
 */
qx.Class.define("qx.tool.cli.commands.Command", {
  extend: qx.core.Object,

  construct: function(argv) {
    this.base(arguments);
    this.argv = argv;
  },

  properties: {
    /**
     * A reference to the current compilerApi instance
     * @var {qx.tool.cli.api.CompilerApi}
     */
    compilerApi: {
      check: "qx.tool.cli.api.CompilerApi",
      nullable: true
    }
  },

  members: {
    argv: null,
    compileJs: null,

    async process() {
      let argv = this.argv;
      if (argv.set) {
        let configDb = await qx.tool.cli.ConfigDb.getInstance();
        argv.set.forEach(function(kv) {
          var m = kv.match(/^([^=\s]+)(=(.+))?$/);
          if (m) {
            var key = m[1];
            var value = m[3];
            configDb.setOverride(key, value);
          } else {
            throw new qx.tool.utils.Utils.UserError(`Failed to parse environment setting commandline option '--set ${kv}'`);
          }
        });
      }
      // check if we have to migrate files
      await this.checkMigrations();
    },

    /**
     * This is to notify the commands after loading the full args.
     * The commands can overload special arg arguments here.
     * e.g. Deploy will will overload the target.
     *
     * @param {*} argv : args to process
     *
     */
    processArgs: function(argv) {
      // Nothing
    },

    /**
     * Returns the parsed command line arguments
     * @return {Object}
     */
    getArgs() {
      return this.argv;
    },

    /**
     * Check if the current application needs to be migrated
     */
    async checkMigrations(){
      let appQxVersion;
      try {
        appQxVersion = await this.getAppQxVersion();
      } catch (e) {
        // if no application qx verson exists, do nothing
        return;
      }
      const semaphore = path.join(process.cwd(), ".qxmigrationcheck");
      try {
        await fsp.stat(semaphore);
        this.debug(`Not checking migration because check is already in progress.`);
      } catch (e) {
        // run migration in dry-run mode
        await fsp.writeFile(semaphore,"");
        let runner = new qx.tool.migration.Runner().set({
          dryRun: true
        });
        let {pending, applied} = await runner.runMigrations();
        await fsp.unlink(semaphore);
        if (pending) {
          qx.tool.compiler.Console.warn(
            `*** There are ${pending} pending migrations. \n` +
            `*** Please run '(npx) qx migrate --dry-run --verbose' for details, \n`+
            `*** and '(npx) qx migrate' to apply th changes.`
          );
          process.exit(1);
        }
        this.debug("No migrations necessary.");
      }
    },

    /**
     * @see {@link qx.tool.config.Utils#getQxPath}
     */
    getQxPath: qx.tool.config.Utils.getQxPath.bind(qx.tool.config.Utils),

    /**
     * @see {@link qx.tool.config.Utils#getQxVersion}
     */
    getQxVersion: qx.tool.config.Utils.getQxVersion.bind(qx.tool.config.Utils),

    /**
     * @see {@link qx.tool.config.Utils#getAppQxPath}
     */
    getAppQxPath : qx.tool.config.Utils.getAppQxPath.bind(qx.tool.config.Utils),

    /**
     * @see {@link qx.tool.config.Utils#getAppQxVersion}
     */
    getAppQxVersion : qx.tool.config.Utils.getAppQxVersion.bind(qx.tool.config.Utils),

    // deprecated methods, will be removed

    /**
     * @deprecated {7.0} Use {@link qx.tool.config.Utils#getProjectData} instead
     */
    getProjectData : qx.tool.config.Utils.getProjectData.bind(qx.tool.config.Utils),

    /**
     * @deprecated {7.0} Use {@link qx.tool.config.Utils#getLibraryPath} instead
     */
    getLibraryPath : qx.tool.config.Utils.getLibraryPath.bind(qx.tool.config.Utils),

    /**
     * @deprecated {7.0} Use {@link qx.tool.config.Utils#getApplicationPath} instead
     */
    getApplicationPath: qx.tool.config.Utils.getApplicationPath.bind(qx.tool.config.Utils),

    /**
     * @deprecated {7.0} Use {@link qx.tool.config.Utils#getLibraryVersion} instead
     */
    getLibraryVersion : qx.tool.config.Utils.getLibraryVersion.bind(qx.tool.config.Utils),

    /**
     * @deprecated {7.0} Use {@link qx.tool.cli.Utils#run} instead
     */
    run : qx.tool.utils.Utils.run.bind(qx.tool.utils.Utils),

    /**
     * @deprecated {7.0} Use {@link qx.tool.cli.Utils#exec} instead
     */
    exec : qx.tool.utils.Utils.exec.bind(qx.tool.utils.Utils),

    /**
     * @deprecated {7.0} Use {@link qx.tool.cli.Utils#getTemplateDir} instead
     */
    getTemplateDir : qx.tool.utils.Utils.getTemplateDir.bind(qx.tool.utils.Utils),

    /**
     * @deprecated {7.0} Use {@link qx.tool.cli.Utils#isExplicitArg} instead
     */
    isExplicitArg : qx.tool.utils.Utils.isExplicitArg.bind(qx.tool.utils.Utils)
  }
});
