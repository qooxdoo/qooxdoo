const path = require("path");
const fs = require("fs");
const https = require("https");
if (!qx.tool.compiler?.cli?.api) {
  return;
}

qx.Class.define("qx.compile.CompilerApi", {
  extend: qx.tool.compiler.cli.api.CompilerApi,

  members: {
    async load() {
      let originalCreateCliCommand = qx.tool.compiler.cli.commands.Test.createCliCommand;
      qx.tool.compiler.cli.commands.Test.createCliCommand = async function(clazz) {
        let cmd = await originalCreateCliCommand.call(this, clazz);
        
        cmd.addFlag(
          new qx.tool.cli.Flag("diag").set({
            description: "show diagnostic output",
            type: "boolean",
            value: false
          })
        );

        cmd.addFlag(
          new qx.tool.cli.Flag("terse").set({
            description: "show only summary and errors", 
            type: "boolean",
            value: false
          })
        );

        cmd.addFlag(
          new qx.tool.cli.Flag("headless").set({
            description: "runs test headless",
            type: "boolean", 
            value: false
          })
        );

        cmd.addFlag(
          new qx.tool.cli.Flag("browsers").set({
            description: "list of browsers to test against, currently supported chromium, firefox, webkit, none (=node tests only)",
            type: "string"
          })
        );

        return cmd;
      };
      this.addListener(
        "changeCommand",
        async function () {
          let command = this.getCommand();
          if (command instanceof qx.tool.compiler.cli.commands.package.Publish) {
            // Token sofort validieren - wird awaited weil async:true Property
            this.__npmToken = await this.__initNpmToken();
            command.addListener("beforeCommit", this.__fixDocVersion, this);
          }
        },
        this
      );
      let data = await this.base(arguments);
      if (!data.environment) {
        data.environment = {};
      }
      let manifestConfig = await qx.tool.config.Manifest.getInstance().load();
      let manifestData = manifestConfig.getData();
      data.environment["qx.compiler.version"] = manifestData.info.version;
      return data;
    },

    async __fixDocVersion(evt) {
      const data = evt.getData();
      const vars = path.join(process.cwd(), "docs", "_variables.json");
      if (await fs.existsAsync(vars)) {
        let var_data = await qx.tool.utils.Json.loadJsonAsync(vars);
        var_data.qooxdoo.version = data.version;
        if (data.argv.dryrun) {
          qx.tool.compiler.Console.info(
            "Dry run: Not changing _variables.json version..."
          );
        } else {
          await qx.tool.utils.Json.saveJsonAsync(vars, var_data);
          if (!data.argv.quiet) {
            qx.tool.compiler.Console.info(
              `Updated version in _variables.json.`
            );
          }
        }
      }
    },

    /**
     * Validates an npm token by calling the npm registry whoami endpoint
     * @param {string} token
     * @returns {Promise<boolean>}
     */
    __validateNpmToken(token) {
      return new Promise((resolve) => {
        const req = https.get({
          hostname: "registry.npmjs.org",
          path: "/-/whoami",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }, (res) => {
          resolve(res.statusCode === 200);
        });
        req.on("error", () => resolve(false));
        req.end();
      });
    },

    /**
     * Prompts user for npm token if not stored
     * @returns {Promise<string|null>}
     */
    async __promptForNpmToken() {
      const inquirer = require("inquirer");
      let response = await inquirer.prompt([
        {
          type: "input",
          name: "token",
          message:
            "Publishing to npm requires an access token - visit https://www.npmjs.com/settings/tokens " +
            "(you must assign permission to publish);\nWhat is your npm access Token ? "
        }
      ]);
      return response.token || null;
    },

    /**
     * Creates .npmrc file if it doesn't exist
     * @param {boolean} quiet
     */
    __ensureNpmrc(quiet) {
      const npmrc = path.join(process.cwd(), ".npmrc");
      if (!fs.existsSync(npmrc)) {
        fs.writeFileSync(
          npmrc,
          `//registry.npmjs.org/:_authToken=\${NPM_TOKEN}\n`,
          "utf8"
        );
        if (!quiet) {
          qx.tool.compiler.Console.info("Created .npmrc for npm publish.");
        }
      }
    },

    /**
     * Initialize and validate npm token
     * @returns {Promise<string>} valid token
     * @throws {UserError} if token invalid or not provided
     */
    async __initNpmToken() {
      let cfg = await qx.tool.compiler.cli.ConfigDb.getInstance();
      let npm = cfg.db("npm", {});

      if (!npm.token) {
        npm.token = await this.__promptForNpmToken();
        if (!npm.token) {
          throw new qx.tool.utils.Utils.UserError("You have not provided a npm token.");
        }
        await cfg.save();
      }

      qx.tool.compiler.Console.info("Validating npm token...");
      const isValid = await this.__validateNpmToken(npm.token);
      if (!isValid) {
        delete npm.token;
        await cfg.save();
        throw new qx.tool.utils.Utils.UserError(
          "npm token is invalid or expired. Please update your token."
        );
      }

      return npm.token;
    },

    /**
     * runs after the whole process is finished
     * @param cmd {qx.tool.cli.Command} current command
     * @param res {boolean} result of the just finished process
     */
    async afterProcessFinished(cmd, res) {
      if (res) {
        return;
      }
      if (cmd.classname !== "qx.tool.compiler.cli.commands.package.Publish") {
        return;
      }

      // Kein Token = einfach return
      if (!this.__npmToken) {
        return;
      }

      let env = { ...process.env };
      env.NPM_TOKEN = this.__npmToken;

      this.__ensureNpmrc(cmd.argv.quiet);

      let args = ["publish", "--access public"];
      if (cmd.argv.dryRun) {
        args.push("--dry-run");
      }
      if (cmd.argv.prerelease) {
        args.push("--tag beta");
      }

      return qx.tool.utils.Utils.runCommand({
        cwd: ".",
        cmd: "npm",
        args: args,
        env: env,
        log: console.log,
        error: console.log,
        shell: true
      });
    },

    /**
     * Register compiler tests
     * @param {qx.tool.cli.Command} command
     * @return {Promise<void>}
     */
    async beforeTests(command) {
      const that = this;
      command.addTest(
        new qx.tool.compiler.cli.api.Test("lint", async function () {
          qx.tool.compiler.Console.log("# ********* running lint ");
          this.setFailFast(true);  
          result = await qx.tool.utils.Utils.runCommand({
            cwd: ".",
            cmd: "node",
            args: [
              path.join(
                __dirname,
                "bin",
                command.getTargetType(),
                "qx"
              ),
              "lint",
              "--warn-as-error"
            ],
            log: console.log,
            error: console.log,
            shell: true   
          });

          if (result.exitCode === 0) {
            qx.tool.compiler.Console.log("ok");
          } else {
            qx.tool.compiler.Console.log("not ok");
          }
          this.setExitCode(result.exitCode);
        })
      );
      let argList = [
        "colorize",
        "verbose",
        "quiet",
        "fail-fast",
        "diag",
        "terse"
      ];
      command.addTest(
        new qx.tool.compiler.cli.api.Test("compiler test", async function () {
          qx.tool.compiler.Console.log("# ******** running compiler test");
          let args = argList;
          let curArgs = that.__getArgs(command, args);
          if (command.argv.verbose) {
             qx.tool.compiler.Console.log(curArgs);
          }
        result = await qx.tool.utils.Utils.runCommand({
            cwd: "test/tool",
            cmd: "node",
            args: curArgs
          });
          this.setExitCode(result.exitCode);
        })
      );
      if (command.argv["browsers"] != "none") {
        command.addTest(
          new qx.tool.compiler.cli.api.Test("framework test", async function () {
            qx.tool.compiler.Console.log("# ******** running framework test");
            this.setFailFast(true);  
            let args = argList.slice();
            args.push("browsers");
            args.push("headless");
            let curArgs = that.__getArgs(command, args);
            curArgs.push("--fail-fast");
            if (command.argv.verbose) {
               qx.tool.compiler.Console.log(curArgs);
            }
            result = await qx.tool.utils.Utils.runCommand({
              cwd: "test/framework",
              cmd: "node",
              args: curArgs
            });
            this.setExitCode(result.exitCode);
          })
        );
      }
    },

    __getArgs(command, argList) {
      let res = [];
      res.push(
        path.join(__dirname, "bin", command.getTargetType(), "qx")
      );
      res.push("test");
      for (const arg of argList) {
        if (command.argv[arg]) {
          res.push(`--${arg}=${command.argv[arg]}`);
        }
      }
      return res;
    }
  }
});

module.exports = {
  CompilerApi: qx.compile.CompilerApi
};
