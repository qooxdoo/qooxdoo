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

var qx = require("qooxdoo");

qx.Class.define("qxcompiler.utils.Promisify", {
  statics: {
    MAGIC_KEY: '__isPromisified__',
    IGNORED_PROPS: /^(?:length|name|arguments|caller|callee|prototype|__isPromisified__)$/,
    
    promisifyAll: function(target, fn) {
      Object.getOwnPropertyNames(target).forEach((key) => {
        if (this.IGNORED_PROPS.test(key) || (fn && fn(key, target) === false)) {
          return;
        }
        if (typeof target[key] !== 'function') {
          return;
        }
        if (this.isPromisified(target[key])) {
          return;
        }

        var promisifiedKey = key + 'Async';

        target[promisifiedKey] = this.promisify(target[key]);

        [key, promisifiedKey].forEach((key) => {
          Object.defineProperty(target[key], this.MAGIC_KEY, {
            value: true,
            configurable: true,
            enumerable: false,
            writable: true
          });
        });
      });

      return target;
    },
    
    isPromisified: function(fn) {
      try {
        return fn[MAGIC_KEY] === true;
      } catch (e) {
        return false;
      }
    },
    
    promisify: require("util").promisify,
    
    fs: null
  },
  
  defer: function(statics) {
    statics.fs = statics.promisifyAll(require("fs"), function(key, fs) {
      return key !== "SyncWriteStream";
    });
  }
});


(function (exports, require, module, __filename, __dirname) { 'use strict';

var promisify = require('es6-promisify');

module.exports = promisifyAll;

var MAGIC_KEY = '__isPromisified__';
var IGNORED_PROPS = /^(?:length|name|arguments|caller|callee|prototype|__isPromisified__)$/;


function isPromisified(fn) {
  try {
    return fn[MAGIC_KEY] === true;
  } catch (e) {
    return false;
  }
}

});