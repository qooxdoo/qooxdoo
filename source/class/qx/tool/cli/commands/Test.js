/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2020 Henner Kollmann

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project"s top-level directory for details.


************************************************************************ */
const fs = require("fs");
const path = require("path");
const process = require("process");

/**
 * Compiles the project, serves it up as a web page (default, can be turned off),
 * and dispatches the "runTests" event.
 *
 * All tests that should be run need to register themselves by the
 * test command. This is usually done in a `compile.js` file by either
 *
 * - adding a listener for the "runTests" event fired on the command
 * instance  in the `load()` method of the class extending {@link
 * qx.tool.cli.api.CompilerApi} or {@link qx.tool.cli.api.CompilerApi}.
 *
 * - or by implementing a `beforeTests()` method in the class
 * extending {@link qx.tool.cli.api.CompilerApi}
 *
 * The event and/or method is called with a {@link qx.event.type.Data}
 * containing the command instance.
 *
 */
qx.Class.define("qx.tool.cli.commands.Test", {
  extend: qx.tool.cli.commands.Serve,

  statics: {
    /**
     * The name of the file containing the compile config for the testrunner
     * defaults to "compile-test.json"
     */
    CONFIG_FILENAME: "compile-test.json",

    YARGS_BUILDER: {
      "fail-fast": {
        describe: "Exit on first failing test",
        default: false,
        type: "boolean"
      },

      "disable-webserver": {
        describe: "Disables the start of the webserver",
        default: false,
        type: "boolean"
      }
    },

    getYargsCommand() {
      return {
        command: "test",
        describe: "run test for current project",
        builder: (() => {
          let res = Object.assign(
            {},
            qx.tool.cli.commands.Compile.YARGS_BUILDER,
            qx.tool.cli.commands.Serve.YARGS_BUILDER,
            qx.tool.cli.commands.Test.YARGS_BUILDER
          );

          delete res.watch;
          delete res["machine-readable"];
          delete res["feedback"];
          delete res["show-startpage"];
          delete res["rebuild-startpage"];
          return res;
        })()
      };
    }
  },

  events: {
    /**
     * Fired to start tests.
     *
     * The event data is the command instance:
     *  cmd: {qx.tool.cli.commands.Test}
     */
    runTests: "qx.event.type.Data"
  },

  construct(argv) {
    super(argv);
    this.__tests = [];
    this.addListener("changeExitCode", evt => {
      let exitCode = evt.getData();
      // overwrite error code only in case of errors
      if (exitCode !== 0 && argv.failFast) {
        process.exit(exitCode);
      }
    });
  },

  properties: {
    /**
     * The exit code of all tests.
     *
     */
    exitCode: {
      check: "Number",
      event: "changeExitCode",
      nullable: false,
      init: 0
    },

    /**
     * Is the webserver instance needed for the test?
     */
    needsServer: {
      check: "Boolean",
      nullable: false,
      init: false
    }
  },

  members: {
    /**
     * @var {Array}
     */
    __tests: null,

    /**
     * add a test object and listens for the change of exitCode property
     * @param {qx.tool.cli.api.Test} test
     */
    addTest(test) {
      qx.core.Assert.assertInstance(test, qx.tool.cli.api.Test);
      test.addListenerOnce("changeExitCode", evt => {
        let exitCode = evt.getData();
        // handle result and inform user
        if (exitCode === 0) {
          if (test.getName() && !this.argv.quiet) {
            qx.tool.compiler.Console.info(`Test '${test.getName()}' passed.`);
          }
        } else if (test.getName()) {
          qx.tool.compiler.Console.error(
            `Test '${test.getName()}' failed with exit code ${exitCode}.`
          );
        }
        // overwrite error code only in case of errors
        if (exitCode !== 0) {
          this.setExitCode(exitCode);
        }
      });
      this.__tests.push(test);
      return test;
    },

    /**
     * @Override
     */
    async process() {
      this.argv.watch = false;
      this.argv["machine-readable"] = false;
      this.argv["feedback"] = false;
      this.argv["show-startpage"] = false;
      // check for special test compiler config
      if (
        !this.argv.configFile &&
        fs.existsSync(
          path.join(process.cwd(), qx.tool.cli.commands.Test.CONFIG_FILENAME)
        )
      ) {
        this.argv.configFile = qx.tool.cli.commands.Test.CONFIG_FILENAME;
      }
      this.addListener("making", () => {
        if (
          !this.hasListener("runTests") &&
          this.__tests.length === 0 &&
          (!this.getCompilerApi() ||
            typeof this.getCompilerApi().beforeTests != "function")
        ) {
          qx.tool.compiler.Console.error(
            `No tests are registered! You need to either register tests, or install a testrunner.
             See documentation at https://qooxdoo.org/docs/#/development/testing/`
          );

          process.exit(1);
        }
      });

      this.addListener("afterStart", async () => {
        qx.tool.compiler.Console.info(`Running unit tests`);
        await this.fireDataEventAsync("runTests", this);
        if (
          this.getCompilerApi() &&
          typeof this.getCompilerApi().beforeTests == "function"
        ) {
          await this.getCompilerApi().beforeTests(this);
        }
        for (let test of this.__tests) {
          qx.tool.compiler.Console.info(`Running ${test.getName()}`);
          await test.execute();
        }
        // for bash exitcode is not allowed to be more then 255!
        // We must exit the process here because serve runs infinite!
        process.exit(Math.min(255, this.getExitCode()));
      });

      if (this.__needsServer()) {
        // start server
        await super.process();
      } else {
        // compile only
        await qx.tool.cli.commands.Compile.prototype.process.call(this);
        // since the server is not started, manually fire the event necessary for firing the "runTests" event
        await this.fireDataEventAsync("afterStart");
      }
    },

    __needsServer() {
      return (
        !this.argv.disableWebserver &&
        (this.getNeedsServer() ||
          this.__tests.some(test => test.getNeedsServer()))
      );
    }
  }
});
