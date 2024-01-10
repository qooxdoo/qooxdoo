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

  construct(argv) {
    super();
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
        argv.set.forEach(function (kv) {
          var m = kv.match(/^([^=\s]+)(=(.+))?$/);
          if (m) {
            var key = m[1];
            var value = m[3];
            configDb.setOverride(key, value);
          } else {
            throw new qx.tool.utils.Utils.UserError(
              `Failed to parse environment setting commandline option '--set ${kv}'`
            );
          }
        });
      }
    },

    /**
     * This is to notify the commands after loading the full args.
     * The commands can overload special arg arguments here.
     * e.g. Deploy will will overload the target.
     *
     * @param {*} argv : args to process
     *
     */
    processArgs(argv) {
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
    async checkMigrations() {
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
        this.debug(
          `Not checking migration because check is already in progress.`
        );
      } catch (e) {
        // run migration in dry-run mode
        await fsp.writeFile(semaphore, "");
        let runner = new qx.tool.migration.Runner().set({
          dryRun: true
        });

        let { pending, applied } = await runner.runMigrations();
        await fsp.unlink(semaphore);
        if (pending) {
          qx.tool.compiler.Console.warn(
            `*** There are ${pending} pending migrations. \n` +
              `*** Please run '(npx) qx migrate --dry-run --verbose' for details, \n` +
              `*** and '(npx) qx migrate' to apply the changes.`
          );

          if (!process.env.IGNORE_MIGRATION_WARNING) {
            process.exit(1);
          }
          return;
        }
        this.debug("No migrations necessary.");
      }
    },

    /**
     * @see {@link qx.tool.config.Utils#getQxPath}
     */
    getQxPath: qx.tool.config.Utils.getQxPath.bind(qx.tool.config.Utils),

    /**
     *
     * @see {@link qx.tool.config.Utils#getCompilerVersion}
     * @returns {String}
     */
    getCompilerVersion() {
      return qx.tool.config.Utils.getCompilerVersion();
    },

    /**
     * Returns the qooxdoo version, either from the `--qx-version` command line
     * parameter (if supported by the command and supplied by the user) or from
     * {@link qqx.tool.config.Utils#getQxVersion()}. Throws if no version can be
     * determined.
     *
     * @throws {qx.tool.utils.Utils.UserError}
     * @return {Promise<String>}
     */
    getQxVersion() {
      try {
        return this.argv.qxVersion || qx.tool.config.Utils.getQxVersion();
      } catch (e) {
        throw new qx.tool.utils.Utils.UserError(e.message);
      }
    },

    /**
     * Returns the qooxdoo version used in the application in the current
     * directory via {@link qx.tool.config.Utils#getAppQxVersion}. Can be
     * overridden by the `--qx-version` command line parameter (if supported by
     * the command and supplied by the user). Throws if no version can be
     * determined.
     *
     * @return {Promise<String>}
     * @throws {qx.tool.utils.Utils.UserError}
     */
    getAppQxVersion() {
      try {
        return this.argv.qxVersion || qx.tool.config.Utils.getAppQxVersion();
      } catch (e) {
        throw new qx.tool.utils.Utils.UserError(e.message);
      }
    },

    /**
     * Returns the calculated target type
     * @returns {String}
     */
    getTargetType() {
      return (
        this.argv.target ||
        this.getCompilerApi().getConfiguration().defaultTarget ||
        "source"
      );
    }
  }
});
