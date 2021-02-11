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
qx.Class.define("qx.tool.cli.commands.Serve", {
  extend: qx.tool.cli.commands.Compile,

  statics: {

    YARGS_BUILDER: {
      "listen-port": {
        alias: "p",
        describe: "The port for the web browser to listen on",
        type: "number",
        default: 8080
      },
      "show-startpage": {
        alias: "S",
        describe: "Show the startpage with the list of applications and additional information",
        type: "boolean",
        default: null
      },
      "rebuild-startpage": {
        alias: "R",
        describe: "Rebuild the startpage with the list of applications and additional information",
        type: "boolean",
        default: false
      }
    },

    getYargsCommand: function() {
      return {
        command   : "serve",
        describe  : "runs a webserver to run the current application with continuous compilation, using compile.json",
        builder   : (() => {
          let res = Object.assign({}, 
            qx.tool.cli.commands.Compile.YARGS_BUILDER, 
            qx.tool.cli.commands.Serve.YARGS_BUILDER
          );
          delete res.watch;
          return res;
        })()
      };
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
    "beforeStart": "qx.event.type.Data",
    /**
     * Fired when server is started
    */
    "afterStart": "qx.event.type.Event"
  },

  members: {
    /** @type {qx.tool.utils.Website} the Website instance */
    _website: null,

    /*
     * @Override
     */
    process: async function() {
      this.argv.watch = true;
      this.argv["machine-readable"] = false;
      this.argv["feedback"] = false;
      await this.base(arguments);

      // build website if it hasn't been built yet.
      const website = this._website = new qx.tool.utils.Website();
      if (!await fs.existsAsync(website.getTargetDir())) {
        qx.tool.compiler.Console.info(">>> Building startpage...");
        await this._website.rebuildAll();
      } else if (this.argv.rebuildStartpage) {
        this._website.startWatcher();
      }

      await this.runWebServer();
    },

    /**
     *
     * returns the showStartpage flag
     *
     */
    showStartpage: function() {
      return this.__showStartpage;
    },

    /**
     * Runs the web server
     */
    runWebServer: async function() {
      let makers = this.getMakers().filter(maker => maker.getApplications().some(app => app.getStandalone()));
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
            if ((defaultMaker === null) && app.getWriteIndexHtmlToRoot()) {
              defaultMaker = maker;
            }
          }
        });
      });
      if (!defaultMaker && (apps.length === 1)) {
        defaultMaker = firstMaker;
      }
      
      this.__showStartpage = this.argv.showStartpage;
      if ((this.__showStartpage === undefined) || (this.__showStartpage === null)) {
        this.__showStartpage = defaultMaker === null;
      }
      var config = this._getConfig();
      const app = express();
      const website = new qx.tool.utils.Website();
      if (!this.__showStartpage) {
        app.use("/", express.static(defaultMaker.getTarget().getOutputDir()));
      } else {
        let s = await this.getAppQxPath();
        if (!await fs.existsAsync(path.join(s, "docs"))) {
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
            apps: maker.getApplications()
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
      this.addListenerOnce("made", e => {
        let server = http.createServer(app);
        this.fireDataEvent("beforeStart", {
          server: server,
          application: app,
          outputdir: defaultMaker.getTarget().getOutputDir()
        });
        server.on("error", e => {
          if (e.code === "EADDRINUSE") {
            qx.tool.compiler.Console.print("qx.tool.cli.serve.webAddrInUse", config.serve.listenPort);
            process.exit(-1);
          } else {
            qx.tool.compiler.Console.log("Error when starting web server: " + e);
          }
        });
        server.listen(config.serve.listenPort, () => {
          qx.tool.compiler.Console.print("qx.tool.cli.serve.webStarted", "http://localhost:" + config.serve.listenPort);
          this.fireEvent("afterStart");
        });
      });
    },

    __showStartpage: null


  },

  defer: function(statics) {
    qx.tool.compiler.Console.addMessageIds({
      "qx.tool.cli.serve.webStarted": "Web server started, please browse to %1",
      "qx.tool.cli.serve.webAddrInUse": "Web server cannot start because port %1 is already in use"
    });
  }
});

