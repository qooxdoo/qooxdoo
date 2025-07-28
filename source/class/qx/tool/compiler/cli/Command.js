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
qx.Class.define("qx.tool.compiler.cli.Command", {
  extend: qx.core.Object,
  statics: {
    /**
     * abstract factory to create the command
     * @returns {qx.cli.Command} the created command
     */
    async createCliCommand(clazz = this) {
      let cmd = new qx.cli.Command("");
      let cls = new clazz();
      cmd.setRun(async cmd => {
        let { argv } = cmd.getValues();
        argv.$cmd = cmd.getName();
        qx.tool.compiler.cli.ConfigLoader.getInstance().getCompilerApi().setCommand(cls);
        cls.setCompilerApi(
          qx.tool.compiler.cli.ConfigLoader.getInstance().getCompilerApi()
        );
        qx.tool.compiler.Console.getInstance().setVerbose(
          argv.verbose || false
        );
        cls.argv = argv;
        return cls.process();
      });
      cmd.addFlag(
        new qx.cli.Flag("verbose").set({
          shortCode: "v",
          description: "enables additional progress output to console",
          type: "boolean",
          value: false
        })
      );

      cmd.addFlag(
        new qx.cli.Flag("config-file").set({
          description: "Specify the config file to use",
          type: "string",
          shortCode: "c"
        })
      );

      cmd.addFlag(
        new qx.cli.Flag("debug").set({
          description: "enables debug output",
          value: false,
          type: "boolean"
        })
      );

      cmd.addFlag(
        new qx.cli.Flag("quiet").set({
          shortCode: "q",
          description: "suppresses normal progress output to console",
          type: "boolean"
        })
      );

      cmd.addFlag(
        new qx.cli.Flag("force").set({
          description: "Override warnings",
          type: "boolean",
          value: false,
          shortCode: "F"
        })
      );

      cmd.addFlag(
        new qx.cli.Flag("colorize").set({
          description:
            "colorize log output to the console using ANSI color codes",
          value: true,
          type: "boolean"
        })
      );

      return cmd;
    },

    async addSubcommands(rootCmd, rootClass) {
      for await (const cls of Object.keys(rootClass)) {
        let c = rootClass[cls];
        if (!c) {
          continue;
        }
        if (!c.createCliCommand) {
          continue;
        }
        let cmd = await rootClass[cls].createCliCommand();
        rootCmd.addSubcommand(cmd);
      }
    }
  },

  construct() {
    super();
  },

  properties: {
    /**
     * A reference to the current compilerApi instance
     * @var {qx.tool.compiler.cli.api.CompilerApi}
     */
    compilerApi: {
      check: "qx.tool.compiler.cli.api.CompilerApi",
      nullable: true
    }
  },

  members: {
    argv: null,

    async process() {
      throw new Error("Abstract method call");
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

        let { pending } = await runner.runMigrations();
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
     * @throws {typeof qx.tool.utils.Utils.UserError}
     *
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
     * @throws {typeof qx.tool.utils.Utils.UserError}
     *
     * @return {Promise<String>}
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
