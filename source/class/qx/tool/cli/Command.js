/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2019-2022 Zenesis Ltd, https://www.zenesis.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com, @johnspackman)
     * Henner Kollmann (Henner.Kollmann@gmx.de, @hkollmann)

************************************************************************ */
const path = require("path");
const process = require("process");

qx.Class.define("qx.tool.cli.Command", {
  extend: qx.core.Object,

  construct(name) {
    super();
    this.setName(name);
    this.__subcommands = [];
    this.__flags = [];
    this.__arguments = [];
    this.addFlag(
      new qx.tool.cli.Flag("help").set({
        description: qx.locale.Manager.tr("Outputs usage summary"),
        type: "boolean",
        value: false
      })
    );
  },

  properties: {
    /** The name that is this part of the command */
    name: {
      check: "String",
      transform: "__transformName"
    },

    /** Short equivalent of the name */
    shortCode: {
      init: null,
      nullable: true,
      check: "String"
    },

    /** Optional description */
    description: {
      init: null,
      nullable: true,
      check: "String"
    },

    /** Function to run this command */
    run: {
      init: null,
      nullable: true,
      check: "Function"
    }
  },

  members: {
    /** @type{zx.cli.Command[]} subcommands */
    __subcommands: null,

    /** @type{zx.cli.Command} parent comamnd */
    __parent: null,

    /** @type{zx.cli.Flag[]} list of flag definitions */
    __flags: null,

    /** @type{zx.cli.Argument} list of positional arguments */
    __arguments: null,

    /** @type{String[]?} list of error messages */
    __errors: null,

    /**
     * Adds a sub command
     *
     * @param {zx.cli.Command} cmd
     * @returns {zx.cli.Command}
     */
    addSubcommand(cmd) {
      this.__subcommands.push(cmd);
      cmd.__parent = this;
      return cmd;
    },

    /**
     * Returns the parent command if this is a sub command
     *
     * @returns {zx.cli.Command?}
     */
    getParent() {
      return this.__parent;
    },

    /**
     * Adds a flag
     *
     * @param {zx.cli.Flag} flag
     * @returns {zx.cli.Command}
     */
    addFlag(flag) {
      if (this.getFlag(flag.getName())) {
        throw new Error("double flag: " + flag.getName());
      }
      this.__flags.push(flag);
      return this;
    },

    /**
     * removes a flag
     *
     * @param {String} name
     */
    removeFlag(name) {
      name = qx.lang.String.camelCase(name);
      let i = this.__flags.findIndex(flag => flag.getName() === name);
      if (i >= 0) {
        this.__flags.splice(i, 1);
      }
    },

    /**
     * Locates a flag by name
     *
     * @param {String} name
     * @return {zx.cli.Flag}
     */
    getFlag(name) {
      name = qx.lang.String.camelCase(name);
      for (let i = 0; i < this.__flags.length; i++)
        {if (this.__flags[i].getName() == name) {return this.__flags[i];}}
      return null;
    },

    /**
     * Adds a positional argument
     *
     * @param {zx.cli.Argument} argument
     * @returns {zx.cli.Command}
     */
    addArgument(argument) {
      this.__arguments.push(argument);
      return this;
    },

    /**
     * Locates an argument by name or index
     *
     * @param {String|Integer} name
     * @return {zx.cli.Argument}
     */
    getArgument(name) {
      if (typeof name == "string") {
        name = qx.lang.String.camelCase(name);
        for (let i = 0; i < this.__arguments.length; i++)
          {if (this.__arguments[i].getName() == name) {return this.__arguments[i];}}
        return null;
      }
      return this.__arguments[name] || null;
    },

    /**
     * Transform for `name`
     */
    __transformName(value) {
      return qx.lang.String.camelCase(value);
    },

    /**
     * Parses the command, where this is the root of the command structure
     *
     * @param {String[]?} argv arguments, where argv[0] is the command name (typically the filename, what would be `$0` in bash)
     */
    parseRoot(argv) {
      if (!argv) {
        argv = qx.lang.Array.clone(process.argv);
        qx.lang.Array.removeAt(argv, 0);
      }

      let exe = argv[0];
      let pos = exe.lastIndexOf(path.sep);
      if (pos > -1) {exe = exe.substring(pos + 1);}
      this.setName(exe);

      let argvIndex = 1;
      function fnGetMore(index, rebase) {
        let value = null;
        if (argv.length > index + argvIndex) {value = argv[index + argvIndex];}
        if (rebase) {argvIndex += index;}
        return value;
      }

      return this.parse(argv[0], fnGetMore);
    },

    /**
     * Prints usage information
     */
    usage() {
      let out = [""];
      function print(...args) {
        out[out.length - 1] += args.join(" ");
      }
      function println(...args) {
        print(...args);
        out.push("");
      }
      let columnify = require("columnify");
      function table(data) {
        let str = columnify(data, { showHeaders: false, maxWidth : 80 });  
        println(str);
      }

      let verbs = [];
      for (let tmp = this; tmp; tmp = tmp.getParent())
        {verbs.unshift(qx.lang.String.hyphenate(tmp.getName()));}

      println("USAGE:");
      print(`   ${verbs.join(" ")}`);
      if (this.__subcommands.length > 0) {print(` [COMMAND]`);}
      if (this.__flags.length > 0) {print(` [FLAGS]`);}
      if (this.__arguments.length > 0) {print(` [ARGUMENTS]`);}
      println();
      if (this.getDescription()) {
        println();
        print(`   ${this.getDescription()}`);
        println();
      }
      if (this.__subcommands.length > 0) {
        println();
        println("COMMANDS:");
        let data = [];
        this.__subcommands.forEach(cmd =>
          data.push(cmd._quickUsage().split(/\s+::\s+/))
        );
        table(data);
      }
      if (this.__flags.length > 0) {
        println();
        println("FLAGS:");
        let data = [];
        this.__flags.forEach(flag => data.push(flag.usage().split(/\s+::\s+/)));
        table(data);
      }
      if (this.__arguments.length > 0) {
        println();
        println("ARGUMENTS:");
        let data = [];
        this.__arguments.forEach(argument =>
          data.push(argument.usage().split(/\s+::\s+/))
        );
        table(data);
      }
      return out.join("\n");
    },

    /**
     * Quick one line usage description
     *
     * @returns {String}
     */
    _quickUsage() {
      let str = this.getName();
      str = qx.lang.String.hyphenate(str);
      if (this.__subcommands.length) {str += " (...)";}
      if (this.getDescription()) {str += "  ::  " + this.getDescription();}
      return str;
    },

    /**
     * Returns the values parsed for flags and arguments as a handy POJO; the
     *
     * @typedef ValuesDef
     * @property {Map<String,Object>} flags
     * @property {Map<String,Object>} arguments
     *
     * @return {ValuesDef}
     */
    getValues() {
      let result = {
        flags: {},
        arguments: [],
        argv: {}
      };

      this.__flags.forEach(flag => {
        result.flags[flag.getName()] = result.flags[flag.getHyphenatedName()] =
          flag.getValue();
        result.argv[flag.getName()] = result.argv[flag.getHyphenatedName()] =
          flag.getValue();
      });
      this.__arguments.forEach(argument => {
        if (argument.getName())
          {result.argv[argument.getName()] = result.argv[
            argument.getHyphenatedName()
          ] = argument.getValue();}
        result.arguments.push(argument.getValue());
      });
      return result;
    },

    /**
     * Adds an error message
     *
     * @param {String} msg
     */
    _error(msg) {
      if (!this.__errors) {this.__errors = [];}
      this.__errors.push(msg);
    },

    /**
     * Returns error messages
     *
     * @returns {String[]}
     */
    getErrors() {
      return this.__errors;
    },

    /**
     * Tests whether the string matches this command
     *
     * @param {String} arg
     * @returns {Boolean}
     */
    is(arg) {
      return arg == this.getName() || arg == this.getShortCode();
    },

    /**
     * Parses the command
     *
     * @param {String} cmdName the name
     * @param {Function} fnGetMore look ahead function
     * @returns {zx.cli.Command} the command to execute after parsing
     */
    parse(cmdName, fnGetMore) {
      let argvIndex = 0;
      function nextCmdName() {
        let value = fnGetMore(argvIndex++);
        if (value && value[0] == "-") {value = null;}
        if (value === null) {argvIndex--;}
        return value;
      }

      function fnGetMoreForChildren(index, reset) {
        let value = fnGetMore(argvIndex + index);
        if (reset) {
          argvIndex += index;
        }
        return value;
      }

      const parseArgument = (argument, value) => {
        try {
          argument.parse(value, fnGetMoreForChildren);
        } catch (ex) {
          this._error(ex.message);
        }
      };

      const parseFlag = (flag, value) => {
        try {
          flag.parse(value, fnGetMoreForChildren);
        } catch (ex) {
          this._error(ex.message);
        }
      };

      const findSubcommand = arg => {
        arg = qx.lang.String.camelCase(arg);
        for (let arr = this.__subcommands, i = 0; i < arr.length; i++) {
          let cmd = arr[i];
          if (cmd.is(arg)) {return cmd;}
        }
        return null;
      };

      const findFlag = arg => {
        for (let i = 0; i < this.__flags.length; i++) {
          let flag = this.__flags[i];
          if (flag.is(arg)) {return flag;}
        }
        for (let i = 0; i < this.__arguments.length; i++) {
          let flag = this.__arguments[i];
          if (flag.is(arg)) {return flag;}
        }
        return null;
      };

      let done = false;
      let finalCommand = this;
      let currentArgumentIndex = 0;
      let scanningForArguments = false;
      while (!done) {
        let value = fnGetMore(argvIndex++);
        if (!value) {break;}

        // Once we hit "--", then it's positional arguments only thereafter
        if (value == "--") {
          scanningForArguments = true;
          continue;
        }

        // Is it a flag? (but not if we're scanning for arguments after --)
        if (!scanningForArguments && value[0] == "-") {
          let flag = findFlag(value);
          if (!flag) {
            // Check for combined short flags (e.g., -fd = -f -d)
            if (value.startsWith("-") && !value.startsWith("--") && value.length > 2 && !value.includes("=")) {
              let combinedFlags = value.substring(1);
              let allFlagsFound = true;
              let foundFlags = [];
              
              // Check if all characters are valid short codes for boolean flags
              for (let i = 0; i < combinedFlags.length; i++) {
                let shortCode = combinedFlags[i];
                let foundFlag = null;
                
                for (let j = 0; j < this.__flags.length; j++) {
                  let testFlag = this.__flags[j];
                  if (testFlag.getShortCode() === shortCode && testFlag.getType() === "boolean") {
                    foundFlag = testFlag;
                    break;
                  }
                }
                
                if (foundFlag) {
                  foundFlags.push(foundFlag);
                } else {
                  allFlagsFound = false;
                  break;
                }
              }
              
              if (allFlagsFound && foundFlags.length > 0) {
                // Parse each combined flag
                foundFlags.forEach(combinedFlag => {
                  parseFlag(combinedFlag, "-" + combinedFlag.getShortCode());
                });
              } else {
                this._error(`Unrecognised flag ${value} passed to ${this}`);
              }
            } else {
              this._error(`Unrecognised flag ${value} passed to ${this}`);
            }
          } else {
            parseFlag(flag, value);
          }
        } else {
          if (!scanningForArguments) {
            // Sub command processing
            let subcommand = findSubcommand(value);
            if (subcommand)
              {finalCommand = subcommand.parse(value, fnGetMoreForChildren);}

            // After a sub command, any argv that the subcommand has not consumed now
            //  belongs to our positional arguments
            scanningForArguments = true;
            if (subcommand) {continue;}
          }

          // Positional arguments
          if (currentArgumentIndex < this.__arguments.length) {
            let argument = this.__arguments[currentArgumentIndex++];
            parseArgument(argument, value);
            
            // If this is an array argument and we're scanning for arguments (after --),
            // then this argument should consume all remaining values
            if (argument.isArray() && scanningForArguments) {
              done = true; // Exit the parsing loop to let array collect all remaining values
            }
          }
        }
      }

      let helpRequested = finalCommand.getFlag("help").getValue();
      if (!helpRequested) {
        // Check for missing mandatory arguments
        while (currentArgumentIndex < this.__arguments.length) {
          let argument = this.__arguments[currentArgumentIndex++];
          if (argument.isRequired()) {
            this._error(`Not enough positional arguments for ${this}`);
            break;
          }
        }

        // Check for missing mandatory flags
        Object.values(this.__flags).forEach(flag => {
          if (flag.isRequired() && flag.getValue() === null)
            {this._error(`Missing value for ${flag}`);}
        });
      }

      fnGetMore(argvIndex, true);

      // Return the command (or sub command) to execute
      return finalCommand;
    },

    toString() {
      return this.getName();
    }
  }
});
