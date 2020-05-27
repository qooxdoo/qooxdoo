# Testing your application

To test your application we provide a test infrastructure
based on the `qx test` command and an extension in compile.js.

To use this you have to generate a compile.js file as
described [here](../compiler/configuration/api.md#compile.js).

Here is an example for running a browser test based on
[playwright](https://www.npmjs.com/package/playwright). Remember
you have to make sure to prepare the runtime environment in your
build scripts yourself (such as installing required libraries and
npm modules), since they are not included in qooxdoo (see [this
example](https://github.com/qooxdoo/qxl.apiviewer/blob/master/.github/workflows/build-and-deploy.yml)).

```javascript

qx.Class.define("myapp.compile.LibraryApi", {
  extend: qx.tool.cli.api.LibraryApi,

  members: {
    async load() {
      let command = this.getCompilerApi().getCommand();
      // Register a test if the calling command is test
      if (command instanceof qx.tool.cli.commands.Test) {
        command.addListener("runTests", this.__appTesting, this);
     }
    },


   // Test application in headless Chrome and Firefox
   // see https://github.com/microsoft/playwright/blob/master/docs/api.md
   __appTesting : async function (evt) {
  
      // register test
      const cmd = evt.getData();
      const test = new qx.tool.cli.api.Test("Open page in browsers");
      cmd.registerTest(test);
      let href = `http://localhost:8080/`;

      return new qx.Promise(async (resolve) => {
        const playwright = this.require('playwright');
        try {
          for (const browserType of ['chromium', 'firefox' /*, 'webkit'*/]) {
            console.info("Running test in " + browserType);
            const launchArgs = {
              args: ['--no-sandbox', '--disable-setuid-sandbox']
            };
            const browser = await playwright[browserType].launch(launchArgs);
            const context = await browser.newContext();
            const page = await context.newPage();
            page.on("pageerror", exception => {
              qx.tool.compiler.Console.error("Error on page " + page.url());
              result.errorCode = 1;
              resolve();
            });
            await page.goto(href);
            let url = page.url();
            await browser.close();
          }
          test.setExitCode(0);
          resolve();
        } catch (e) {
          qx.tool.compiler.Console.error(e);
          test.setExitCode(1);
          resolve();
        }
      });
    }
  }
});

module.exports = {
    LibraryApi: qxl.apiviewer.compile.LibraryApi
};

```



