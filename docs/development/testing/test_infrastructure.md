# Testing your application

To test your application we provide a test infrastructure based on the `qx test` command and an extension in compile.js.

To use this you have to generate a compile.js file as described [here](../compiler/configuration/api.md#compile.js).

Here is an example for running a browser test based on [playwright](https://www.npmjs.com/package/playwright):

```

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
   __appTesting : async function (data) {
      /* get the result from the event.
      *  result: {
      *    errorCode: 0 
      *  }
      *  After all tests are run the process is terminated 
      *  with the cumulated errorCode of all tests.
      */
	  let result = data.getData();
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
          resolve();
        } catch (e) {
          qx.tool.compiler.Console.error(e);
          result.errorCode = 1;
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



