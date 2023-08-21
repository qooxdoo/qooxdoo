const fs = require("fs");
const path = require("path");
const async = require("async");
const child_process = require("child_process");
//var fsPromises = require("fs").promises;
// node 8 compatibility
const {promisify} = require('util');
const stat = promisify(fs.stat);

const fsPromises = {
  readFile: promisify(fs.readFile),
  writeFile: promisify(fs.writeFile),
  unlink: promisify(fs.unlink),
  mkdir: promisify(fs.mkdir),
  readdir: promisify(fs.readdir)
};

/**
 * Return the path to the compiler executable, unless the "QX_JS" OS environment
 * variable is set, in which case the content of this variable is returned.
 *
 * @param {String} buildVersion? The build version, defaults to "build"
 * @return {String}
 */
function getCompiler(buildVersion="build") {
  let qxJs = process.env.QX_JS;
  if (!qxJs) {
    qxJs = path.join(__dirname, "..", buildVersion, "qx");
  }
  return qxJs;
}

async function runCompiler(dir, ...cmd) {
  let result = await runCommand(dir, getCompiler(), "compile", "--machine-readable", ...cmd);
  result.messages = [];
  result.output.split("\n").forEach(line => {
    let m = line.match(/^\#\#([^:]+):\[(.*)\]$/);
    if (m) {
      let args = m[2].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      if (args) {
        args = args.map(arg => {
          if (arg.length && arg[0] == "\"" && arg[arg.length - 1] == "\"")
            return arg.substring(1, arg.length - 1);
          return arg;
        });
      } else {
        args = [];
      }
      result.messages.push({
        id: m[1],
        args: args
      });
    }
  });
  return result;
}

async function runCommand(dir, ...args) {
  return new Promise((resolve, reject) => {
    let cmd = args.shift();
    let proc = child_process.spawn(cmd, args, {
      cwd: dir,
      shell: true
    });
    let result = {
        exitCode: null,
        output: "",
        error: "",
        messages: null
    };
    proc.stdout.on('data', (data) => {
      data = data.toString().trim();
      console.log(data);
      result.output += data;
    });
    proc.stderr.on('data', (data) => {
      data = data.toString().trim();
      console.error(data);
      result.error += data;
    });

    proc.on('close', code => {
      result.exitCode = code;
      resolve(result);
    });
    proc.on('error', err => {
       reject(err);
    });
  });
}

async function deleteRecursive(name) {
  return new Promise((resolve, reject) => {
    fs.access(name, err => {
      if (err) {
        return resolve();
      }
      deleteRecursiveImpl(name, err => {
        if (err) {
          reject(err);
        } else {
          resolve(err);
        }
      });
      return null;
    });

    function deleteRecursiveImpl(name, cb) {
      fs.stat(name, function (err, stat) {
        if (err) {
          return cb && cb(err);
        }

        if (stat.isDirectory()) {
          fs.readdir(name, function (err, files) {
            if (err) {
              return cb && cb(err);
            }
            async.each(files,
                function (file, cb) {
                  deleteRecursiveImpl(name + "/" + file, cb);
                },
                function (err) {
                  if (err) {
                    return cb && cb(err);
                  }
                  fs.rmdir(name, cb);
                  return null;
                }
            );
            return null;
          });
        } else {
          fs.unlink(name, cb);
        }
        return null;
      });
    }
  });
}

async function safeDelete(filename) {
  try {
    await fsPromises.unlink(filename);
  } catch(ex) {
    if (ex.code == "ENOENT")
      return;
    throw ex;
  }
}

function defaultOptions() {
  return {
    clean: true,
    version: null,
    target: "build",
    incVersion: false
  }
}


async function bootstrapCompiler(options) {
  if (!options)
    options = defaultOptions();
  let result;

  if (options.clean) {
    console.log("Deleting previous bootstrap compiler");
    await deleteRecursive("bootstrap");
    await deleteRecursive("known-good/node_modules");
  }

  // Use the compiler in node_modules to compile a temporary version
  console.log("Creating temporary compiler with known-good one");
  result = await runCommand("known-good", "node", "../bin/known-good/qx", "compile", "--target=" + options.target);
  if (result.exitCode) {
    process.exit(result.exitCode);
  }

  // Create a handy `qx` binary for that version
  await fsPromises.writeFile("bootstrap/qx",
`#!/usr/bin/env node
const path=require("path");
require("../source/resource/qx/tool/loadsass.js");
require(path.join(__dirname, "compiled", "node", "${options.target}", "compiler"));
`, "utf8");
fs.chmodSync("bootstrap/qx", "777");
fs.copyFileSync("bin/build/qx.cmd", "bootstrap/qx.cmd");

  /*
   * Now use the new ./bootstrap/ compiler to compile itself again; the output goes into the
   *  normal `compiled` directory, ready for use.
   *
   * Note that we compile both source and build targets; this is because some of
   *  the unit tests have to refer to the compiled code and we want to be sure that
   *  it does not matter if they use source or build, just make sure it is up to date
   */
  console.log("Compiling source version");
  result = await runCommand(".", "node", "./bootstrap/qx", "compile", "--clean", "--verbose");
  if (result.exitCode) {
    process.exit(result.exitCode);
  }

  console.log("Compiling build version");
  result = await runCommand(".", "node", "./bootstrap/qx", "compile", "--target=build", "--clean", "--verbose");
  if (result.exitCode) {
    process.exit(result.exitCode);
  }

  console.log("Compiler successfully bootstrapped");
}

// this is simply a copy of qx.tool.utils.files.Utils
// needs to be cleaned up.
moreUtils = {
  async findAllFiles(dir, fnEach) {
    let filenames;
    try {
      filenames = await fsPromises.readdir(dir);
    } catch (ex) {
      if (ex.code == "ENOENT") {
        return;
      }
      throw ex;
    }
    await qx.Promise.all(filenames.map(async shortName => {
      let filename = path.join(dir, shortName);
      let tmp = await stat(filename);
      if (tmp.isDirectory()) {
        await qx.tool.utils.files.Utils.findAllFiles(filename, fnEach);
      } else {
        await fnEach(filename);
      }
    }));
  },

  /**
   * Synchronises two files or folders; files are copied from/to but only if their
   * modification time or size has changed.
   * @param from {String} path to copy from
   * @param to {String} path to copy to
   * @param filter {Function?} optional filter method to validate filenames before sync
   * @async
   */
  sync: function(from, to, filter) {
    var t = this;

    function copy(statFrom, statTo) {
      if (statFrom.isDirectory()) {
        var p;
        if (statTo === null) {
          p = fsPromises.mkdir(to);
        } else {
          p = Promise.resolve();
        }
        return p.then(() => fsPromises.readdir(from)
          .then(files => Promise.all(files.map(file => t.sync(path.join(from, file), path.join(to, file), filter)))));
      } else if (statFrom.isFile()) {
        return Promise.resolve(filter ? filter(from, to) : true)
          .then(result => result && t.copyFile(from, to));
      }
      return undefined;
    }

    return new Promise((resolve, reject) => {
      var statFrom = null;
      var statTo = null;

      stat(from)
        .then(tmp => {
          statFrom = tmp;
          return stat(to)
            .then(tmp => statTo = tmp)
            .catch(err => {
              if (err.code !== "ENOENT") {
                throw err;
              }
            });
        })
        .then(() => {
          if (!statTo || statFrom.isDirectory() != statTo.isDirectory()) {
            return t.deleteRecursive(to)
              .then(() => copy(statFrom, statTo));
          } else if (statFrom.isDirectory() || (statFrom.mtime.getTime() > statTo.mtime.getTime() || statFrom.size != statTo.size)) {
            return copy(statFrom, statTo);
          }
          return undefined;
        })
        .then(resolve)
        .catch(reject);
    });
  },

  /**
   * Copies a file
   * @param from {String} path to copy from
   * @param to {String} path to copy to
   * @async
   */
  copyFile: function(from, to) {
    return new Promise((resolve, reject) => {
      moreUtils.mkParentPath(to, function() {
        var rs = fs.createReadStream(from, { flags: "r", encoding: "binary" });
        var ws = fs.createWriteStream(to, { flags: "w", encoding: "binary" });
        rs.on("end", function() {
          resolve(from, to);
        });
        rs.on("error", reject);
        ws.on("error", reject);
        rs.pipe(ws);
      });
    });
  },

  /**
   * Returns the stats for a file, or null if the file does not exist
   *
   * @param filename
   * @returns {fs.Stat}
   * @async
   */
  safeStat: function(filename) {
    return new Promise((resolve, reject) => {
      fs.stat(filename, function(err, stats) {
        if (err && err.code != "ENOENT") {
          reject(err);
        } else {
          resolve(err ? null : stats);
        }
      });
    });
  },

  /**
   * Deletes a file, does nothing if the file does not exist
   *
   * @param filename {String} file to delete
   * @async
   */
  safeUnlink: function(filename) {
    return new Promise((resolve, reject) => {
      fs.unlink(filename, function(err) {
        if (err && err.code != "ENOENT") {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },

  /**
   * Renames a file, does nothing if the file does not exist
   *
   * @param from {String} file to rename
   * @param to {String} new filename
   * @async
   */
  safeRename: function(from, to) {
    return new Promise((resolve, reject) => {
      fs.rename(from, to, function(err) {
        if (err && err.code != "ENOENT") {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },

  /**
   * Normalises the path and corrects the case of the path to match what is actually on the filing system
   *
   * @param dir {String} the filename to normalise
   * @returns {String} the new path
   * @async
   */
  correctCase: function(dir) {
    var drivePrefix = "";
    if (process.platform === "win32" && dir.match(/^[a-zA-Z]:/)) {
      drivePrefix = dir.substring(0, 2);
      dir = dir.substring(2);
    }
    dir = dir.replace(/\\/g, "/");
    var segs = dir.split("/");
    if (!segs.length) {
      return drivePrefix + dir;
    }

    var currentDir;
    var index;
    if (segs[0].length) {
      currentDir = "";
      index = 0;
    } else {
      currentDir = "/";
      index = 1;
    }

    function bumpToNext(nextSeg) {
      index++;
      if (currentDir.length && currentDir !== "/") {
        currentDir += "/";
      }
      currentDir += nextSeg;
      return next();
    }

    function next() {
      if (index == segs.length) {
        if (process.platform === "win32") {
          currentDir = currentDir.replace(/\//g, "\\");
        }
        return Promise.resolve(drivePrefix + currentDir);
      }

      let nextSeg = segs[index];
      if (nextSeg == "." || nextSeg == "..") {
        return bumpToNext(nextSeg);
      }

      return new Promise((resolve, reject) => {
        fs.readdir(currentDir.length == 0 ? "." : drivePrefix + currentDir, { encoding: "utf8" }, (err, files) => {
          if (err) {
            reject(err);
            return;
          }

          let nextLowerCase = nextSeg.toLowerCase();
          let exact = false;
          let insensitive = null;
          for (let i = 0; i < files.length; i++) {
            if (files[i] === nextSeg) {
              exact = true;
              break;
            }
            if (files[i].toLowerCase() === nextLowerCase) {
              insensitive = files[i];
            }
          }
          if (!exact && insensitive) {
            nextSeg = insensitive;
          }

          bumpToNext(nextSeg).then(resolve);
        });
      });
    }

    return new Promise((resolve, reject) => {
      fs.stat(drivePrefix + dir, err => {
        if (err) {
          if (err.code == "ENOENT") {
            resolve(drivePrefix + dir);
          } else {
            reject(err);
          }
        } else {
          next().then(resolve);
        }
      });
    });
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
  }
};

module.exports = {
  getCompiler,
  runCompiler,
  runCommand,
  defaultOptions,
  bootstrapCompiler,
  deleteRecursive,
  safeDelete,
  fsPromises,
  promisify,
  findAllFiles: moreUtils.findAllFiles,
  sync: moreUtils.sync,
  copyFile: moreUtils.copyFile,
  safeStat: moreUtils.safeStat,
  safeRename: moreUtils.safeRename,
  correctCase: moreUtils.correctCase
};

