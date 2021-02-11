/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
   2017 Christian Boulanger

   License:
   MIT: https://opensource.org/licenses/MIT
   See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Christian Boulanger (info@bibliograph.org, @cboulanger)

************************************************************************ */
/**
 * Lists compatible library packages
 */
qx.Class.define("qx.tool.cli.commands.package.Upgrade", {
  extend: qx.tool.cli.commands.Package,
  statics: {
    getYargsCommand: function () {
      return {
        command: "upgrade [library_uri]",
        describe:
          "if no library URI is given, upgrades all available libraries to the latest compatible version, otherwise upgrade only the package identified by the URI.",
        builder: {
          quiet: {
            alias: "q",
            describe: "No output"
          },
          "verbose": {
            alias: "v",
            describe: "Verbose logging"
          },
          "releases-only": {
            alias: "r",
            describe: "Upgrade regular releases only (this leaves versions based on branches, commits etc. untouched)",
            default: true
          },
          "reinstall": {
            alias: "R",
            describe: "Do not upgrade, reinstall current version"
          },
          "dryrun":{
            alias: "d",
            describe: "Show result only, do not actually upgrade"
          },
          "prereleases": {
            alias: "p",
            describe: "Use prereleases if available"
          }
        }
      };
    }
  },

  members: {
    async process() {
      await this.base(arguments);
      await (new qx.tool.cli.commands.package.Update({
        quiet:true,
        prereleases: this.argv.prereleases
      })).process();
      await (new qx.tool.cli.commands.package.List({
        quiet:true,
        prereleases: this.argv.prereleases
      })).process();
      if (!this.argv.quiet) {
        qx.tool.compiler.Console.info("Upgrading project dependencies to their latest available releases...");
      }
      let data = await this.getLockfileData();
      let found = false;
      const installer = new qx.tool.cli.commands.package.Install({
        quiet: this.argv.quiet,
        verbose: this.argv.verbose
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
        if (this.argv.releasesOnly && (!qx.lang.Type.isString(library.repo_tag) || !library.repo_tag.startsWith("v"))) {
          if (!this.argv.quiet) {
            qx.tool.compiler.Console.info(`Skipping ${library.library_name} (${library.uri}@${library.repo_tag}) since it is not a release.`);
          }
          continue;
        }
        try {
          if (this.argv.dryrun) {
            qx.tool.compiler.Console.info(`Dry run. Not upgrading ${library.library_name} (${library.uri}@${library.repo_tag}).`);
            continue;
          }
          if (library.repo_tag && this.argv.reinstall) {
            await installer.install(library.uri, library.repo_tag);
          } else {
            await installer.install(library.uri);
          }
        } catch (e) {
          qx.tool.compiler.Console.warn(e.message);
        }
      }
      if (!found) {
        throw new qx.tool.utils.Utils.UserError(`Library '${this.argv.library_uri}' is not installed.`);
      }
    }
  }
});
