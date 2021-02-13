require("../index");
const rimraf = require("rimraf");
const fs = qx.tool.utils.Promisify.fs;
const process = require("process");
const assert = require("assert");

const appNamespace = "testConfigSchemaApp";

(async () => {
  try {
    console.info("Running config file schema tests...");
    // delete existing app
    if (await fs.existsAsync(appNamespace) && await fs.statAsync(appNamespace)) {
      rimraf.sync(appNamespace);
    }
    // create a test app
    const appConfig = {noninteractive:true, namespace:appNamespace, theme: "Indigo", icontheme: "Tango", verbose:false};
    await (new qx.tool.cli.commands.Create(appConfig)).process();
    process.chdir(appNamespace);

    // run tests
    /**
     * Manifest.json
     */
    const manifestConfig = await qx.tool.config.Manifest.getInstance().load();
    // get a value
    assert.strictEqual(manifestConfig.getValue("provides.namespace"), appNamespace);
    // change a value
    manifestConfig.setValue("requires.@qooxdoo/framework", "^20.1.5");
    assert.strictEqual(manifestConfig.getValue("requires.@qooxdoo/framework"), "^20.1.5");
    // add new property
    manifestConfig.setValue("requires.foo", "^1.0.0");
    assert.strictEqual(manifestConfig.getValue("requires.foo"), "^1.0.0");
    // remove property
    manifestConfig.unset("requires.foo");
    assert.strictEqual(manifestConfig.getValue("requires.foo"), undefined);
    // transform a property
    assert.ok(manifestConfig.getValue("info.authors").length === 0);
    manifestConfig.transform("info.authors", authors => {
      authors.push({name: "John Doe", email:"john@acme.com"});
      return authors;
    });
    manifestConfig.transform("info.authors", authors => authors.concat({name: "Bob Schultz", email:"bob@acme.com"}));
    assert.ok(manifestConfig.getValue("info.authors").length === 2);
    // manipulating the data outside the api requires manual validation
    manifestConfig.getValue("info.authors").push({name: "Jane Miller", email:"jane@acme.com"});
    manifestConfig.validate();
    assert.ok(manifestConfig.getValue("info.authors").length === 3);
    // do something illegal according to the schema
    assert.throws(() => manifestConfig.setValue("requires.@qooxdoo/framework", 42));
    assert.throws(() => manifestConfig.setValue("foo", "bar"));
    await manifestConfig.save();
    /**
     * compile.json
     */
    const compilerConfig = await qx.tool.config.Compile.getInstance().load();
    assert.strictEqual(compilerConfig.getValue("applications.0.name"), appNamespace);

    // delete the test app
    process.chdir("..");
    rimraf.sync(appNamespace);
    console.info("All tests passed.");
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
