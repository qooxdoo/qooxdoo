require("../index");
const rimraf = qx.tool.utils.Promisify.promisify(require("rimraf"));
const fs = qx.tool.utils.Promisify.fs;
const process = require("process");
const assert = require("assert");
const path = require("upath");

const appNamespace = "testCommandsApp";

(async () => {
  try {
    console.info("Running command tests...");
	
    process.chdir("test-commands");

    try {
      throw new qx.tool.utils.Utils.UserError("test");
    } catch (e) {
      console.error(e);
      assert.ok(e.name === "UserError");
    }
	
    // delete existing app
    if (await fs.existsAsync(appNamespace) && await fs.statAsync(appNamespace)) {
      await rimraf(appNamespace, {maxBusyTries: 10});
    }
    
    // create a test app
    const commands = qx.tool.cli.commands;
    const appConfig = {noninteractive:true, namespace:appNamespace, theme: "Indigo", icontheme: "Tango"};
    await (new commands.Create(appConfig)).process();
    process.chdir(appNamespace);

    // run tests
    let actual; 
    let expected;
    const manifestModel = await qx.tool.config.Manifest.getInstance().load();

    // qx add script --rename=test-commands-renamed-to.js test/testdata/test-commands-rename.js
    let filename = "test-commands-rename.js";
    let scriptpath = path.join("..", filename);
    let resourcedir = "js";
    let args = {verbose:true, noninteractive:true, scriptpath, resourcedir, rename:"test-commands-renamed-to.js"};
    await (new commands.add.Script(args)).process();
    actual = manifestModel.getValue("externalResources.script.0");
    expected = path.join(appNamespace, resourcedir, "test-commands-renamed-to.js");
    assert.strictEqual(actual, expected);
    let filePath = path.join(process.cwd(), "source/resource", expected);
    assert.ok(await fs.existsAsync(filePath), "File was not copied.");

    // qx add script --undo --rename=test-commands-renamed-to.js test/testdata/test-commands-rename.js
    args.undo = true;
    await (new commands.add.Script(args)).process();
    actual = manifestModel.getValue("externalResources.script").length;
    expected = 0;
    assert.strictEqual(actual, expected);
    assert.ok(!await fs.existsAsync(filePath), "File was not removed.");

    // delete the test app
    process.chdir("..");
    await rimraf(appNamespace, {maxBusyTries: 10});
    console.info("All tests passed.");
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
