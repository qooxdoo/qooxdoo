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
 *      * Henner Kollmann (henner.kollmann@gmx.de)
 *
 * ************************************************************************/

var fs = require("fs");
var path = require("path");
var async = require('async');
var sass = require('node-sass');
var qx = require("qooxdoo");
var util = require("../../util");
require("./Handler");

var log = util.createLog("resource-manager");

qx.Class.define("qxcompiler.resources.ScssHandler", {
  extend: qxcompiler.resources.Handler,

  construct: function (analyser) {
    this.base(arguments, /\.scss$/);
    this.__analyser = analyser;
  },

  members: {
    __analyser: null,
    matches: function (filename) {
      return this.base(arguments, filename) && path.basename(filename)[0] !== '_';
    },

    needsCompile: function(filename, fileInfo, stat) {
      let res =this.base(arguments, filename, fileInfo, stat);
      return res;
    },
    
    compile: function (filename, library, fileInfo) {
      let qooxdooPath = this.__analyser.getQooxdooPath();
      return new Promise((resolve, reject) => {
        fs.readFile(filename, {
          encoding: "utf-8"
        }, function (err, data) {
          if (err)
            return reject(err);
          let relName = path.join(library.getRootDir(), library.getThemePath());
          fs.stat(relName,
            function (err, stats) {
              if (err && err.code === "ENOENT")
                resolve();
              if (err)
                return reject(err);
              relName = filename.substr(relName.length + 1);
              relName = relName.replace(/scss/g, "css");
              let destName = path.join(library.getRootDir(), library.getResourcePath());
              destName = path.join(destName, relName);
              let sassOptions = {
                data: data,
                includePaths: [
                  path.dirname(filename),
                  path.join(qooxdooPath, "source/resource/qx/mobile/scss"),
                  path.join(qooxdooPath, "source/resource/qx/scss")
                ],
                outFile: destName,
                sourceMap: destName + ".map",
                outputStyle: "compressed"
              };
              sass.render(sassOptions, function (err, data) {
                if (err)
                  return reject(err);
                fs.writeFile(sassOptions.outFile, data.css, function (err) {
                  if (err)
                    return reject(err);
                  fs.writeFile(sassOptions.sourceMap, data.map, function (err) {
                    if (err)
                      return reject(err);
                    resolve();
                  });
                });
              });
            });
        });
      });
    }
  }
});