/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017 Zenesis Ltd

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com, @johnspackman)
     * Christian Boulanger (info@bibliograph.org, @cboulanger)

************************************************************************ */

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
            throw new Error(`Failed to parse environment setting commandline option '--set ${kv}'`);
          }
        });
      }

      // check if we have to migrate files
      await (new qx.tool.cli.commands.package.Migrate(this.argv)).process(true);
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
     * @deprecated {7.0} Use {@link qx.tool.config.Utils#getProjectData} instead
     */
    getProjectData : qx.tool.config.Utils.getProjectData,

    /**
     * @deprecated {7.0} Use {@link qx.tool.config.Utils#getLibraryPath} instead
     */
    getLibraryPath : qx.tool.config.Utils.getLibraryPath,

    /**
     * @deprecated {7.0} Use {@link qx.tool.config.Utils#getApplicationPath} instead
     */
    getApplicationPath: qx.tool.config.Utils.getApplicationPath,

    /**
     * @deprecated {7.0} Use {@link qx.tool.config.Utils#getAppQxPath} instead
     */
    getAppQxPath : qx.tool.config.Utils.getAppQxPath,

    /**
     * @deprecated {7.0} Use {@link qx.tool.config.Utils#getQxPath} instead
     */
    getGlobalQxPath: qx.tool.config.Utils.getQxPath,

    /**
     * @deprecated {7.0} Use {@link qx.tool.config.Utils#getUserQxPath} instead
     */
    getUserQxPath : qx.tool.config.Utils.getUserQxPath,

    /**
     * @deprecated {7.0} Use {@link qx.tool.config.Utils#getUserQxVersion} instead
     */
    getUserQxVersion : qx.tool.config.Utils.getUserQxVersion,

    /**
     * @deprecated {7.0} Use {@link qx.tool.config.Utils#getLibraryVersion} instead
     */
    getLibraryVersion : qx.tool.config.Utils.getLibraryVersion,

    /**
     * @deprecated {7.0} Use {@link qx.tool.cli.Utils#run} instead
     */
    run : qx.tool.cli.Utils.run,

    /**
     * @deprecated {7.0} Use {@link qx.tool.cli.Utils#exec} instead
     */
    exec : qx.tool.cli.Utils.exec,

    /**
     * @deprecated {7.0} Use {@link qx.tool.cli.Utils#getTemplateDir} instead
     */
    getTemplateDir : qx.tool.cli.Utils.getTemplateDir,

    /**
     * @deprecated {7.0} Use {@link qx.tool.cli.Utils#isExplicitArg} instead
     */
    isExplicitArg : qx.tool.cli.Utils.isExplicitArg
  }
});
