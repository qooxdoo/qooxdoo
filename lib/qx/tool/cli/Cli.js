/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2018 Zenesis Ltd

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com, @johnspackman)

************************************************************************ */

require("qooxdoo");
const path = require("path");

/**
 * Entry point for the CLI
 */

qx.Class.define("qx.tool.cli.Cli", {
  extend: qx.core.Object,
  
  members: {
    run: function() {
      // sanitise process list parameter
      let args = [path.relative(process.cwd(), process.argv[1])]

      for (let i=2; i<process.argv.length; i++) {
        let arg = process.argv[i]
        if (arg === '--token' || arg === '-t') {
          args.push.apply(args, [arg, '*****'])
          i++
        }
        else if (arg.startsWith('--token=')) {
          args.push('--token=*****')
        }
        else if (arg.startsWith('-t')) {
          args.push('-t*****')
        }
        else {
          args.push(arg)
        }
      }

      process.title = args.join(" ")

      // main config
      var title = "qooxdoo command line interface";
      title = "\n" + title + "\n" + "=".repeat(title.length) + "\n";
      title += `Versions: qooxdoo-compiler v${qx.tool.compiler.Version.VERSION}\n\n`;
      title +=
      `Typical usage:
        qx <commands> [options]
        
      Type qx <command> --help for options and subcommands.`

      let yargs = require('yargs')
        .locale("en");
      qx.tool.cli.Cli.addYargsCommands(yargs, 
          [
            "Add", 
            "Clean", 
            "Compile", 
            "Config", 
            "Contrib", 
            "Create", 
            "Lint", 
            "Serve", 
            "Upgrade"
          ], 
          "qx.tool.cli.commands")
      yargs
        .usage(title)
        .demandCommand()
        .strict()
        .showHelpOnFail()
        .argv;
    }
  },
  
  statics: {
    /**
     * Adds commands to Yargs
     * 
     * @param yargs {yargs} the Yargs instance
     * @param classNames {String[]} array of class names, each of which is in the `packageName` package
     * @param packageName {String} the name of the package to find each command class
     */
    addYargsCommands: function(yargs, classNames, packageName) {
      let pkg = null;
      packageName.split('.').forEach(seg => {
        if (pkg === null)
          pkg = window[seg];
        else
          pkg = pkg[seg];
      });
      classNames.forEach(cmd => {
        require("../../../" + packageName.replace(/\./g, '/') + "/" + cmd);
        let data = pkg[cmd].getYargsCommand();
        yargs.command(data);
      });
    }    
  }
});
