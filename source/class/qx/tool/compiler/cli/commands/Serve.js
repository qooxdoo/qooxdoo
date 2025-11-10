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

const path = require("upath");
const process = require("process");
const express = require("express");
const http = require("http");
const fs = qx.tool.utils.Promisify.fs;
require("app-module-path").addPath(process.cwd() + "/node_modules");
/**
 * Compiles the project and serves it up as a web page
 */
qx.Class.define("qx.tool.compiler.cli.commands.Serve", {
  extend: qx.tool.compiler.cli.commands.Compile,

  statics: {
    async createCliCommand(clazz = this) {
      let cmd = await qx.tool.compiler.cli.commands.Compile.createCliCommand(clazz);
      cmd.set({
        name: "serve",
        description: "runs a webserver to run the current application with continuous compilation, using compile.json"
      });

      // Remove watch flag since serve doesn't use it
      cmd.removeFlag("watch");

      // Add serve-specific flags
      cmd.addFlag(
        new qx.tool.cli.Flag("listen-port").set({
          shortCode: "p",
          description: "The port for the web browser to listen on",
          type: "integer",
          value: 8080
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("show-startpage").set({
          shortCode: "S",
          description: "Show the startpage with the list of applications and additional information",
          type: "boolean",
          value: false
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("rebuild-startpage").set({
          shortCode: "R",
          description: "Rebuild the startpage with additional information",
          type: "boolean",
          value: false
        })
      );

      return cmd;
    }
  },

  events: {
    /**
     * Fired before server start
     *
     * The event data is an object with the following properties:
     *   server: the http server
     *   application: the used express server instance
     *   outputdir: the qooxdoo app output dir
     */
    beforeStart: "qx.event.type.Data",
    /**
     * Fired when server is started
     */
    afterStart: "qx.event.type.Event"
  },

  members: {
    /*
     * @Override
     */
    async process() {
      this.argv.watch = true;
      this.argv["machine-readable"] = false;
      this.argv["feedback"] = false;
      if (this.argv.rebuildStartpage) {
          qx.tool.compiler.Console.info(">>> Building startpage...");
          await website.generateSite();
          return;
      }
      if (this.argv["show-startpage"]) {
        // build website if it hasn't been built yet or if rebuild is requested
        const website = new qx.tool.utils.Website();
        if (!(await fs.existsAsync(website.getTargetDir()))) {
          qx.tool.compiler.Console.info(">>> Building startpage...");
          await website.generateSite();
        }
      }
      this.addListenerOnce("made", () => {
        this.runWebServer();
      });
      return super.process();
    },

    /**
     *
     * returns the showStartpage flag
     *
     */
    showStartpage() {
      return this.__showStartpage;
    },

    /**
     * Runs the web server
     */
    async runWebServer() {
      let makers = this.getMakers().filter(maker =>
        maker.getApplications().some(app => app.getStandalone())
      );

      let apps = [];
      let defaultMaker = null;
      let firstMaker = null;
      makers.forEach(maker => {
        maker.getApplications().forEach(app => {
          if (app.isBrowserApp() && app.getStandalone()) {
            apps.push(app);
            if (firstMaker === null) {
              firstMaker = maker;
            }
            if (defaultMaker === null && app.getWriteIndexHtmlToRoot()) {
              defaultMaker = maker;
            }
          }
        });
      });
      if (!defaultMaker && apps.length === 1) {
        defaultMaker = firstMaker;
      }

      this.__showStartpage = this.argv.showStartpage;
      if (this.__showStartpage === undefined || this.__showStartpage === null) {
        this.__showStartpage = defaultMaker === null;
      }
      const app = express();
      app.use((req, res, next) => {
        res.set({
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers":
            "Origin, X-Requested-With, Content-Type, Accept",
          "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
          "Content-Security-Policy":
            "default-src *  data: blob: filesystem: about: ws: wss: 'unsafe-inline' 'unsafe-eval'; script-src * data: blob: 'unsafe-inline' 'unsafe-eval'; connect-src * data: blob: 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src * data: blob: ; style-src * data: blob: 'unsafe-inline'; font-src * data: blob: 'unsafe-inline';"
        });

        next();
      });
      if (!this.__showStartpage) {
        app.use("/", express.static(defaultMaker.getTarget().getOutputDir()));
      } else {
        const website = new qx.tool.utils.Website();
        let s = await qx.tool.config.Utils.getQxPath();
        if (!(await fs.existsAsync(path.join(s, "docs")))) {
          s = path.dirname(s);
        }
        app.use("/docs", express.static(path.join(s, "docs")));
        app.use("/apps", express.static(path.join(s, "apps")));
        app.use("/", express.static(website.getTargetDir()));
        var appsData = [];
        makers.forEach(maker => {
          let target = maker.getTarget();
          let out = path.normalize("/" + target.getOutputDir());
          app.use(out, express.static(target.getOutputDir()));
          appsData.push({
            target: {
              type: target.getType(),
              outputDir: out
            },

            apps: maker
              .getApplications()
              .filter(app => app.getStandalone())
              .map(app => ({
                isBrowser: app.isBrowserApp(),
                name: app.getName(),
                type: app.getType(),
                title: app.getTitle() || app.getName(),
                appClass: app.getClassName(),
                description: app.getDescription(),
                outputPath: target.getProjectDir(app) // no trailing slash or link will break
              }))
          });
        });
        app.get("/serve.api/apps.json", (req, res) => {
          res.set("Content-Type", "application/json");
          res.send(JSON.stringify(appsData, null, 2));
        });
      }
      let config = this.getCompilerApi().getConfiguration();
      let listenPort = config?.serve?.listenPort ?? this.argv.listenPort;
      let server = http.createServer(app);
      this.fireDataEvent("beforeStart", {
        server: server,
        application: app,
        outputdir: defaultMaker.getTarget().getOutputDir()
      });
      server.on("error", e => {
        if (e.code === "EADDRINUSE") {
          qx.tool.compiler.Console.print(
            "qx.tool.compiler.cli.serve.webAddrInUse",
            listenPort
          );

          process.exit(1);
        } else {
          qx.tool.compiler.Console.log("Error when starting web server: " + e);
        }
      });
      server.listen(listenPort, () => {
        qx.tool.compiler.Console.print(
          "qx.tool.compiler.cli.serve.webStarted",
          "http://localhost:" + listenPort
        );

        this.fireEvent("afterStart");
      });
    },

    __showStartpage: null
  },

  defer(statics) {
    qx.tool.compiler.Console.addMessageIds({
      "qx.tool.compiler.cli.serve.webStarted": "Web server started, please browse to %1",
      "qx.tool.compiler.cli.serve.webAddrInUse":
        "Web server cannot start because port %1 is already in use"
    });
  }
});
