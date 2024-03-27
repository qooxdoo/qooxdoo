/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo
 *
 *    Copyright:
 *      2011-2017 Zenesis Limited, http://www.zenesis.com
 *
 *    License:
 *      MIT: https://opensource.org/licenses/MIT
 *
 *      This software is provided under the same licensing terms as Qooxdoo,
 *      please see the LICENSE file in the Qooxdoo project's top-level directory
 *      for details.
 *
 *    Authors:
 *      * John Spackman (john.spackman@zenesis.com, @johnspackman)
 *
 * *********************************************************************** */

const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");

const { promisify } = require("util");
const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const rename = promisify(fs.rename);

qx.Class.define("qx.tool.utils.files.Utils", {
  extend: qx.core.Object,

  statics: {
    async findAllFiles(dir, fnEach) {
      let filenames;
      try {
        filenames = await readdir(dir);
      } catch (ex) {
        if (ex.code == "ENOENT") {
          return;
        }
        throw ex;
      }
      await qx.Promise.all(
        filenames.map(async shortName => {
          let filename = path.join(dir, shortName);
          let tmp = await stat(filename);
          if (tmp.isDirectory()) {
            await qx.tool.utils.files.Utils.findAllFiles(filename, fnEach);
          } else {
            await fnEach(filename);
          }
        })
      );
    },

    /**
     * Synchronises two files or folders; files are copied from/to but only if their
     * modification time or size has changed.
     * @param from {String} path to copy from
     * @param to {String} path to copy to
     * @param filter {Function?} optional filter method to validate filenames before sync
     * @async
     */
    sync(from, to, filter) {
      var t = this;

      function copy(statFrom, statTo) {
        if (statFrom.isDirectory()) {
          var p;
          if (statTo === null) {
            p = mkdir(to);
          } else {
            p = Promise.resolve();
          }
          return p.then(() =>
            readdir(from).then(files =>
              Promise.all(
                files.map(file =>
                  t.sync(path.join(from, file), path.join(to, file), filter)
                )
              )
            )
          );
        } else if (statFrom.isFile()) {
          return qx.Promise.resolve(filter ? filter(from, to) : true).then(
            result => result && t.copyFile(from, to)
          );
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
              .then(tmp => (statTo = tmp))
              .catch(err => {
                if (err.code !== "ENOENT") {
                  throw err;
                }
              });
          })
          .then(() => {
            if (!statTo || statFrom.isDirectory() != statTo.isDirectory()) {
              return t.deleteRecursive(to).then(() => copy(statFrom, statTo));
            } else if (
              statFrom.isDirectory() ||
              statFrom.mtime.getTime() > statTo.mtime.getTime() ||
              statFrom.size != statTo.size
            ) {
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
    copyFile(from, to) {
      return new Promise((resolve, reject) => {
        qx.tool.utils.Utils.mkParentPath(to, function () {
          var rs = fs.createReadStream(from, {
            flags: "r",
            encoding: "binary"
          });

          var ws = fs.createWriteStream(to, { flags: "w", encoding: "binary" });
          rs.on("end", function () {
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
     * @returns {import("node:fs").Stats}
     * @async
     */
    safeStat(filename) {
      return new Promise((resolve, reject) => {
        fs.stat(filename, function (err, stats) {
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
    safeUnlink(filename) {
      return new Promise((resolve, reject) => {
        fs.unlink(filename, function (err) {
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
    safeRename(from, to) {
      return new Promise((resolve, reject) => {
        fs.rename(from, to, function (err) {
          if (err && err.code != "ENOENT") {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    },

    /**
     * Rotates files so that this file does not exist, by renaming the existing file to have a ".1"
     * appended, and the ".1" to be renamed to ".2" etc, up to `length` versions
     *
     * @param filename {String} filename to rotate
     * @param length {Integer} maximum number of files
     * @async
     */
    async rotateUnique(filename, length) {
      if ((await this.safeStat(filename)) && length > 1) {
        var lastFile = null;
        for (var i = length; i > 0; i--) {
          var tmp = filename + "." + i;
          if (i == length) {
            await this.safeUnlink(tmp);
          } else if (await this.safeStat(tmp)) {
            await rename(tmp, lastFile);
          }
          lastFile = tmp;
        }
        await rename(filename, lastFile);
      }
    },

    /**
     * Deletes a file or directory; directories are recursively removed
     * @param name {String} file or dir to delete
     * @async
     */
    deleteRecursive(name) {
      return new Promise((resolve, reject) => {
        rimraf(name, err => {
          if (err) {
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
    correctCase(dir) {
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
          fs.readdir(
            currentDir.length == 0 ? "." : drivePrefix + currentDir,
            { encoding: "utf8" },
            (err, files) => {
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
            }
          );
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
    }
  }
});
