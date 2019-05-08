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

************************************************************************ */

require("qooxdoo");
const path = require("upath");
const process = require("process");
const express = require("express");
const http = require("http");

require("app-module-path").addPath(process.cwd() + "/node_modules");

require("./Compile");

/**
 * Handles compilation of the project by qxcompiler
 */
qx.Class.define("qx.tool.cli.commands.Serve", {
  extend: qx.tool.cli.commands.Compile,

  statics: {

    getYargsCommand: function() {
      return {
        command   : "serve [configFile]",
        describe  : "runs a webserver to run the current application with continuous compilation, using compile.json",
        builder   : {
          "target": {
            "default": "source",
            describe: "Set the target type: source or build or class name",
            requiresArg: true,
            type: "string"
          },
          "output-path": {
            describe: "Base path for output",
            nargs: 1,
            requiresArg: true,
            type: "string"
          },
          "locale": {
            describe: "Compile for a given locale",
            nargs: 1,
            requiresArg: true,
            type: "string",
            array: true
          },
          "update-po-files": {
            describe: "enables detection of translations and writing them out into .po files",
            type: "boolean",
            default: false,
            alias: "u"
          },
          "write-all-translations": {
            describe: "enables output of all translations, not just those that are explicitly referenced",
            type: "boolean"
          },
          "set": {
            describe: "sets an environment value",
            nargs: 1,
            requiresArg: true,
            type: "string",
            array: true
          },
          "machine-readable": {
            describe: "output compiler messages in machine-readable format",
            type: "boolean"
          },
          "verbose": {
            alias: "v",
            describe: "enables additional progress output to console",
            type: "boolean"
          },
          "minify": {
            describe: "disables minification (for build targets only)",
            choices: ["off", "minify", "mangle", "beautify"],
            default: "mangle"
          },
          "save-unminified": {
            describe: "Saves a copy of the unminified version of output files (build target only)",
            type: "boolean",
            default: false
          },
          "erase": {
            describe: "Enabled automatic deletion of the output directory when compiler version changes",
            type: "boolean",
            default: true
          },
          "typescript": {
            describe: "Outputs typescript definitions in qooxdoo.d.ts",
            type: "boolean"
          },
          "add-created-at": {
            describe: "Adds code to populate object's $$createdAt",
            type: "boolean"
          },
          "clean": {
            describe: "Deletes the target dir before compile",
            type: "boolean"
          },
          "listen-port": {
            describe: "The port for the web browser to listen on",
            type: "number",
            default: 8080
          },
          "write-library-info": {
            describe: "Write library information to the script, for reflection",
            type: "boolean",
            default: true
          },
          "bundling": {
            describe: "Whether bundling is enabled",
            type: "boolean",
            default: true
          }
        },
        handler   : function(argv) {
          return new qx.tool.cli.commands.Serve(argv)
            .process()
            .catch(e => {
              console.error(e.stack || e.message);
              process.exit(1);
            });
        }
      };
    }
  },

  members: {
    /*
     * @Override
     */
    process: async function() {
      this.argv.watch = true;
      this.argv["machine-readable"] = false;
      this.argv["feedback"] = false;
      return this.base(arguments).then(() => this.runWebServer());
    },

    /**
     *
     * @returns
     */
    runWebServer: function() {
      var maker = this._getMaker();
      var config = this._getConfig();
      var target = maker.getTarget();
      var apps = maker.getApplications();

      const app = express();
      if ((apps.length === 1) && apps[0].getWriteIndexHtmlToRoot()) {
        app.use("/", express.static(target.getOutputDir()));
      } else {
        app.use("/", express.static(path.join(__dirname, "../../../../../tool/cli/serve/build")));
        app.use("/" + target.getOutputDir(), express.static(target.getOutputDir()));
        var obj = {
          target: {
            type: target.getType(),
            outputDir: "/" + target.getOutputDir()
          },
          apps: apps.map(app => ({
            name: app.getName(),
            type: app.getType(),
            title: app.getTitle() || app.getName(),
            outputPath: target.getProjectDir(app) + "/"
          }))
        };
        app.get("/serve.api/apps.json", (req, res) => {
          res.set("Content-Type", "application/json");
          res.send(JSON.stringify(obj, null, 2));
        });
      }
      this.addListenerOnce("made", e => {
        let server = http.createServer(app);
        server.on("error", e => {
          if (e.code == "EADDRINUSE") {
            qx.tool.compiler.Console.print("qx.tool.cli.serve.webAddrInUse", config.serve.listenPort);
            process.exit(-1);
          } else {
            console.log("Error when starting web server: " + e);
          }
        });
        server.listen(config.serve.listenPort, () => 
          qx.tool.compiler.Console.print("qx.tool.cli.serve.webStarted", "http://localhost:" + config.serve.listenPort));
      });
    }
  },

  defer: function(statics) {
    qx.tool.compiler.Console.addMessageIds({
      "qx.tool.cli.serve.webStarted": "Web server started, please browse to %1",
      "qx.tool.cli.serve.webAddrInUse": "Web server cannot start because port %1 is already in use"
    });
  }
});

