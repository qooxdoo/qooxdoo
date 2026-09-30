const qx = require("../qx");
const test = require("tape");
const Yargs = require("yargs/yargs");

/**
 * Parses `qx serve <args>` with the real serve options and asks the Cli
 * whether `option` was given on the command line
 */
function isExplicitArg(args, option) {
  let command = qx.tool.cli.commands.Serve.getYargsCommand();
  command.handler = () => {};
  let yargs = Yargs(["serve", ...args]).command(command);
  let argv = yargs.argv;
  return qx.tool.cli.Cli.prototype.isExplicitArg.call({ yargs, argv }, option);
}

test("isExplicitArg sees every spelling of --listen-port", assert => {
  for (let args of [
    ["--listen-port", "9000"],
    ["--listen-port=9000"],
    ["-p", "9000"],
    ["-p9000"],
    ["--listenPort", "9000"],
    ["-p", "8080"]
  ]) {
    assert.ok(isExplicitArg(args, "listen-port"), args.join(" "));
  }
  assert.end();
});

test("isExplicitArg ignores yargs defaults", assert => {
  assert.notOk(isExplicitArg([], "listen-port"), "no flag");
  assert.notOk(isExplicitArg(["-S"], "listen-port"), "other flag only");
  assert.notOk(isExplicitArg([], "rebuild-startpage"), "boolean default");
  assert.end();
});
