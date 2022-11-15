/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2019 Zenesis Ltd

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com, @johnspackman)

************************************************************************ */

const path = require("upath");
const process = require("process");

/**
 * Runs a server application
 */
qx.Class.define("qx.tool.cli.commands.Run", {
  extend: qx.tool.cli.commands.Compile,

  statics: {
    YARGS_BUILDER: {
      inspect: {
        describe:
          "Whether to start node for debugging (ie with the --inspect argument)",
        type: "boolean",
        default: false
      },

      "inspect-brk": {
        describe:
          "Whether to start node for debugging and break immediately (ie with the --inspect-brk argument)",
        type: "boolean",
        default: false
      }
    },

    getYargsCommand() {
      return {
        command: "run [configFile]",
        describe:
          "runs a server application (written in node) with continuous compilation, using compile.json",
        builder: Object.assign(
          {},
          qx.tool.cli.commands.Compile.YARGS_BUILDER,
          qx.tool.cli.commands.Run.YARGS_BUILDER
        )
      };
    }
  },

  members: {
    /*
     * @Override
     */
    async process() {
      this.argv.watch = true;
      this.argv["machine-readable"] = false;
      this.argv["feedback"] = false;
      await super.process();
      let config = this.getCompilerApi().getConfiguration();
      if (!config.run) {
        qx.tool.compiler.Console.print("qx.tool.cli.run.noRunConfig");
        process.exit(-1);
      }

      if (!config.run.application) {
        qx.tool.compiler.Console.print("qx.tool.cli.run.noAppName");
        process.exit(-1);
      }

      let maker = null;
      let app = null;
      this.getMakers().forEach(tmp => {
        let apps = tmp
          .getApplications()
          .filter(app => app.getName() == config.run.application);
        if (apps.length) {
          if (maker) {
            qx.tool.compiler.Console.print("qx.tool.cli.run.tooManyMakers");
            process.exit(-1);
          }
          if (apps.length != 1) {
            qx.tool.compiler.Console.print(
              "qx.tool.cli.run.tooManyApplications"
            );

            process.exit(-1);
          }
          maker = tmp;
          app = apps[0];
        }
      });
      if (!app) {
        qx.tool.compiler.Console.print("qx.tool.cli.run.noAppName");
        process.exit(-1);
      }
      if (app.getType() != "node") {
        qx.tool.compiler.Console.print("qx.tool.cli.run.mustBeNode");
        process.exit(-1);
      }

      let target = maker.getTarget();

      let scriptname = path.join(target.getApplicationRoot(app), "index.js");
      let args = config.run.arguments || "";
      let debug = "";
      if (this.argv["inspect-brk"]) {
        debug = " --inspect-brk";
      } else if (this.argv["inspect"]) {
        debug = " --inspect";
      }
      let cmd = `node${debug} ${scriptname} ${args}`;

      let restartNeeded = true;
      this.addListener("making", evt => {
        restartNeeded = false;
      });

      this.addListener("writtenApplication", evt => {
        if (app === evt.getData()) {
          restartNeeded = true;
        }
      });

      /* eslint-disable @qooxdoo/qx/no-illegal-private-usage */
      this.addListener("made", async e => {
        if (this.__process) {
          if (!restartNeeded) {
            return;
          }

          try {
            await qx.tool.utils.Utils.killTree(this.__process.pid);
          } catch (ex) {
            //Nothing
          }
          this.__process = null;
        }
        console.log("Starting application: " + cmd);
        let child = (this.__process = require("child_process").exec(cmd));
        child.stdout.setEncoding("utf8");
        child.stdout.on("data", function (data) {
          console.log(data);
        });

        child.stderr.setEncoding("utf8");
        child.stderr.on("data", function (data) {
          console.error(data);
        });

        child.on("close", function (code) {
          console.log("Application has terminated");
          this.__process = null;
        });
        child.on("error", function (err) {
          console.error("Application has failed: " + err);
        });
      });
    }
  },

  defer(statics) {
    qx.tool.compiler.Console.addMessageIds(
      {
        "qx.tool.cli.run.noRunConfig":
          "Cannot run anything because the config.json does not have a `run` configuration",
        "qx.tool.cli.run.noAppName":
          "Cannot run anything because the config.json does not specify a unique application name",
        "qx.tool.cli.run.mustBeNode":
          "The application %1 is not a node application (only node applications are supported)",
        "qx.tool.cli.run.tooManyMakers":
          "Cannot run anything because multiple targets are detected",
        "qx.tool.cli.run.tooManyApplications":
          "Cannot run anything because multiple applications are detected"
      },

      "error"
    );
  }
});
