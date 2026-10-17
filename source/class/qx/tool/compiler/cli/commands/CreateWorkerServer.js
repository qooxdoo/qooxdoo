const fs = require("fs");
const process = require("process");
const path = require("upath");

/**
 * Cleans generated and cache files
 */
qx.Class.define("qx.tool.compiler.cli.commands.CreateWorkerServer", {
  extend: qx.tool.compiler.cli.Command,
  statics: {
    async createCliCommand() {
      let cmd = new qx.tool.cli.Command("create-worker-server").set({
        description: "Starts a worker process for transpilation - INTERNAL USE ONLY",
        hidden: true
      });
      cmd.set({
        hidden: true,
        run: async cmd => {
          let workerServer = new qx.tool.worker.WorkerServer();
          await workerServer.start();
          await new Promise(() => {}); //never resolve, we want this process to keep running until killed
        }
      });
      return cmd;
    }
  }
});
