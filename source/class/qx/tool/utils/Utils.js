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
const {promisify} = require("util");
const child_process = require("child_process");

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
    newExternalPromise: function () {
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


    promisifyThis: function promisifyThis(fn, self, ...args) {
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
     * @param {string} message
     * @returns {Error}
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
      var minutes = Math.floor(seconds / 60);
      var hours = Math.floor(minutes / 60);
      millisec %= 1000;

      var result = "";
      if (hours) {
        result += ((hours > 9) ? hours : "0" + hours) + "h ";
      }
      if (hours || minutes) {
        result += ((minutes > 9) ? minutes : "0" + minutes) + "m ";
      }
      if (seconds > 9 || (!hours && !minutes)) {
        result += seconds;
      } else if (hours || minutes) {
        result += "0" + seconds;
      }
      result += "." + ((millisec > 99) ? "" : millisec > 9 ? "0" : "00") + millisec + "s";
      return result;
    },

    /**
     * Creates a dir
     * @param dir
     * @param cb
     */
    mkpath: function mkpath(dir, cb) {
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
                cb(new Error("Cannot create " + made + " (in " + dir + ") because it exists and is not a directory", "ENOENT"));
              }
            });
          });
        },
        function (err) {
          cb(err);
        });
    },


    /**
     * Creates the parent directory of a filename, if it does not already exist
     */
    mkParentPath: function mkParentPath(dir, cb) {
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
    makeParentDir: function (filename) {
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
    makeDirs: function (filename) {
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
    isPlainObject: function (obj) {
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
      let options = {
        
      };
      
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
      return new Promise((resolve, reject) => {
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
          console.log(data);
          result.output += data;
        });
        proc.stderr.on("data", data => {
          data = data.toString().trim();
          console.error(data);
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
