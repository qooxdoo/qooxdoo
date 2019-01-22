/* ************************************************************************
 *
 *    qxcompiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/johnspackman/qxcompiler
 *
 *    Copyright:
 *      2011-2016 Zenesis Limited, http://www.zenesis.com
 *
 *    License:
 *      MIT: http://opensource.org/licenses/MIT.
 *
 *    Authors:
 *      * John Spackman (john.spackman@zenesis.com)
 *
 * *********************************************************************** */

/* eslint no-confusing-arrow: 0 */

var fs = require("fs");
var path = require("path");
var util = require("util");
var child_process = require("child_process");
var async = require("async");

module.exports = util;

var log = null;


/** *****************************************************************************
 *
 * DEBUG LOGGING
 *
 */
(function() {
  var LM = require("./utils/LogManager").getInstance();

  module.exports.createLog = function(categoryName) {
    if (!categoryName) {
      categoryName = "generic"; 
    }
    return LM.getLogger(categoryName);
  };
})();

log = module.exports.createLog("util");



/** *****************************************************************************
 *
 * EXCEPTIONS
 *
 */
function AbstractError(msg, code, constr) {
  Error.captureStackTrace(this, constr || this);
  this.message = msg || "Error";
  this.code = code || "EUNKNOWN";
}
util.inherits(AbstractError, Error);
module.exports.AbstractError = AbstractError;

function GenericError(msg, code) {
  GenericError.super_.call(this, msg, code, this.constructor);
}
util.inherits(GenericError, util.AbstractError);
module.exports.GenericError = GenericError;



/** *****************************************************************************
 *
 * UTILS
 *
 */
module.exports.merge = function() {
  var args = [].slice.call(arguments);
  function mergeInto(dest, src) {
    for (var name in src) {
      var value = src[name];
      if (typeof value == "object") {
        if (value instanceof Date) {
          dest[name] = value;
        } else {
          var current = dest[name];
          if (current === null || current === undefined) {
            current = dest[name] = {}; 
          }
          mergeInto(current, value);
        }
      } else {
        dest[name] = value; 
      }
    }
  }

  for (var i = 1; i < args.length; i++) {
    mergeInto(args[0], args[i]);
  }

  return args[0];
};

module.exports.process = {
  /**
   *
   * @param cmd
   * @param args
   * @param opts
   * @param callback
   * @returns
   */
  exec : function(cmd/* , args, opts, callback */) {
    var tmp = [].slice.call(arguments, 1);
    var args = Array.isArray(tmp[0]) ? tmp.shift() : [];
    var callback = typeof tmp[tmp.length - 1] === "function" ? tmp.pop() : null;
    var opts = (typeof tmp[0] === "object" ? tmp.shift() : null)||{};

    log.debug("spawn: " + cmd + " " + JSON.stringify(args));
    var proc = child_process.spawn(cmd, args);
    var lnrStdout;
    var lnrStderr;
    proc.stdout.on("data", lnrStdout = function(data) {
      log.trace(cmd + " stdout: " + data);
      if (opts.onStdout) {
        opts.onStdout(data);
      }
    });
    proc.stderr.on("data", lnrStderr = function(data) {
      log.trace(cmd + " stderr: " + data);
      if (opts.onStderr) {
        opts.onStderr(data);
      }
    });
    var closed = false;
    var exited = false;
    var exitCode = null;
    var exitSignal = null;
    proc.on("close", function() {
      log.trace(cmd + " closed");
      proc.stdout.removeListener("data", lnrStdout);
      proc.stderr.removeListener("data", lnrStderr);
      closed = true;
      if (closed && exited && callback) {
        callback(null, exitCode, exitSignal);
        callback = null;
      }
    });
    proc.on("exit", function(code, signal) {
      log.trace(cmd + " exit code=" + code + ", signal=" + signal);
      exited = true;
      exitCode = code;
      exitSignal = signal;
      if (closed && exited && callback) {
        callback(null, exitCode, signal);
        callback = null;
      }
    });
    proc.on("error", function(err) {
      if (callback) {
        callback(err); 
      } else {
        throw err;
      }
    });
    return proc;
  },

  execAndCapture : function(cmd, args, callback) {
    var stdout = [];
    function capture(data) {
      stdout.push(data);
    }
    var proc = this.exec(cmd, args, {
      onStdout: capture,
      onStderr: capture
    }, function(err, code, signal) {
      callback(err, stdout.join(""), code, signal);
    });
    return proc;
  }
};

/** *****************************************************************************
 *
 * JSON
 *
 */
