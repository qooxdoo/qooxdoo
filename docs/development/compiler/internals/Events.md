# Compiler Events

When you use a [`compile.js`](../configuration/api.md) to configure the
compilation process, or if you use the compiler's [API](API.md), in your
own code, the different object instances that you work with fire events to
which your code can listen. Here is a list of events with a brief explanation:

## Makers

`qx.tool.compiler.makers.Maker` instances fire the following events:  
- `making`: Fired when making of apps begins.
- `made`: Fired when making of apps is done. 
- `writingApplication`: Fired when writing of single application starts.
- `writingApplications`: Fired when application writing starts.
- `writtenApplication`: Fired when writing of single application is complete.
- `writtenApplications`: Fired after writing of all applications.

## Analyzer

`qx.tool.compiler.Analyser` instances fire the following events:
- `compilingClass`: Fired when a class is about to be compiled.
- `compiledClass`: Fired when a class is compiled.
- `alreadyCompiledClass`: Fired when a class is already compiled (but needed for compilation)
- `saveDatabase`: Fired when the database is being saved

## CLI Commands

Instances of `qx.tool.cli.commands.Compile` and its subclasses fire the following events:
- `checkEnvironment`: Fired after all environment data is collected. 
- `compilingClass`: Fired when a class is about to be compiled.
- `compiledClass`: Fired when a class is compiled.
- `making`: Fired when making of apps begins.
- `made`: Fired when making of apps is done.
- `minifyingApplication`: Fired when minification begins.
- `minifiedApplication`: Fired when minification is done.
- `saveDatabase`: Fired when the database is being saved.
- `writingApplication`: Fired when writing of single application starts.
- `writingApplications`: Fired when application writing starts.
- `writtenApplication`: Fired when writing of single application is complete.
- `writtenApplications`: Fired after writing of all applications.

Instances of `qx.tool.cli.commands.Deploy` and its subclasses fire the following events:
events:
- `afterDeploy`: Fired after the deploy process has finished.

Instances of `qx.tool.cli.commands.Serve` and its subclasses fire the following events:
events:
- `beforeStart`: Fired before server start
- `afterStart`: Fired when server is started

Instances of `qx.tool.cli.commands.Publish` and its subclasses fire the following events:
events:
- `beforeCommit`:  Fired before commit happens.

Here is an example how to add some stuff to the express server when you run qx start:
```javascript
qx.Class.define("myApp.CompilerApi", {
  extend: qx.tool.cli.api.CompilerApi,
  members: {
    async load() {
      this.addListener("changeCommand", function () {
        let command = this.getCommand();
        if (command instanceof qx.tool.cli.commands.Serve) {
          command.addListener("beforeStart", this.__onBeforeStart, this);
        }
      }, this);
      return super.load();
    },

    __onBeforeStart(event) {
      let expressApp = event.getData().application;
      expressApp.use("/", express.static(my_cool_static_dir));
    }
  }
});

module.exports = {
  CompilerApi: myApp.CompilerApi
};
```

Instances of `qx.tool.cli.commands.Test` and its subclasses fire the following events:
events:
- `runTests`: Fired to start tests. Alternative to overload the function `beforeTests`.

Here is an example how to write your own test using the events in your `compile.js` file:
```javascript
qx.Class.define("myApp.CompilerApi", {
  extend: qx.tool.cli.api.CompilerApi,
  members: {
    async load() {
      this.addListener("changeCommand", function () {
        let command = this.getCommand();
        if (command instanceof qx.tool.cli.commands.Test) {
          command.addListener("runTests", this.__appTesting, this);
        }
      }, this);
      return await super.load();
    },

    async __appTesting(data) {
        let result = data.getData();
        return new qx.Promise(async function (resolve) {
           result.setExitCode(testResult);
        });
    }
  }
});
module.exports = {
  CompilerApi: myApp.CompilerApi
};
```

