/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
   2017-2021 Christian Boulanger

   License:
   MIT: https://opensource.org/licenses/MIT
   See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Christian Boulanger (info@bibliograph.org, @cboulanger)

************************************************************************ */

const semver = require("semver");

/**
 * Lists compatible library packages
 */
qx.Class.define("qx.tool.cli.commands.package.Upgrade", {
  extend: qx.tool.cli.commands.Package,
  statics: {
    getYargsCommand() {
      return {
        command: "upgrade [library_uri]",
        describe:
          "if no library URI is given, upgrades all available libraries to the latest compatible version, otherwise upgrade only the package identified by the URI.",
        builder: {
          quiet: {
            alias: "q",
            describe: "No output"
          },

          verbose: {
            alias: "v",
            describe: "Verbose logging"
          },

          "releases-only": {
            alias: "r",
            describe:
              "Upgrade regular releases only (this leaves versions based on branches, commits etc. untouched)",
            default: true
          },

          reinstall: {
            alias: "R",
            describe: "Do not upgrade, reinstall current version"
          },

          prereleases: {
            alias: "p",
            describe: "Use prereleases if available"
          },

          "dry-run": {
            alias: "d",
            describe: "Show result only, do not actually upgrade"
          },

          "qx-version": {
            check: argv => semver.valid(argv.qxVersion),
            describe:
              "A semver string. If given, the qooxdoo version for which to upgrade the package"
          }
        }
      };
    }
  },

  members: {
    /**
     * Process the command
     * @return {Promise<void>}
     */
    async process() {
      await super.process();
      let qxVersion = await this.getAppQxVersion();
      await new qx.tool.cli.commands.package.Update({
        quiet: true,
        prereleases: this.argv.prereleases
      }).process();
      await new qx.tool.cli.commands.package.List({
        quiet: true,
        prereleases: this.argv.prereleases,
        qxVersion
      }).process();
      if (!this.argv.quiet) {
        qx.tool.compiler.Console.info(
          `Upgrading project dependencies to the latest available release for qooxdoo version ${qxVersion}:`
        );
      }
      let data = await this.getLockfileData();
      let found = false;
      const installer = new qx.tool.cli.commands.package.Install({
        quiet: this.argv.quiet,
        verbose: this.argv.verbose,
        qxVersion
      });

      for (const library of data.libraries) {
        // do not upggrade libraries that are not from a repository
        if (!library.repo_name || !library.repo_tag) {
          continue;
        }
        if (!library.uri) {
          library.uri = library.repo_name;
        }
        // if a library to upgrade has been provided, skip non-matching ones
        if (this.argv.library_uri && library.uri !== this.argv.library_uri) {
          continue;
        }
        found = true;
        if (
          this.argv.releasesOnly &&
          (!qx.lang.Type.isString(library.repo_tag) ||
            !library.repo_tag.startsWith("v"))
        ) {
          if (!this.argv.quiet) {
            qx.tool.compiler.Console.info(
              `Skipping ${library.library_name} (${library.uri}@${library.repo_tag}) since it is not a release.`
            );
          }
          continue;
        }
        if (this.argv.dryRun) {
          qx.tool.compiler.Console.info(
            `Dry run. Not upgrading ${library.library_name} (${library.uri}@${library.repo_tag}).`
          );

          continue;
        }
        if (library.repo_tag && this.argv.reinstall) {
          await installer.install(library.uri, library.repo_tag);
        } else {
          await installer.install(library.uri);
        }
      }
      if (!found) {
        if (this.argv.library_uri) {
          throw new qx.tool.utils.Utils.UserError(
            `Library '${this.argv.library_uri}' is not installed.`
          );
        } else {
          qx.tool.compiler.Console.info("No packages to upgrade.");
        }
      }
    }
  }
});
