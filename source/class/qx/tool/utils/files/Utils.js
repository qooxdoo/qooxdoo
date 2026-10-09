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
const { stat, mkdir, readdir, rename, unlink, copyFile: fsCopyFile } = fs.promises;

qx.Class.define("qx.tool.utils.files.Utils", {
  extend: qx.core.Object,

  statics: {
    async findAllFiles(dir, fnEach) {
      let dirStat = await qx.tool.utils.files.Utils.safeStat(dir);
      if (!dirStat) {
        return;
      }
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
    async sync(from, to, filter) {
      const t = this;

      async function copy(statFrom, statTo) {
        if (statFrom.isDirectory()) {
          if (statTo === null) {
            await mkdir(to);
          }
          const files = await readdir(from);
          await Promise.all(files.map(file => t.sync(path.join(from, file), path.join(to, file), filter)));
        } else if (statFrom.isFile()) {
          const result = filter ? await filter(from, to) : true;
          if (result) {
            await t.copyFile(from, to);
          }
        }
      }

      const statFrom = await stat(from);
      let statTo = null;
      try {
        statTo = await stat(to);
      } catch (err) {
        if (err.code !== "ENOENT") {
          throw err;
        }
      }

      if (!statTo || statFrom.isDirectory() != statTo.isDirectory()) {
        await t.deleteRecursive(to);
        await copy(statFrom, statTo);
      } else if (statFrom.isDirectory() || statFrom.mtime.getTime() > statTo.mtime.getTime() || statFrom.size != statTo.size) {
        await copy(statFrom, statTo);
      }
    },

    /**
     * Copies a file
     * @param from {String} path to copy from
     * @param to {String} path to copy to
     * @async
     */
    async copyFile(from, to) {
      await qx.tool.utils.Utils.makeParentDir(to);
      await fsCopyFile(from, to);
    },

    /**
     * Returns the stats for a file, or null if the file does not exist
     *
     * @param filename
     * @returns {import("node:fs").Stats}
     * @async
     */
    async safeStat(filename) {
      return await new Promise((resolve, reject) => {
        fs.stat(filename, (err, stats) => {
          if (!err) {
            resolve(stats);
          } else if (err.code === "ENOENT") {
            resolve(null);
          } else {
            reject(err);
          }
        });
      });
    },

    /**
     * Returns the stats for a file, or null if the file does not exist
     *
     * @param filename
     * @returns {import("node:fs").Stats}
     */
    safeStatSync(filename) {
      try {
        return fs.statSync(filename);
      } catch (err) {
        if (err.code === "ENOENT") {
          return null;
        }
        throw err;
      }
    },

    /**
     * Deletes a file, does nothing if the file does not exist
     *
     * @param filename {String} file to delete
     * @async
     */
    async safeUnlink(filename) {
      return await new Promise((resolve, reject) => {
        fs.unlink(filename, err => {
          if (!err || err.code === "ENOENT") {
            resolve();
          } else {
            reject(err);
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
    async safeRename(from, to) {
      return await new Promise((resolve, reject) => {
        fs.rename(from, to, err => {
          if (!err || err.code === "ENOENT") {
            resolve();
          } else {
            reject(err);
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
    async deleteRecursive(name) {
      return fs.promises.rm(name, { recursive: true, force: true });
    },

    /**
     * Normalises the path and corrects the case of the path to match what is actually on the filing system
     *
     * @param dir {String} the filename to normalise
     * @returns {String} the new path
     * @async
     */
    async correctCase(dir) {
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

      async function bumpToNext(nextSeg) {
        index++;
        if (currentDir.length && currentDir !== "/") {
          currentDir += "/";
        }
        currentDir += nextSeg;
        return next();
      }

      async function next() {
        if (index == segs.length) {
          if (process.platform === "win32") {
            currentDir = currentDir.replace(/\//g, "\\");
          }
          return drivePrefix + currentDir;
        }

        let nextSeg = segs[index];
        if (nextSeg == "." || nextSeg == "..") {
          return bumpToNext(nextSeg);
        }

        const files = await readdir(currentDir.length == 0 ? "." : drivePrefix + currentDir, { encoding: "utf8" });
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
        return bumpToNext(nextSeg);
      }

      try {
        await stat(drivePrefix + dir);
        return next();
      } catch (err) {
        if (err.code === "ENOENT") {
          return drivePrefix + dir;
        }
        throw err;
      }
    }
  }
});
