/* ************************************************************************
 *
 *    qxcompiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/johnspackman/qxcompiler
 *
 *    Copyright:
 *      2011-2013 Zenesis Limited, http://www.zenesis.com
 *
 *    License:
 *      LGPL: http://www.gnu.org/licenses/lgpl.html
 *      EPL: http://www.eclipse.org/org/documents/epl-v10.php
 *
 *      This software is provided under the same licensing terms as Qooxdoo,
 *      please see the LICENSE file in the Qooxdoo project's top-level directory
 *      for details.
 *
 *    Authors:
 *      * John Spackman (john.spackman@zenesis.com)
 *
 * ************************************************************************/

var fs = require("fs");
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
    },

    /**
     * Copies a file
     * @param from {String} path to copy from
     * @param to {String} path to copy to
     * @param cb(err) {Function}
     */
    copyFile: function(from, to, cb) {
      var rs = fs.createReadStream(from, { flags: 'r', encoding: "binary" });
      var ws = fs.createWriteStream(to, { flags: 'w',  encoding: "binary" });
      rs.on('end', function() {
        cb && cb();
      });
      rs.pipe(ws);
    },

    /**
     * Deletes a file or directory; directories are recursively removed
     * @param path {String} path to delete
     * @param cb(err) {Function}
     */
    deleteRecursive: function(path, cb) {
      var t = this;

      fs.exists(path, function(exists) {
        if (!exists)
          return cb && cb();
        deleteRecursiveImpl(path, cb);
      });

      function deleteRecursiveImpl(path, cb) {
        fs.stat(path, function(err, stat) {
          if (err)
            return cb && cb(err);

          if (fs.isDirectory()) {
            fs.readdir(path, function(err, files) {
              if (err)
                return cb && cb(err);
              async.each(files,
                  function(file, cb) {
                    t.deleteRecursiveImpl(path + "/" + file, cb);
                  },
                  function(err) {
                    if (err)
                      return cb && cb(err);
                    fs.rmdir(path, cb);
                  });
            });
          } else {
            fs.unlink(path, cb);
          }
        });
      }
    }
  }
});

module.exports = qxcompiler.files.Utils;

