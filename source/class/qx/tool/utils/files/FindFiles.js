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

var fs = require("fs");
var async = require("async");


qx.Class.define("qx.tool.utils.files.FindFiles", {
  extend: qx.core.Object,

  construct: function(root) {
    this.base(arguments);
    this.__root = root;
  },

  properties: {
    matchFiles: {
      init: null,
      nullable: true,
      check: "RegEx"
    }
  },

  members: {
    __root: null,

    scan: function(notify, cb) {
      cb = cb||function() {};

      var t = this;

      function scanImpl(path, cb) {
        async.waterfall([
          function(cb) {
            fs.readdir(path, cb);
          },

          function(files, cb) {
            async.forEach(files,
              function(file, cb) {
                fs.stat(path + "/" + file, function(err, stat) {
                  if (err) {
                    cb(err);
                    return;
                  }
                  if (stat.isDirectory()) {
                    scanImpl(path + "/" + file, cb);
                    return;
                  }
                  if (stat.isFile()) {
                    t._onFindFile(path + "/" + file, notify, cb);
                    return;
                  }
                  cb();
                });
              },
              cb);
          }],
        cb);
      }

      scanImpl(this.__root, cb);
    },

    _onFindFile: function(file, notify, cb) {
      var re = this.getMatchFiles();
      if (re && !re.test(file)) {
        return;
      }
      notify(file, cb);
    }
  }

});

