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

var fs = require("fs");
var path = require("path");
var util = require("../../util");
var async = require("async");
var qx = require("qooxdoo");

qx.Class.define("qxcompiler.files.Utils",{
  extend: qx.core.Object,

  statics: {

    /**
     * Synchronises two files or folders; files are copied from/to but only if their
     * modification time or size has changed.
     * @param from {String} path to copy from
     * @param to {String} path to copy to
     * @param callback(err) {Function}
     */
    sync: function(from, to, cb) {
      function copy(statFrom, statTo) {
        if (statFrom.isDirectory()) {
          if (statTo == null) {
            fs.mkdir(to, function(err) {
              if (err)
                return cb && cb(err);
              copyFiles();
            });
          } else
            copyFiles();

          function copyFiles() {
            fs.readdir(from, function(err, files) {
              if (err)
                return cb && cb(err);
              async.each(files,
                  function(file, cb) {
                    t.sync(from + "/" + file, to + "/" + file, cb);
                  },
                  cb);
            });
          }
        } else if (statFrom.isFile()) {
          t.copyFile(from, to, cb);
        }
      }

      var t = this;

      fs.stat(from, function(err, statFrom) {
        fs.exists(to, function(exists) {
          if (!exists)
            return copy(statFrom, null);
          fs.stat(to, function(err, statTo) {
            if (statFrom.isDirectory() != statTo.isDirectory()) {
              t.deleteRecursive(to, function (err) {
                if (err)
                  return cb && cb(err);
                copy(statFrom, statTo);
              });

            } else if (statFrom.isDirectory() || (statFrom.mtime.getTime() > statTo.mtime.getTime() || statFrom.size != statTo.size)) {
              copy(statFrom, statTo);
            } else {
              cb && cb();
            }
          });
        })
      });

    },

    /**
     * Copies a file
     * @param from {String} path to copy from
     * @param to {String} path to copy to
     * @param cb(err) {Function}
     */
    copyFile: function(from, to, cb) {
      util.mkParentPath(to, function() {
        var rs = fs.createReadStream(from, { flags: 'r', encoding: "binary" });
        var ws = fs.createWriteStream(to, { flags: 'w',  encoding: "binary" });
        rs.on('end', function() {
          cb && cb();
        });
        rs.pipe(ws);
      });
    },

    /**
     * Deletes a file or directory; directories are recursively removed
     * @param name {String} file or dir to delete
     */
    deleteRecursive: async function(name) {
      
      var stat = util.promisify(fs.stat);
      var readdir = util.promisify(fs.readdir);
      var rmdir = util.promisify(fs.rmdir);
      var unlink = util.promisify(fs.unlink);

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