module.exports.json = {
  parseISO : function(str) {
    if (!str) {
      return null; 
    }
    var m = str.match(/([0-9]+)-([0-9]+)-([0-9]+)T([0-9]+):([0-9]+):([0-9]+).([0-9]+)Z/);
    if (!m) {
      log.error("Cannot parse date " + str);
      return null;
    }
    var year = parseInt(m[1], 10);
    var month = parseInt(m[2], 10) - 1;
    var day = parseInt(m[3], 10);
    var hours = parseInt(m[4], 10);
    var minutes = parseInt(m[5], 10);
    var seconds = parseInt(m[6], 10);
    var millis = parseInt(m[7], 10);

    var dt = new Date(year, month, day, hours, minutes, seconds, millis);
    var offset = dt.getTimezoneOffset();
    if (offset != 0) {
      dt = new Date(year, month, day, hours, minutes - offset, seconds, millis);
    }
    return dt;
  },

  formatISO : function(dt) {
    if (!dt) {
      return null; 
    }
    function dp2(v) {
      if (v < 10) {
        return "0" + v; 
      }
      return String(v);
    }
    function dp3(v) {
      if (v < 10) {
        return "00" + v;
      }
      if (v < 100) {
        return "0" + v;
      }
      return String(v);
    }
    var str = dt.getUTCFullYear() + "-" + dp2(dt.getUTCMonth() + 1) + "-" + dp2(dt.getUTCDate()) + "T" + dp2(dt.getUTCHours()) +
        ":" + dp2(dt.getUTCMinutes()) + ":" + dp2(dt.getUTCSeconds()) + "." + dp3(dt.getUTCMilliseconds()) + "Z";
    return str;
  },

  parse : function(str, reviver) {
    var t = this;
    var PREFIX = this.__PREFIX;
    var SUFFIX = this.__SUFFIX;

    function reviverImpl(key, value) {
      if (typeof value === "string" && value.substring(0, PREFIX.length) === PREFIX && value.slice(-SUFFIX.length) === SUFFIX) {
        var str = value.slice(PREFIX.length, -SUFFIX.length);
        if (str.slice(0, 5) == "Date(" && str.slice(-1) == ")") {
          var strDt = str.slice(5, -1);
          var dt = t.parseISO(strDt);
          if (dt) {
            if (t.formatISO(dt) != strDt) {
              log.error("date parsing (iso), original text=" + strDt + ", expected=" + t.formatISO(dt) + ", interpretted Date=" +
                  dt);
            } else if (dt.getTime() > (new Date().getTime()) + (24 * 60 * 60 * 1000)) {
              log.debug("date parsing (future), str=" + str + ", strDt=" + strDt + ", dt=" + dt + ", dt.time=" + dt.getTime() +
                  ", now.time=" + (new Date().getTime())); 
            }
          }
          return dt;
        }
      }
      if (typeof reviver == "function") {
        return reviver(key, value); 
      }
      return value;
    }

    return JSON.parse(str, reviverImpl);
  },

  stringify : function(obj, replacer, space) {
    var t = this;
    var PREFIX = this.__PREFIX;
    var SUFFIX = this.__SUFFIX;

    function replacerImpl(key, value) {
      if (this[key] instanceof Date) {
        value = PREFIX + "Date(" + t.formatISO(this[key]) + ")" + SUFFIX; 
      }
      if (typeof replacer == "function") {
        value = replacer(key, value);
      }
      return value;
    }

    return JSON.stringify(obj, replacerImpl, space);
  },

  __PREFIX : "[__GRASSHOPPER__[",
  __SUFFIX : "]]"
};


/**
 * Encodes a path, IE only encodes the parts between '/' and excluding the query
 */
module.exports.encodeURIPath = function(uri) {
  var pos = uri.indexOf("?");
  var query = "";
  if (pos > -1) {
    query = uri.substring(pos);
    uri = uri.substring(0, pos);
  }
  var segs = uri.split("/");
  for (var i = 0; i < segs.length; i++) {
    segs[i] = encodeURIComponent(segs[i]);
  }
  return segs.join("/") + query;
};


/**
 * Creates a dir
 * @param dir
 * @param cb
 */
function mkpath(dir, cb) {
  dir = path.normalize(dir);
  var segs = dir.split(path.sep);
  var made = "";
  async.eachSeries(
    segs,
    function(seg, cb) {
      if (made.length || !seg.length) {
        made += "/";
      }
      made += seg;
      fs.exists(made, function(exists) {
        if (!exists) {
          fs.mkdir(made, function(err) {
            if (err && err.code === "EEXIST") {
              err = null; 
            }
            cb(err);
          });
          return;
        }
        fs.stat(made, function(err, stat) {
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
    function(err) {
      cb(err);
    });
}

function mkParentPath(dir, cb) {
  var segs = dir.split(/[\\\/]/);
  segs.pop();
  if (!segs.length) {
    return cb && cb(); 
  }
  dir = segs.join(path.sep);
  return mkpath(dir, cb);
}

function newExternalPromise() {
  var resolve;
  var reject;
  var promise = new Promise((resolve_, reject_) => {
    resolve = resolve_;
    reject = reject_;
  });
  promise.resolve = resolve;
  promise.reject = reject;
  return promise;
}

/*
function promisify(fn, ...args) {
  return new Promise((resolve, reject) => {
    args = args.slice();
    args.push(function(err, result) {
      if (err)
        reject(err);
      else
        resolve(result);
    });
    try {
      fn.apply(null, args);
    } catch(ex) {
      reject(ex);
    }
  });
}
module.exports.promisify = promisify;
*/

function promisifyThis(fn, self, ...args) {
  return new Promise((resolve, reject) => {
    args = args.slice();
    args.push(function(err, result) {
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
}


module.exports.mkpath = mkpath;
module.exports.mkpathAsync = filename => new Promise((resolve, reject) => {
  mkpath(filename, err => err ? reject(err) : resolve());
});
module.exports.mkParentPath = mkParentPath;
module.exports.mkParentPathAsync = filename => new Promise((resolve, reject) => {
  mkParentPath(filename, err => err ? reject(err) : resolve());
});
module.exports.newExternalPromise = newExternalPromise;
module.exports.promisifyThis = promisifyThis;

