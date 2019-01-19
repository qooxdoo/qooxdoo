/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo-compiler
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
const util = require("../util");
require("qooxdoo");
const glob = require("glob");
const rimraf = require("rimraf");

const stat = util.promisify(fs.stat);
const mkdir = util.promisify(fs.mkdir);
const readdir = util.promisify(fs.readdir);
const rename = util.promisify(fs.rename);

qx.Class.define("qx.tool.compiler.files.Utils", {
  extend: qx.core.Object,

  statics: {

    /**
     * Synchronises two files or folders; files are copied from/to but only if their
     * modification time or size has changed.
     * @param from {String} path to copy from
     * @param to {String} path to copy to
     * @param filter {Function?} optional filter method to validate filenames before sync
     */
    sync: async function(from, to, filter) {
      var t = this;

      async function copy(statFrom, statTo) {
        if (statFrom.isDirectory()) {
          var p;
          if (statTo === null) {
            p = mkdir(to); 
          } else {
            p = Promise.resolve(); 
          }
          return p.then(() => readdir(from)
            .then(files => Promise.all(files.map(file => t.sync(from + "/" + file, to + "/" + file, filter)))));
        } else if (statFrom.isFile()) {
          if (filter && !filter(from, to)) {
            return undefined;
          }
          return t.copyFile(from, to);
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
     * @param cb(err) {Function}
     */
    copyFile: async function(from, to) {
      return new Promise((resolve, reject) => {
        util.mkParentPath(to, function() {
          var rs = fs.createReadStream(from, { flags: "r", encoding: "binary" });
          var ws = fs.createWriteStream(to, { flags: "w", encoding: "binary" });
          rs.on("end", function() {
            resolve();
          });
          rs.on("error", reject);
          ws.on("error", reject);
          rs.pipe(ws);
        });
      });
    },
    
    safeStat: async function(filename) {
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

    safeUnlink: async function(filename) {
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

    safeRename: async function(from, to) {
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
     * Rotates files so that this file does not exist, by renaming the existing file to have a ".1"
     * appended, and the ".1" to be renamed to ".2" etc, up to `length` versions
     * 
     * @param filename {String} filename to rotate
     * @param length {Integer} maximum number of files
     */
    rotateUnique: async function(filename, length) {
      if (await this.safeStat(filename) && length > 1) {
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
     */
    deleteRecursive: async function(name) {
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
    
    correctCase: async function(fsPath) {
      return new Promise((resolve, reject) => {
        // Normalize the path so as to resolve . and .. components.
        // !! As of Node v4.1.1, a path starting with ../ is NOT resolved relative
        // !! to the current dir, and glob.sync() below then fails.
        // !! When in doubt, resolve with fs.realPathSync() *beforehand*.
        var fsPathNormalized = path.normalize(fsPath);

        // OSX: HFS+ stores filenames in NFD (decomposed normal form) Unicode format,
        // so we must ensure that the input path is in that format first.
        if (process.platform === "darwin") {
          fsPathNormalized = fsPathNormalized.normalize("NFD");
        }

        // !! Windows: Curiously, the drive component mustn't be part of a glob,
        // !! otherwise glob.sync() will invariably match nothing.
        // !! Thus, we remove the drive component and instead pass it in as the 'cwd' 
        // !! (working dir.) property below.
        var pathRoot = path.parse(fsPathNormalized).root;
        var noDrivePath = fsPathNormalized.slice(Math.max(pathRoot.length - 1, 0));

        // Perform case-insensitive globbing (on Windows, relative to the drive / 
        // network share) and return the 1st match, if any.
        // Fortunately, glob() with nocase case-corrects the input even if it is 
        // a *literal* path.
        glob(noDrivePath, { nocase: true, cwd: pathRoot }, function(err, files) {
          if (err) {
            if (err.code == "ENOENT") {
              resolve(fsPath); 
            } else {
              reject(err);
            }
          } else {
            resolve(files[0]); 
          }
        });
      });
    }
  }
});

module.exports = qx.tool.compiler.files.Utils;
