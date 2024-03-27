/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017 Zenesis Ltd

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com, @johnspackman)

************************************************************************ */
const path = require("upath");
const fs = require("fs");
const async = require("async");
const { promisify } = require("util");
const child_process = require("child_process");
const psTree = require("ps-tree");
/**
 * @ignore(process)
 */
/* global process */
/**
 * Utility methods
 */
qx.Class.define("qx.tool.utils.Utils", {
  extend: qx.core.Object,

  statics: {
    /**
     * Creates a Promise which can be resolved/rejected externally - it has
     * the resolve/reject methods as properties
     *
     * @returns {Promise} a promise
     */
    newExternalPromise() {
      var resolve;
      var reject;
      var promise = new Promise((resolve_, reject_) => {
        resolve = resolve_;
        reject = reject_;
      });
      promise.resolve = resolve;
      promise.reject = reject;
      return promise;
    },

    promisifyThis(fn, self, ...args) {
      return new Promise((resolve, reject) => {
        args = args.slice();
        args.push(function (err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
        try {
          fn.apply(self, args);
        } catch (ex) {
          reject(ex);
        }
      });
    },

    /**
     * Error that can be thrown to indicate wrong user input  and which doesn't
     * need a stack trace
     *
     * @type {new (message: string) => Error}
     */
    UserError: class extends Error {
      constructor(message) {
        super(message);
        this.name = "UserError";
        this.stack = null;
      }
    },

    /**
     * Formats the time in a human readable format, eg "1h 23m 45.678s"
     *
     * @param {number} millisec
     * @returns {string} formatted string
     */
    formatTime(millisec) {
      var seconds = Math.floor(millisec / 1000);
      millisec %= 1000;
      var minutes = Math.floor(seconds / 60);
      seconds %= 60;
      var hours = Math.floor(minutes / 60);
      minutes %= 60;

      var result = "";
      if (hours) {
        result += (hours > 9 ? hours : "0" + hours) + "h ";
      }
      if (hours || minutes) {
        result += (minutes > 9 ? minutes : "0" + minutes) + "m ";
      }
      if (seconds > 9 || (!hours && !minutes)) {
        result += seconds;
      } else if (hours || minutes) {
        result += "0" + seconds;
      }
      result +=
        "." + (millisec > 99 ? "" : millisec > 9 ? "0" : "00") + millisec + "s";
      return result;
    },

    /**
     * Creates a dir
     * @param dir
     * @param cb
     */
    mkpath(dir, cb) {
      dir = path.normalize(dir);
      var segs = dir.split(path.sep);
      var made = "";
      async.eachSeries(
        segs,
        function (seg, cb) {
          if (made.length || !seg.length) {
            made += "/";
          }
          made += seg;
          fs.exists(made, function (exists) {
            if (!exists) {
              fs.mkdir(made, function (err) {
                if (err && err.code === "EEXIST") {
                  err = null;
                }
                cb(err);
              });
              return;
            }
            fs.stat(made, function (err, stat) {
              if (err) {
                cb(err);
              } else if (stat.isDirectory()) {
                cb(null);
              } else {
                cb(
                  new Error(
                    "Cannot create " +
                      made +
                      " (in " +
                      dir +
                      ") because it exists and is not a directory",
                    "ENOENT"
                  )
                );
              }
            });
          });
        },
        function (err) {
          cb(err);
        }
      );
    },

    /**
     * Creates the parent directory of a filename, if it does not already exist
     */
    mkParentPath(dir, cb) {
      var segs = dir.split(/[\\\/]/);
      segs.pop();
      if (!segs.length) {
        return cb && cb();
      }
      dir = segs.join(path.sep);
      return this.mkpath(dir, cb);
    },

    /**
     * Creates the parent directory of a filename, if it does not already exist
     *
     * @param {string} filename the filename to create the parent directory of
     *
     * @return {Promise?} the value
     */
    makeParentDir(filename) {
      const mkParentPath = promisify(this.mkParentPath).bind(this);
      return mkParentPath(filename);
    },

    /**
     * Creates a directory, if it does not exist, including all intermediate paths
     *
     * @param {string} filename the directory to create
     *
     * @return {Promise?} the value
     */
    makeDirs(filename) {
      const mkpath = promisify(this.mkpath);
      return mkpath(filename);
    },

    /**
     * Writable stream that keeps track of what the current line number is
     */
    LineCountingTransform: null,

    /**
     * Writable stream that strips out sourceMappingURL comments
     */
    StripSourceMapTransform: null,

    /**
     * Writable stream that keeps track of what's been written and can return
     * a copy as a string
     */
    ToStringWriteStream: null,

    /*  Function to test if an object is a plain object, i.e. is constructed
     **  by the built-in Object constructor and inherits directly from Object.prototype
     **  or null. Some built-in objects pass the test, e.g. Math which is a plain object
     **  and some host or exotic objects may pass also.
     **
     **  @param {} obj - value to test
     **  @returns {Boolean} true if passes tests, false otherwise
     *
     * @see https://stackoverflow.com/a/5878101/2979698
     */
    isPlainObject(obj) {
      // Basic check for Type object that's not null
      if (typeof obj == "object" && obj !== null) {
        // If Object.getPrototypeOf supported, use it
        if (typeof Object.getPrototypeOf == "function") {
          var proto = Object.getPrototypeOf(obj);
          return proto === Object.prototype || proto === null;
        }

        // Otherwise, use internal class
        // This should be reliable as if getPrototypeOf not supported, is pre-ES5
        return Object.prototype.toString.call(obj) == "[object Object]";
      }

      // Not an object
      return false;
    },

    /**
     * Runs the given command and returns an object containing information on the
     * `exitCode`, the `output`, potential `error`s, and additional `messages`.
     * @param {String} cwd The current working directory
     * @param {String} args One or more command line arguments, including the
     * command itself
     * @return {{exitCode: Number, output: String, error: *, messages: *}}
     */
    async runCommand(cwd, ...args) {
      let options = {};

      if (typeof cwd == "object") {
        options = cwd;
      } else {
        args = args.filter(value => {
          if (typeof value == "string") {
            return true;
          }
          if (!options) {
            options = value;
          }
          return false;
        });
        if (!options.cwd) {
          options.cwd = cwd;
        }
        if (!options.cmd) {
          options.cmd = args.shift();
        }
        if (!options.args) {
          options.args = args;
        }
      }
      if (!options.error) {
        options.error = console.error;
      }
      if (!options.log) {
        options.log = console.log;
      }
      return await new Promise((resolve, reject) => {
        let env = process.env;
        if (options.env) {
          env = Object.assign({}, env);
          Object.assign(env, options.env);
        }
        let proc = child_process.spawn(options.cmd, options.args, {
          cwd: options.cwd,
          shell: true,
          env: env
        });

        let result = {
          exitCode: null,
          output: "",
          error: "",
          messages: null
        };

        proc.stdout.on("data", data => {
          data = data.toString().trim();
          options.log(data);
          result.output += data;
        });
        proc.stderr.on("data", data => {
          data = data.toString().trim();
          options.error(data);
          result.error += data;
        });
        proc.on("close", code => {
          result.exitCode = code;
          resolve(result);
        });
        proc.on("error", err => {
          reject(err);
        });
      });
    },

    /**
     * Awaitable wrapper around child_process.spawn.
     * Runs a command in a separate process. The output of the command
     * is ignored. Throws when the exit code is not 0.
     * @param  {String} cmd Name of the command
     * @param  {Array} args Array of arguments to the command
     * @return {Promise<Number>} A promise that resolves with the exit code
     */
    run(cmd, args) {
      let opts = { env: process.env };
      return new Promise((resolve, reject) => {
        let exe = child_process.spawn(cmd, args, opts);
        // suppress all output unless in verbose mode
        exe.stdout.on("data", data => {
          qx.log.Logger.debug(data.toString());
        });
        exe.stderr.on("data", data => {
          qx.log.Logger.error(data.toString());
        });
        exe.on("close", code => {
          if (code !== 0) {
            let message = `Error executing '${cmd} ${args.join(
              " "
            )}'. Use --verbose to see what went wrong.`;
            reject(new qx.tool.utils.Utils.UserError(message));
          } else {
            resolve(0);
          }
        });
        exe.on("error", reject);
      });
    },

    /**
     * Awaitable wrapper around child_process.exec
     * Executes a command and return its result wrapped in a Promise.
     * @param cmd {String} Command with all parameters
     * @return {Promise<String>} Promise that resolves with the result
     */
    exec(cmd) {
      return new Promise((resolve, reject) => {
        child_process.exec(cmd, (err, stdout, stderr) => {
          if (err) {
            reject(err);
          }
          if (stderr) {
            reject(new Error(stderr));
          }
          resolve(stdout);
        });
      });
    },

    /**
     * Parses a command line and separates them out into an array that can be given to `child_process.spawn` etc
     *
     * @param {String} cmd
     * @returns {String[]}
     */
    parseCommand(str) {
      let inQuote = null;
      let inArg = false;
      let lastC = null;
      let start = 0;
      let args = [];
      for (let i = 0; i < str.length; i++) {
        let c = str[i];
        if (inQuote) {
          if (c == inQuote) {
            inQuote = null;
          }
          continue;
        }
        if (c == '"' || c == "'") {
          inQuote = c;
          if (!inArg) {
            inArg = true;
            start = i;
          }
          continue;
        }
        if (c == " " || c == "\t") {
          if (inArg) {
            let arg = str.substring(start, i);
            args.push(arg);
            inArg = false;
          }
        } else {
          if (!inArg) {
            inArg = true;
            start = i;
          }
        }
      }
      if (inArg) {
        let arg = str.substring(start);
        args.push(arg);
      }
      return args;
    },

    /**
     * Quotes special characters in the argument array, ensuring that they are safe to pass to the command line
     *
     * @param {String[]} cmd
     * @returns {String[]}
     */
    quoteCommand(cmd) {
      const SPECIALS = '&*?;# "';
      cmd = cmd.map(arg => {
        let c = arg[0];
        if ((c == "'" || c == '"') && c == arg[arg.length - 1]) {
          return arg;
        }
        if (arg.indexOf("'") > -1) {
          if (arg.indexOf('"') > -1) {
            return "$'" + arg.replace(/'/g, "\\'") + "'";
          }
          return '"' + arg + '"';
        }
        for (let i = 0; i < SPECIALS.length; i++) {
          if (arg.indexOf(SPECIALS[i]) > -1) {
            return "'" + arg + "'";
          }
        }
        return arg;
      });
      return cmd;
    },

    /**
     * Reformats a command line
     *
     * @param {String} cmd
     * @returns {String}
     */
    formatCommand(cmd) {
      return qx.tool.utils.Utils.quoteCommand(cmd).join(" ");
    },

    /**
     * Kills a process tree
     *
     * @param {Number} parentId parent process ID to kill
     */
    async killTree(parentId) {
      await new qx.Promise((resolve, reject) => {
        psTree(parentId, function (err, children) {
          if (err) {
            reject(err);
            return;
          }
          children.forEach(item => {
            try {
              process.kill(item.PID);
            } catch (ex) {
              // Nothing
            }
          });
          try {
            process.kill(parentId);
          } catch (ex) {
            // Nothing
          }
          resolve();
        });
      });
    },
    /**
     * Returns the absolute path to the template directory
     * @return {String}
     */ getTemplateDir() {
      let dir = qx.util.ResourceManager.getInstance().toUri(
        "qx/tool/cli/templates/template_vars.js"
      );

      dir = path.dirname(dir);
      return dir;
    },

    /**
     * Detects whether the command line explicit set an option (as opposed to yargs
     * providing a default value).  Note that this does not handle aliases, use the
     * actual, full option name.
     *
     * @param option {String} the name of the option, eg "listen-port"
     * @return {Boolean}
     */
    isExplicitArg(option) {
      function searchForOption(option) {
        return process.argv.indexOf(option) > -1;
      }
      return searchForOption(`-${option}`) || searchForOption(`--${option}`);
    }
  },

  defer(statics) {
    const { Writable, Transform } = require("stream");

    class LineCountingTransform extends Transform {
      constructor(options) {
        super(options);
        this.__lineNumber = 1;
      }

      _write(chunk, encoding, callback) {
        let str = chunk.toString();
        for (let i = 0; i < str.length; i++) {
          if (str[i] == "\n") {
            this.__lineNumber++;
          }
        }
        this.push(str);
        callback();
      }

      getLineNumber() {
        return this.__lineNumber;
      }
    }

    statics.LineCountingTransform = LineCountingTransform;

    class StripSourceMapTransform extends Transform {
      constructor(options) {
        super(options);
        this.__lastLine = "";
      }

      _transform(chunk, encoding, callback) {
        let str = this.__lastLine + chunk.toString();
        let pos = str.lastIndexOf("\n");
        if (pos > -1) {
          this.__lastLine = str.substring(pos);
          str = str.substring(0, pos);
        } else {
          this.__lastLine = str;
          str = "";
        }
        str = str.replace(/\n\/\/\#\s*sourceMappingURL=.*$/m, "");
        this.push(str);
        callback();
      }

      _flush(callback) {
        let str = this.__lastLine;
        this.__lastLine = null;
        str = str.replace(/\n\/\/\#\s*sourceMappingURL=.*$/m, "");
        this.push(str);
        callback();
      }
    }

    statics.StripSourceMapTransform = StripSourceMapTransform;

    class ToStringWriteStream extends Writable {
      constructor(dest, options) {
        super(options);
        this.__dest = dest;
        this.__value = "";
      }

      _write(chunk, encoding, callback) {
        this.__value += chunk.toString();
        if (this.__dest) {
          this.__dest.write(chunk, encoding, callback);
        } else if (callback) {
          callback();
        }
      }

      toString() {
        return this.__value;
      }
    }

    statics.ToStringWriteStream = ToStringWriteStream;
  }
});
