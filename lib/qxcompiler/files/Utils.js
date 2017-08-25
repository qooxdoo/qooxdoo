/* ************************************************************************
 *
 *    qxcompiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qxcompiler
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
 * ************************************************************************/

const fs = require("fs");
const path = require("path");
const util = require("../../util");
const async = require("async");
const qx = require("qooxdoo");

const stat = util.promisify(fs.stat);
const mkdir = util.promisify(fs.mkdir);
const mkParentPath = util.promisify(util.mkParentPath);
const readdir = util.promisify(fs.readdir);
const rmdir = util.promisify(fs.rmdir);
const unlink = util.promisify(fs.unlink);

qx.Class.define("qxcompiler.files.Utils",{
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
      
      async function copy(statFrom, statTo) {
        if (statFrom.isDirectory()) {
          var p;
          if (statTo == null)
            p = mkdir(to);
          else
            p = Promise.resolve();
          return p.then(() => {
            return readdir(from)
              .then((files) => Promise.all(files.map((file) => t.sync(from + "/" + file, to + "/" + file))));
          })
        } else if (statFrom.isFile()) {
          if (filter && !filter(from, to))
            return;
          return t.copyFile(from, to);
        }
      }

      var t = this;

      return new Promise((resolve, reject) => {
        var statFrom = null;
        var statTo = null;
        
        stat(from)
          .then((tmp) => {
            statFrom = tmp;
            return stat(to)
              .then((tmp) => statTo = tmp)
              .catch((err) => {
                if (err.code !== "ENOENT")
                  throw err;
              });
          })
          .then(() => {
            if (!statTo || statFrom.isDirectory() != statTo.isDirectory()) {
              return t.deleteRecursive(to)
                .then(() => copy(statFrom, statTo));

            } else if (statFrom.isDirectory() || (statFrom.mtime.getTime() > statTo.mtime.getTime() || statFrom.size != statTo.size)) {
              return copy(statFrom, statTo);
            }
          })
          .then(resolve)
          .catch(reject);
      })

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
          var rs = fs.createReadStream(from, { flags: 'r', encoding: "binary" });
          var ws = fs.createWriteStream(to, { flags: 'w',  encoding: "binary" });
          rs.on('end', function() {
            resolve();
          });
          rs.on('error', reject);
          ws.on('error', reject);
          rs.pipe(ws);
        });
      });
    },

    /**
     * Deletes a file or directory; directories are recursively removed
     * @param name {String} file or dir to delete
     */
    deleteRecursive: async function(name) {
      
      async function deleteRecursiveImpl(name) {
        var stats = await stat(name);
        if (stats.isDirectory()) {
          var files = await readdir(name);
          var promises = files.map((file) => deleteRecursiveImpl(name + "/" + file));
          return Promise.all(promises)
            .then(() => rmdir(name));
        } else {
          return unlink(name);
        }
      }
      
      try { 
        var stats = await stat(name);
      }catch(err) {
        if (err.code === "ENOENT")
          return;
        throw err;
      }
      return deleteRecursiveImpl(name)
    }
  }
});

module.exports = qxcompiler.files.Utils;
